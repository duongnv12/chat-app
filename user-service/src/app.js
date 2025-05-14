// src/app.js
   const express = require('express');
   const cors = require('cors');
   
   const userRoutes = require('./routes/user.routes');
   
   const app = express();
   
   // Middleware
   app.use(cors());
   app.use(express.json());
   
   // Routes
   app.use('/api/users', userRoutes);
   
   // Error handling middleware (optional)
   app.use((err, req, res, next) => {
     console.error(err.stack);
     res.status(500).json({ message: 'Lỗi server' });
   });
   
   module.exports = app;