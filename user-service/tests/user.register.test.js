// tests/user.register.test.js
    require('dotenv').config();
   const request = require('supertest');
   const app = require('../src/app');
   const mongoose = require('mongoose');
   const User = require('../src/models/user.model');
   
   beforeAll(async () => {
     await mongoose.connect(process.env.MONGODB_URI, {
       useNewUrlParser: true,
       useUnifiedTopology: true,
     });
     await User.deleteMany({});
   });
   
   afterAll(async () => {
     await mongoose.connection.close();
   });
   
   describe('POST /api/users/register', () => {
     it('Should register a new user', async () => {
       const response = await request(app)
         .post('/api/users/register')
         .send({
           username: 'testuser',
           email: 'testuser@example.com',
           password: 'password123',
         })
         .expect(201);
   
       expect(response.body).toHaveProperty('userId');
     });
   
     it('Should return 400 if username already exists', async () => {
       await request(app)
         .post('/api/users/register')
         .send({
           username: 'testuser',
           email: 'another@example.com',
           password: 'anotherpassword',
         });
   
       await request(app)
         .post('/api/users/register')
         .send({
           username: 'testuser',
           email: 'testuser2@example.com',
           password: 'password123',
         })
         .expect(400);
     });
   
     it('Should return 400 if email already exists', async () => {
       await request(app)
         .post('/api/users/register')
         .send({
           username: 'existinguser',
           email: 'testuser@example.com',
           password: 'existingpassword',
         });
   
       await request(app)
         .post('/api/users/register')
         .send({
           username: 'testuser2',
           email: 'testuser@example.com',
           password: 'password123',
         })
         .expect(400);
     });
   
     it('Should return 400 if username is not provided', async () => {
       await request(app)
         .post('/api/users/register')
         .send({
           email: 'testuser@example.com',
           password: 'password123',
         })
         .expect(400);
     });
   
     it('Should return 400 if email is not provided', async () => {
       await request(app)
         .post('/api/users/register')
         .send({
           username: 'testuser',
           password: 'password123',
         })
         .expect(400);
     });
   
     it('Should return 400 if password is not provided', async () => {
       await request(app)
         .post('/api/users/register')
         .send({
           username: 'testuser',
           email: 'testuser@example.com',
         })
         .expect(400);
     });
   });