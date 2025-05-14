require('dotenv').config();
const request = require('supertest');
const app = require('../src/app');
const mongoose = require('mongoose');
const User = require('../src/models/user.model');
const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');
const nodemailer = require('nodemailer');

jest.mock('nodemailer');

beforeAll(async () => {
    await mongoose.connect(process.env.MONGODB_URI);
    await User.deleteMany({});
});

afterAll(async () => {
    await mongoose.connection.close();
    jest.restoreAllMocks();
});

describe('POST /api/users/resend-verification-email', () => {
    let user;

    beforeEach(async () => {
        // Tạo một người dùng chưa xác thực email trước mỗi test
        const uniqueUsername = `testuser-${uuidv4()}`;
        user = new User({
            username: uniqueUsername,
            email: `${uniqueUsername}@example.com`,
            password: await bcrypt.hash('password123', 10),
            emailVerified: false,
        });
        await user.save();
    });

    it('Should resend the verification email', async () => {
        const response = await request(app)
            .post('/api/users/resend-verification-email')
            .send({ email: user.email })
            .expect(200);

        expect(response.body.message).toBe('Email xác thực đã được gửi lại.');
        expect(nodemailer.createTransport).toHaveBeenCalledTimes(1);
        expect(nodemailer.createTransport().sendMail).toHaveBeenCalledTimes(1);

        const updatedUser = await User.findById(user._id);
        expect(updatedUser.emailVerificationToken).toBeDefined();
    });

    it('Should return 404 if user does not exist', async () => {
        await request(app)
            .post('/api/users/resend-verification-email')
            .send({ email: 'nonexistent@example.com' })
            .expect(404);
    });

    it('Should return 400 if email is not provided', async () => {
        await request(app)
            .post('/api/users/resend-verification-email')
            .send({})
            .expect(400);
    });
});