// __tests__/chat.integration.test.js
jest.setTimeout(15000); // Tăng timeout lên 15 giây

const request = require("supertest");
const axios = require('axios');
const { server } = require("../src/server");
const ChatRoom = require("../src/models/ChatRoom");

// Giả lập Notification Service bằng cách spy trên axios.post
jest.mock('axios');

describe("Chat Service Integration with Notification Service", () => {
  let roomId;

  it("should send a message and trigger notification", async () => {
    // Giả sử tạo phòng chat đã có
    const createRes = await request(server)
      .post("/api/chat/createRoom")
      .send({ roomName: "general" });
    roomId = createRes.body.chatRoom._id;

    // Thiết lập spy để kiểm tra axios.post được gọi
    axios.post.mockResolvedValue({ data: { message: "Notification sent successfully" } });

    const senderId = "USER_ID";
    const text = "Hello integration!";
    const res = await request(server)
      .post("/api/chat/sendMessage")
      .send({ roomId, sender: senderId, text });

    expect(res.statusCode).toEqual(200);
    expect(axios.post).toHaveBeenCalledWith(
      expect.stringContaining("/api/notifications/send"),
      expect.objectContaining({
        userId: senderId,
        title: expect.any(String),
        message: expect.stringContaining(text),
      })
    );
  });
});
