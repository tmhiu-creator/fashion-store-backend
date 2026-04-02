const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');

// --- CÁC ROUTE SẢN PHẨM & TRANG CHỦ ---

// 1. Trang chủ (Đã bao gồm logic Tìm kiếm & Lọc)
router.get('/', productController.getHomePage);

// 2. Chi tiết sản phẩm
router.get('/product/:id', productController.getProductDetail);

// 3. Giỏ hàng
router.get('/cart', productController.getCartPage);

// 4. Thanh toán
router.get('/checkout', productController.getCheckoutPage);

module.exports = router;