    // middlewares/auth.js
    const jwt = require('jsonwebtoken');
    const userServiceUrl = process.env.USER_SERVICE_URL || 'http://localhost:3001';
    const axios = require('axios');
    
    async function authMiddleware(fastify, options) {
      fastify.addHook('onRequest', async (request, reply) => {
        // Các route không cần xác thực
        if (request.url === '/users' && request.method === 'POST' || request.url === '/users/login' && request.method === 'POST') {
          return;
        }
    
        const authHeader = request.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
          reply.status(401).send({ error: 'Unauthorized' });
          return;
        }
    
        const token = authHeader.split(' ')[1];
    
        try {
          const decoded = jwt.verify(token, 'your-secret-key'); // Thay 'your-secret-key' bằng secret key thật
          request.user = decoded; // Lưu thông tin người dùng vào request
        } catch (err) {
          reply.status(401).send({ error: 'Invalid token' });
          return;
        }
      });
    }
    
    module.exports = authMiddleware;