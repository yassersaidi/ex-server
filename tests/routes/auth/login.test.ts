import request from 'supertest';
import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import { PrismaClient } from '@prisma/client';
const bcrypt = require('bcryptjs');
import { v4 as uuidv4 } from 'uuid';

const auth = require("../../../routes/auth")

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use('/auth', auth);

const prisma = new PrismaClient();

beforeAll(async () => {
    const hashedPassword = await bcrypt.hash('testpassword', parseInt(process.env.PASSWORD_SALT as string));
    await prisma.user.create({
        data: {
            id: 'Test User' + uuidv4(),
            email: 'test@example.com',
            password: hashedPassword,
            username: 'Test User',
        },
    });
});

afterAll(async () => {
    await prisma.user.deleteMany({
        where: { email: 'test@example.com' },
    });
    await prisma.$disconnect();
});

describe("Login Route Tests", () => {
    test("Should return: (No Email Provided) Invalid Email", async () => {
        const response = await request(app)
            .post('/auth/login')
        expect(response.status).toBe(422)
        expect(response.body).toHaveProperty('errors')
        expect(response.body.errors[0].msg).toBe("Invalid Email")
    })

    test("Should return: Invalid Email", async () => {
        const response = await request(app)
            .post('/auth/login')
            .send({
                email: "testingcom",
            })
        expect(response.status).toBe(422)
        expect(response.body).toHaveProperty('errors')
        expect(response.body.errors[0].msg).toBe("Invalid Email")
    })

    test("Should return: (No Password Provided) Password should be at least 8 chars", async () => {
        const response = await request(app)
            .post('/auth/login')
            .send({
                email: "testing@cdcd.com",
            })
        expect(response.status).toBe(422)
        expect(response.body).toHaveProperty('errors')
        expect(response.body.errors[0].msg).toBe("Password should be at least 8 chars")
    })

    test("Should return: Password should be at least 8 chars", async () => {
        const response = await request(app)
            .post('/auth/login')
            .send({
                email: "testing@cdcd.com",
                password: "ddsd"
            })
        expect(response.status).toBe(422)
        expect(response.body).toHaveProperty('errors')
        expect(response.body.errors[0].msg).toBe("Password should be at least 8 chars")
    })

    test("Should return: Invalid credentials", async () => {
        const response = await request(app)
            .post('/auth/login')
            .send({
                email: "test@example.com",
                password: "ddsdbhgb"
            })
        expect(response.status).toBe(401)
        expect(response.body).toHaveProperty('error')
        expect(response.body.error).toBe("Invalid credentials")
    })

    test("Should login a user and return accessToken and username", async () => {
        const response = await request(app)
            .post('/auth/login')
            .send({
                email: "test@example.com",
                password: "testpassword"
            })
        expect(response.status).toBe(200)
        expect(response.body).toHaveProperty('accessToken')
        expect(response.body.user.username).toBe("Test User")
    })
})