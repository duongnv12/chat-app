const express = require('express');
const cors = require('cors');

const app = express();

app.use(cors());
app.use(express.json()); // Để parse JSON trong request body

// Routes
const userRoutes = require('./routes/userRoutes');
app.use('/users', userRoutes);

module.exports = app;