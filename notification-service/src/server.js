require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();

// Cấu hình middleware
app.use(express.json());
app.use(cors({
  origin: process.env.FRONTEND_ORIGIN || "*", // Ở production, thay bằng domain frontend cụ thể
  credentials: true,
}));

// Đăng ký route cho Notification Service
const notificationRoutes = require('./routes/notification.routes');
app.use('/api/notifications', notificationRoutes);

const port = process.env.PORT || 3003;

app.listen(port, () => {
  console.log(`Notification Service started on port ${port}`);
});

module.exports = app;
