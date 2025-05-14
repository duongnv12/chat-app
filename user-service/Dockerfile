# Sử dụng Node.js runtime làm base image
FROM node:18-alpine

# Đặt thư mục làm việc bên trong container
WORKDIR /app

# Copy các file package.json và package-lock.json vào thư mục làm việc
COPY package*.json ./

# Cài đặt các dependencies
RUN npm install --production

# Copy toàn bộ source code vào thư mục làm việc
COPY ./src/server.js ./server.js

# Đảm bảo file server.js tồn tại
RUN test -f server.js || (echo "Error: server.js not found!" && exit 1)

# Khai báo port mà ứng dụng sẽ lắng nghe
EXPOSE 3000

# Lệnh chạy ứng dụng
CMD ["npm", "start"]