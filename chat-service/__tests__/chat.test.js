// __tests__/chat.test.js
const request = require("supertest");
const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");
const { server } = require("../src/server"); // Lấy HTTP server đã được tạo
const ChatRoom = require("../src/models/ChatRoom");

let testServerInstance;
let mongoServer;
let roomId;

describe("Chat Service Endpoints", () => {
  beforeAll(async (done) => {
    // Khởi tạo MongoDB in-memory
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    await mongoose.connect(mongoUri, { useNewUrlParser: true, useUnifiedTopology: true });
    process.env.MONGO_URI = mongoUri; // Đảm bảo mọi nơi dùng MongoDB in-memory
    
    // Sử dụng cổng ngẫu nhiên để tránh xung đột (không dùng cổng cố định)
    const randomPort = Math.floor(3000 + Math.random() * 1000);
    testServerInstance = server.listen(randomPort, done);
  });

  afterAll(async (done) => {
    try {
      if (mongoose.connection.readyState === 1 && mongoose.connection.db) {
        await mongoose.connection.db.dropDatabase();
        await mongoose.connection.close();
      }
      await mongoServer.stop();
    } catch (err) {
      console.error(err);
    }
    testServerInstance.close(done);
  });

  // Nếu cần tăng timeout cho các test (ví dụ: 10000 ms) thì có thể thêm:
  jest.setTimeout(10000);

  it("should create a new chat room", async () => {
    const res = await request(server)
      .post("/api/chat/createRoom")
      .send({ roomName: "general" });
    
    expect(res.statusCode).toEqual(201);
    expect(res.body.chatRoom).toHaveProperty("_id");
    roomId = res.body.chatRoom._id;
  });

  it("should send a message to chat room", async () => {
    const senderId = new mongoose.Types.ObjectId();
    const res = await request(server)
      .post("/api/chat/sendMessage")
      .send({ roomId, sender: senderId, text: "Hello everyone!" });
    
    expect(res.statusCode).toEqual(200);
    expect(res.body.chatRoom.messages.length).toBeGreaterThan(0);
  });

  it("should get messages from chat room", async () => {
    const res = await request(server)
      .get(`/api/chat/${roomId}`);
    
    expect(res.statusCode).toEqual(200);
    expect(Array.isArray(res.body.messages)).toBe(true);
  });
});
