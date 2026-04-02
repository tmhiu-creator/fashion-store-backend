const Product = require('../models/product');

// --- TRANG CHỦ (CÓ TÌM KIẾM) ---
exports.getHomePage = async (req, res) => {
    try {
        const page = +req.query.page || 1;
        const ITEMS_PER_PAGE = 8;
        
        // 1. Lấy từ khóa tìm kiếm và danh mục từ URL
        const keyword = req.query.keyword || '';
        const category = req.query.category || '';

        // 2. Tạo bộ lọc (Filter)
        let filter = {};

        // Nếu có từ khóa -> Tìm theo tên (không phân biệt hoa thường)
        if (keyword) {
            filter.name = { $regex: keyword, $options: 'i' };
        }

        // Nếu có danh mục (Bạn đã làm link category ở header, nên xử lý luôn)
        if (category) {
            // Giả sử trong Product Model bạn lưu category_id hoặc category
            // Nếu bạn lưu là 'category', hãy đổi 'category_id' thành 'category'
            filter.category_id = category; 
        }

        // 3. Đếm và Lấy sản phẩm theo bộ lọc
        const totalProducts = await Product.countDocuments(filter); 
        const products = await Product.find(filter)
            .sort({ createdAt: -1 }) // Sản phẩm mới nhất lên đầu
            .skip((page - 1) * ITEMS_PER_PAGE)
            .limit(ITEMS_PER_PAGE);

        const banners = [
            {
                image: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=2000&auto=format&fit=crop',
                title: 'New Season 2026',
                subtitle: 'Nét Đẹp Thanh Lịch'
            },
            {
                image: 'https://images.unsplash.com/photo-1490578474895-699cd4e2cf59?q=80&w=2000&auto=format&fit=crop',
                title: 'Gentleman Series',
                subtitle: 'Bản Lĩnh Phái Mạnh'
            },
            {
                image: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?q=80&w=2000&auto=format&fit=crop',
                title: 'Urban Collection',
                subtitle: 'Phong Cách Đột Phá'
            }
        ];

        res.render('index', { 
            pageTitle: keyword ? `Tìm kiếm: ${keyword}` : 'Trang chủ - H Fashion',
            products: products, 
            banners: banners,
            user: res.locals.user,
            
            // Phân trang
            currentPage: page,
            hasNextPage: ITEMS_PER_PAGE * page < totalProducts,
            hasPreviousPage: page > 1,
            nextPage: page + 1,
            previousPage: page - 1,
            lastPage: Math.ceil(totalProducts / ITEMS_PER_PAGE),

            // Truyền lại từ khóa để view hiển thị
            currentKeyword: keyword,
            currentCategory: category
        });

    } catch (err) {
        console.error('❌ Lỗi trang chủ:', err);
        res.redirect('/');
    }
};

// --- TRANG CHI TIẾT SẢN PHẨM ---
exports.getProductDetail = async (req, res) => {
    try {
        const prodId = req.params.id; 
        const product = await Product.findById(prodId);
        
        if (!product) {
            return res.redirect('/');
        }

        res.render('product-detail', { 
            pageTitle: product.name, 
            product: product,        
            user: res.locals.user
        });

    } catch (err) {
        console.error('❌ Lỗi lấy chi tiết sản phẩm:', err);
        res.redirect('/');
    }
};

// --- TRANG GIỎ HÀNG ---
exports.getCartPage = (req, res) => {
    res.render('cart', {
        pageTitle: 'Giỏ hàng của bạn',
        user: res.locals.user
    });
};

// --- TRANG THANH TOÁN ---
exports.getCheckoutPage = (req, res) => {
    res.render('checkout', {
        pageTitle: 'Thanh toán đơn hàng',
        user: res.locals.user 
    });
};