const express = require('express');
const router = express.Router();
const {
    registerUser,
    loginUser,
    getUser,
    updateUser,
    deleteUser,
} = require('../controllers/userController');
// const { protect } = require('../middleware/authMiddleware'); // Middleware xác thực (tùy chọn)

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/:id', getUser); // protect, getUser nếu cần xác thực
router.put('/:id', updateUser); // protect, updateUser nếu cần xác thực
router.delete('/:id', deleteUser); // protect, deleteUser nếu cần xác thực

module.exports = router;