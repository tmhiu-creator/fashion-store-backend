// --- QUẢN LÝ TRẠNG THÁI (STATE) ---
const AppState = {
    cart: [],
    subtotal: 0,
    shippingFee: 0
};

// 1. Render Giỏ hàng & Tính tổng
function renderOrderSummary() {
    const container = document.getElementById('order-summary-body');
    if(!container) return;
    
    container.innerHTML = '';
    AppState.subtotal = 0;

    AppState.cart.forEach(item => {
        // Fix lỗi NaN giá tiền
        let price = typeof item.price === 'number' ? item.price : parseFloat(item.price.replace(/[^0-9]/g, '')) || 0;
        const quantity = parseInt(item.quantity) || 1;
        
        AppState.subtotal += price * quantity;

        const html = `
            <div class="d-flex align-items-center mb-3">
                <div class="position-relative me-3">
                    <img src="${item.image}" class="rounded border" style="width: 60px; height: 60px; object-fit: cover;" onerror="this.src='https://placehold.co/60'">
                    <span class="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-secondary" style="font-size: 0.6rem;">${quantity}</span>
                </div>
                <div class="flex-grow-1">
                    <h6 class="mb-0 small fw-bold text-truncate" style="max-width: 150px;">${item.name}</h6>
                    <small class="text-muted d-block">Size: ${item.size || 'F'} | Màu: ${item.color || 'Std'}</small>
                </div>
                <span class="fw-bold small text-dark">${(price * quantity).toLocaleString('vi-VN')} đ</span>
            </div>
        `;
        container.innerHTML += html;
    });

    document.getElementById('checkout-subtotal').innerText = AppState.subtotal.toLocaleString('vi-VN') + ' đ';
    document.getElementById('cart-data').value = JSON.stringify(AppState.cart);
    updateTotalUI();
}

// 2. Tính phí Ship
function calculateShipping() {
    const city = document.getElementById('city-select').value;
    const shipRadios = document.getElementsByName('shippingMethod');
    let shipMethod = 'standard';
    shipRadios.forEach(r => { if(r.checked) shipMethod = r.value });

    const instantOption = document.getElementById('ship-instant-container');
    let baseFee = 0;

    // Logic giá
    if (city === 'hcm') {
        if(instantOption) instantOption.style.display = 'block';
        if (shipMethod === 'standard') baseFee = 20000;
        if (shipMethod === 'fast') baseFee = 35000;
        if (shipMethod === 'instant') baseFee = 50000;
    } else {
        if(instantOption) instantOption.style.display = 'none';
        // Reset về Standard nếu đang chọn Instant mà đổi tỉnh
        if (shipMethod === 'instant') {
            document.getElementById('shipStandard').checked = true;
            baseFee = 35000;
        } else {
            baseFee = (shipMethod === 'fast') ? 55000 : 35000;
        }
    }
    
    if (!city) baseFee = 0;
    AppState.shippingFee = baseFee;

    // Cập nhật text hiển thị giá từng loại ship
    updateShippingPricesUI(city);
    
    // Cập nhật hiển thị phí ship tổng
    const shipDisplay = document.getElementById('shipping-fee-display');
    if (baseFee === 0 && !city) {
        shipDisplay.innerText = "Vui lòng chọn tỉnh/thành";
        shipDisplay.className = "text-danger small fw-bold";
    } else {
        shipDisplay.innerText = baseFee.toLocaleString('vi-VN') + ' đ';
        shipDisplay.className = "text-success small fw-bold";
    }

    updateTotalUI();
}

// Helper: Cập nhật giá hiển thị bên trái (20k, 35k...)
function updateShippingPricesUI(city) {
    const prices = city === 'hcm' 
        ? { std: '20.000 đ', fast: '35.000 đ', inst: '50.000 đ' } 
        : { std: '35.000 đ', fast: '55.000 đ', inst: '--' };
        
    if(document.getElementById('price-standard')) document.getElementById('price-standard').innerText = prices.std;
    if(document.getElementById('price-fast')) document.getElementById('price-fast').innerText = prices.fast;
    if(document.getElementById('price-instant')) document.getElementById('price-instant').innerText = prices.inst;
}

// 3. Cập nhật Tổng tiền cuối cùng
function updateTotalUI() {
    const finalTotal = AppState.subtotal + AppState.shippingFee;
    
    const totalEl = document.getElementById('checkout-total');
    if(totalEl) totalEl.innerText = finalTotal.toLocaleString('vi-VN') + ' đ';

    const inputTotal = document.getElementById('input-total');
    if(inputTotal) inputTotal.value = finalTotal;
    
    const inputShip = document.getElementById('input-shipping-fee');
    if(inputShip) inputShip.value = AppState.shippingFee;
}