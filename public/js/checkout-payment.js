let countdownInterval;
let checkPaymentInterval;
let currentOrderCode = null;

// 1. Xử lý logic khi bấm nút Đặt Hàng
async function handleCheckout() {
    const form = document.getElementById('checkoutForm');
    
    if (!form.checkValidity()) { form.reportValidity(); return; }
    if (document.getElementById('city-select').value === "") { alert("Vui lòng chọn Tỉnh / Thành phố!"); return; }

    const paymentMethod = document.querySelector('input[name="paymentMethod"]:checked').value;
    
    if (paymentMethod === 'online') {
        await processOnlinePayment(form);
    } else {
        if(confirm('Xác nhận đặt hàng (COD)?')) form.submit();
    }
}

// 2. Xử lý thanh toán Online
async function processOnlinePayment(form) {
    const btn = document.getElementById('btn-place-order');
    btn.disabled = true;
    btn.innerText = "Đang xử lý...";

    try {
        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());

        const response = await fetch('/api/create-payment-order', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        const result = await response.json();

        if (result.success) {
            currentOrderCode = result.orderCode;
            showQRCode(result.amount, result.orderCode);
        } else {
            alert("Lỗi: " + result.message);
            btn.disabled = false;
            btn.innerText = "ĐẶT HÀNG NGAY";
        }
    } catch (error) {
        console.error(error);
        alert("Lỗi kết nối Server!");
        btn.disabled = false;
        btn.innerText = "ĐẶT HÀNG NGAY";
    }
}

// 3. Hiển thị Modal QR
function showQRCode(amount, orderContent) {
    const BANK_ID = "MB";
    const ACCOUNT_NO = "4723042006";
    const ACCOUNT_NAME = "TRINH MINH HIEU";
    
    const qrUrl = `https://img.vietqr.io/image/${BANK_ID}-${ACCOUNT_NO}-compact.png?amount=${amount}&addInfo=${orderContent}&accountName=${encodeURIComponent(ACCOUNT_NAME)}`;
    
    document.getElementById('vietqr-img').src = qrUrl;
    document.getElementById('qr-amount').innerText = amount.toLocaleString('vi-VN') + ' đ';
    document.getElementById('qr-content').innerText = orderContent;

    const qrModal = new bootstrap.Modal(document.getElementById('qrModal'));
    qrModal.show();

    startCountdown(10 * 60); 
    startCheckingPayment(orderContent);
}

// 4. Đếm ngược
function startCountdown(duration) {
    let timer = duration, minutes, seconds;
    const display = document.getElementById('countdown-timer');
    
    clearInterval(countdownInterval);
    countdownInterval = setInterval(() => {
        minutes = parseInt(timer / 60, 10);
        seconds = parseInt(timer % 60, 10);
        minutes = minutes < 10 ? "0" + minutes : minutes;
        seconds = seconds < 10 ? "0" + seconds : seconds;
        display.textContent = minutes + ":" + seconds;

        if (--timer < 0) {
            stopAllIntervals();
            alert("⏰ Hết thời gian thanh toán!");
            location.reload();
        }
    }, 1000);
}

// 5. Kiểm tra thanh toán (Polling)
function startCheckingPayment(orderCode) {
    clearInterval(checkPaymentInterval);
    const checkingBadge = document.getElementById('checking-payment');
    
    checkPaymentInterval = setInterval(async () => {
        if(checkingBadge) checkingBadge.style.display = 'block';
        try {
            const res = await fetch(`/api/check-status/${orderCode}`);
            const data = await res.json();

            if (data.paid) {
                stopAllIntervals();
                const modalEl = document.getElementById('qrModal');
                const modal = bootstrap.Modal.getInstance(modalEl);
                modal.hide();

                alert("✅ ĐƠN HÀNG CỦA BẠN ĐÃ ĐƯỢC ĐẶT!");
                
                const cartKey = USER_ID ? `cart_${USER_ID}` : 'cart_guest';
                localStorage.removeItem(cartKey);
                window.location.href = '/my-orders'; 
            }
        } catch (error) { console.error(error); }
    }, 3000);
}

function cancelPayment() {
    if(confirm("Hủy thanh toán?")) {
        stopAllIntervals();
        location.reload();
    }
}

function stopAllIntervals() {
    clearInterval(countdownInterval);
    clearInterval(checkPaymentInterval);
}