// tests/user.resetPassword.test.js
    require('dotenv').config();
   const request = require('supertest');
   const app = require('../src/app');
   const mongoose = require('mongoose');
   const User = require('../src/models/user.model');
   const bcrypt = require('bcrypt');
   const crypto = require('crypto');
   
   beforeAll(async () => {
     await mongoose.connect(process.env.MONGODB_URI);
     await User.deleteMany({});
   });
   
   afterAll(async () => {
     await mongoose.connection.close();
   });
   
   describe('POST /api/users/reset-password/:token', () => {
     let user;
     let resetToken;
   
     beforeEach(async () => {
       resetToken = crypto.randomBytes(20).toString('hex');
       user = new User({
         username: 'testuser',
         email: 'testuser@example.com',
         password: await bcrypt.hash('password123', 10),
         resetPasswordToken: resetToken,
         resetPasswordExpires: Date.now() + 3600000,
       });
       await user.save();
     });
   
     afterEach(async () => {
       await User.deleteMany({}); // Xóa tất cả user sau mỗi test
     });
   
     it('Should reset password with a valid token', async () => {
       const response = await request(app)
         .post(`/api/users/reset-password/${resetToken}`)
         .send({ newPassword: 'newpassword123' })
         .expect(200);
   
       expect(response.body.message).toBe('Mật khẩu đã được đặt lại thành công.');
   
       const updatedUser = await User.findById(user._id);
       expect(await bcrypt.compare('newpassword123', updatedUser.password)).toBe(true);
       expect(updatedUser.resetPasswordToken).toBeNull();
       expect(updatedUser.resetPasswordExpires).toBeNull();
     });
   
     it('Should return 400 if token is invalid', async () => {
       await request(app)
         .post('/api/users/reset-password/invalidtoken')
         .send({ newPassword: 'newpassword123' })
         .expect(400);
     });
   
     it('Should return 400 if token has expired', async () => {
       const expiredUser = new User({
         username: 'expireduser',
         email: 'expireduser@example.com',
         password: await bcrypt.hash('password123', 10),
         resetPasswordToken: 'expiredtoken',
         resetPasswordExpires: Date.now() - 3600000,
       });
       await expiredUser.save();
   
       await request(app)
         .post('/api/users/reset-password/expiredtoken')
         .send({ newPassword: 'newpassword123' })
         .expect(400);
     });
   
     it('Should return 400 if newPassword is not provided', async () => {
       await request(app)
         .post(`/api/users/reset-password/${resetToken}`)
         .send({})
         .expect(400);
     });
   });