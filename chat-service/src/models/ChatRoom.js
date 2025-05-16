const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema({
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',  // Giả sử tham chiếu đến User từ User Service
    required: true,
  },
  text: {
    type: String,
    required: true,
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  },
});

const ChatRoomSchema = new mongoose.Schema(
  {
    roomName: { 
      type: String, 
      required: true, 
      unique: true 
    },
    messages: [MessageSchema],
  },
  { timestamps: true }
);

module.exports = mongoose.model('ChatRoom', ChatRoomSchema);
