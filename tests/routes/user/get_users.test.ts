import request from 'supertest';
import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import { PrismaClient } from '@prisma/client';
const bcrypt = require('bcryptjs');
import { v4 as uuidv4 } from 'uuid';
const jwt = require('jsonwebtoken');

const user = require("../../../routes/user")

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use('/user', user);

const prisma = new PrismaClient();


afterAll(async () => {
    await prisma.user.deleteMany({
        where: { email: { in: ["testing23@example.com", "testing24@example.com"] } }
    })
    await prisma.$disconnect();
});

describe("Get All Users Route Test", () => {

    test("Should return: Unauthorized", async () => {
        const user = await prisma.user.create({
            data: {
                id: 'testing23',
                email: 'testing23@example.com',
                password: "testing23",
                username: 'Testing23',
            },
        });

        const accessToken = jwt.sign({ userId: user.id }, process.env.JWT_SECRET as string, {
            expiresIn: process.env.JWT_EXPIRES_IN as string
        });

        const response = await request(app)
            .get('/user/all')
            .set('Authorization', `Bearer ${accessToken}`)
        expect(response.status).toBe(403)
        expect(response.body).toHaveProperty('error')
        expect(response.body.error).toBe("Unauthorized")
    })

    test("Should return: List of Users", async () => {
        const user = await prisma.user.create({
            data: {
                id: 'testing24',
                email: 'testing24@example.com',
                password: "testing24",
                username: 'Testing24',
                Admin: {
                    create:{
                        email:"testing24@example.com"
                    }
                }
            },
        });


        const accessToken = jwt.sign({ userId: user.id }, process.env.JWT_SECRET as string, {
            expiresIn: process.env.JWT_EXPIRES_IN as string
        });

        const response = await request(app)
            .get('/user/all')
            .set('Authorization', `Bearer ${accessToken}`)
        expect(response.status).toBe(200)
    })
})