const mongoose = require('mongoose');

const newsSchema = new mongoose.Schema({
    title: { type: String, required: true },
    summary: { type: String }, // Mô tả ngắn
    content: { type: String, required: true }, // Nội dung chi tiết
    image: { type: String }, // Ảnh đại diện bài viết
    author: { type: String, default: 'Admin' }
}, { timestamps: true });

module.exports = mongoose.model('News', newsSchema);