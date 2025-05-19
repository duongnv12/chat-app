require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const chatRoutes = require('./routes/chat.routes');

const app = express();

// Cấu hình middleware
app.use(express.json());
app.use(cors({
  origin: process.env.FRONTEND_ORIGIN || "*", // Ở production, thay thế bằng domain của frontend
  credentials: true,
}));

// Đăng ký các endpoint REST cho Chat Service
app.use('/chat', chatRoutes);

// Kết nối MongoDB nếu không ở môi trường test
if (process.env.NODE_ENV !== 'test') {
  mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
    .then(() => console.log("MongoDB connected for Chat Service..."))
    .catch((err) => console.error("MongoDB connection error:", err));
}

// Tạo HTTP server từ Express app
const server = http.createServer(app);

// Tích hợp Socket.IO vào HTTP server với cấu hình CORS
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_ORIGIN || "*", // Thay bằng domain thật khi triển khai production
    methods: ["GET", "POST"],
  }
});

// Định nghĩa các sự kiện của Socket.IO
io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`);

  // Sự kiện client tham gia phòng chat
  socket.on('joinRoom', (roomId) => {
    socket.join(roomId);
    console.log(`Socket ${socket.id} joined room ${roomId}`);
  });

  // Sự kiện nhận tin nhắn từ client và phát lại cho toàn bộ phòng
  socket.on('chatMessage', (data) => {
    console.log(`Received message from ${data.sender} for room ${data.roomId}: ${data.text}`);
    io.to(data.roomId).emit('chatMessage', data);
  });

  // Xử lý khi client disconnect
  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.id}`);
  });
});

// Khởi động server nếu không ở chế độ test
const port = process.env.PORT || 3002;
if (process.env.NODE_ENV !== 'test') {
  server.listen(port, () => {
    console.log(`Chat Service running in real-time mode on port ${port}`);
  });
}

// Xuất ra app, server và io để có thể sử dụng trong các module khác hoặc test
module.exports = { app, server, io };
