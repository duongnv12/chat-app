// tests/user.verifyEmail.test.js

require('dotenv').config();
const request = require('supertest');
const app = require('../src/app');
const mongoose = require('mongoose');
const User = require('../src/models/user.model');
const crypto = require('crypto');

beforeEach(async () => { // Thay vì beforeAll
    await mongoose.connect(process.env.MONGODB_URI);
    await User.deleteMany({});
});

afterAll(async () => {
    await mongoose.connection.close();
});

describe('GET /api/users/verify-email/:token', () => {
    it('Should verify email with a valid token', async () => {
        const user = new User({
            username: 'testuser',
            email: 'testuser@example.com',
            password: 'password123',
            emailVerificationToken: crypto.randomBytes(20).toString('hex'),
        });
        await user.save();

        const response = await request(app)
            .get(`/api/users/verify-email/${user.emailVerificationToken}`)
            .expect(200);

        expect(response.body.message).toBe('Email đã được xác thực thành công.');

        const updatedUser = await User.findById(user._id);
        expect(updatedUser.emailVerified).toBe(true);
        expect(updatedUser.emailVerificationToken).toBeNull();
    });

    it('Should return 400 if token is invalid', async () => {
        await request(app).get('/api/users/verify-email/invalidtoken').expect(400);
    });

    it('Should return 200 if email is already verified', async () => {
        const user = new User({
            username: 'verifieduser',
            email: 'verifieduser@example.com',
            password: 'password123',
            emailVerified: true,
        });
        await user.save();

        const response = await request(app)
            .get(`/api/users/verify-email/someToken`)
            .expect(200);

        expect(response.body.message).toBe('Email đã được xác thực trước đó.');
    });
});