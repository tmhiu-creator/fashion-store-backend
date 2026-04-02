document.addEventListener('DOMContentLoaded', () => {
    // 1. Tự động dọn dẹp giỏ hàng khi tải trang
    cleanInvalidCartItems();
    
    // 2. Cập nhật số lượng
    updateCartBadge();
});

// HÀM MỚI: Dọn dẹp sản phẩm lỗi (undefined, null, không có ID)
function cleanInvalidCartItems() {
    const userId = (typeof CURRENT_USER_ID !== 'undefined') ? CURRENT_USER_ID : '';
    const cartKey = userId ? `cart_${userId}` : 'cart_guest';
    
    let cart = JSON.parse(localStorage.getItem(cartKey)) || [];
    const originalLength = cart.length;

    // Lọc bỏ những sản phẩm bị lỗi (không có ID, hoặc tên là "undefined")
    cart = cart.filter(item => {
        return item._id && item.name && item.name !== 'undefined' && item.price !== null;
    });

    if (cart.length !== originalLength) {
        console.log("🧹 Đã dọn dẹp " + (originalLength - cart.length) + " sản phẩm lỗi khỏi giỏ hàng.");
        localStorage.setItem(cartKey, JSON.stringify(cart));
        // Nếu đang ở trang giỏ hàng thì reload để thấy kết quả
        if (window.location.pathname === '/cart') {
            window.location.reload();
        }
    }
}

// Cập nhật Badge trên Header
function updateCartBadge() {
    const userId = (typeof CURRENT_USER_ID !== 'undefined') ? CURRENT_USER_ID : '';
    const cartKey = userId ? `cart_${userId}` : 'cart_guest';
    
    const cart = JSON.parse(localStorage.getItem(cartKey)) || [];
    const totalQty = cart.reduce((sum, item) => sum + (parseInt(item.quantity) || 1), 0);

    const desktopBadge = document.getElementById('header-cart-count');
    const mobileBadge = document.getElementById('mobile-cart-count');

    if (desktopBadge) {
        desktopBadge.innerText = totalQty;
        totalQty > 0 ? desktopBadge.classList.remove('d-none') : desktopBadge.classList.add('d-none');
    }
    if (mobileBadge) {
        mobileBadge.innerText = totalQty;
        totalQty > 0 ? mobileBadge.classList.remove('d-none') : mobileBadge.classList.add('d-none');
    }
}

// Hàm Thêm giỏ hàng (Core logic)
function addToCart(product) {
    // [QUAN TRỌNG] Kiểm tra dữ liệu đầu vào lần cuối
    if (!product._id || !product.name || product.name === 'undefined') {
        alert("⚠️ Lỗi dữ liệu sản phẩm! Vui lòng tải lại trang.");
        return;
    }

    const userId = (typeof CURRENT_USER_ID !== 'undefined') ? CURRENT_USER_ID : '';
    const cartKey = userId ? `cart_${userId}` : 'cart_guest';
    
    let cart = JSON.parse(localStorage.getItem(cartKey)) || [];
    const existingItem = cart.find(item => item._id === product._id && item.size === product.size && item.color === product.color);

    if (existingItem) {
        existingItem.quantity = (parseInt(existingItem.quantity) || 0) + 1;
    } else {
        cart.push({
            _id: product._id,
            name: product.name,
            price: parseInt(product.price) || 0,
            image: product.image,
            size: product.size || 'F',
            color: product.color || 'Std',
            quantity: 1
        });
    }

    localStorage.setItem(cartKey, JSON.stringify(cart));
    updateCartBadge();
    
    // Hiệu ứng thông báo (Có thể thay bằng Toast đẹp hơn)
    alert(`✅ Đã thêm "${product.name}" vào giỏ!`);
}

// Xử lý sự kiện click từ data-attribute
function addToCartV2(btn) {
    if (event) event.preventDefault();

    // Lấy dữ liệu
    const id = btn.getAttribute('data-id');
    const name = btn.getAttribute('data-name');
    const price = btn.getAttribute('data-price');
    const image = btn.getAttribute('data-image');

    // Kiểm tra xem có lấy được dữ liệu không
    if (!id || !name) {
        console.error("Thiếu dữ liệu trên nút mua:", btn);
        return;
    }

    const product = {
        _id: id,
        name: name,
        price: parseInt(price) || 0,
        image: image,
        size: 'F',
        color: 'Std'
    };

    addToCart(product);
}