// tests/user.login.test.js
   require('dotenv').config(); // Thêm dòng này ở đầu file
   const request = require('supertest');
   const app = require('../src/app');
   const mongoose = require('mongoose');
   const User = require('../src/models/user.model');
   const bcrypt = require('bcrypt');
   
   beforeAll(async () => {
     await mongoose.connect(process.env.MONGODB_URI, {
       useNewUrlParser: true,
       useUnifiedTopology: true,
     });
     await User.deleteMany({});
     // Tạo một user test để đăng nhập
     await User.create({
       username: 'testuser',
       email: 'testuser@example.com',
       password: await bcrypt.hash('password123', 10), // Sử dụng bcrypt.hash
     });
   });
   
   afterAll(async () => {
     await mongoose.connection.close();
   });
   
   describe('POST /api/users/login', () => {
     it('Should login with valid credentials and return a token', async () => {
       const response = await request(app)
         .post('/api/users/login')
         .send({
           username: 'testuser',
           password: 'password123',
         })
         .expect(200);
   
       expect(response.body).toHaveProperty('token');
     });
   
     it('Should return 400 if username does not exist', async () => {
       await request(app)
         .post('/api/users/login')
         .send({
           username: 'nonexistentuser',
           password: 'password123',
         })
         .expect(400);
     });
   
     it('Should return 400 if password is incorrect', async () => {
       await request(app)
         .post('/api/users/login')
         .send({
           username: 'testuser',
           password: 'wrongpassword',
         })
         .expect(400);
     });
   
     it('Should return 400 if username is not provided', async () => {
       await request(app)
         .post('/api/users/login')
         .send({
           password: 'password123',
         })
         .expect(400);
     });
   
     it('Should return 400 if password is not provided', async () => {
       await request(app)
         .post('/api/users/login')
         .send({
           username: 'testuser',
         })
         .expect(400);
     });
   });