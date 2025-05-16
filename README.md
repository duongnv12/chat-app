# Chat App Phân Tán

Chat App là một hệ thống giao tiếp thời gian thực với kiến trúc microservices, được thiết kế nhằm đáp ứng nhu cầu kết nối tức thời, khả năng mở rộng linh hoạt và chịu lỗi cao. Hệ thống được chia thành nhiều dịch vụ độc lập để tối ưu hóa việc phát triển, bảo trì và triển khai.

## 1. Tổng Quan

- **Mục tiêu:**  
  Cung cấp nền tảng chat thời gian thực với các tính năng:
  - Gửi/nhận tin nhắn tức thời
  - Tạo phòng chat, quản lý người dùng
  - Nhận thông báo đẩy khi có tin mới
  - Hỗ trợ đa nền tảng: Web và Mobile

- **Kiến trúc:**  
  Hệ thống sử dụng:
  - **Microservices Architecture:** Các dịch vụ chính bao gồm:  
    - `api-gateway`: Định tuyến, xác thực và xử lý cross-cutting concerns  
    - `user-service`: Quản lý người dùng  
    - `chat-service`: Xử lý tin nhắn và lưu trữ lịch sử chat  
    - `notification-service`: Gửi thông báo (push, email, SMS)  
  - **Event-Driven Architecture:** Sử dụng Message Queue (RabbitMQ/Kafka) để truyền tải sự kiện bất đồng bộ giữa các dịch vụ.
  - **Giao tiếp thực thời gian:** Sử dụng WebSocket (Socket.IO) cho giao tiếp real-time giữa client và server.

## 2. Kiến Trúc Hệ Thống

- **API Gateway:**  
  Đóng vai trò trung gian, định tuyến các request từ client đến các microservice thích hợp. Đồng thời xử lý các nhiệm vụ như xác thực, logging và giới hạn tốc độ.

- **Microservices:**  
  Mỗi service được triển khai độc lập:
  - **User Service:** Đăng ký, đăng nhập và quản lý thông tin người dùng.
  - **Chat Service:** Xử lý gửi/nhận tin nhắn, lưu trữ và quản lý phòng chat.
  - **Notification Service:** Gửi thông báo đẩy và email khi có sự kiện mới.
  
- **Frontend (Web):**  
  Ứng dụng giao diện được xây dựng bằng React, giao tiếp với API Gateway qua REST API và/WebSocket.

- **Shared Libraries:**  
  Các module dùng chung như DTO, kiểu dữ liệu, constants và helper functions được đặt ở thư mục `shared/` để đảm bảo tính nhất quán giữa các dịch vụ và giao diện.

## 3. Công Nghệ Sử Dụng

- **Backend:**  
  - Node.js, Express  
  - RabbitMQ hoặc Apache Kafka (Message Queue)  
  - Redis (Caching & Distributed Locking)  
  - Docker & Kubernetes (Containerization & Orchestration)  
  - JWT cho xác thực  
  - Prometheus, Grafana (Monitoring)  
  - ELK Stack, Graylog (Logging)  

- **Frontend:**  
  - React, TypeScript  
  - Axios (để gọi API từ API Gateway)  

## 4. Hướng Dẫn Cài Đặt

### Yêu Cầu
- Node.js (phiên bản LTS)
- Docker (nếu triển khai container)
- [Optional] NX CLI (nếu sử dụng monorepo)

### Các Bước Cài Đặt

1. **Clone repository:**
    ```bash
    git clone https://github.com/your-repo/chat-app.git
    ```

2. **Đi vào thư mục dự án:**
    ```bash
    cd chat-app
    ```

3. **Cài đặt dependencies cho từng dịch vụ:**
    - API Gateway:
      ```bash
      cd api-gateway
      npm install
      ```
    - User Service:
      ```bash
      cd ../user-service
      npm install
      ```
    - Chat Service:
      ```bash
      cd ../chat-service
      npm install
      ```
    - Notification Service:
      ```bash
      cd ../notification-service
      npm install
      ```
    - Frontend:
      ```bash
      cd ../web
      npm install
      ```

4. **Chạy dự án:**
    - Với Docker Compose (nếu có file docker-compose.yml):
      ```bash
      docker-compose up -d
      ```
    - Hoặc chạy riêng từng dịch vụ:
      ```bash
      cd api-gateway && npm start
      cd ../user-service && npm start
      # Tương tự với các dịch vụ khác
      cd ../web && npm start  # Frontend chạy tại http://localhost:3000 (hoặc cổng cấu hình)
      ```

## 5. Cấu Trúc Dự Án

```
chat-app/
├── api-gateway/                # Dịch vụ định tuyến và xử lý xác thực, logging
│   ├── src/
│   │   ├── controllers/
│   │   ├── middlewares/
│   │   ├── routes/
│   │   └── app.js
│   └── package.json
│
├── user-service/               # Dịch vụ quản lý người dùng
│   ├── src/
│   │   ├── controllers/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── models/
│   │   └── app.js
│   └── package.json
│
├── chat-service/               # Dịch vụ xử lý tin nhắn
│   ├── src/
│   │   ├── controllers/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── middlewares/
│   │   ├── models/
│   │   └── app.js
│   └── package.json
│
├── notification-service/       # Dịch vụ thông báo
│   ├── src/
│   │   ├── controllers/
│   │   ├── routes/
│   │   ├── services/
│   │   └── app.js
│   └── package.json
│
├── web/                        # Ứng dụng giao diện (React)
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/           # API calls đến API Gateway/microservices
│   │   └── App.tsx
│   └── package.json
│
└── shared/                     # Các module dùng chung (DTO, models, utilities)
    ├── libs/
    └── package.json
```

## 6. Tính Năng Chính và Tiêu Chí Đánh Giá

- **Mở đầu:** Giới thiệu hệ thống, mục tiêu, ứng dụng và sơ đồ kiến trúc tổng thể.
- **Kiến trúc:** Microservices, event-driven architecture và service-oriented communication.
- **Tiến trình và luồng:** Xử lý bất đồng bộ, scheduled tasks, background jobs.
- **Trao đổi thông tin:** Sử dụng REST API, WebSocket, Message Queue, caching...
- **Định danh:** UUID, DNS, Service Registry, JWT, SSL/TLS.
- **Đồng bộ hóa:** Distributed Locking, CQRS, Concurrency Control.
- **Sao lưu:** Database backup, incremental backup, cloud storage.
- **Tính chịu lỗi:** Circuit Breaking, Health Monitoring, Log Management, Failover, Auto-Scaling.

## 7. Hướng Phát Triển

- Tích hợp CI/CD cho từng dịch vụ.
- Tối ưu hóa hiệu năng qua việc scale independent services.
- Mở rộng thêm chức năng như video call, chat nhóm nâng cao.
- Triển khai trên Kubernetes để kiểm soát việc deploy đa vùng, chịu lỗi cao.

## 8. Liên Hệ và Tài Liệu

- **Tài liệu thiết kế chi tiết:** [Link tới tài liệu thiết kế hệ thống]
- **Email:** your.email@example.com
- **GitHub:** [YourUsername](https://github.com/YourUsername)
