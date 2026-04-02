const transporter = require('../config/mail'); // Gọi cấu hình từ file config

exports.sendOTP = async (email, otp) => {
    try {
        const mailOptions = {
            from: '"H-Fashion Shop" <no-reply@hfashion.com>',
            to: email,
            subject: 'MÃ XÁC THỰC ĐĂNG KÝ (OTP)',
            html: `
                <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 5px;">
                    <h2 style="color: #333;">Xác thực tài khoản H-Fashion</h2>
                    <p>Xin chào,</p>
                    <p>Mã OTP xác thực của bạn là:</p>
                    <h1 style="color: #d9534f; letter-spacing: 5px;">${otp}</h1>
                    <p>Mã này có hiệu lực trong 5 phút. Vui lòng không chia sẻ mã này cho bất kỳ ai.</p>
                    <hr style="border: none; border-top: 1px solid #eee;" />
                    <small style="color: #777;">Nếu bạn không yêu cầu mã này, vui lòng bỏ qua email.</small>
                </div>
            `
        };

        await transporter.sendMail(mailOptions);
        console.log(`✅ Email OTP đã gửi đến: ${email}`);
        
    } catch (err) {
        console.error('❌ Lỗi gửi mail:', err);
        throw err; // Ném lỗi ra để Controller biết đường xử lý
    }
};