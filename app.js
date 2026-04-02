require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const session = require('express-session');
const connectDB = require('./config/database');

// --- IMPORT ROUTES ---
const productRoutes = require('./routes/products');
const authRoutes = require('./routes/auth'); 
const adminRoutes = require('./routes/admin');
const orderRoutes = require('./routes/order');
const contactRoutes = require('./routes/contact');
const newsRoutes = require('./routes/news');

// [QUAN TRỌNG] Import route Thanh toán
const paymentRoutes = require('./routes/payment'); 

// [MỚI] Import route User (Profile)
const userRoutes = require('./routes/user');

const app = express();

// --- KẾT NỐI DATABASE ---
connectDB();

// --- CẤU HÌNH VIEW ENGINE ---
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// --- MIDDLEWARE ---
app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));

// [QUAN TRỌNG] Phải có dòng này để đọc được dữ liệu JSON từ SePay gửi về
app.use(bodyParser.json());

// Cấu hình thư mục chứa file tĩnh
app.use(express.static(path.join(__dirname, 'public')));
app.use('/assets/img', express.static(path.join(__dirname, 'public/images')));

// --- CẤU HÌNH SESSION ---
app.use(session({
    secret: 'mySecretKey123',
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 60 * 60 * 1000 }
}));

// --- MIDDLEWARE USER ---
app.use((req, res, next) => {
    res.locals.user = req.session.user || null; 
    next();
});

// --- KHAI BÁO ROUTES ---
app.use(authRoutes);     
app.use(productRoutes);  
app.use('/admin', adminRoutes);
app.use(orderRoutes);    
app.use(contactRoutes);  
app.use(newsRoutes);     

// [QUAN TRỌNG] Kích hoạt Payment Route
app.use(paymentRoutes);  

// [MỚI] Kích hoạt User Route (Profile)
app.use(userRoutes);

// --- START SERVER ---
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Server đang chạy tại http://localhost:${PORT}`);
});