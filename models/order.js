const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    // [MỚI] Liên kết với bảng User (nếu khách đã đăng nhập)
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },

    fullname: { type: String, required: true },
    email: { type: String }, // Để gửi email xác nhận
    phone: { type: String, required: true },
    address: { type: String, required: true },
    note: { type: String },
    
    // [ĐÃ SỬA] Đổi từ totalMoney -> totalPrice cho khớp với Controller
    totalPrice: { type: Number, required: true },
    
    // [MỚI] Thêm phí vận chuyển
    shippingFee: { type: Number, default: 0 },

    items: [{
        // [ĐÃ SỬA] Đổi productId -> product để chuẩn Mongoose populate
        product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
        name: String,
        quantity: Number,
        price: Number,
        size: String,
        color: String,
        image: String
    }],
    
    // Payment & Status
    paymentMethod: { type: String, default: 'cod' }, // 'cod' hoặc 'banking'
    paymentStatus: { type: String, default: 'unpaid' }, // 'unpaid' | 'paid' | 'failed'
    orderCode: { type: String, required: true, unique: true }, // Mã đơn hàng (VD: HF839210)
    
    // Trạng thái đơn hàng: pending (chờ xử lý), processing (đang chuẩn bị), shipping (đang giao), completed, cancelled
    status: { type: String, default: 'pending' },
    
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);