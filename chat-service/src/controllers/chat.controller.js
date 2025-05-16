const axios = require('axios');
const ChatRoom = require('../models/ChatRoom');

// Tạo phòng chat mới
exports.createRoom = async (req, res) => {
  try {
    const { roomName } = req.body;
    if (!roomName) {
      return res.status(400).json({ message: "roomName is required" });
    }
    // Kiểm tra phòng đã tồn tại hay chưa
    const exists = await ChatRoom.findOne({ roomName });
    if (exists) {
      return res.status(400).json({ message: "Chat room already exists" });
    }
    const chatRoom = await ChatRoom.create({ roomName, messages: [] });
    return res.status(201).json({ message: "Chat room created", chatRoom });
  } catch (err) {
    console.error("Error in createRoom:", err);
    return res.status(500).json({ message: err.message });
  }
};

// Gửi tin nhắn vào phòng chat
exports.sendMessage = async (req, res) => {
  try {
    const { roomId, sender, text } = req.body;

    // Giả sử bạn lưu tin nhắn vào ChatRoom như sau:
    const chatRoom = await ChatRoom.findByIdAndUpdate(
      roomId,
      { $push: { messages: { sender, text, createdAt: new Date() } } },
      { new: true }
    );

    // Sau khi tin nhắn được lưu thành công, tiến hành gọi Notification Service:
    const notificationServiceUrl = process.env.NOTIFICATION_SERVICE_URL;
    // Gọi API của Notification Service để gửi thông báo đến người dùng
    await axios.post(`${notificationServiceUrl}/api/notifications/send`, {
      userId: sender, // Giả định: sender bảo là id người nhận thông báo, có thể điều chỉnh theo logic của bạn
      title: "Tin nhắn mới",
      message: `Bạn có một tin nhắn mới trong phòng ${roomId}: "${text}"`,
    });

    return res.status(200).json({ chatRoom });
  } catch (error) {
    console.error("Error in sendMessage:", error);
    return res.status(500).json({ message: error.message });
  }
};

// Lấy danh sách tin nhắn của một phòng chat
exports.getRoomMessages = async (req, res) => {
  try {
    const { roomId } = req.params;
    const chatRoom = await ChatRoom.findById(roomId);
    if (!chatRoom) {
      return res.status(404).json({ message: "Chat room not found" });
    }
    return res.status(200).json({ messages: chatRoom.messages });
  } catch (err) {
    console.error("Error in getRoomMessages:", err);
    return res.status(500).json({ message: err.message });
  }
};
