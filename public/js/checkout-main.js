document.addEventListener('DOMContentLoaded', () => {
    // 1. Tải giỏ hàng
    const cartKey = USER_ID ? `cart_${USER_ID}` : 'cart_guest';
    const storedCart = localStorage.getItem(cartKey);

    if (storedCart) {
        AppState.cart = JSON.parse(storedCart); // Gán vào biến global ở core.js
        if(AppState.cart.length === 0) window.location.href = '/cart';
        
        renderOrderSummary(); // Từ core.js
        calculateShipping();  // Từ core.js
    } else {
        window.location.href = '/cart';
    }

    // 2. Gán sự kiện (Event Listeners)
    
    // Đổi tỉnh thành
    document.getElementById('city-select').addEventListener('change', calculateShipping);
    
    // Đổi phương thức ship
    document.getElementsByName('shippingMethod').forEach(el => {
        el.addEventListener('change', calculateShipping);
    });

    // Đổi phương thức thanh toán (UI effect)
    document.getElementsByName('paymentMethod').forEach(el => {
        el.addEventListener('change', function() {
            document.querySelectorAll('.payment-option').forEach(opt => 
                opt.classList.remove('border-primary', 'bg-light', 'selected-payment'));
            this.closest('.payment-option').classList.add('selected-payment');
        });
    });

    // Nút Đặt Hàng -> Gọi hàm bên payment.js
    const btnPlaceOrder = document.getElementById('btn-place-order');
    if(btnPlaceOrder) btnPlaceOrder.addEventListener('click', handleCheckout);
});