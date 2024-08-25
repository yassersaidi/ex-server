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
            id: 'testing17',
            email: 'testing17@example.com',
            password: hashedPassword,
            username: 'Testing17 User',
        },
        {
            id: 'testing18',
            email: 'testing18@example.com',
            password: "testing18@example.com",
            username: 'Testing18 User',
            verified: true
        },
        {
            id: 'testing19',
            email: 'testing19@example.com',
            password: "testing19@example.com",
            username: 'Testing19 User',
        }
        ],
    });

    await prisma.verificationCode.createMany({
        data: [
            {
                userId: "testing19",
                code: "123456",
                expiresAt: new Date(Date.now() + 15 * 60 * 1000)
            },
            {
                userId: "testing17",
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
                in: ["testing17", "testing18", "testing19"]
            }
        }
    })

    await prisma.user.deleteMany({
        where: {
            email: {
                in: ["testing17@example.com", "testing18@example.com", "testing19@example.com"]
            }
        },
    });
    await prisma.$disconnect();
});

describe("Rest Password Route Tests", () => {

    test("Should return: (No Email Provided) Invalid Email", async () => {
        const response = await request(app)
            .post('/auth/reset-password')
        expect(response.status).toBe(422)
        expect(response.body).toHaveProperty('errors')
        expect(response.body.errors[0].msg).toBe("Invalid Email")
    })

    test("Should return: Invalid Email", async () => {
        const response = await request(app)
            .post('/auth/reset-password')
            .send({
                email: "testexample.com"
            })
        expect(response.status).toBe(422)
        expect(response.body).toHaveProperty('errors')
        expect(response.body.errors[0].msg).toBe("Invalid Email")
    })

    test("Should return: Password should be at least 8 chars", async () => {
        const response = await request(app)
            .post('/auth/reset-password')
            .send({
                email: "testing20@example.com",
            })
        expect(response.status).toBe(422)
        expect(response.body).toHaveProperty('errors')
        expect(response.body.errors[0].msg).toBe("Password should be at least 8 chars")
    })
    test("Should return: Password should be at least 8 chars", async () => {
        const response = await request(app)
            .post('/auth/reset-password')
            .send({
                email: "testing20@example.com",
                password:"784"
            })
        expect(response.status).toBe(422)
        expect(response.body).toHaveProperty('errors')
        expect(response.body.errors[0].msg).toBe("Password should be at least 8 chars")
    })

    test("Should return: Invalid Code", async () => {
        const response = await request(app)
            .post('/auth/reset-password')
            .send({
                email: "testing20@example.com",
                password:"78451ddct",
                code: "412"
            })
        expect(response.status).toBe(422)
        expect(response.body).toHaveProperty('errors')
        expect(response.body.errors[0].msg).toBe("Invalid Code")
    })

    test("Should return: Invalid Code", async () => {
        const response = await request(app)
            .post('/auth/reset-password')
            .send({
                email: "testing20@example.com",
                password:"78451ddct",
                code: "4124741"
            })
        expect(response.status).toBe(422)
        expect(response.body).toHaveProperty('errors')
        expect(response.body.errors[0].msg).toBe("Invalid Code")
    })

    test("Should return: Invalid Code", async () => {
        const response = await request(app)
            .post('/auth/reset-password')
            .send({
                email: "testing20@example.com",
                password:"78451ddct",
                code: "tgtbbfbgf"
            })
        expect(response.status).toBe(422)
        expect(response.body).toHaveProperty('errors')
        expect(response.body.errors[0].msg).toBe("Invalid Code")
    })

    test("Should return: Invalid credentials", async () => {
        const response = await request(app)
            .post('/auth/reset-password')
            .send({
                email: "testing20@example.com",
                password:"78451ddct",
                code: "410144"
            })
        expect(response.status).toBe(404)
        expect(response.body).toHaveProperty('error')
        expect(response.body.error).toBe("Invalid credentials")
    })


    test("Should return: Invalid or expired reset code", async () => {
        const response = await request(app)
            .post('/auth/reset-password')
            .send({
                email: "testing17@example.com",
                password:"78451ddct",
                code: "788954"
            })
        expect(response.status).toBe(400)
        expect(response.body).toHaveProperty('error')
        expect(response.body.error).toBe("Invalid or expired reset code")
    })

    test("Should return: Invalid or expired reset code", async () => {
        const response = await request(app)
            .post('/auth/reset-password')
            .send({
                email: "testing19@example.com",
                password:"78451ddct",
                code: "754120"
            })
        expect(response.status).toBe(400)
        expect(response.body).toHaveProperty('error')
        expect(response.body.error).toBe("Invalid or expired reset code")

    })

    test("Should return: Password successfully reset", async () => {
        const response = await request(app)
            .post('/auth/reset-password')
            .send({
                email: "testing19@example.com",
                password:"78451ddct",
                code: "123456"
            })
        expect(response.status).toBe(200)
        expect(response.body).toHaveProperty('message')
        expect(response.body.message).toBe("Password successfully reset")

    })

})