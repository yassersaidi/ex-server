import { NextFunction, Request, Response } from "express";
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
    const token = req.cookies.accessToken;

    if (token == null) return res.status(401).json({ error: 'Access token is missing' });

    jwt.verify(token, process.env.JWT_SECRET as string, (err: any, decode: any) => {
        if (err || !decode.userId) {
            return res.status(403).json({ error: 'Invalid token' });
        }
        next()
    })
};