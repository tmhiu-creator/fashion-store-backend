document.addEventListener('DOMContentLoaded', () => {
    loadCart();
});

// Hàm render giỏ hàng
function loadCart() {
    // Lấy giỏ hàng từ LocalStorage
    // Biến USER_ID được định nghĩa bên file .ejs trước khi file này được gọi
    const cartKey = USER_ID ? `cart_${USER_ID}` : 'cart_guest';
    const cart = JSON.parse(localStorage.getItem(cartKey)) || [];
    
    const container = document.getElementById('cart-container');
    const emptyMsg = document.getElementById('empty-cart-msg');
    
    // Reset nội dung cũ
    if(container) container.innerHTML = ''; 
    if(emptyMsg) emptyMsg.classList.add('d-none');

    // 1. Xử lý khi giỏ hàng RỖNG
    if (cart.length === 0) {
        if(emptyMsg) emptyMsg.classList.remove('d-none'); // Hiện thông báo rỗng
        updateTotals(0);
        return;
    }

    // 2. Xử lý khi CÓ sản phẩm
    let total = 0;

    cart.forEach((item, index) => {
        // Fix lỗi giá tiền nếu lưu sai format (NaN)
        let price = 0;
        if (typeof item.price === 'number') {
            price = item.price;
        } else if (typeof item.price === 'string') {
            price = parseInt(item.price.replace(/[^0-9]/g, ''));
        }
        if (isNaN(price)) price = 0;

        let qty = parseInt(item.quantity) || 1;
        let subtotal = price * qty;
        total += subtotal;

        // HTML cho từng dòng sản phẩm
        const html = `
            <div class="cart-item p-3 border-bottom transition-bg">
                <div class="row align-items-center gy-3">
                    <div class="col-12 col-lg-6 d-flex align-items-center">
                        <div class="position-relative flex-shrink-0">
                            <img src="${item.image}" alt="${item.name}" class="rounded border" style="width: 80px; height: 80px; object-fit: cover;" onerror="this.src='https://placehold.co/80?text=No+Img'">
                            <button onclick="removeItem(${index})" class="btn btn-sm btn-danger position-absolute top-0 start-0 translate-middle rounded-circle shadow-sm" style="width: 24px; height: 24px; padding: 0; font-size: 10px;">
                                <i class="bi bi-x-lg"></i>
                            </button>
                        </div>
                        <div class="ms-3">
                            <h6 class="mb-1 fw-bold text-dark text-truncate-2">${item.name}</h6>
                            <div class="small text-muted">
                                Size: <span class="fw-bold text-dark">${item.size || 'F'}</span> | 
                                Màu: <span class="fw-bold text-dark">${item.color || 'Std'}</span>
                            </div>
                            <div class="d-lg-none mt-1 text-primary fw-bold">${price.toLocaleString('vi-VN')} đ</div>
                        </div>
                    </div>

                    <div class="col-lg-2 text-center d-none d-lg-block fw-bold text-muted">
                        ${price.toLocaleString('vi-VN')} đ
                    </div>

                    <div class="col-6 col-lg-2">
                        <div class="input-group input-group-sm rounded-pill border overflow-hidden" style="max-width: 100px; margin: 0 auto;">
                            <button class="btn btn-light border-0" onclick="updateQty(${index}, -1)">-</button>
                            <input type="text" class="form-control text-center border-0 bg-white p-0" value="${qty}" readonly>
                            <button class="btn btn-light border-0" onclick="updateQty(${index}, 1)">+</button>
                        </div>
                    </div>

                    <div class="col-6 col-lg-2 text-end">
                        <span class="fw-bold text-dark fs-6">${subtotal.toLocaleString('vi-VN')} đ</span>
                    </div>
                </div>
            </div>
        `;
        container.insertAdjacentHTML('beforeend', html);
    });

    updateTotals(total);
}

// Cập nhật tổng tiền hiển thị
function updateTotals(total) {
    const subtotalEl = document.getElementById('cart-subtotal');
    const totalEl = document.getElementById('cart-total');
    
    if(subtotalEl) subtotalEl.innerText = total.toLocaleString('vi-VN') + ' đ';
    if(totalEl) totalEl.innerText = total.toLocaleString('vi-VN') + ' đ';
}

// Tăng giảm số lượng
function updateQty(index, change) {
    const cartKey = USER_ID ? `cart_${USER_ID}` : 'cart_guest';
    let cart = JSON.parse(localStorage.getItem(cartKey)) || [];
    
    let newQty = (parseInt(cart[index].quantity) || 1) + change;
    if (newQty < 1) newQty = 1;
    
    cart[index].quantity = newQty;
    localStorage.setItem(cartKey, JSON.stringify(cart));
    
    loadCart(); // Render lại
    updateHeaderCartCount(); // Cập nhật số trên header (nếu có hàm này ở header)
}

// Xóa sản phẩm
function removeItem(index) {
    if(!confirm('Bạn có chắc muốn xóa sản phẩm này khỏi giỏ hàng?')) return;
    
    const cartKey = USER_ID ? `cart_${USER_ID}` : 'cart_guest';
    let cart = JSON.parse(localStorage.getItem(cartKey)) || [];
    
    cart.splice(index, 1);
    localStorage.setItem(cartKey, JSON.stringify(cart));
    
    loadCart(); // Render lại
    updateHeaderCartCount(); // Cập nhật số trên header
}

// Hàm phụ trợ cập nhật số lượng trên Header (phòng trường hợp file header chưa có)
function updateHeaderCartCount() {
    const cartKey = USER_ID ? `cart_${USER_ID}` : 'cart_guest';
    const cart = JSON.parse(localStorage.getItem(cartKey)) || [];
    const headerCount = document.getElementById('header-cart-count');
    
    if(headerCount) {
        headerCount.innerText = cart.length;
        if (cart.length > 0) {
            headerCount.classList.remove('d-none');
        } else {
            headerCount.classList.add('d-none');
        }
    }
}