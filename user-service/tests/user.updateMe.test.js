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
    
    describe('PUT /api/users/me', () => {
      let user;
      let token;
    
      beforeEach(async () => {
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
    
      it('Should update the current user information', async () => {
        const response = await request(app)
          .put('/api/users/me')
          .set('Authorization', `Bearer ${token}`)
          .send({ username: 'updateduser', email: 'updated@example.com' })
          .expect(200);
    
        expect(response.body).toHaveProperty('username', 'updateduser');
        expect(response.body).toHaveProperty('email', 'updated@example.com');
    
        const updatedUser = await User.findById(user._id);
        expect(updatedUser.username).toBe('updateduser');
        expect(updatedUser.email).toBe('updated@example.com');
      });
    
      it('Should return 401 if no token is provided', async () => {
        await request(app)
          .put('/api/users/me')
          .send({ username: 'updateduser', email: 'updated@example.com' })
          .expect(401);
      });
    
      it('Should return 401 if token is invalid', async () => {
        await request(app)
          .put('/api/users/me')
          .set('Authorization', 'Bearer invalidtoken')
          .send({ username: 'updateduser', email: 'updated@example.com' })
          .expect(401);
      });
    
      it('Should return 400 if username already exists', async () => {
        // Tạo một người dùng khác
        const existingUser = await User.create({
          username: 'existinguser',
          email: 'existinguser@example.com',
          password: await bcrypt.hash('password123', 10),
        });
    
        const response = await request(app)
          .put('/api/users/me')
          .set('Authorization', `Bearer ${token}`)
          .send({ username: 'existinguser' })
          .expect(400);
    
        expect(response.body.message).toBe('Username đã tồn tại'); // Kiểm tra message
      });
    
      it('Should return 400 if email already exists', async () => {
        // Tạo một người dùng khác
        const existingUser = await User.create({
          username: 'existinguser',
          email: 'existinguser@example.com',
          password: await bcrypt.hash('password123', 10),
        });
    
        const response = await request(app)
          .put('/api/users/me')
          .set('Authorization', `Bearer ${token}`)
          .send({ email: 'existinguser@example.com' })
          .expect(400);
    
         expect(response.body.message).toBe('Email đã tồn tại'); // Kiểm tra message
      });
    });