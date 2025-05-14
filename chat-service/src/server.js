const app = require('./app');
const connectDB = require('./config/db');
const dotenv = require('dotenv');

dotenv.config(); // Load biến môi trường từ .env file

connectDB(); // Kết nối với MongoDB

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
    console.log(`User Service listening on port ${PORT}`);
});