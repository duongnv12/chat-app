const express = require('express');
const router = express.Router();
const {
    createRoom,
    getRooms,
    sendMessage,
    getMessages,
} = require('../controllers/chatController');
const { protect } = require('../middlewares/authMiddleware');

router.post('/rooms', protect, createRoom);
router.get('/rooms', protect, getRooms);
router.post('/messages', protect, sendMessage);
router.get('/messages/:roomId', protect, getMessages);

module.exports = router;