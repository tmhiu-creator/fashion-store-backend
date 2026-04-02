const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');

// Xử lý gửi form đặt hàng
router.post('/order', orderController.postOrder);

// Trang xem lịch sử đơn hàng
router.get('/my-orders', orderController.getMyOrders);

module.exports = router;