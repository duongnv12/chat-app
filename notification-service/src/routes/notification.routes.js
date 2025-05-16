const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notification.controller');

// Định nghĩa endpoint để gửi thông báo
router.post('/send', notificationController.sendNotification);

module.exports = router;
