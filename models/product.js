const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    image: {
        type: String,
        required: true
    },
    category_id: {
        type: String,
        required: true
    },
    description: {
        type: String,
        default: ''
    },
    rating: {
        type: Number,
        default: 0
    },
    sold: {
        type: Number,
        default: 0
    },
    discount: {
        type: Number,
        default: 0
    },
    // --- KHAI BÁO THÊM 2 TRƯỜNG NÀY ---
    sizes: {
        type: [String], // Mảng các chuỗi ký tự (Ví dụ: ['M', 'L'])
        default: []
    },
    colors: {
        type: [String], // Mảng mã màu (Ví dụ: ['#FFF', '#000'])
        default: []
    }
});

module.exports = mongoose.model('Product', productSchema);