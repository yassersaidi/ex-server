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
            id: 'testing6',
            email: 'testing6@example.com',
            password: hashedPassword,
            username: 'Test6 User',
        },
        {
            id: 'testing7',
            email: 'testing7@example.com',
            password: "testing7@example.com",
            username: 'Test7 User',
            verified: true
        },
        {
            id: 'testing8',
            email: 'testing8@example.com',
            password: "testing8@example.com",
            username: 'Test8 User',
        }
        ],
    });

    await prisma.verificationCode.createMany({
        data: [
            {
                userId: "testing8",
                code: "123456",
                expiresAt: new Date(Date.now() + 15 * 60 * 1000)
            },
            {
                userId: "testing6",
                code: "788954",
                expiresAt: new Date(Date.now())
            }
        ]
    });
});

afterAll(async () => {
    await prisma.verificationCode.deleteMany({
        where: {
            userId: {
                in: ["testing6", "testing7", "testing8"]
            }
        }
    })

    await prisma.user.deleteMany({
        where: {
            email: {
                in: ["testing6@example.com", "testing7@example.com", "testing8@example.com"]
            }
        },
    });
    await prisma.$disconnect();
});

describe("Code Verification Route Tests", () => {

    test("Should return: (No Email Provided) Invalid Email", async () => {
        const response = await request(app)
            .post('/auth/verify-code')
        expect(response.status).toBe(422)
        expect(response.body).toHaveProperty('errors')
        expect(response.body.errors[0].msg).toBe("Invalid Email")
    })

    test("Should return: Invalid Email", async () => {
        const response = await request(app)
            .post('/auth/verify-code')
            .send({
                email: "testexample.com"
            })
        expect(response.status).toBe(422)
        expect(response.body).toHaveProperty('errors')
        expect(response.body.errors[0].msg).toBe("Invalid Email")
    })

    test("Should return: Invalid Code", async () => {
        const response = await request(app)
            .post('/auth/verify-code')
            .send({
                email: "test10@example.com",
            })
        expect(response.status).toBe(422)
        expect(response.body).toHaveProperty('errors')
        expect(response.body.errors[0].msg).toBe("Invalid Code")
    })

    test("Should return: Invalid Code", async () => {
        const response = await request(app)
            .post('/auth/verify-code')
            .send({
                email: "test10@example.com",
                code: "412"
            })
        expect(response.status).toBe(422)
        expect(response.body).toHaveProperty('errors')
        expect(response.body.errors[0].msg).toBe("Invalid Code")
    })

    test("Should return: Invalid Code", async () => {
        const response = await request(app)
            .post('/auth/verify-code')
            .send({
                email: "test10@example.com",
                code: "4124741"
            })
        expect(response.status).toBe(422)
        expect(response.body).toHaveProperty('errors')
        expect(response.body.errors[0].msg).toBe("Invalid Code")
    })

    test("Should return: Invalid Code", async () => {
        const response = await request(app)
            .post('/auth/verify-code')
            .send({
                email: "test10@example.com",
                code: "tgtbbfbgf"
            })
        expect(response.status).toBe(422)
        expect(response.body).toHaveProperty('errors')
        expect(response.body.errors[0].msg).toBe("Invalid Code")
    })

    test("Should return: Invalid credentials", async () => {
        const response = await request(app)
            .post('/auth/verify-code')
            .send({
                email: "test10@example.com",
                code: "410144"
            })
        expect(response.status).toBe(404)
        expect(response.body).toHaveProperty('error')
        expect(response.body.error).toBe("Invalid credentials")
    })

    test("Should return: User already verified !", async () => {
        const response = await request(app)
            .post('/auth/verify-code')
            .send({
                email: "testing7@example.com",
                code: "745123"
            })
        expect(response.status).toBe(204)
    })

    test("Should return: Invalid or expired verification code", async () => {
        const response = await request(app)
            .post('/auth/verify-code')
            .send({
                email: "testing6@example.com",
                code: "788954"
            })
        expect(response.status).toBe(400)
        expect(response.body).toHaveProperty('error')
        expect(response.body.error).toBe("Invalid or expired verification code")
    })

    test("Should return: Invalid or expired verification code", async () => {
        const response = await request(app)
            .post('/auth/verify-code')
            .send({
                email: "testing8@example.com",
                code: "754120"
            })
        expect(response.status).toBe(400)
        expect(response.body).toHaveProperty('error')
        expect(response.body.error).toBe("Invalid or expired verification code")

    })

    test("Should return: User successfully verified", async () => {
        const response = await request(app)
            .post('/auth/verify-code')
            .send({
                email: "testing8@example.com",
                code: "123456"
            })
        expect(response.status).toBe(200)
        expect(response.body).toHaveProperty('message')
        expect(response.body.message).toBe("User successfully verified")

    })

})