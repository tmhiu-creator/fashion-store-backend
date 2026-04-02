const News = require('../models/news');

// Trang danh sách tin tức
exports.getNewsPage = async (req, res) => {
    try {
        // Lấy tất cả tin tức, tin mới nhất lên đầu
        const newsList = await News.find().sort({ createdAt: -1 });

        // [DỮ LIỆU GIẢ] Nếu DB chưa có bài nào, tạo 1 bài mẫu để hiển thị cho đẹp
        if (newsList.length === 0) {
            newsList.push({
                _id: 'sample-id',
                title: 'Chào mừng bộ sưu tập Mùa Hè 2026',
                summary: 'Khám phá những mẫu thiết kế mới nhất vừa cập bến H-Fashion...',
                image: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=800&q=80',
                createdAt: new Date()
            });
        }

        res.render('news', {
            pageTitle: 'Tin tức & Sự kiện',
            user: res.locals.user,
            newsList: newsList
        });
    } catch (err) {
        console.log(err);
        res.redirect('/');
    }
};

// Trang chi tiết một bài viết
exports.getNewsDetail = async (req, res) => {
    try {
        const newsId = req.params.id;
        
        // Nếu là bài mẫu (sample-id) thì không query DB
        if (newsId === 'sample-id') {
            return res.render('news-detail', {
                pageTitle: 'Bài viết mẫu',
                user: res.locals.user,
                news: {
                    title: 'Chào mừng bộ sưu tập Mùa Hè 2026',
                    content: '<p>Đây là nội dung bài viết mẫu. Khi bạn thêm tin tức thật vào Database, nội dung này sẽ thay đổi.</p>',
                    image: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=800&q=80',
                    createdAt: new Date(),
                    author: 'System'
                }
            });
        }

        const news = await News.findById(newsId);
        if (!news) return res.redirect('/news');

        res.render('news-detail', {
            pageTitle: news.title,
            user: res.locals.user,
            news: news
        });
    } catch (err) {
        console.log(err);
        res.redirect('/news');
    }
};