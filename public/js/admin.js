const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const multer = require('multer');
const path = require('path');

// --- CẤU HÌNH UPLOAD ẢNH (Multer) ---
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/images'); // Lưu vào thư mục public/images
    },
    filename: (req, file, cb) => {
        // Đặt tên file: thời gian hiện tại + tên gốc (để tránh trùng)
        cb(null, Date.now() + '-' + file.originalname);
    }
});
const upload = multer({ storage: storage });

// Middleware Admin
const requireAdmin = (req, res, next) => {
    if (!req.session.user || req.session.user.role !== 'admin') {
        return res.redirect('/login');
    }
    next();
};

// --- ROUTES ---
router.get('/dashboard', requireAdmin, adminController.getDashboard);
router.get('/orders', requireAdmin, adminController.getOrders);
router.post('/order/update-status', requireAdmin, adminController.postUpdateOrderStatus);
router.post('/order/delete', requireAdmin, adminController.postDeleteOrder);
router.get('/products', requireAdmin, adminController.getProducts);

// --- [SỬA] THÊM SẢN PHẨM (Có upload ảnh) ---
router.get('/add-product', requireAdmin, adminController.getAddProduct);

// Thêm middleware 'upload.single' để xử lý file
router.post('/add-product', requireAdmin, upload.single('imageFile'), adminController.postAddProduct);

// --- [SỬA] SỬA SẢN PHẨM (Có upload ảnh) ---
router.get('/edit-product/:productId', requireAdmin, adminController.getEditProduct);
router.post('/edit-product', requireAdmin, upload.single('imageFile'), adminController.postEditProduct);

router.post('/delete-product', requireAdmin, adminController.postDeleteProduct);

module.exports = router;