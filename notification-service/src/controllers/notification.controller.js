exports.sendNotification = async (req, res) => {
  try {
    const { userId, title, message } = req.body;
    // Giả lập việc gửi thông báo: ở đây bạn có thể tích hợp email, push notification hoặc lưu vào cơ sở dữ liệu.
    console.log(`Sending notification to user ${userId}: ${title} - ${message}`);
    
    // Trả về kết quả thành công (có thể mở rộng xử lý theo lập trình nghiệp vụ thực tế)
    return res.status(200).json({ message: "Notification sent successfully" });
  } catch (err) {
    console.error("Error sending notification:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};
