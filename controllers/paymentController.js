const Order = require('../models/order');
const Product = require('../models/product'); // Cần import Product để check giá

// 1. TẠO ĐƠN HÀNG (Logic Bảo Mật Cao)
exports.createPaymentOrder = async (req, res) => {
    try {
        const { fullname, email, phone, address, note, cartData, city, shippingFee } = req.body;
        
        console.log("📝 Đang tạo đơn hàng mới...");

        // Parse giỏ hàng từ JSON
        let clientItems = [];
        try { 
            clientItems = JSON.parse(cartData); 
        } catch (e) { 
            return res.status(400).json({ success: false, message: "Dữ liệu giỏ hàng lỗi" });
        }

        if (clientItems.length === 0) {
            return res.status(400).json({ success: false, message: "Giỏ hàng trống" });
        }

        // --- BƯỚC QUAN TRỌNG: TÍNH LẠI TIỀN TỪ DATABASE (CHỐNG HACK GIÁ) ---
        let dbItems = [];
        let calculatedTotal = 0;

        for (const item of clientItems) {
            // Tìm sản phẩm gốc trong DB
            const product = await Product.findById(item._id || item.id);
            if (product) {
                const price = product.price || 0;
                const quantity = parseInt(item.quantity) || 1;
                
                calculatedTotal += price * quantity;
                
                // Lưu thông tin chuẩn vào đơn hàng
                dbItems.push({
                    product: product._id, // Lưu ID tham chiếu (quan trọng cho admin xem thống kê)
                    name: product.name,
                    quantity: quantity,
                    price: price,
                    size: item.size || 'F',
                    color: item.color || 'Std',
                    image: product.image // Hoặc item.image
                });
            }
        }

        // Cộng phí ship (nếu có)
        const shipFee = parseInt(shippingFee) || 0;
        const finalTotal = calculatedTotal + shipFee;

        // Tạo mã đơn hàng: HF + 6 số ngẫu nhiên (VD: HF839210)
        // Cách này ngắn gọn và dễ quét QR
        const randomCode = Math.floor(100000 + Math.random() * 900000);
        const orderCode = 'HF' + randomCode;

        // Tạo đơn hàng mới
        const newOrder = new Order({
            user: req.session.user ? req.session.user._id : null, // Gán user nếu đã đăng nhập
            fullname, 
            email,
            phone, 
            address: address + (city ? `, ${city}` : ''), 
            note,
            items: dbItems,
            totalPrice: finalTotal, // [QUAN TRỌNG] Dùng totalPrice cho khớp với Model
            shippingFee: shipFee,
            paymentMethod: req.body.paymentMethod || 'cod',
            paymentStatus: 'unpaid', // Mặc định chưa thanh toán
            status: 'pending',       // Chờ xử lý
            orderCode: orderCode 
        });

        await newOrder.save();
        console.log(`✅ Đã tạo đơn thành công: ${orderCode} - Tổng: ${finalTotal}`);

        res.json({ 
            success: true, 
            orderCode: orderCode, 
            amount: finalTotal 
        });

    } catch (err) {
        console.error("❌ LỖI TẠO ĐƠN:", err); 
        res.status(500).json({ success: false, message: 'Lỗi server: ' + err.message });
    }
};

// 2. NHẬN WEBHOOK TỪ SEPAY
exports.webhookSePay = async (req, res) => {
    try {
        const { content, amount, transferAmount } = req.body;
        const money = transferAmount || amount;

        // Tìm mã đơn hàng trong nội dung chuyển khoản (Tìm chuỗi HFxxxxxx)
        const match = content?.match(/HF\d{6}/);
        
        if (match) {
            const orderCode = match[0];
            console.log(`🔔 Webhook nhận được cho đơn: ${orderCode}`);

            const order = await Order.findOne({ orderCode: orderCode });

            if (order) {
                // Nếu đơn đã thanh toán rồi thì bỏ qua
                if (order.paymentStatus === 'paid') {
                    return res.json({ success: true, message: 'Already paid' });
                }

                // Kiểm tra số tiền (Cho phép sai số nhỏ hoặc >=)
                if (parseInt(money) >= order.totalPrice) {
                    order.paymentStatus = 'paid';
                    order.status = 'processing'; // Chuyển sang đang xử lý
                    await order.save();
                    console.log(`💰 Đã xác nhận thanh toán: ${orderCode}`);
                } else {
                    console.log(`⚠️ Khách chuyển thiếu tiền. Đơn: ${order.totalPrice}, Nhận: ${money}`);
                }
            }
        }
        
        res.json({ success: true }); // Luôn trả về true để SePay không gửi lại
    } catch (err) {
        console.error("Webhook Error:", err);
        res.status(500).json({ success: false });
    }
};

// 3. CHECK TRẠNG THÁI (Frontend gọi liên tục để kiểm tra)
exports.checkOrderStatus = async (req, res) => {
    try {
        const { orderCode } = req.params;
        const order = await Order.findOne({ orderCode: orderCode });
        
        if (order && order.paymentStatus === 'paid') {
            return res.json({ paid: true });
        }
        res.json({ paid: false });
    } catch (err) {
        res.status(500).json({ paid: false });
    }
};