import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';

const socket = io("http://localhost:3003", {
  withCredentials: true
});

const NotificationComponent = () => {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    socket.on('new_notification', (notification) => {
      setNotifications((prev) => [...prev, notification]);
    });

    return () => {
      socket.off('new_notification');
    };
  }, []);

  return (
    <div>
      <h2>Thông báo mới:</h2>
      <ul>
        {notifications.map((notif, index) => (
          <li key={index}>{notif.message}</li>
        ))}
      </ul>
    </div>
  );
};

export default NotificationComponent;
