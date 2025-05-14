// src/controllers/user.controller.js
const User = require('../models/user.model');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const crypto = require('crypto'); // Thêm dòng này
const nodemailer = require('nodemailer'); // Thêm dòng này

// Cấu hình nodemailer (thay thế bằng cấu hình email của bạn)
const transporter = nodemailer.createTransport({
  service: 'Gmail',
  auth: {
    user: 'ngduog.04@gmail.com', // Thay bằng email Gmail của bạn
    pass: 'cpvzndcrilnahhmj',    // Thay bằng mật khẩu ứng dụng hoặc mật khẩu Gmail
  },
});

exports.register = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const existingUser = await User.findOne({
            $or: [{ username: req.body.username }, { email: req.body.email }],
        });
        if (existingUser) {
            return res.status(400).json({ message: 'Username hoặc email đã tồn tại' });
        }

        const hashedPassword = await bcrypt.hash(req.body.password, 10);

        // Tạo token xác thực email
        const emailVerificationToken = crypto.randomBytes(20).toString('hex'); // Tạo token

        const newUser = new User({
            username: req.body.username,
            email: req.body.email,
            password: hashedPassword,
            emailVerificationToken: emailVerificationToken, // Lưu token
        });

        const savedUser = await newUser.save();

        // Gửi email xác thực
        const verificationLink = `http://localhost:3000/api/users/verify-email/${emailVerificationToken}`; // Tạo link
        const mailOptions = {
            from: 'Chat App <chat-app@example.com>',
            to: req.body.email,
            subject: 'Xác thực email của bạn',
            html: `Vui lòng nhấp vào <a href="${verificationLink}">đây</a> để xác thực email của bạn.`, // Nội dung email
        };

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.error('Lỗi gửi email:', error);
            } else {
                console.log('Email đã được gửi:', info.response);
            }
        });

        res.status(201).json({
            message: 'Người dùng đã được tạo thành công. Vui lòng kiểm tra email để xác thực.',
            userId: savedUser._id,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Lỗi server' });
    }
};

// Hàm xác thực email
exports.verifyEmail = async (req, res) => {
  try {
    const token = req.params.token;

    const user = await User.findOne({ emailVerificationToken: token });

    if (user) {
      user.emailVerified = true;
      user.emailVerificationToken = null;
      await user.save();
      return res.json({ message: 'Email đã được xác thực thành công.' });
    }

    // Nếu không tìm thấy user với token, kiểm tra xem có user nào đã được xác thực không
    const alreadyVerifiedUser = await User.findOne({ emailVerificationToken: null, emailVerified: true });
    if (alreadyVerifiedUser) {
      return res.status(200).json({ message: 'Email đã được xác thực trước đó.' });
    }

    return res.status(400).json({ message: 'Token xác thực không hợp lệ hoặc đã hết hạn.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Lỗi server' });
  }
};

// Hàm đăng nhập người dùng
exports.login = async (req, res) => {
  try {
    const { username, password } = req.body; // Lấy username và password từ body

    if (!username || !password) {
      return res.status(400).json({ message: 'Vui lòng cung cấp username và password.' });
    }

    // Tìm người dùng theo username
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(400).json({ message: 'Username không tồn tại' });
    }

    // So sánh mật khẩu
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(400).json({ message: 'Mật khẩu không đúng' });
    }

    // Tạo và trả về JWT token
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: '1h', // Thời gian hết hạn của token
    });

    res.status(200).json({ message: 'Đăng nhập thành công', token: token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Lỗi server' });
  }
};

// Hàm lấy thông tin người dùng (yêu cầu xác thực)
exports.getUser = async (req, res) => {
    try {
        // Lấy thông tin người dùng từ database (không bao gồm password)
        const user = await User.findById(req.userId).select('-password');
        if (!user) {
            return res.status(404).json({ message: 'Người dùng không tồn tại' });
        }

        res.status(200).json(user);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Lỗi server' });
    }
};

