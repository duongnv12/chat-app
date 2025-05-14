// tests/user.forgotPassword.test.js
   const request = require('supertest');
   const app = require('../src/app');
   const mongoose = require('mongoose');
   const User = require('../src/models/user.model');
   const crypto = require('crypto');
   const nodemailer = require('nodemailer');
   const bcrypt = require('bcrypt');
   
   // Mock nodemailer bằng jest.spyOn
   const createTransportSpy = jest.spyOn(nodemailer, 'createTransport');
   const sendMailSpy = jest.spyOn(nodemailer.createTransport.prototype, 'sendMail');
   
   beforeAll(async () => {
     await mongoose.connect(process.env.MONGODB_URI);
     await User.deleteMany({});
     // Tạo một user test
     await User.create({
       username: 'testuser',
       email: 'testuser@example.com',
       password: await bcrypt.hash('password123', 10),
     });
     // Reset module cache cho nodemailer
     jest.resetModules();
   });
   
   afterAll(async () => {
     await mongoose.connection.close();
     createTransportSpy.mockRestore();
     sendMailSpy.mockRestore();
   });
   
   describe('POST /api/users/forgot-password', () => {
     it('Should send reset password email to an existing user', async () => {
       const response = await request(app)
         .post('/api/users/forgot-password')
         .send({ email: 'testuser@example.com' })
         .expect(200);
   
       expect(response.body.message).toBe('Email đặt lại mật khẩu đã được gửi. Vui lòng kiểm tra email của bạn.');
       expect(createTransportSpy).toHaveBeenCalledTimes(1);
       expect(sendMailSpy).toHaveBeenCalledTimes(1);
   
       const updatedUser = await User.findOne({ email: 'testuser@example.com' });
       expect(updatedUser.resetPasswordToken).toBeDefined();
       expect(updatedUser.resetPasswordExpires).toBeDefined();
     });
   
     it('Should return 404 if user does not exist', async () => {
       await request(app)
         .post('/api/users/forgot-password')
         .send({ email: 'nonexistent@example.com' })
         .expect(404);
     });
   
     it('Should return 400 if email is not provided', async () => {
       await request(app).post('/api/users/forgot-password').send({}).expect(400);
     });
   });