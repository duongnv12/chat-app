require('dotenv').config();
const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const fileRoutes = require('./routes/file.routes');

const app = express();

// Tạo thư mục uploads nếu chưa tồn tại
const uploadsPath = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsPath)) {
  fs.mkdirSync(uploadsPath);
  console.log(`Created uploads folder at ${uploadsPath}`);
}

app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use('/files', fileRoutes);

const port = process.env.PORT || 3004;
app.listen(port, () => {
  console.log(`File Service started on port ${port}`);
});

module.exports = app;
