const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const multer = require('multer');
const path = require('path');

// Cấu hình upload
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/images');
    },
    filename: (req, file, cb) => {
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

// --- DASHBOARD ---
router.get('/dashboard', requireAdmin, adminController.getDashboard);

// --- ĐƠN HÀNG ---
router.get('/orders', requireAdmin, adminController.getOrders);
router.post('/order/update-status', requireAdmin, adminController.postUpdateOrderStatus);
router.post('/order/delete', requireAdmin, adminController.postDeleteOrder);

// --- SẢN PHẨM ---
router.get('/products', requireAdmin, adminController.getProducts);
router.get('/add-product', requireAdmin, adminController.getAddProduct);
router.post('/add-product', requireAdmin, upload.single('imageFile'), adminController.postAddProduct);
router.get('/edit-product/:productId', requireAdmin, adminController.getEditProduct);
router.post('/edit-product', requireAdmin, upload.single('imageFile'), adminController.postEditProduct);
router.post('/delete-product', requireAdmin, adminController.postDeleteProduct);

// --- QUẢN LÝ USER ---
router.get('/users', requireAdmin, adminController.getUsers);
router.post('/user/lock', requireAdmin, adminController.postLockUser);
router.post('/user/delete', requireAdmin, adminController.postDeleteUser);
router.post('/user/change-role', requireAdmin, adminController.postChangeRole);
router.post('/user/reset-password', requireAdmin, adminController.postResetUserPassword);

// --- [MỚI] CÀI ĐẶT ---
router.get('/settings', requireAdmin, adminController.getSettings);
router.post('/settings', requireAdmin, adminController.postSettings);

module.exports = router;