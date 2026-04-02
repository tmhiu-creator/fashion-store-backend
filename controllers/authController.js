const User = require('../models/user');
const bcrypt = require('bcryptjs');
const mailer = require('../utils/mailer');

// --- HÀM HỖ TRỢ ---
const formatName = (name) => {
    return name.toLowerCase().replace(/(^|\s)\S/g, l => l.toUpperCase());
};

const isValidPhone = (phone) => {
    const vnf_regex = /((09|03|07|08|05)+([0-9]{8})\b)/g;
    return vnf_regex.test(phone);
};

// --- GET CONTROLLERS ---
exports.getLoginPage = (req, res) => {
    res.render('login', { pageTitle: 'Đăng nhập', errorMessage: null });
};

exports.getRegisterPage = (req, res) => {
    res.render('register', { pageTitle: 'Đăng ký', errorMessage: null, oldData: {} });
};

// Trang nhập OTP
exports.getVerifyPage = (req, res) => {
    if (!req.session.tempUser) {
        return res.redirect('/register');
    }
    res.render('verify-otp', { 
        pageTitle: 'Xác thực OTP', 
        email: req.session.tempUser.email, 
        errorMessage: null 
    });
};

exports.logout = (req, res) => {
    req.session.destroy(() => {
        res.redirect('/');
    });
};

// --- POST CONTROLLERS ---

// BƯỚC 1: ĐĂNG KÝ
exports.postRegister = async (req, res) => {
    try {
        let { fullname, email, password, phone, confirmPassword } = req.body;

        if (password !== confirmPassword) {
            return res.render('register', { pageTitle: 'Đăng ký', errorMessage: '❌ Mật khẩu nhập lại không khớp!', oldData: req.body });
        }
        if (!fullname || fullname.trim().length <= 8) {
            return res.render('register', { pageTitle: 'Đăng ký', errorMessage: '❌ Tên phải dài hơn 8 ký tự!', oldData: req.body });
        }
        if (!isValidPhone(phone)) {
            return res.render('register', { pageTitle: 'Đăng ký', errorMessage: '❌ SĐT không hợp lệ!', oldData: req.body });
        }

        const existingUser = await User.findOne({ email: email });
        if (existingUser) {
            return res.render('register', { pageTitle: 'Đăng ký', errorMessage: '❌ Email này đã được đăng ký!', oldData: req.body });
        }

        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const hashedPassword = await bcrypt.hash(password, 12);

        req.session.tempUser = { 
            fullname: formatName(fullname.trim()), 
            email, 
            password: hashedPassword, 
            phone, 
            otp 
        };

        await mailer.sendOTP(email, otp);
        res.redirect('/verify-otp');

    } catch (err) {
        console.error(err);
        res.render('register', { pageTitle: 'Đăng ký', errorMessage: 'Lỗi hệ thống!', oldData: req.body });
    }
};

// BƯỚC 2: XÁC THỰC OTP
exports.postVerifyOTP = async (req, res) => {
    try {
        const { otp } = req.body;
        const tempUser = req.session.tempUser;

        if (!tempUser) return res.redirect('/register');

        if (otp === tempUser.otp) {
            const user = new User({
                fullname: tempUser.fullname,
                email: tempUser.email,
                password: tempUser.password,
                phone: tempUser.phone,
                role: 'customer',
                isLocked: false // Mặc định không khóa
            });
            
            await user.save();
            delete req.session.tempUser;

            return res.render('login', { 
                pageTitle: 'Đăng nhập', 
                errorMessage: null,
                successMessage: '✅ Đăng ký thành công! Vui lòng đăng nhập.' 
            });
        } else {
            return res.render('verify-otp', { 
                pageTitle: 'Xác thực OTP', 
                email: tempUser.email, 
                errorMessage: '❌ Mã OTP không đúng!' 
            });
        }
    } catch (err) {
        console.log(err);
        res.redirect('/register');
    }
};

// BƯỚC 3: ĐĂNG NHẬP (CÓ CHECK KHÓA TÀI KHOẢN)
exports.postLogin = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });

        if (!user) {
            return res.render('login', { pageTitle: 'Đăng nhập', errorMessage: '❌ Email không tồn tại!' });
        }

        // --- [MỚI] KIỂM TRA KHÓA TÀI KHOẢN ---
        if (user.isLocked) {
            return res.render('login', {
                pageTitle: 'Đăng nhập',
                errorMessage: '🚫 Tài khoản của bạn đã bị khóa. Vui lòng liên hệ Admin!'
            });
        }

        const doMatch = await bcrypt.compare(password, user.password);
        if (doMatch) {
            req.session.user = user;
            req.session.save(err => {
                res.redirect('/');
            });
        } else {
            return res.render('login', { pageTitle: 'Đăng nhập', errorMessage: '❌ Sai mật khẩu!' });
        }
    } catch (err) {
        console.log(err);
        res.redirect('/login');
    }
};