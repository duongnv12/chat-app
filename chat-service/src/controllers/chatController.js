const Room = require('../models/Room');
const Message = require('../models/Message');

// @desc    Create a new chat room
// @route   POST /chats/rooms
// @access  Private
const createRoom = async (req, res) => {
    try {
        const { name, description } = req.body;
        const room = await Room.create({
            name,
            description,
            creatorId: req.user._id,
        });
        res.status(201).json(room);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all chat rooms
// @route   GET /chats/rooms
// @access  Private
const getRooms = async (req, res) => {
    try {
        const rooms = await Room.find();
        res.json(rooms);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Send a message
// @route   POST /chats/messages
// @access  Private
const sendMessage = async (req, res) => {
    try {
        const { roomId, content } = req.body;
        const message = await Message.create({
            senderId: req.user._id,
            roomId,
            content,
        });
        res.status(201).json(message);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get messages in a room
// @route   GET /chats/messages/:roomId
// @access  Private
const getMessages = async (req, res) => {
    try {
        const messages = await Message.find({ roomId: req.params.roomId }).populate('senderId', 'username');
        res.json(messages);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    createRoom,
    getRooms,
    sendMessage,
    getMessages,
};