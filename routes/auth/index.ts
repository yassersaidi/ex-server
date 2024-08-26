import express, { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';
const router = express.Router()
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

import { LoginType, RegisterType, ResetPasswordType } from '../../types/Auth';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { checkLoginSchema, checkRegisterSchema, checkVerificationCodeSchema, checkResetPasswordSchema, checkUserSchema } from '../../utils/validation';
import { validationResult } from 'express-validator';
import { sendResetPasswordCode, sendVerificationCode } from '../../utils/sendEmails';
import { generateNumericCode } from '../../utils/generateCodes';
import generateInitialsImage from '../../utils/generateImage';

const prisma = new PrismaClient()

// Middelware for rate limiting

// router.use(authLimit) // comment this line when running tests

// Login Route
router.post('/login', checkLoginSchema, async (req: Request, res: Response) => {
    //generateReqLog("../logs/auth.json", "Login", req)
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({ errors: errors.array() });
    }
    const { email, password }: LoginType = req.body

    try {
        const user = await prisma.user.findUnique({
            where: { email }
        })
        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials' })
        }

        const isValid = await bcrypt.compare(password, user?.password)

        if (!isValid) {
            return res.status(401).json({
                error: "Invalid credentials"
            })
        }

        const accessToken = jwt.sign({ userId: user.id }, process.env.JWT_SECRET as string, {
            expiresIn: process.env.JWT_EXPIRES_IN as string
        });
        const refreshToken = jwt.sign({ userId: user.id }, process.env.JWT_REFRESH_TOKEN_SECRET as string, {
            expiresIn: process.env.JWT_REFRESH_TOKEN_EXPIRES_IN as string
        });

        await prisma.session.create({
            data: {
                refreshToken,
                userId: user.id,
                expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
            }
        });

        res.cookie('rt', refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 3600000 // 1 hour
        });

        res.json({
            accessToken,
            user: {
                id: user.id,
                email: user?.email,
                username: user?.username
            }
        })
    } catch (error) {
        res.status(500).json({ error: 'An error occurred during login' });
    }
})

// Register Route
router.post('/register', checkRegisterSchema, async (req: Request, res: Response) => {
    //generateReqLog("../logs/auth.json", "Register", req)
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({ errors: errors.array() });
    }
    const { email, username, password }: RegisterType = req.body
    try {
        const profilePicture = await generateInitialsImage(username);
        const hashedPassword = await bcrypt.hash(password, parseInt(process.env.PASSWORD_SALT as string))
        const user = await prisma.user.create({
            data: {
                id: username + uuidv4(),
                email,
                password: hashedPassword,
                username,
                profilePicture
            }
        })
        res.json(user?.id)
    } catch (error) {
        if (error instanceof PrismaClientKnownRequestError && error.code === "P2002") {
            const targetField = error.meta?.target;
            return res.status(409).json({ error: `The provided ${targetField} already exists` });
        }
        res.status(500).json({ error: 'An error occurred during registration' });
    }

})

// Send Verification code Route
router.post('/verify-email', checkUserSchema, async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({ errors: errors.array() });
    }
    const { email }: LoginType = req.body

    try {
        const user = await prisma.user.findUnique({
            where: { email }
        })
        if (!user) {
            return res.status(404).json({ error: "Invalid credentials" })
        }
        if (user?.verified) {
            return res.status(204).send()
        }
        const existingCode = await prisma.verificationCode.findFirst({
            where: {
                userId: user.id,
                expiresAt: { gt: new Date() }
            }
        });
        if (existingCode) {
            return res.status(200).json({ message: 'A verification code has already been sent. Please check your email.' });
        }

        const code = generateNumericCode(6)

        await prisma.verificationCode.create({
            data: {
                userId: user.id,
                code,
                expiresAt: new Date(Date.now() + 15 * 60 * 1000) // Code expires in 15 minutes
            }
        });

        const isSent = await sendVerificationCode(email, code)

        if (!isSent) {
            return res.status(204).json({ error: "Can't send the Verification code, try again!" })
        }

        res.status(200).json({ message: 'Verification code sent!' });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'An error occurred during verification.' });
    }
})

