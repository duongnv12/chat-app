const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const authenticateToken = require('../middlewares/auth');

// Register endpoint
router.post('/register', userController.register);

// Verify email endpoint
router.get('/verify', userController.verifyEmail);

// Login endpoint
router.post('/login', userController.login);

// Forgot password endpoint
router.post('/forgotPassword', userController.forgotPassword);

// Reset password endpoint (token truyền dưới query param)
router.post('/resetPassword', userController.resetPassword);

// Delete account endpoint (yêu cầu người dùng đã xác thực)
router.delete('/deleteAccount', authenticateToken, userController.deleteAccount);

// List users endpoint (yêu cầu người dùng đã xác thực)
router.get("/list", userController.listUsers);  // Route mới để lấy danh sách người dùng

router.get('/', (req, res) => {
  res.json({ message: "User Service is running." });
});

module.exports = router;
