const express = require('express');
const router = express.Router();

// Import Controller (Đảm bảo đường dẫn đúng)
const paymentController = require('../controllers/paymentController');

// 1. Tạo đơn hàng (Dùng chung cho cả COD và Online)
// Frontend checkout-payment.js sẽ gọi vào đây
router.post('/api/create-payment-order', paymentController.createPaymentOrder);

// 2. Nhận Webhook từ SePay (Tự động kích hoạt khi có tiền)
router.post('/api/bank-webhook', paymentController.webhookSePay);

// 3. Kiểm tra trạng thái đơn hàng (Polling)
router.get('/api/check-status/:orderCode', paymentController.checkOrderStatus);

module.exports = router;