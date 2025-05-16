const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chat.controller');

// Tạo phòng chat mới
router.post('/createRoom', chatController.createRoom);

// Gửi tin nhắn vào phòng chat
router.post('/sendMessage', chatController.sendMessage);

// Lấy danh sách tin nhắn theo roomId
router.get('/:roomId', chatController.getRoomMessages);

// Endpoint kiểm tra nhanh trạng thái service
router.get('/', (req, res) => {
  res.json({ message: "Chat Service is running" });
});

module.exports = router;
