require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('./models/product');

mongoose.connect(process.env.DB_URI)
    .then(() => console.log('✅ Đã kết nối DB'))
    .catch(err => console.log(err));

const products = [
    {
        name: "Áo Polo Nam Classic Fit",
        price: 350000,
        image: "https://i.pinimg.com/1200x/9a/5c/66/9a5c66dca5661c770f2647dfb0ac0f12.jpg",
        category_id: "cat_nam",
        rating: 4.5, sold: 120,
        sizes: ['M', 'L', 'XL'], colors: ['#000000', '#FFFFFF', '#191970'] 
    },
    {
        name: "Quần Jeans Nam Slimfit",
        price: 550000,
        image: "https://i.pinimg.com/1200x/22/cf/bb/22cfbb01938c5633957b468e9c88c7d3.jpg",
        category_id: "cat_nam",
        rating: 4.8, sold: 85,
        sizes: ['29', '30', '31', '32'], colors: ['#000080', '#808080']
    },
    {
        name: "Áo Khoác Bomber Da Lộn",
        price: 1200000,
        image: "https://i.pinimg.com/736x/0b/92/93/0b9293a534a861412d25f87e49a90022.jpg",
        category_id: "cat_nam",
        rating: 5.0, sold: 40,
        sizes: ['L', 'XL'], colors: ['#8B4513', '#000000']
    },
    {
        name: "Đầm Maxi Hoa Nhí Vintage",
        price: 450000,
        image: "https://i.pinimg.com/736x/ce/ac/b0/ceacb0b5f88443f03692c814368a2025.jpg",
        category_id: "cat_nu",
        rating: 4.7, sold: 200,
        sizes: ['S', 'M'], colors: ['#FFC0CB', '#FFFFFF']
    },
    {
        name: "Set Blazer Nữ Công Sở",
        price: 890000,
        image: "https://i.pinimg.com/736x/fb/21/b3/fb21b37b2a5d6db41f34154f5ff9afec.jpg",
        category_id: "cat_nu",
        rating: 4.9, sold: 150,
        sizes: ['S', 'M', 'L'], colors: ['#F5F5DC', '#000000']
    },
    {
        name: "Set Đồ Bộ Bé Trai",
        price: 220000,
        image: "https://i.pinimg.com/1200x/bb/8b/d2/bb8bd22c91351d642105fb82141fea5e.jpg",
        category_id: "cat_kid",
        rating: 4.8, sold: 300,
        sizes: ['10kg', '12kg', '15kg'], colors: ['#87CEEB', '#FFFF00']
    },
    {
        name: "Váy Công Chúa Bé Gái",
        price: 350000,
        image: "https://i.pinimg.com/1200x/59/e3/ca/59e3cad7f80a449d00107081dedc93d6.jpg",
        category_id: "cat_kid",
        rating: 5.0, sold: 180,
        sizes: ['2Y', '4Y', '6Y'], colors: ['#FF69B4', '#FFFFFF']
    },
    {
        name: "Túi Xách Da Cao Cấp",
        price: 1500000,
        image: "https://i.pinimg.com/1200x/32/87/e6/3287e6034dab3a0c66a398a80b7032e2.jpg",
        category_id: "cat_bag",
        rating: 5.0, sold: 70,
        sizes: [], colors: ['#8B0000', '#000000']
    },
    {
        name: "Đồng Hồ Nam, Nữ Dây Da",
        price: 2500000,
        image: "https://i.pinimg.com/1200x/df/8d/e8/df8de87e352d0ec638d33ce551435bff.jpg",
        category_id: "cat_watch",
        rating: 4.9, sold: 60,
        sizes: [], colors: ['#A52A2A', '#000000']
    }
];

const seedDB = async () => {
    try {
        await Product.deleteMany({});
        await Product.insertMany(products);
        console.log(`✅ Đã cập nhật ${products.length} sản phẩm có Size và Màu!`);
        process.exit();
    } catch (err) {
        console.log(err);
        process.exit();
    }
};

seedDB();