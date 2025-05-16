FROM node:18-alpine

WORKDIR /app

COPY package.json /
RUN yarn install --production

COPY . .

# Expose cổng cho API Gateway (ở đây là 3000)
EXPOSE 3000

CMD ["yarn", "start"]
