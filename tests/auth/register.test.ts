import request from 'supertest';
import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import { PrismaClient } from '@prisma/client';
const bcrypt = require('bcryptjs');
import { v4 as uuidv4 } from 'uuid';

const auth = require("../../routes/auth")

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use('/auth', auth);

const prisma = new PrismaClient();

beforeAll(async () => {
    const hashedPassword = await bcrypt.hash('testpassword', parseInt(process.env.PASSWORD_SALT as string));
    await prisma.user.create({
        data: {
            id: 'Test1 User' + uuidv4(),
            email: 'test1@example.com',
            password: hashedPassword,
            username: 'Test1 User',
        },
    });
});

afterAll(async () => {
    await prisma.user.deleteMany({
        where: {
            email: {
                in: ['test1@example.com', 'test2@example.com']
            },
        }
    });
    await prisma.$disconnect();
});

describe("Register User Route Tests", () => {
    test("Should return: (No Email Provided) Invalid Email", async () => {
        const response = await request(app)
            .post('/auth/register')
        expect(response.status).toBe(422)
        expect(response.body).toHaveProperty('errors')
        expect(response.body.errors[0].msg).toBe("Invalid Email")
    })

    test("Should return: Invalid Email", async () => {
        const response = await request(app)
            .post('/auth/register')
            .send({
                email: 'testexample.com',
                username: 'testuser',
                password: 'testpassword',
            })
        expect(response.status).toBe(422)
        expect(response.body).toHaveProperty('errors')
        expect(response.body.errors[0].msg).toBe("Invalid Email")
    })

    test("Should return: Username is required", async () => {
        const response = await request(app)
            .post('/auth/register')
            .send({
                email: 'test1@example.com',
                password: 'testpassword',
            })
        expect(response.status).toBe(422)
        expect(response.body).toHaveProperty('errors')
        expect(response.body.errors[0].msg).toBe("Username is required")
    })

    test("Should return: Username should be at least 6 chars", async () => {
        const response = await request(app)
            .post('/auth/register')
            .send({
                email: 'test1@example.com',
                password: 'testpassword',
                username: "cdyhf"
            })
        expect(response.status).toBe(422)
        expect(response.body).toHaveProperty('errors')
        expect(response.body.errors[0].msg).toBe("Username should be at least 6 chars")
    })

    test("Should return: Name must contain at least one alphabetical character", async () => {
        const response = await request(app)
            .post('/auth/register')
            .send({
                email: 'test1@example.com',
                password: 'testpassword',
                username: "4715447"
            })
        expect(response.status).toBe(422)
        expect(response.body).toHaveProperty('errors')
        expect(response.body.errors[0].msg).toBe("Name must contain at least one alphabetical character")
    })

    test("Should return: The provided email already exists", async () => {
        const response = await request(app)
            .post('/auth/register')
            .send({
                email: 'test1@example.com',
                password: 'testpassword',
                username: "4715d447"
            })
        expect(response.status).toBe(409)
        expect(response.body).toHaveProperty('error')
        expect(response.body.error).toBe("The provided email already exists")
    })

    test("Should return: The provided username already exists", async () => {
        const response = await request(app)
            .post('/auth/register')
            .send({
                email: 'test2@example.com',
                password: 'testpassword',
                username: "Test1 User"
            })
        expect(response.status).toBe(409)
        expect(response.body).toHaveProperty('error')
        expect(response.body.error).toBe("The provided username already exists")
    })

    test("Should register and return the user id", async () => {
        const response = await request(app)
            .post('/auth/register')
            .send({
                email: 'test2@example.com',
                password: 'testpassword',
                username: "Test2 User"
            })
        expect(response.status).toBe(200)
    })
})