// src/middlewares/auth.middleware.js
   const jwt = require('jsonwebtoken');
   
   const auth = (req, res, next) => {
     try {
       // Lấy token từ header
       const token = req.header('Authorization')?.replace('Bearer ', '');
       if (!token) {
         return res.status(401).json({ message: 'Không có token, xác thực thất bại' });
       }
   
       // Xác thực token
       const decoded = jwt.verify(token, process.env.JWT_SECRET);
   
       // Gán userId vào request để sử dụng trong các route sau
       req.userId = decoded.userId;
       next();
     } catch (error) {
       console.error(error);
       return res.status(401).json({ message: 'Token không hợp lệ' });
     }
   };
   
   module.exports = auth;