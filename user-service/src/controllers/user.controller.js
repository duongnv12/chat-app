const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const transporter = require('../config/mailer');

// Hàm gửi email xác thực
const sendVerificationEmail = async (userEmail, token) => {
  const verificationUrl = `http://localhost:${process.env.PORT || 3001}/api/users/verify?token=${token}`;
  const mailOptions = {
    from: process.env.GMAIL_USER,
    to: userEmail,
    subject: 'Xác thực tài khoản của bạn',
    html: `<p>Nhấn vào <a href="${verificationUrl}">link này</a> để kích hoạt tài khoản của bạn.</p>`
  };
  return transporter.sendMail(mailOptions);
};

exports.register = async (req, res) => {
  try {
    let { username, email, password } = req.body;
    
    if (!username || !email || !password) {
      return res.status(400).json({ message: "Missing required fields" });
    }
    
    // Chuẩn hóa email
    email = email.toLowerCase().trim();
    
    // Kiểm tra xem người dùng đã tồn tại chưa
    const existingUser = await User.findOne({ $or: [{ username }, { email }] });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }
    
    // Mã hóa mật khẩu
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    // Tạo user mới với trạng thái chưa xác thực
    const newUser = await User.create({
      username,
      email,
      password: hashedPassword,
      isVerified: false
    });
    
    // Tạo token xác thực email (hết hạn 1 ngày)
    const token = jwt.sign(
      { id: newUser._id },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );
    
    // Gửi email xác thực
    await sendVerificationEmail(email, token);
    
    return res.status(201).json({ message: "Registration successful. Please check your email to verify your account." });
  } catch (err) {
    console.error("Error in register:", err);
    return res.status(500).json({ message: "Error registering user", error: err.toString() });
  }
};

exports.verifyEmail = async (req, res) => {
  try {
    const token = req.query.token;
    if (!token) return res.status(400).send("Token is missing.");
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded || !decoded.id) return res.status(400).send("Invalid token.");
    
    await User.findByIdAndUpdate(decoded.id, { isVerified: true });
    
    return res.status(200).send("Email verified successfully. You can now log in.");
  } catch (err) {
    console.error("Error in email verification:", err);
    return res.status(400).send("Invalid or expired token.");
  }
};

exports.login = async (req, res) => {
  try {
    let { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ message: "Missing email or password" });
    }
    
    email = email.toLowerCase().trim();
    
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid email or password" });
    }
    
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid email or password" });
    }
    
    if (!user.isVerified) {
      return res.status(400).json({ message: "User not verified. Please check your email." });
    }
    
    const token = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );
    
    return res.status(200).json({ message: "User logged in successfully", token });
  } catch (err) {
    console.error("Error in login:", err);
    return res.status(500).json({ message: "Error during login", error: err.toString() });
  }
};

exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Email is required" });
    
    const normalizedEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      // Trả về thông báo chung để không lộ thông tin tồn tại không
      return res.status(200).json({ message: "If that email exists, a reset link has been sent." });
    }
    
    // Tạo token reset mật khẩu với thời gian hiệu lực 15 phút
    const resetToken = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '15m' }
    );
    const resetUrl = `http://localhost:${process.env.PORT || 3001}/api/users/resetPassword?token=${resetToken}`;
    const mailOptions = {
      from: process.env.GMAIL_USER,
      to: user.email,
      subject: "Password Reset Request",
      html: `<p>Bạn đã yêu cầu đặt lại mật khẩu. Nhấn vào <a href="${resetUrl}">link này</a> để đặt lại mật khẩu của bạn.</p>
             <p>Lưu ý: Link này chỉ có hiệu lực trong 15 phút.</p>`
    };
    await transporter.sendMail(mailOptions);
    return res.status(200).json({ message: "If that email exists, a reset link has been sent." });
  } catch (err) {
    console.error("Error in forgotPassword:", err);
    return res.status(500).json({ message: "Error processing request", error: err.toString() });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const token = req.query.token;
    const { newPassword } = req.body;
    if (!token) return res.status(400).json({ message: "Token is required" });
    if (!newPassword) return res.status(400).json({ message: "New password is required" });
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }
    
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();
    return res.status(200).json({ message: "Password successfully updated" });
  } catch (err) {
    console.error("Error in resetPassword:", err);
    return res.status(500).json({ message: "Error processing request", error: err.toString() });
  }
};

exports.deleteAccount = async (req, res) => {
  try {
    const userId = req.user.id;  // Được set trong middleware authenticateToken
    await User.findByIdAndDelete(userId);
    return res.status(200).json({ message: "Your account has been deleted" });
  } catch (err) {
    console.error("Error in deleteAccount:", err);
    return res.status(500).json({ message: "Error processing your request", error: err.toString() });
  }
};
