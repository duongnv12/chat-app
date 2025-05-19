require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();

// Cấu hình middleware
app.use(cors());
app.use(express.json());

// Định tuyến các request đến microservice tương ứng
app.use('/users', createProxyMiddleware({ target: process.env.USER_SERVICE_URL, changeOrigin: true }));
app.use('/chat', createProxyMiddleware({ target: process.env.CHAT_SERVICE_URL, changeOrigin: true }));
app.use('/notification', createProxyMiddleware({ target: process.env.NOTIFICATION_SERVICE_URL, changeOrigin: true }));
app.use('/files', createProxyMiddleware({ target: process.env.FILE_SERVICE_URL, changeOrigin: true }));

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`API Gateway started on port ${port}`);
});
