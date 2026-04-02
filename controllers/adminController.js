const Product = require('../models/product');
const User = require('../models/user');
const Order = require('../models/order');
const Setting = require('../models/setting'); 
const bcrypt = require('bcryptjs');

// ==========================================
// --- 1. DASHBOARD & THỐNG KÊ ---
// ==========================================
exports.getDashboard = async (req, res) => {
    try {
        const productCount = await Product.countDocuments();
        const userCount = await User.countDocuments();
        const orderCount = await Order.countDocuments();
        
        // [QUAN TRỌNG] Tính tổng tiền: Cộng gộp cả trường cũ (totalMoney) và mới (totalPrice)
        // Nếu không có logic này, doanh thu sẽ bị tính sai hoặc thiếu
        const revenueData = await Order.aggregate([
            { $match: { $or: [{ status: 'Hoàn thành' }, { status: 'completed' }] } },
            { $group: { 
                _id: null, 
                total: { $sum: { $ifNull: ["$totalPrice", "$totalMoney"] } } 
            }}
        ]);
        const revenue = revenueData.length > 0 ? revenueData[0].total : 0;

        // Đếm đơn mới (Bao gồm cả trạng thái tiếng Anh 'pending' và tiếng Việt cũ)
        const newOrders = await Order.countDocuments({ 
            status: { $in: ['Chờ xác nhận', 'pending', 'Chờ thanh toán'] } 
        });

        res.render('admin/dashboard', {
            pageTitle: 'Trang quản trị',
            path: '/admin/dashboard',
            user: req.session.user,
            stats: { revenue, orders: orderCount, products: productCount, newOrders }
        });
    } catch (err) {
        console.log(err);
        res.redirect('/');
    }
};

// ==========================================
// --- 2. QUẢN LÝ ĐƠN HÀNG ---
// ==========================================
exports.getOrders = async (req, res) => {
    try {
        const orders = await Order.find().sort({ createdAt: -1 });
        
        // Đếm đơn mới cho badge thông báo
        const newOrdersCount = await Order.countDocuments({ 
            status: { $in: ['Chờ xác nhận', 'pending', 'Chờ thanh toán'] } 
        });

        res.render('admin/orders', {
            pageTitle: 'Quản lý đơn hàng',
            path: '/admin/orders',
            user: req.session.user,
            orders: orders,
            stats: { newOrders: newOrdersCount }
        });
    } catch (err) {
        console.log(err);
        res.redirect('/admin/dashboard');
    }
};

exports.postUpdateOrderStatus = async (req, res) => {
    try {
        // Cập nhật trạng thái (đảm bảo gửi đúng mã trạng thái tiếng Anh 'shipping', 'completed'...)
        await Order.findByIdAndUpdate(req.body.orderId, { status: req.body.status });
        res.redirect('/admin/orders');
    } catch (err) {
        console.log(err);
        res.redirect('/admin/orders');
    }
};

exports.postDeleteOrder = async (req, res) => {
    try {
        await Order.findByIdAndDelete(req.body.orderId);
        res.redirect('/admin/orders');
    } catch (err) {
        console.log(err);
        res.redirect('/admin/orders');
    }
};

// ==========================================
// --- 3. QUẢN LÝ SẢN PHẨM ---
// ==========================================
exports.getProducts = async (req, res) => {
    try {
        const products = await Product.find().sort({ createdAt: -1 });
        const newOrdersCount = await Order.countDocuments({ status: { $in: ['Chờ xác nhận', 'pending'] } });

        res.render('admin/products', {
            pageTitle: 'Quản lý sản phẩm',
            path: '/admin/products',
            products: products,
            user: req.session.user,
            stats: { newOrders: newOrdersCount }
        });
    } catch (err) {
        console.log(err);
        res.redirect('/admin/dashboard');
    }
};

exports.getAddProduct = async (req, res) => {
    try {
        const newOrdersCount = await Order.countDocuments({ status: { $in: ['Chờ xác nhận', 'pending'] } });
        res.render('admin/edit-product', {
            pageTitle: 'Thêm sản phẩm mới',
            path: '/admin/products',
            editing: false,
            user: req.session.user,
            stats: { newOrders: newOrdersCount }
        });
    } catch (err) {
        console.log(err);
        res.redirect('/admin/products');
    }
};

exports.postAddProduct = async (req, res) => {
    try {
        const { name, price, description, category_id, sizes, colors, imageURL } = req.body;
        const imageFile = req.file;

        let finalImage = imageURL;
        if (imageFile) { finalImage = '/images/' + imageFile.filename; }

        const product = new Product({
            name, price: parseInt(price), image: finalImage, description, category_id,
            sizes: sizes ? sizes.split(',').map(s => s.trim()) : [],
            colors: colors ? colors.split(',').map(c => c.trim()) : [],
            rating: 5, sold: 0
        });

        await product.save();
        res.redirect('/admin/products');
    } catch (err) {
        console.log(err);
        res.redirect('/admin/add-product');
    }
};

