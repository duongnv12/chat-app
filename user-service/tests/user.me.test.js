require('dotenv').config();
const request = require('supertest');
const app = require('../src/app');
const mongoose = require('mongoose');
const User = require('../src/models/user.model');
const bcrypt = require('bcrypt');

beforeAll(async () => {
    await mongoose.connect(process.env.MONGODB_URI);
    await User.deleteMany({});
});

afterAll(async () => {
    await mongoose.connection.close();
});

describe('GET /api/users/me', () => {
  let user;
  let token;

  beforeEach(async () => {
    await User.deleteMany({}); // Xóa tất cả user trước mỗi test
    // Tạo một người dùng và lấy token trước mỗi test
    user = new User({
      username: 'testuser',
      email: 'testuser@example.com',
      password: await bcrypt.hash('password123', 10),
    });
    await user.save();

    const loginResponse = await request(app)
      .post('/api/users/login')
      .send({ username: 'testuser', password: 'password123' });
    token = loginResponse.body.token;
  });

  it('Should get the current user information', async () => {
    const response = await request(app)
      .get('/api/users/me')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(response.body).toHaveProperty('_id', user._id.toString());
    expect(response.body).toHaveProperty('username', user.username);
    expect(response.body).toHaveProperty('email', user.email);
  });

  it('Should return 401 if no token is provided', async () => {
    await request(app)
      .get('/api/users/me')
      .expect(401);
  });

  it('Should return 401 if token is invalid', async () => {
    await request(app)
      .get('/api/users/me')
      .set('Authorization', 'Bearer invalidtoken')
      .expect(401);
  });
});