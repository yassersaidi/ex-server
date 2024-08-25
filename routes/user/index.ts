import express, { Express, Request, Response, Application, NextFunction } from 'express';
const router = express.Router()
import { PrismaClient } from '@prisma/client'
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
import { v4 as uuidv4 } from 'uuid';

import generateReqLog from '../../utils/generateReqLog';
import { LoginType, RegisterType, ResetPasswordType } from '../../types/Auth';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { authLimit } from '../../middleware/auth';
import { checkLoginSchema, checkRegisterSchema, checkVerificationCodeSchema, checkResetPasswordSchema, checkUsernameSchema, checkSearchQuerySchema } from '../../utils/validation';
import { validationResult } from 'express-validator';
import { sendResetPasswordCode, sendVerificationCode } from '../../utils/sendEmails';
import { generateNumericCode } from '../../utils/generateCodes';
import { isAdmin, isAuth } from '../../middleware';


const prisma = new PrismaClient()

router.use(isAuth)

router.get('/all', async (req: Request, res: Response) => {
    if (!req?.body?.userId) {
        return res.status(403).json({ error: "Unauthorized" })
    }
    try {
        const canAccess = await isAdmin(req?.body?.userId)
        if (!canAccess) {
            return res.status(403).json({ error: "Unauthorized" })
        }
        const users = await prisma.user.findMany({
            select: {
                id: true,
                email: true,
                username: true,
                createdAt: true,
                verified: true,
            }
        })

        res.json(users)
    } catch (error) {
        res.status(500).json({ error: "An error occurred during getting users" })
    }
})

router.get('/me', async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({ errors: errors.array() });
    }

    if (!req?.body?.userId) {
        return res.status(403).json({ error: "Unauthorized" });
    }

    try {
        const user = await prisma.user.findUnique({
            where: { id: req?.body?.userId },
            select: {
                id: true,
                email: true,
                username: true,
                createdAt: true,
                verified: true,
            }
        });

        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        res.json(user);
    } catch (error) {
        res.status(500).json({ error: "An error occurred during updating the user" });
    }
});


router.get('/get/:username', checkUsernameSchema, async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({ errors: errors.array() });
    }

    const { username } = req.params;

    if (!req?.body?.userId) {
        return res.status(403).json({ error: "Unauthorized" });
    }

    try {
        const user = await prisma.user.findUnique({
            where: { username },
            select: {
                id: true,
                email: true,
                username: true,
                createdAt: true,
                verified: true,
            }
        });

        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        res.json(user);
    } catch (error) {
        res.status(500).json({ error: "An error occurred during getting the user" });
    }
});


router.put('/username', checkUsernameSchema, async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({ errors: errors.array() });
    }

    if (!req?.body?.userId) {
        return res.status(403).json({ error: "Unauthorized" });
    }

    try {
        const user = await prisma.user.findUnique({
            where: { id: req?.body?.userId }
        });

        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        const updatedUser = await prisma.user.update({
            where: { id: user.id },
            data: {
                username: req.body?.username
            }
        });

        res.json(updatedUser);
    } catch (error) {
        res.status(500).json({ error: "An error occurred during updating the user" });
    }
});

router.get('/search', checkSearchQuerySchema, async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({ errors: errors.array() });
    }

    const { query } = req.query;

    try {
        const users = await prisma.user.findMany({
            where: {
                OR: [
                    {
                        username: {
                            contains: query as string,
                            mode: 'insensitive'
                        }
                    },
                    {
                        email: {
                            contains: query as string,
                            mode: 'insensitive'
                        }
                    }
                ]
            },
            select: {
                id: true,
                email: true,
                username: true,
                createdAt: true,
                verified: true
            }
        });

        res.json(users);
    } catch (error) {
        res.status(500).json({ error: "An error occurred during searching users" });
    }

})

router.delete('/', async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({ errors: errors.array() });
    }

    if (!req?.body?.userId) {
        return res.status(403).json({ error: "Unauthorized" });
    }

    try {
        const user = await prisma.user.findUnique({
            where: { id: req?.body?.userId }
        });

        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        const deletedUser = await prisma.user.deleteMany({
            where: { id: req?.body?.userId }
        })

        res.json(deletedUser);
    } catch (error) {
        res.status(500).json({ error: "An error occurred during deleting the user" });
    }
});

module.exports = router