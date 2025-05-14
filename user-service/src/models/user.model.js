// src/models/user.model.js
   const mongoose = require('mongoose');
   
   const userSchema = new mongoose.Schema(
     {
       username: {
         type: String,
         required: true,
         unique: true,
         trim: true,
         minlength: 3,
         maxlength: 50,
       },
       email: {
         type: String,
         required: true,
         unique: true,
         trim: true,
         lowercase: true,
         match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
       },
       password: {
         type: String,
         required: true,
         minlength: 6,
       },
       profilePicture: {
         type: String,
         default: null,
       },
       emailVerified: { // Thêm trường này
         type: Boolean,
         default: false,
       },
       emailVerificationToken: { // Thêm trường này
         type: String,
         default: null,
       },
        resetPasswordToken: { // Thêm trường này
          type: String,
          default: null,
        },
        resetPasswordExpires: { // Thêm trường này
          type: Date,
          default: null,
        },
     },
     {
       timestamps: true,
     }
   );
   
   const User = mongoose.model('User', userSchema);
   
   module.exports = User;