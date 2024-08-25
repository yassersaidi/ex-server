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
    await prisma.user.createMany({
        data: [{
            id: 'testing3',
            email: 'test3@example.com',
            password: hashedPassword,
            username: 'Test3 User',
        },
        {
            id: 'testing4',
            email: 'test4@example.com',
            password: "test4@example.com",
            username: 'Test4 User',
            verified: true
        },
        {
            id: 'testing5',
            email: 'test5@example.com',
            password: "test5@example.com",
            username: 'Test5 User',
        }
        ],
    });

    await prisma.verificationCode.create({
        data: {
            userId: "testing5",
            code: "123456",
            expiresAt: new Date(Date.now() + 15 * 60 * 1000)
        }
    });


});

afterAll(async () => {
    await prisma.verificationCode.deleteMany({
        where: {
            userId: {
                in:["testing3","testing4","testing5"]
            }
        }
    })

    await prisma.user.deleteMany({
        where: {
            email: {
                in: ["test3@example.com", "test4@example.com", "test5@example.com"]
            }
        },
    });



    await prisma.$disconnect();
});

describe("Send User Verification Code Route Tests", () => {

    test("Should return: (No Email Provided) Invalid Email", async () => {
        const response = await request(app)
            .post('/auth/verify-email')
        expect(response.status).toBe(422)
        expect(response.body).toHaveProperty('errors')
        expect(response.body.errors[0].msg).toBe("Invalid Email")
    })

    test("Should return: Invalid Email", async () => {
        const response = await request(app)
            .post('/auth/verify-email')
            .send({
                email: "testexample.com"
            })
        expect(response.status).toBe(422)
        expect(response.body).toHaveProperty('errors')
        expect(response.body.errors[0].msg).toBe("Invalid Email")
    })

    test("Should return: Invalid credentials", async () => {
        const response = await request(app)
            .post('/auth/verify-email')
            .send({
                email: "test6@example.com"
            })
        expect(response.status).toBe(404)
        expect(response.body).toHaveProperty('error')
        expect(response.body.error).toBe("Invalid credentials")
    })

    test("Should return: User already verified !", async () => {
        const response = await request(app)
            .post('/auth/verify-email')
            .send({
                email: "test4@example.com"
            })
        expect(response.status).toBe(204)
    })

    test("Should return: Verification code sent!", async () => {
        const response = await request(app)
            .post('/auth/verify-email')
            .send({
                email: "test3@example.com"
            })
        expect(response.status).toBe(200)
        expect(response.body).toHaveProperty('message')
        expect(response.body.message).toBe("Verification code sent!")
    })

    test("Should return: A verification code has already been sent", async () => {

        const response = await request(app)
            .post('/auth/verify-email')
            .send({
                email: "test5@example.com"
            })
        expect(response.status).toBe(200)
        expect(response.body).toHaveProperty('message')
        expect(response.body.message).toBe("A verification code has already been sent. Please check your email.")

    })

})