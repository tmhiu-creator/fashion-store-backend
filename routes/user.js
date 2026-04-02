const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

// Trang Profile
router.get('/profile', userController.getProfilePage);

// Xử lý cập nhật thông tin
router.post('/profile/update', userController.updateProfile);

// Xử lý đổi mật khẩu
router.post('/profile/change-password', userController.changePassword);

module.exports = router;