// Validate The Verification code Route
router.post('/verify-code', checkVerificationCodeSchema, async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({ errors: errors.array() });
    }

    const { email, code }: { email: string; code: string } = req.body;

    try {
        const user = await prisma.user.findUnique({
            where: { email }
        });

        if (!user) {
            return res.status(404).json({ error: "Invalid credentials" });
        }

        if (user?.verified) {
            return res.status(204).send()
        }


        const userVerificationCode = await prisma.verificationCode.findFirst({
            where: {
                userId: user.id,
                code,
                expiresAt: { gt: new Date() }
            }
        });

        if (!userVerificationCode) {
            return res.status(400).json({ error: "Invalid or expired verification code" });
        }

        await prisma.user.update({
            where: { id: user.id },
            data: { verified: true }
        });

        await prisma.verificationCode.delete({
            where: { id: userVerificationCode.id }
        });

        res.status(200).json({ message: "User successfully verified" });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'An error occurred during verification.' });
    }
});

// Forget Password Route
router.post('/forgot-password', checkUserSchema, async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({ errors: errors.array() });
    }

    const { email }: { email: string } = req.body;

    try {
        const user = await prisma.user.findUnique({
            where: { email }
        });

        if (!user) {
            return res.status(404).json({ error: "Invalid credentials" });
        }

        const existingResetCode = await prisma.verificationCode.findFirst({
            where: {
                userId: user.id,
                expiresAt: { gt: new Date() }
            }
        });

        if (existingResetCode) {
            return res.status(200).json({ message: "A reset code has already been sent. Please check your email." });
        }

        const resetCode = generateNumericCode(6);

        await prisma.verificationCode.create({
            data: {
                userId: user.id,
                code: resetCode,
                expiresAt: new Date(Date.now() + 5 * 60 * 1000)
            }
        });

        const isSent = await sendResetPasswordCode(email, resetCode);

        if (!isSent) {
            return res.status(500).json({ error: "Failed to send the reset code. Please try again." });
        }

        res.status(200).json({ message: "Password reset code sent!" });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'An error occurred during the forgot password process.' });
    }
});

// Reset Password Route
router.post('/reset-password', checkResetPasswordSchema, async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({ errors: errors.array() });
    }

    const { email, code, password }: ResetPasswordType = req.body;

    try {
        const user = await prisma.user.findUnique({
            where: { email }
        });

        if (!user) {
            return res.status(404).json({ error: "Invalid credentials" });
        }

        const resetCode = await prisma.verificationCode.findFirst({
            where: {
                userId: user.id,
                code,
                expiresAt: { gt: new Date() }
            }
        });

        if (!resetCode) {
            return res.status(400).json({ error: "Invalid or expired reset code" });
        }

        const hashedPassword = await bcrypt.hash(password, parseInt(process.env.PASSWORD_SALT as string));

        await prisma.user.update({
            where: { id: user.id },
            data: { password: hashedPassword }
        });

        await prisma.verificationCode.delete({
            where: { id: resetCode.id }
        });

        res.status(200).json({ message: "Password successfully reset" });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'An error occurred during the reset password process.' });
    }
});

// Refresh Token Route
router.post('/rt', async (req: Request, res: Response) => {
    const { rt } = req.cookies;
    if (!rt) {
        return res.status(403).json({ error: 'Access denied, token missing!' });
    }

    try {
        const session = await prisma.session.findUnique({
            where: { refreshToken: rt }
        })
        if (!session) {
            return res.status(403).json({ error: 'Invalid refresh token' });
        }

        jwt.verify(rt, process.env.JWT_REFRESH_TOKEN_SECRET as string, (err: any, decode: any) => {
            if (err || session.userId !== decode.userId) {
                return res.status(403).json({ error: 'Invalid refresh token' });
            }
            const accessToken = jwt.sign({ userId: session.userId }, process.env.JWT_SECRET as string, { expiresIn: '15m' });
            res.json({ accessToken });
        })
    } catch (error) {
        res.status(500).json({ error: 'An error occurred while refreshing token' });
    }
})

// Logout Route
router.post("/logout", async (req: Request, res: Response) => {
    const { rt } = req.cookies;
    if (!rt) {
        return res.status(403).json({ error: 'Access denied, token missing!' });
    }
    try {
        await prisma.session.delete({
            where: { refreshToken: rt }
        });
        res.clearCookie('rt');
        res.status(204).send()
    } catch (error) {
        console.error(error)
        res.status(500).json({ error: 'An error occurred during logout' });
    }
})

module.exports = router