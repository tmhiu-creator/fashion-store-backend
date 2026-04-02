// 1. Tăng số lượng
function increaseQty() {
    const qtyInput = document.getElementById('qty');
    let val = parseInt(qtyInput.value);
    if (val < 99) qtyInput.value = val + 1;
}

// 2. Giảm số lượng
function decreaseQty() {
    const qtyInput = document.getElementById('qty');
    let val = parseInt(qtyInput.value);
    if (val > 1) qtyInput.value = val - 1;
}

// 3. Hàm xử lý Thêm vào giỏ hàng (Đã chuẩn hóa)
function addToCartDetail(btn) {
    if(event) event.preventDefault();

    // Lấy thông tin từ data-attribute của nút
    const id = btn.getAttribute('data-id');
    const name = btn.getAttribute('data-name');
    const image = btn.getAttribute('data-image');
    
    // Lấy giá tiền
    let price = 0;
    const priceTag = document.querySelector('.price-tag');
    if (priceTag) {
        price = parseInt(priceTag.innerText.replace(/[^0-9]/g, ''));
    } else {
        price = parseInt(btn.getAttribute('data-price')) || 0;
    }

    // Lấy Size, Màu, Số lượng người dùng đang chọn
    const size = document.querySelector('input[name="size"]:checked')?.value || 'F';
    const color = document.querySelector('input[name="color"]:checked')?.value || 'Std';
    const qty = parseInt(document.getElementById('qty').value) || 1;

    // Tạo object sản phẩm chuẩn (Dùng 'quantity' thay vì 'qty' để khớp với main.js)
    const product = {
        _id: id,
        name: name,
        price: price,
        image: image,
        size: size,
        color: color,
        quantity: qty 
    };

    // Gọi hàm global addToCart (đã có trong main.js)
    if (typeof addToCart === 'function') {
        addToCart(product);
    } else {
        alert("Lỗi: Hệ thống chưa tải xong. Vui lòng F5 lại trang.");
    }
}