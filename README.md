# Chat App Microservices

Đây là dự án Chat App được xây dựng theo kiến trúc microservices, tích hợp nhiều công nghệ hiện đại như Docker, Redis, MinIO, Socket.IO và React + Vite cho frontend. Hệ thống cung cấp các chức năng:

- **API Gateway**: Điều phối và định tuyến các yêu cầu từ client đến các microservice.
- **Notification Service**: Xử lý thông báo theo thời gian thực, tích hợp với Redis (Pub/Sub) và Socket.IO để đẩy thông báo realtime tới các client.
- **File Service**: Quản lý upload file, tích hợp với MinIO (giống AWS S3) để lưu trữ file.
- **Chat Service**: (Có thể bổ sung) Xử lý chat realtime giữa người dùng.
- **User Service**: (Có thể bổ sung) Quản lý thông tin người dùng.
- **Frontend (Web)**: Giao diện người dùng xây dựng bằng React và Vite, hiển thị thông báo realtime và các chức năng bổ sung khác.

## Kiến trúc hệ thống

![Architecture Diagram](link-to-your-diagram-if-any)

Hệ thống được triển khai với Docker Compose, trong đó các container chạy chung một network, giúp các service giao tiếp với nhau thông qua tên service định nghĩa trong file `docker-compose.yml`. Ví dụ:
- Notification Service truy cập Redis qua hostname `redis`.
- File Service truy cập MinIO qua hostname `minio`.

## Cấu trúc dự án

```
chat-app/
├── api-gateway/            # Dịch vụ API Gateway (định tuyến request đến các service)
├── chat-service/           # (Tùy chọn) Dịch vụ chat realtime
├── file-service/           # Dịch vụ upload file tích hợp với MinIO
├── notification-service/   # Dịch vụ thông báo realtime sử dụng Redis + Socket.IO
├── user-service/           # (Tùy chọn) Dịch vụ quản lý người dùng
├── web/                    # Frontend ứng dụng sử dụng React + Vite
├── docker-compose.yml      # File cấu hình Docker Compose tổng hợp các service
└── README.md               # File hướng dẫn chi tiết (File này)
```

## Yêu cầu và Công nghệ sử dụng

- **Docker & Docker Compose:** Để container hoá các microservice.
- **Node.js:** Cho backend (API Gateway, Notification Service, File Service, v.v.)
- **Express:** Xây dựng API REST cho các service.
- **Socket.IO:** Tích hợp realtime giữa Notification Service và Frontend.
- **Redis:** Dùng cho cache và pub/sub (thông báo realtime).
- **MinIO:** Lưu trữ file theo mô hình S3.
- **React + Vite:** Giao diện frontend hiện đại, nhanh và đơn giản.
- **MongoDB:** (Có thể sử dụng) Lưu trữ dữ liệu người dùng, tin nhắn, v.v.

## Cài đặt và Chạy hệ thống

### 1. Cấu hình environment variables

Mỗi service đều có file `.env` riêng, ví dụ:

**File Service (.env):**
```
PORT=3004
FRONTEND_ORIGIN=http://localhost:3000
MINIO_ENDPOINT=http://minio:9000
AWS_ACCESS_KEY_ID=minioadmin
AWS_SECRET_ACCESS_KEY=minioadmin
AWS_REGION=us-east-1
AWS_BUCKET_NAME=files
```

**Notification Service (.env):**
```
PORT=3003
REDIS_URL=redis://redis:6379
FRONTEND_ORIGIN=http://localhost:3000
```

Hãy đảm bảo các giá trị cấu hình phù hợp, nhất là khi chạy trong môi trường Docker.

### 2. Docker Compose

File `docker-compose.yml` tích hợp tất cả các service. Ví dụ:

