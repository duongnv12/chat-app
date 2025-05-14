    const axios = require('axios');
    const userServiceUrl = process.env.USER_SERVICE_URL || 'http://localhost:3001';
    
    async function userRoutes(fastify, options) {
      // Route cho đăng ký người dùng
      fastify.post('/users', async (request, reply) => {
        try {
          const response = await axios.post(`${userServiceUrl}/users`, request.body);
          reply.send(response.data);
        } catch (error) {
          if (error.response) {
            // Lỗi từ User Service (có mã trạng thái)
            reply.status(error.response.status).send(error.response.data);
          } else if (error.request) {
            // Lỗi không có response (ví dụ: không kết nối được)
            reply.status(500).send({ error: 'User Service not available' });
          } else {
            // Lỗi khác
            reply.status(500).send({ error: error.message });
          }
        }
      });
    
      // Route cho đăng nhập người dùng
      fastify.post('/users/login', async (request, reply) => {
        try {
          const response = await axios.post(`${userServiceUrl}/users/login`, request.body);
          reply.send(response.data);
        } catch (error) {
          if (error.response) {
            reply.status(error.response.status).send(error.response.data);
          } else if (error.request) {
            reply.status(500).send({ error: 'User Service not available' });
          } else {
            reply.status(500).send({ error: error.message });
          }
        }
      });
    
      // Route cho lấy thông tin người dùng hiện tại
      fastify.get('/users/me', async (request, reply) => {
        try {
          const response = await axios.get(`${userServiceUrl}/users/me`, {
            headers: { Authorization: request.headers.authorization }
          });
          reply.send(response.data);
        } catch (error) {
          if (error.response) {
            reply.status(error.response.status).send(error.response.data);
          } else if (error.request) {
            reply.status(500).send({ error: 'User Service not available' });
          } else {
            reply.status(500).send({ error: error.message });
          }
        }
      });
    
      // Route cho cập nhật thông tin người dùng hiện tại
      fastify.put('/users/me', async (request, reply) => {
        try {
          const response = await axios.put(`${userServiceUrl}/users/me`, request.body, {
            headers: { Authorization: request.headers.authorization }
          });
          reply.send(response.data);
        } catch (error) {
          if (error.response) {
            reply.status(error.response.status).send(error.response.data);
          } else if (error.request) {
            reply.status(500).send({ error: 'User Service not available' });
          } else {
            reply.status(500).send({ error: error.message });
          }
        }
      });
    
      // Route cho đổi mật khẩu người dùng hiện tại
      fastify.put('/users/password', async (request, reply) => {
        try {
          const response = await axios.put(`${userServiceUrl}/users/password`, request.body, {
            headers: { Authorization: request.headers.authorization }
          });
          reply.send(response.data);
        } catch (error) {
          if (error.response) {
            reply.status(error.response.status).send(error.response.data);
          } else if (error.request) {
            reply.status(500).send({ error: 'User Service not available' });
          } else {
            reply.status(500).send({ error: error.message });
          }
        }
      });
    
      // Route cho xóa người dùng hiện tại
      fastify.delete('/users/me', async (request, reply) => {
        try {
          const response = await axios.delete(`${userServiceUrl}/users/me`, {
            headers: { Authorization: request.headers.authorization }
          });
          reply.send(response.data);
        } catch (error) {
          if (error.response) {
            reply.status(error.response.status).send(error.response.data);
          } else if (error.request) {
            reply.status(500).send({ error: 'User Service not available' });
          } else {
            reply.status(500).send({ error: error.message });
          }
        }
      });
    
       // Route cho gửi lại email xác thực
      fastify.post('/users/resend-verification-email', async (request, reply) => {
        try {
          const response = await axios.post(`${userServiceUrl}/users/resend-verification-email`, request.body);
          reply.send(response.data);
        } catch (error) {
          if (error.response) {
            reply.status(error.response.status).send(error.response.data);
          } else if (error.request) {
            reply.status(500).send({ error: 'User Service not available' });
          } else {
            reply.status(500).send({ error: error.message });
          }
        }
      });
    }
    
    module.exports = userRoutes;