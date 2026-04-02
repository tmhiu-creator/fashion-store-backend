const mongoose = require('mongoose');

const settingSchema = new mongoose.Schema({
    // Thông tin chung
    storeName: { type: String, default: 'H-Fashion Store' },
    storePhone: { type: String, default: '0909000000' },
    storeEmail: { type: String, default: 'contact@hfashion.com' },
    storeAddress: { type: String, default: 'TP. Hồ Chí Minh, Việt Nam' },
    
    // Cấu hình vận chuyển
    shippingFee: { type: Number, default: 30000 }, // Phí ship mặc định
    freeShippingThreshold: { type: Number, default: 500000 }, // Đơn trên bao nhiêu thì freeship
    
    // Mạng xã hội (để hiện icon ở footer)
    facebook: { type: String },
    zalo: { type: String },
    
}, { timestamps: true });

module.exports = mongoose.model('Setting', settingSchema);