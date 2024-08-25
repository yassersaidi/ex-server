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
let accessToken: string

beforeAll(async () => {
    const user = await prisma.user.create({
        data: {
            id: 'testing25',
            email: 'testing25@example.com',
            password: "testing25",
            username: 'Testing25',
        },
    });

    accessToken = jwt.sign({ userId: user.id }, process.env.JWT_SECRET as string, {
        expiresIn: process.env.JWT_EXPIRES_IN as string
    });

})
afterAll(async () => {
    await prisma.user.deleteMany({
        where: { email: { in: ["testing25@example.com"] } }
    })
    await prisma.$disconnect();
});

describe("Get a user by Username", () => {
    test("Should return: 404 Cannot GET /user/", async () => {
        const response = await request(app)
            .get('/user/get')
            .set('Authorization', `Bearer ${accessToken}`)
        expect(response.status).toBe(404)
    })

    test("Should return: Username should be at least 6 chars", async () => {
        const response = await request(app)
            .get('/user/get/test')
            .set('Authorization', `Bearer ${accessToken}`)
        expect(response.status).toBe(422)
        expect(response.body).toHaveProperty('errors')
        expect(response.body.errors[0].msg).toBe("Username should be at least 6 chars")
    })
    test("Should return: User not found", async () => {
        const response = await request(app)
            .get('/user/get/Testing26')
            .set('Authorization', `Bearer ${accessToken}`)
        expect(response.status).toBe(404)
        expect(response.body).toHaveProperty('error')
        expect(response.body.error).toBe("User not found")
    })

    test("Should return: User", async () => {
        const response = await request(app)
            .get('/user/get/Testing25')
            .set('Authorization', `Bearer ${accessToken}`)
        expect(response.status).toBe(200)
        expect(response.body.email).toBe("testing25@example.com")
    })
})