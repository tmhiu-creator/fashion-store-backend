const Order = require('../models/order');

// 1. XỬ LÝ ĐẶT HÀNG (Lưu vào DB)
exports.postOrder = async (req, res) => {
    try {
        const { fullname, email, phone, address, note, totalMoney, cartData } = req.body;
        
        // Kiểm tra đăng nhập (Bắt buộc phải đăng nhập mới lưu được đơn vào tài khoản)
        if (!req.session.user) {
            return res.redirect('/login');
        }

        // Parse dữ liệu giỏ hàng từ chuỗi JSON
        const items = JSON.parse(cartData);

        const order = new Order({
            userId: req.session.user._id, // Lấy ID user từ session
            fullname,
            email,
            phone,
            address,
            note,
            items: items,
            totalMoney: parseInt(totalMoney)
        });

        await order.save();

        // Đặt hàng xong -> Chuyển sang trang "Đơn hàng của tôi"
        // Gửi kèm query success để bên kia hiện thông báo xóa LocalStorage
        res.redirect('/my-orders?status=success');

    } catch (err) {
        console.log(err);
        res.redirect('/checkout');
    }
};

// 2. HIỂN THỊ DANH SÁCH ĐƠN HÀNG CỦA TÔI
exports.getMyOrders = async (req, res) => {
    try {
        if (!req.session.user) {
            return res.redirect('/login');
        }

        // Tìm tất cả đơn hàng của User này, sắp xếp mới nhất lên đầu
        const orders = await Order.find({ userId: req.session.user._id }).sort({ createdAt: -1 });

        res.render('orders', {
            pageTitle: 'Đơn hàng của tôi',
            user: req.session.user,
            orders: orders
        });

    } catch (err) {
        console.log(err);
        res.redirect('/');
    }
};