```yaml
version: "3.8"

services:
  api-gateway:
    build:
      context: ./api-gateway
      dockerfile: Dockerfile
    container_name: api-gateway
    ports:
      - "3000:3000"
    depends_on:
      - notification-service
      - file-service
      # - chat-service
      # - user-service

  notification-service:
    build:
      context: ./notification-service
      dockerfile: Dockerfile
    container_name: notification-service
    environment:
      - PORT=3003
      - REDIS_URL=redis://redis:6379
      - FRONTEND_ORIGIN=http://localhost:3000
    ports:
      - "3003:3003"
    depends_on:
      - redis

  file-service:
    build:
      context: ./file-service
      dockerfile: Dockerfile
    container_name: file-service
    environment:
      - PORT=3004
      - FRONTEND_ORIGIN=http://localhost:3000
      - MINIO_ENDPOINT=http://minio:9000
      - AWS_ACCESS_KEY_ID=minioadmin
      - AWS_SECRET_ACCESS_KEY=minioadmin
      - AWS_REGION=us-east-1
      - AWS_BUCKET_NAME=files
    ports:
      - "3004:3004"
    depends_on:
      - minio

  redis:
    image: redis:latest
    container_name: redis
    ports:
      - "6379:6379"

  minio:
    image: minio/minio
    container_name: minio
    ports:
      - "9000:9000"
      - "9001:9001"
    environment:
      MINIO_ROOT_USER: minioadmin
      MINIO_ROOT_PASSWORD: minioadmin
    command: server /data --console-address ":9001"
    volumes:
      - minio-data:/data

  # Khai báo thêm các service khác (chat-service, user-service) nếu có

volumes:
  minio-data:
```

### 3. Chạy hệ thống

Trong root directory của dự án, chạy lệnh:

```bash
docker compose up --build
```

Các service sẽ được khởi động và có thể truy cập theo các cổng:
- **API Gateway:** [http://localhost:3000](http://localhost:3000)
- **Notification Service:** [http://localhost:3003](http://localhost:3003)
- **File Service:** [http://localhost:3004](http://localhost:3004)
- **MinIO Console:** [http://localhost:9001](http://localhost:9001)

### 4. Frontend (Web)

Frontend được xây dựng bằng React + Vite và nằm trong thư mục `web`. Để chạy frontend, di chuyển đến thư mục `web` và chạy:

```bash
yarn install
yarn dev
```

Frontend sẽ được phục vụ tại [http://localhost:5173](http://localhost:5173) (hoặc địa chỉ được hiển thị trên terminal).  
Component **NotificationComponent.jsx** sẽ tự động kết nối với Notification Service qua Socket.IO để nhận thông báo realtime.

## Kiểm thử

1. **Kiểm thử Notification Service:**

   Gửi request thông báo bằng cURL:

   ```bash
   curl -X POST http://localhost:3003/api/notification/send \
     -H "Content-Type: application/json" \
     -d '{"message": "Hello, WebSocket!", "userId": "12345"}'
   ```

   Nếu thành công, log trên Notification Service sẽ hiển thị thông báo đã gửi, đồng thời frontend sẽ được cập nhật realtime.

2. **Kiểm thử File Service:**

   Upload file bằng cURL:

   ```bash
   curl -X POST http://localhost:3004/api/files/upload -F "file=@assets/test-image.jpg"
   ```

   Sau đó kiểm tra giao diện MinIO trên [http://localhost:9001](http://localhost:9001) để xác nhận file đã được lưu đúng.

## Bảo mật và Mở rộng

- **Bảo mật:**  
  Xem xét tích hợp các biện pháp xác thực (JWT/OAuth), hạn chế CORS, và mã hóa dữ liệu khi cần thiết.

- **Giám sát & Logging:**  
  Tích hợp công cụ giám sát như Prometheus + Grafana, và hệ thống logging (ELK Stack) để theo dõi hiệu suất của từng service.

- **CI/CD:**  
  Thiết lập pipeline CI/CD cho quá trình build và deploy tự động.


## Hướng dẫn sử dụng

1. **Clone Repository và thiết lập các biến môi trường**  
2. **Chạy Docker Compose:** `docker compose up --build`  
3. **Chạy Frontend:** (trong thư mục `web`) `yarn dev`  
4. **Kiểm thử các API và realtime notification**

## Kết luận

Dự án Chat App Microservices là một hệ thống phân tán hoàn chỉnh với các thành phần backend realtime (Socket.IO, Redis, MinIO) và frontend hiện đại (React + Vite). Hãy tiếp tục mở rộng và tối ưu hệ thống theo yêu cầu sản xuất.

## Liên hệ & Hỗ trợ

Nếu có thắc mắc hay góp ý, hãy liên hệ với [tên & email] hoặc mở issue trên repository này.

Chúc bạn thành công với hệ thống Chat App Microservices của mình!
