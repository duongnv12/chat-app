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
    describe('PUT /api/users/password', () => {
      let user;
      let token;
    
      beforeEach(async () => {
        // Tạo một người dùng và lấy token trước mỗi test với username duy nhất
        const uniqueUsername = `testuser-${uuidv4()}`;
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
      });
    
      it('Should update the password with valid credentials', async () => {
        const response = await request(app)
          .put('/api/users/password')
          .set('Authorization', `Bearer ${token}`)
          .send({ oldPassword: 'password123', newPassword: 'newpassword123' })
          .expect(200);
    
        expect(response.body.message).toBe('Mật khẩu đã được cập nhật thành công.');
    
        const updatedUser = await User.findById(user._id);
        expect(await bcrypt.compare('newpassword123', updatedUser.password)).toBe(true);
      });
    
      it('Should return 401 if no token is provided', async () => {
        await request(app)
          .put('/api/users/password')
          .send({ oldPassword: 'password123', newPassword: 'newpassword123' })
          .expect(401);
      });
    
      it('Should return 401 if token is invalid', async () => {
        await request(app)
          .put('/api/users/password')
          .set('Authorization', 'Bearer invalidtoken')
          .send({ oldPassword: 'password123', newPassword: 'newpassword123' })
          .expect(401);
      });
    
      it('Should return 400 if oldPassword is incorrect', async () => {
        await request(app)
          .put('/api/users/password')
          .set('Authorization', `Bearer ${token}`)
          .send({ oldPassword: 'wrongpassword', newPassword: 'newpassword123' })
          .expect(400);
      });
    
      it('Should return 400 if oldPassword or newPassword is not provided', async () => {
        await request(app)
          .put('/api/users/password')
          .set('Authorization', `Bearer ${token}`)
          .send({})
          .expect(400);
    
        await request(app)
          .put('/api/users/password')
          .set('Authorization', `Bearer ${token}`)
          .send({ oldPassword: 'password123' })
          .expect(400);
    
        await request(app)
          .put('/api/users/password')
          .set('Authorization', `Bearer ${token}`)
          .send({ newPassword: 'newpassword123' })
          .expect(400);
      });
    });