require('dotenv').config();
const request = require('supertest');
const app = require('../src/app');
const mongoose = require('mongoose');
const User = require('../src/models/user.model');
const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');

beforeAll(async () => {
  await mongoose.connect(process.env.MONGODB_URI);
  await User.deleteMany({});
});

afterAll(async () => {
  await mongoose.connection.close();
});

describe('DELETE /api/users/me', () => {
  let user;
  let token;
  let uniqueUsername; // Declare uniqueUsername outside beforeEach

  beforeEach(async () => {
    // Tạo một người dùng và lấy token trước mỗi test với username duy nhất
    uniqueUsername = `testuser-${uuidv4()}`;
    user = new User({
      username: uniqueUsername,
      email: `${uniqueUsername}@example.com`,
      password: await bcrypt.hash('password123', 10),
    });
    await user.save();

    const loginResponse = await request(app)
      .post('/api/users/login')
      .send({ username: uniqueUsername, password: 'password123' });
    token = loginResponse.body.token;

    await User.deleteMany({}); // Dọn dẹp trước mỗi test
  });

  it('Should delete the current user', async () => {
    const response = await request(app)
      .delete('/api/users/me')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(response.body.message).toBe('Tài khoản đã được xóa');

    const deletedUser = await User.findById(user._id);
    expect(deletedUser).toBeNull();
  });

  it('Should return 401 if no token is provided', async () => {
    await request(app)
      .delete('/api/users/me')
      .expect(401);
  });

  it('Should return 401 if token is invalid', async () => {
    // Ensure a user exists for this test to pass correctly
    const invalidUser = new User({
        username: "invaliduser",
        email: "invaliduser@example.com",
        password: await bcrypt.hash("password123", 10)
    });
    await invalidUser.save();

    const loginResponse = await request(app)
      .post('/api/users/login')
      .send({ username: "invaliduser", password: "password123" });
    const invalidToken = loginResponse.body.token + "invalid"; // Create an invalid token

    await request(app)
      .delete('/api/users/me')
      .set('Authorization', `Bearer ${invalidToken}`)
      .expect(401);
  });
});