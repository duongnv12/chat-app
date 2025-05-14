// src/routes/user.routes.js
   const express = require('express');
   const { body } = require('express-validator');
   const userController = require('../controllers/user.controller');
   const authMiddleware = require('../middlewares/auth.middleware');
   
   const router = express.Router();
   
   // Đăng ký người dùng
   router.post(
     '/register',
     [
       body('username').notEmpty().withMessage('Username không được để trống'),
       body('email').isEmail().withMessage('Email không hợp lệ'),
       body('password').isLength({ min: 6 }).withMessage('Mật khẩu phải có ít nhất 6 ký tự'),
     ],
     userController.register
   );
   
   // Đăng nhập người dùng
   router.post('/login', userController.login);
   
   // Lấy thông tin người dùng (yêu cầu xác thực)
   router.get('/me', authMiddleware, userController.getUser);
   
   // Cập nhật thông tin người dùng (yêu cầu xác thực)
   router.put('/me', authMiddleware, userController.updateUser);
   
   // Thay đổi mật khẩu (yêu cầu xác thực)
   router.put('/password', authMiddleware, userController.changePassword);
   
   // Xóa tài khoản (yêu cầu xác thực)
   router.delete('/me', authMiddleware, userController.deleteUser);

    // Xác thực email
    router.get('/verify-email/:token', userController.verifyEmail);

    // Gửi lại email xác thực
    router.post('/resend-verification-email', userController.resendVerificationEmail);

    // Quên mật khẩu
    router.post('/forgot-password', body('email').isEmail().withMessage('Email không hợp lệ'), userController.forgotPassword);

    // Đặt lại mật khẩu
    router.post('/reset-password/:token', body('newPassword').isLength({ min: 6 }).withMessage('Mật khẩu phải có ít nhất 6 ký tự'), userController.resetPassword);
   
   module.exports = router;