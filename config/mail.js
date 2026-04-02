require('dotenv').config();
const nodemailer = require('nodemailer');

// Tạo transporter để kết nối đến Gmail
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        // SỬA LẠI: Dùng đúng tên biến trong file .env (EMAIL_USER)
        user: process.env.EMAIL_USER, 
        pass: process.env.EMAIL_PASS  
    }
});

module.exports = transporter;