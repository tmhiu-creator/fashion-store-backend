const User = require('../models/user');
const bcrypt = require('bcryptjs'); // Hoặc 'bcrypt' tùy thư viện bạn dùng

// 1. Hiển thị trang Profile
exports.getProfilePage = async (req, res) => {
    try {
        if (!req.session.user) return res.redirect('/login');

        // Lấy thông tin mới nhất từ DB (tránh dùng session cũ)
        const user = await User.findById(req.session.user._id);

        res.render('profile', {
            pageTitle: 'Thông tin tài khoản',
            user: user,
            message: null, // Để hiện thông báo thành công/thất bại
            type: null     // success hoặc danger
        });
    } catch (err) {
        console.error(err);
        res.redirect('/');
    }
};

// 2. Cập nhật thông tin cá nhân
exports.updateProfile = async (req, res) => {
    try {
        const userId = req.session.user._id;
        const { fullname, phone, address } = req.body;

        await User.findByIdAndUpdate(userId, { 
            fullname, phone, address 
        });

        // Cập nhật lại session để header hiển thị đúng tên mới ngay lập tức
        req.session.user.fullname = fullname;
        req.session.user.phone = phone;
        req.session.user.address = address;

        // Render lại trang với thông báo thành công
        const user = await User.findById(userId);
        res.render('profile', {
            pageTitle: 'Thông tin tài khoản',
            user: user,
            message: '✅ Cập nhật thông tin thành công!',
            type: 'success'
        });

    } catch (err) {
        console.error(err);
        const user = await User.findById(req.session.user._id);
        res.render('profile', {
            pageTitle: 'Thông tin tài khoản',
            user: user,
            message: '❌ Lỗi hệ thống, vui lòng thử lại.',
            type: 'danger'
        });
    }
};

// 3. Đổi mật khẩu
exports.changePassword = async (req, res) => {
    try {
        const userId = req.session.user._id;
        const { currentPassword, newPassword, confirmPassword } = req.body;
        const user = await User.findById(userId);

        // Kiểm tra mật khẩu cũ
        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
            return res.render('profile', {
                pageTitle: 'Thông tin tài khoản',
                user: user,
                message: '⚠️ Mật khẩu hiện tại không đúng!',
                type: 'danger'
            });
        }

        // Kiểm tra xác nhận mật khẩu mới
        if (newPassword !== confirmPassword) {
            return res.render('profile', {
                pageTitle: 'Thông tin tài khoản',
                user: user,
                message: '⚠️ Mật khẩu xác nhận không khớp!',
                type: 'danger'
            });
        }

        // Kiểm tra độ dài mật khẩu (Tùy chọn)
        if (newPassword.length < 6) {
            return res.render('profile', {
                pageTitle: 'Thông tin tài khoản',
                user: user,
                message: '⚠️ Mật khẩu mới phải có ít nhất 6 ký tự.',
                type: 'danger'
            });
        }

        // Mã hóa và lưu mật khẩu mới
        const hashedPassword = await bcrypt.hash(newPassword, 12);
        user.password = hashedPassword;
        await user.save();

        res.render('profile', {
            pageTitle: 'Thông tin tài khoản',
            user: user,
            message: '✅ Đổi mật khẩu thành công!',
            type: 'success'
        });

    } catch (err) {
        console.error(err);
        res.redirect('/profile');
    }
};