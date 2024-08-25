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
            id: 'testing27',
            email: 'testing27@example.com',
            password: "testing27",
            username: 'Testing27',
        },
    });

    accessToken = jwt.sign({ userId: user.id }, process.env.JWT_SECRET as string, {
        expiresIn: process.env.JWT_EXPIRES_IN as string
    });

})
afterAll(async () => {
    await prisma.user.deleteMany({
        where: { email: { in: ["testing27@example.com"] } }
    })
    await prisma.$disconnect();
});

describe("Search Users Route Test", () => {
    test("Should return: Search query is required and must be a string", async () => {
        const response = await request(app)
            .get('/user/search')
            .set('Authorization', `Bearer ${accessToken}`)
        expect(response.status).toBe(422)
        expect(response.body.errors[0].msg).toBe("Search query is required and must be a string")
    })

    test("Should return: Search query is required and must be a string", async () => {
        const response = await request(app)
            .get('/user/search?query=c')
            .set('Authorization', `Bearer ${accessToken}`)

        expect(response.status).toBe(422)
        expect(response.body.errors[0].msg).toBe("Search query must be at least 6 character long")
    })

    test("Should return: Empty Array(No Users Found)", async () => {
        const response = await request(app)
            .get('/user/search?query=784c1s')
            .set('Authorization', `Bearer ${accessToken}`)

        expect(response.status).toBe(200)
        expect(response.body.length).toBe(0)
    })

    test("Should return: The Email of the user with the given Username", async () => {
        const response = await request(app)
            .get('/user/search?query=Testing27')
            .set('Authorization', `Bearer ${accessToken}`)

        expect(response.status).toBe(200)
        expect(response.body[0].email).toBe("testing27@example.com")
    })

    test("Should return: Empty Array(No Users Found)", async () => {
        const response = await request(app)
            .get('/user/search?query=testing28@example.com')
            .set('Authorization', `Bearer ${accessToken}`)

        expect(response.status).toBe(200)
        expect(response.body.length).toBe(0)
    })

})