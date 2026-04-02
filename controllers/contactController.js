const Contact = require('../models/contact');
const Setting = require('../models/setting');

// Hiển thị trang liên hệ
exports.getContactPage = async (req, res) => {
    try {
        // Lấy thông tin shop để hiển thị bên cạnh form
        const settings = await Setting.findOne();
        res.render('contact', {
            pageTitle: 'Liên hệ với chúng tôi',
            user: res.locals.user,
            settings: settings || {} // Tránh lỗi nếu chưa có setting
        });
    } catch (err) {
        console.log(err);
        res.redirect('/');
    }
};

// Xử lý khi khách bấm nút Gửi
exports.postContact = async (req, res) => {
    try {
        const { name, email, message } = req.body;
        
        const newContact = new Contact({
            name, email, message
        });
        await newContact.save();

        // Gửi xong thì load lại trang và báo thành công
        const settings = await Setting.findOne();
        res.render('contact', {
            pageTitle: 'Liên hệ',
            user: res.locals.user,
            settings: settings || {},
            successMessage: '✅ Cảm ơn bạn! Chúng tôi đã nhận được tin nhắn.'
        });
    } catch (err) {
        console.log(err);
        res.redirect('/contact');
    }
};