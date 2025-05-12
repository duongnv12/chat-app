const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema({
  senderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  roomId: { type: mongoose.Schema.Types.ObjectId, ref: 'Room', required: true },
  content: { type: String, required: true },
}, { timestamps: true });

const Message = mongoose.model('Message', MessageSchema);
module.exports = Message;