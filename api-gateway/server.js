const fastify = require('fastify')({
  logger: true
});
const fastifyCors = require('@fastify/cors'); // Thêm dòng này
const userRoutes = require('./routes/user');
const authMiddleware = require('./middlewares/auth');

fastify.register(fastifyCors, {
  origin: true, // Cho phép tất cả các origin (KHÔNG NÊN DÙNG TRONG PRODUCTION)
  methods: ['GET', 'POST', 'PUT', 'DELETE']
});

fastify.register(authMiddleware);
fastify.register(userRoutes, { prefix: '/users' });

// Khởi động server
const start = async () => {
  try {
    await fastify.listen({ port: process.env.PORT || 3000, host: '0.0.0.0' });
    fastify.log.info(`Server listening on ${fastify.server.address().port}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};
start();