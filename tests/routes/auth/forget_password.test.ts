import request from 'supertest';
import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import { PrismaClient } from '@prisma/client';
const bcrypt = require('bcryptjs');
const auth = require("../../../routes/auth")
const app = express();

app.use(cors());
app.use(bodyParser.json());
app.use('/auth', auth);

const prisma = new PrismaClient();

beforeAll(async () => {
    const hashedPassword = await bcrypt.hash('testpassword', parseInt(process.env.PASSWORD_SALT as string));
    await prisma.user.createMany({
        data: [{
            id: 'testing11',
            email: 'testing11@example.com',
            password: hashedPassword,
            username: 'Testing11 User',
        },
        {
            id: 'testing13',
            email: 'testing13@example.com',
            password: "testing13@example.com",
            username: 'Testing13 User',
        }
        ],
    });
    await prisma.verificationCode.create({
        data: {
            userId: "testing13",
            code: "414141",
            expiresAt: new Date(Date.now() + 15 * 60 * 1000)
        }
    });
});

afterAll(async () => {
    await prisma.verificationCode.deleteMany({
        where: {
            userId: {
                in:["testing11","testing13"]
            }
        }
    })
    await prisma.user.deleteMany({
        where: {
            email: {
                in: ["testing11@example.com", "testing13@example.com"]
            }
        },
    });
    await prisma.$disconnect();
});

describe("Forget Password Route Tests", () => {
    test("Should return: (No Email Provided) Invalid Email", async () => {
        const response = await request(app)
            .post('/auth/forgot-password')
        expect(response.status).toBe(422)
        expect(response.body).toHaveProperty('errors')
        expect(response.body.errors[0].msg).toBe("Invalid Email")
    })
    test("Should return: Invalid Email", async () => {
        const response = await request(app)
            .post('/auth/forgot-password')
            .send({
                email: "testexample.com"
            })
        expect(response.status).toBe(422)
        expect(response.body).toHaveProperty('errors')
        expect(response.body.errors[0].msg).toBe("Invalid Email")
    })
    test("Should return: Invalid credentials", async () => {
        const response = await request(app)
            .post('/auth/forgot-password')
            .send({
                email: "testing16@example.com"
            })
        expect(response.status).toBe(404)
        expect(response.body).toHaveProperty('error')
        expect(response.body.error).toBe("Invalid credentials")
    })
    test("Should return: Password reset code sent!", async () => {
        const response = await request(app)
            .post('/auth/forgot-password')
            .send({
                email: "testing11@example.com"
            })
        expect(response.status).toBe(200)
        expect(response.body).toHaveProperty('message')
        expect(response.body.message).toBe("Password reset code sent!")
    })
    test("Should return: A reset code has already been sent.", async () => {
        const response = await request(app)
            .post('/auth/forgot-password')
            .send({
                email: "testing13@example.com"
            })
        expect(response.status).toBe(200)
        expect(response.body).toHaveProperty('message')
        expect(response.body.message).toBe("A reset code has already been sent. Please check your email.")
    })
})