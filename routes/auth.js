const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// GET Routes
router.get('/login', authController.getLoginPage);
router.get('/register', authController.getRegisterPage);
router.get('/verify-otp', authController.getVerifyPage); // Trang nhập OTP
router.get('/logout', authController.logout);

// POST Routes
router.post('/login', authController.postLogin);
router.post('/register', authController.postRegister);     // Xử lý đăng ký -> Gửi OTP
router.post('/verify-otp', authController.postVerifyOTP);  // Check OTP -> Tạo User

module.exports = router;