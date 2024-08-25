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
            id: 'testing28',
            email: 'testing28@example.com',
            password: "testing28",
            username: 'Testing28',
        },
    });

    accessToken = jwt.sign({ userId: user.id }, process.env.JWT_SECRET as string, {
        expiresIn: process.env.JWT_EXPIRES_IN as string
    });

})
afterAll(async () => {
    await prisma.user.deleteMany({
        where: { email: { in: ["testing28@example.com"] } }
    })
    await prisma.$disconnect();
});

describe("Get Current User Route Test", () => {

    test("Should return: 200 OK", async () => {
        const response = await request(app)
            .get('/user/me')
            .set('Authorization', `Bearer ${accessToken}`)
        expect(response.status).toBe(200)
        expect(response.body.email).toBe("testing28@example.com")
    })
})