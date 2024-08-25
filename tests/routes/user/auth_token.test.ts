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
        where: { email: "testing22@example.com" }
    })
    await prisma.$disconnect();
});

describe("Check Auth Token", () => {
    test("Should return: Access token is missing", async () => {
        const response = await request(app)
            .get('/user/all')
        expect(response.status).toBe(401)
        expect(response.body).toHaveProperty('error')
        expect(response.body.error).toBe("Access token is missing")
    })

    test("Should return: Access token is missing", async () => {
        const accessToken = jwt.sign({ userId: "testingId" }, process.env.JWT_SECRET as string, {
            expiresIn: process.env.JWT_EXPIRES_IN as string
        });

        const response = await request(app)
            .get('/user/all')
            .set('Cookie', [`accessToken=${accessToken}`])
        expect(response.status).toBe(401)
        expect(response.body).toHaveProperty('error')
        expect(response.body.error).toBe("Access token is missing")
    })

    test("Should return: Invalid token", async () => {
        const accessToken = jwt.sign({ user: "testingId" }, process.env.JWT_SECRET as string, {
            expiresIn: process.env.JWT_EXPIRES_IN as string
        });
        const response = await request(app)
            .get('/user/all')
            .set('Authorization', `Bearer ${accessToken}`)
        expect(response.status).toBe(403)
        expect(response.body).toHaveProperty('error')
        expect(response.body.error).toBe("Invalid token")
    })

    test("Should return: Invalid token", async () => {
        const accessToken = jwt.sign({ userId: "testingId" }, process.env.JWT_SECRET as string, {
            expiresIn: process.env.JWT_EXPIRES_IN as string
        });
        const response = await request(app)
            .get('/user/all')
            .set('Authorization', `Bearer ${accessToken}`)
        expect(response.status).toBe(404)
        expect(response.body).toHaveProperty('error')
        expect(response.body.error).toBe("Invalid token")
    })

    test("Should return: Invalid token", async () => {
        const accessToken = jwt.sign({ userId: "testingId" }, process.env.JWT_SECRET as string, {
            expiresIn: process.env.JWT_EXPIRES_IN as string
        });
        const response = await request(app)
            .get('/user/all')
            .set('Authorization', `Bearer ${accessToken}`)
        expect(response.status).toBe(404)
        expect(response.body).toHaveProperty('error')
        expect(response.body.error).toBe("Invalid token")
    })

    test("Should return: Unauthorized", async () => {
        const user = await prisma.user.create({
            data: {
                id: 'testing22',
                email: 'testing22@example.com',
                password: "testing22",
                username: 'Testing22',
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
})