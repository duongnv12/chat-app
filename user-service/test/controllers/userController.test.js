const userController = require('../../src/controllers/userController');
const User = require('../../src/models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

jest.mock('../../src/models/User');
jest.mock('bcrypt');
jest.mock('jsonwebtoken');

describe('UserController', () => {
  beforeEach(() => {
    // Reset mocks trước mỗi test
    User.findOne.mockReset();
    User.create.mockReset();
    bcrypt.hash.mockReset();
    jwt.sign.mockReset();
  });

  describe('registerUser', () => {
    it('should register a new user', async () => {
      // Mock dữ liệu đầu vào và đầu ra
      const req = {
        body: {
          username: 'testuser',
          email: 'test@example.com',
          password: 'password123',
        },
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
      const hashedPassword = 'hashedPassword';
      const newUser = {
        _id: 'someUserId',
        username: 'testuser',
        email: 'test@example.com',
      };
      const token = 'someToken';

      // Mock các hàm được gọi
      User.findOne.mockResolvedValue(null); // User doesn't exist
      bcrypt.hash.mockResolvedValue(hashedPassword);
      User.create.mockResolvedValue(newUser);
      jwt.sign.mockReturnValue(token); // Mock jwt.sign

      // Gọi hàm cần test
      await userController.registerUser(req, res);

      // Kiểm tra kết quả
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        _id: newUser._id,
        username: newUser.username,
        email: newUser.email,
        token: token,
      });
    });

    it('should return an error if user already exists', async () => {
      // Mock dữ liệu đầu vào và đầu ra
      const req = {
        body: {
          username: 'existinguser',
          email: 'existing@example.com',
          password: 'password123',
        },
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      // Mock hàm User.findOne để trả về một user tồn tại
      User.findOne.mockResolvedValue({ _id: 'someUserId' });

      // Gọi hàm cần test
      await userController.registerUser(req, res);

      // Kiểm tra kết quả
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'User already exists' });
    });

    // Thêm các test cases khác cho các trường hợp khác (ví dụ: lỗi database, lỗi input)
  });

  // Thêm các describe blocks khác cho các hàm khác (loginUser, getUser, v.v.)
});