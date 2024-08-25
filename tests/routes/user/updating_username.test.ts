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
            id: 'testing26',
            email: 'testing26@example.com',
            password: "testing26",
            username: 'Testing26',
        },
    });

    accessToken = jwt.sign({ userId: user.id }, process.env.JWT_SECRET as string, {
        expiresIn: process.env.JWT_EXPIRES_IN as string
    });

})
afterAll(async () => {
    await prisma.user.deleteMany({
        where: { email: { in: ["testing26@example.com"] } }
    })
    await prisma.$disconnect();
});

describe("Updating Username Route Test", () => {
    test("Should return: Username is required", async () => {
        const response = await request(app)
            .put('/user/username')
            .set('Authorization', `Bearer ${accessToken}`)
        expect(response.status).toBe(422)
        expect(response.body).toHaveProperty('errors')
        expect(response.body.errors[0].msg).toBe("Username is required")
    })

    test("Should return: Username should be at least 6 chars", async () => {
        const response = await request(app)
            .put('/user/username')
            .set('Authorization', `Bearer ${accessToken}`)
            .send({
                "username":"c"
            })
        expect(response.status).toBe(422)
        expect(response.body).toHaveProperty('errors')
        expect(response.body.errors[0].msg).toBe("Username should be at least 6 chars")
    })

    test("Should return: Username can only contain letters and numbers", async () => {
        const response = await request(app)
            .put('/user/username')
            .set('Authorization', `Bearer ${accessToken}`)
            .send({
                "username":"cccccc,"
            })
        expect(response.status).toBe(422)
        expect(response.body).toHaveProperty('errors')
        expect(response.body.errors[0].msg).toBe("Username can only contain letters and numbers")
    })

    test("Should return: Updated User", async () => {
        const response = await request(app)
            .put('/user/username')
            .set('Authorization', `Bearer ${accessToken}`)
            .send({
                "username":"cccccc"
            })
        expect(response.status).toBe(200)
        expect(response.body.email).toBe("testing26@example.com")
    })
})