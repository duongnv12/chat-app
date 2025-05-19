const { createClient } = require('redis');
const server = require('./server'); // Import toàn bộ server
const io = server.io; // Lấy WebSocket từ server đã khởi tạo


(async () => {
  const subscriber = createClient({
    url: process.env.REDIS_URL || 'redis://localhost:6379'
  });

  subscriber.on('error', (err) => console.error('Redis Subscriber Error:', err));

  await subscriber.connect();

  await subscriber.subscribe('notifications', (message) => {
    if (!message) {
      console.error("Received an undefined message from Redis!");
      return;
    }

    try {
      const notification = JSON.parse(message);
      console.log("Received notification:", notification);

      // Kiểm tra JSON đã parse thành công
      if (!notification.message || !notification.userId) {
        console.error("Invalid notification format:", notification);
        return;
      }

      // Kiểm tra WebSocket đã khởi động chưa trước khi emit
      if (io) {
        io.emit('new_notification', notification);
      } else {
        console.error("WebSocket server (io) chưa được khởi động!");
      }
    } catch (err) {
      console.error("Error parsing Redis message:", err);
    }
  });


  console.log('Redis subscriber đã đăng ký kênh "notifications".');
})();
