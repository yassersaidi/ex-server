import { PrismaClient } from "@prisma/client";
import { NextFunction, Request, Response } from "express";
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient()

export const isAuth = async (req: Request, res: Response, next: NextFunction) => {
    const token = req.headers?.authorization?.split(' ')[1];
    if (!token) {
        return res.status(401).json({ error: 'Access token is missing' });
    }
    jwt.verify(token, process.env.JWT_SECRET as string, async (err: any, decode: { userId: string }) => {
        if (err || !decode?.userId) {
            return res.status(403).json({ error: 'Invalid token' });
        }
        const user = await prisma.user.findUnique({
            where: { id: decode?.userId }
        })
        
        if(!user){
            return res.status(404).json({ error: 'Invalid token' });
        }
        req.body.userId = decode?.userId
        next()
    })
};

export const isAdmin = async (userId: string) => {
    try {
        const user = await prisma.admin.findUnique({
            where: { userId }
        })
        if (!user) {
            return false
        }
        return true
    } catch (error) {
        console.log(error)
        return false
    }
}