# Sử dụng image Node.js (ví dụ: phiên bản alpine nhẹ)
FROM node:20-alpine

# Thiết lập thư mục làm việc trong container
WORKDIR /app

# Copy file package.json và yarn.lock (nếu có) vào container
COPY package.json yarn.lock ./

# Cài đặt các dependencies
RUN yarn install --production

# Copy toàn bộ mã nguồn vào container
COPY . .

# Expose cổng được sử dụng bởi File Service (đã cấu hình PORT=3004 trong .env)
EXPOSE 3004

# Chạy ứng dụng
CMD ["node", "src/server.js"]
