# Chat App - Hệ thống phân tán thời gian thực

## Mô tả

Ứng dụng Chat App là một hệ thống phân tán cho phép người dùng giao tiếp với nhau trong thời gian thực. Hệ thống được xây dựng theo kiến trúc Microservices, sử dụng các công nghệ hiện đại để đảm bảo khả năng mở rộng, hiệu suất và độ tin cậy.

## Các tính năng chính

* **Đăng ký và đăng nhập người dùng:** Người dùng có thể tạo tài khoản và đăng nhập để sử dụng ứng dụng.
* **Tạo và quản lý phòng chat:** Người dùng có thể tạo các phòng chat công khai hoặc riêng tư.
* **Gửi và nhận tin nhắn thời gian thực:** Người dùng có thể gửi và nhận tin nhắn trong phòng chat.
* **Thông báo:** Hệ thống gửi thông báo cho người dùng về các sự kiện quan trọng (ví dụ: tin nhắn mới).
* **(Tùy chọn)** Chia sẻ tệp, trạng thái trực tuyến, v.v.

## Kiến trúc hệ thống

Hệ thống được xây dựng theo kiến trúc Microservices, bao gồm các service sau:

* **API Gateway:** Định tuyến các request từ client đến các service tương ứng.
* **User Service:** Quản lý thông tin người dùng (đăng ký, đăng nhập, hồ sơ).
* **Chat Service:** Xử lý logic liên quan đến chat (phòng chat, tin nhắn, WebSocket).
* **Notification Service:** Xử lý thông báo (email, push notifications).

Các service giao tiếp với nhau thông qua REST APIs và Message Queue (RabbitMQ).

## Công nghệ sử dụng

* **Backend:**
    * Node.js
    * Express
    * MongoDB
    * Socket.IO
    * RabbitMQ
    * JWT (JSON Web Token)
    * bcrypt
* **Frontend:**
    * React
    * Tailwind CSS (hoặc tùy chọn)
* **Khác:**
    * Docker
    * Docker Compose

## Cấu trúc thư mục

```
chat-app/
  ├── api-gateway/       # API Gateway Service
  ├── user-service/      # User Service
  ├── chat-service/      # Chat Service
  ├── notification-service/ # Notification Service
  ├── common/            # Code dùng chung
  ├── web/               # Frontend (React)
  ├── docker-compose.yml  # Docker Compose (tùy chọn)
  └── ...
```

## Hướng dẫn cài đặt và chạy

1.  **Cài đặt Node.js và npm.**
2.  **Cài đặt Docker (tùy chọn).**
3.  **Clone repository:** `git clone <your-repository-url>`
4.  **Cài đặt các dependencies:**
    ```bash
    npm install
    ```
    (Chạy lệnh này trong từng thư mục service và trong thư mục `web/`)
5.  **Cấu hình các biến môi trường:**
    * Tạo file `.env` trong từng thư mục service và cấu hình các biến (ví dụ: `MONGODB_URI`, `JWT_SECRET`, `RABBITMQ_URL`).
6.  **Khởi chạy các service:**
    * Nếu dùng Docker Compose: `docker-compose up -d`
    * Nếu chạy thủ công: `npm start` (trong từng thư mục service)
7.  **Khởi chạy frontend:**
    ```bash
    cd web/
    npm start
    ```

## Các tiêu chí đánh giá

Dự án được đánh giá dựa trên các tiêu chí sau (tham khảo bảng chấm điểm):

* **Chương 1: Mở đầu:** Giới thiệu tổng quan về hệ thống phân tán, mục tiêu và yêu cầu.
* **Chương 2: Kiến trúc:** Đánh giá về kiến trúc Microservices, các thành phần và giao tiếp giữa các node.
* **Chương 3: Tiến trình và luồng:** Mô tả về các tiến trình, luồng xử lý và cách giao tiếp.
* **Chương 4: Trao đổi thông tin:** Đánh giá các phương thức giao tiếp (REST APIs, Message Queue, WebSocket).
* **Chương 5: Định danh:** Cơ chế định danh các node và tiến trình (UUID, JWT).
* **Chương 6: Đồng bộ hóa:** Các cơ chế đồng bộ hóa tiến trình.
* **Chương 7: Sao lưu:** Phương pháp sao lưu và phục hồi dữ liệu.
* **Chương 8: Tính chịu lỗi:** Đảm bảo khả năng phục hồi sau sự cố.

## Đóng góp

Mọi đóng góp đều được hoan nghênh! Vui lòng tạo pull request hoặc issue để thảo luận.

## Tác giả

[Tên của bạn]

## License

[Giấy phép] (ví dụ: MIT)



