// src/server.js
   const app = require('./app');
   const { connectDB } = require('./config/db.config');
   const dotenv = require('dotenv');
   
   dotenv.config(); // Load biến môi trường từ file .env
   
   const PORT = process.env.PORT || 3000;
   
   // Connect to database
   connectDB()
     .then(() => {
       app.listen(PORT, () => {
         console.log(`Server is running on port ${PORT}`);
       });
     })
     .catch((error) => {
       console.error('Database connection error:', error);
     });