exports.getEditProduct = async (req, res) => {
    try {
        const product = await Product.findById(req.params.productId);
        const newOrdersCount = await Order.countDocuments({ status: { $in: ['Chờ xác nhận', 'pending'] } });
        if (!product) return res.redirect('/');

        res.render('admin/edit-product', {
            pageTitle: 'Chỉnh sửa sản phẩm',
            path: '/admin/products',
            editing: true,
            product: product,
            user: req.session.user,
            stats: { newOrders: newOrdersCount }
        });
    } catch (err) {
        console.log(err);
        res.redirect('/admin/products');
    }
};

exports.postEditProduct = async (req, res) => {
    try {
        const { productId, name, price, description, category_id, sizes, colors, imageURL } = req.body;
        const imageFile = req.file;

        const product = await Product.findById(productId);
        product.name = name;
        product.price = price;
        product.description = description;
        product.category_id = category_id;
        product.sizes = sizes ? sizes.split(',').map(s => s.trim()) : [];
        product.colors = colors ? colors.split(',').map(c => c.trim()) : [];

        if (imageFile) product.image = '/images/' + imageFile.filename;
        else product.image = imageURL;

        await product.save();
        res.redirect('/admin/products');
    } catch (err) {
        console.log(err);
        res.redirect('/admin/products');
    }
};

exports.postDeleteProduct = async (req, res) => {
    try {
        await Product.findByIdAndDelete(req.body.productId);
        res.redirect('/admin/products');
    } catch (err) {
        console.log(err);
        res.redirect('/admin/products');
    }
};

// ==========================================
// --- 4. QUẢN LÝ NGƯỜI DÙNG (USERS) ---
// ==========================================
exports.getUsers = async (req, res) => {
    try {
        const users = await User.find({ _id: { $ne: req.session.user._id } }).sort({ createdAt: -1 });
        const newOrdersCount = await Order.countDocuments({ status: { $in: ['Chờ xác nhận', 'pending'] } });

        res.render('admin/users', {
            pageTitle: 'Quản lý người dùng',
            path: '/admin/users',
            user: req.session.user,
            users: users,
            stats: { newOrders: newOrdersCount }
        });
    } catch (err) {
        console.log(err);
        res.redirect('/admin/dashboard');
    }
};

exports.postLockUser = async (req, res) => {
    try {
        const user = await User.findById(req.body.userId);
        if (user) {
            user.isLocked = !user.isLocked;
            await user.save();
        }
        res.redirect('/admin/users');
    } catch (err) { console.log(err); res.redirect('/admin/users'); }
};

exports.postDeleteUser = async (req, res) => {
    try {
        await User.findByIdAndDelete(req.body.userId);
        res.redirect('/admin/users');
    } catch (err) { console.log(err); res.redirect('/admin/users'); }
};

exports.postChangeRole = async (req, res) => {
    try {
        if (req.body.userId === req.session.user._id.toString()) return res.redirect('/admin/users');
        await User.findByIdAndUpdate(req.body.userId, { role: req.body.newRole });
        res.redirect('/admin/users');
    } catch (err) { console.log(err); res.redirect('/admin/users'); }
};

exports.postResetUserPassword = async (req, res) => {
    try {
        const hashedPassword = await bcrypt.hash("123456", 12);
        await User.findByIdAndUpdate(req.body.userId, { password: hashedPassword });
        res.redirect('/admin/users');
    } catch (err) { console.log(err); res.redirect('/admin/users'); }
};

// ==========================================
// --- 5. CÀI ĐẶT HỆ THỐNG ---
// ==========================================
exports.getSettings = async (req, res) => {
    try {
        let settings = await Setting.findOne();
        if (!settings) settings = new Setting();

        const newOrdersCount = await Order.countDocuments({ status: { $in: ['Chờ xác nhận', 'pending'] } });

        res.render('admin/settings', {
            pageTitle: 'Cài đặt hệ thống',
            path: '/admin/settings',
            user: req.session.user,
            settings: settings,
            stats: { newOrders: newOrdersCount }
        });
    } catch (err) {
        console.log(err);
        res.redirect('/admin/dashboard');
    }
};

exports.postSettings = async (req, res) => {
    try {
        const { 
            storeName, storePhone, storeEmail, storeAddress, 
            shippingFee, freeShippingThreshold,
            facebook, zalo 
        } = req.body;

        await Setting.findOneAndUpdate({}, {
            storeName, storePhone, storeEmail, storeAddress,
            shippingFee: parseInt(shippingFee),
            freeShippingThreshold: parseInt(freeShippingThreshold),
            facebook, zalo
        }, { upsert: true, new: true });

        res.redirect('/admin/settings');
    } catch (err) {
        console.log(err);
        res.redirect('/admin/settings');
    }
};