// Hàm cập nhật thông tin người dùng (yêu cầu xác thực)
exports.updateUser = async (req, res) => {
    try {
        const updates = Object.keys(req.body);
        const allowedUpdates = ['username', 'email', 'profilePicture']; // Các trường được phép cập nhật
        const isValidOperation = updates.every((update) => allowedUpdates.includes(update));

        if (!isValidOperation) {
            return res.status(400).json({ message: 'Invalid updates!' });
        }

        const user = await User.findById(req.userId);

        if (!user) {
            return res.status(404).json({ message: 'Người dùng không tồn tại' });
        }

        updates.forEach((update) => (user[update] = req.body[update]));
        await user.save();

        res.json(user);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Lỗi server' });
    }
};

// Hàm thay đổi mật khẩu (yêu cầu xác thực)
exports.changePassword = async (req, res) => {
    try {
        const user = await User.findById(req.userId);
        if (!user) {
            return res.status(404).json({ message: 'Người dùng không tồn tại' });
        }

        const isMatch = await bcrypt.compare(req.body.oldPassword, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Mật khẩu cũ không đúng' });
        }

        const hashedPassword = await bcrypt.hash(req.body.newPassword, 10);
        user.password = hashedPassword;
        await user.save();

        res.json({ message: 'Mật khẩu đã được thay đổi' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Lỗi server' });
    }
};

// Hàm xóa tài khoản người dùng (yêu cầu xác thực)
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.userId);
    if (!user) {
      return res.status(404).json({ message: 'Người dùng không tồn tại' });
    }
    res.json({ message: 'Tài khoản đã được xóa' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Lỗi server' });
  }
};

// Hàm gửi lại email xác thực
exports.resendVerificationEmail = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: 'Người dùng không tồn tại.' });
    }

    if (user.emailVerified) {
      return res.status(400).json({ message: 'Email đã được xác thực trước đó.' });
    }

    // Tạo token xác thực email mới
    const emailVerificationToken = crypto.randomBytes(20).toString('hex');
    user.emailVerificationToken = emailVerificationToken;
    await user.save();

    // Gửi email xác thực mới
    const verificationLink = `http://localhost:3000/api/users/verify-email/${emailVerificationToken}`;
    const mailOptions = {
      from: 'Chat App <chat-app@example.com>',
      to: email,
      subject: 'Xác thực lại email của bạn',
      html: `Vui lòng nhấp vào <a href="${verificationLink}">đây</a> để xác thực email của bạn.`,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error('Lỗi gửi email:', error);
      } else {
        console.log('Email đã được gửi lại:', info.response);
      }
    });

    res.json({ message: 'Email xác thực đã được gửi lại. Vui lòng kiểm tra email của bạn.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Lỗi server' });
  }
};

// Hàm quên mật khẩu
exports.forgotPassword = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: 'Người dùng không tồn tại.' });
    }

    // Tạo token đặt lại mật khẩu
    const resetToken = crypto.randomBytes(20).toString('hex');
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = Date.now() + 3600000; // Token có thời hạn 1 giờ
    await user.save();

    // Gửi email đặt lại mật khẩu
    const resetLink = `http://localhost:3000/api/users/reset-password/${resetToken}`;
    const mailOptions = {
      from: 'Chat App <chat-app@example.com>',
      to: email,
      subject: 'Đặt lại mật khẩu của bạn',
      html: `Vui lòng nhấp vào <a href="${resetLink}">đây</a> để đặt lại mật khẩu của bạn. Liên kết này sẽ hết hạn sau 1 giờ.`,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error('Lỗi gửi email:', error);
      } else {
        console.log('Email đặt lại mật khẩu đã được gửi:', info.response);
      }
    });

    res.json({ message: 'Email đặt lại mật khẩu đã được gửi. Vui lòng kiểm tra email của bạn.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Lỗi server' });
  }
};

// Hàm đặt lại mật khẩu
exports.resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { newPassword } = req.body;

    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ message: 'Token đặt lại mật khẩu không hợp lệ hoặc đã hết hạn.' });
    }

    if (!newPassword) {
      return res.status(400).json({ message: 'Vui lòng cung cấp mật khẩu mới.' });
    }

    // Mã hóa mật khẩu mới
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;
    await user.save();

    res.json({ message: 'Mật khẩu đã được đặt lại thành công.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Lỗi server' });
  }
};