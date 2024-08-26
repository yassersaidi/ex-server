import express, { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import path from 'path';
import { checkUsernameSchema, checkSearchQuerySchema } from '../../utils/validation';
import { validationResult } from 'express-validator';
import { isAdmin, isAuth } from '../../middleware';
import uploader from '../../middleware/fileUploader';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
const router = express.Router()
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');


const prisma = new PrismaClient()


const profileUploadDir = process.env.PROFILE_PICTURE_DIR || '/uploads/profile';

// Middelware to check if the user is already authenticated
router.use(isAuth)

// Get all users (Only Admins can)
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
                profilePicture: true
            }
        })

        res.json(users)
    } catch (error) {
        res.status(500).json({ error: "An error occurred during getting users" })
    }
})

// Get the current authenticated user data
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
                profilePicture: true
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

// Get a user by thier username
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
                profilePicture: true
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

// Update the user username
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
            },
            select: {
                id: true,
                email: true,
                username: true,
                createdAt: true,
                verified: true,
                profilePicture: true
            }
        });

        res.json(updatedUser);
    } catch (error) {
        if (error instanceof PrismaClientKnownRequestError && error.code === "P2002") {
            const targetField = error.meta?.target;
            return res.status(409).json({ error: `The provided ${targetField} already exists` });
        }
        res.status(500).json({ error: 'An error occurred during registration' });
    }
});

// Update the user profile picture
router.put('/update-image', async (req: Request, res: Response) => {

    if (!req?.body?.userId) {
        return res.status(403).json({ error: "Unauthorized" });
    }

    try {

        const user = await prisma.user.findUnique({
            where: { id: req?.body?.userId }
        })

        const upload = await uploader(profileUploadDir, 'image/', user?.username);

        upload.parse(req, async (err, fields, files) => {
            if (err) {
                return res.status(500).json({ error: "An error occurred during file upload" });
            }

            const file = files.image?.[0];


            if (!file) {
                return res.status(400).json({ error: "No image uploaded" });
            }

            const imageUrl = `${profileUploadDir}/${path.basename(file.filepath)}`;

            const updatedUser = await prisma.user.update({
                where: { id: req.body.userId },
                data: { profilePicture: imageUrl },
                select: {
                    id: true,
                    email: true,
                    username: true,
                    createdAt: true,
                    verified: true,
                    profilePicture: true
                }
            });


            res.json({ message: "Image updated successfully", updatedUser });
        })

    } catch (error) {
        res.status(500).json({ error: "An error occurred during updating the image" });
    }
});

// Search users by username or email 
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
                profilePicture: true,
                verified: true
            }
        });

        res.json(users);
    } catch (error) {
        res.status(500).json({ error: "An error occurred during searching users" });
    }

})

// Delete the current authenticated user
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