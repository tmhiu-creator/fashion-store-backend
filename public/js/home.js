// 1. Toggle Contact Menu
function toggleContact() {
    document.getElementById('contactGroup').classList.toggle('is-open');
}

// 2. Countdown Timer Logic
const targetDate = new Date('2026-02-17T00:00:00').getTime();

function updateTimer() {
    const now = new Date().getTime();
    const distance = targetDate - now;

    if (distance < 0) return;

    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);

    // Kiểm tra xem element có tồn tại không trước khi gán giá trị để tránh lỗi
    if(document.getElementById('days')) document.getElementById('days').innerText = days;
    if(document.getElementById('hours')) document.getElementById('hours').innerText = hours;
    if(document.getElementById('minutes')) document.getElementById('minutes').innerText = minutes;
    if(document.getElementById('seconds')) document.getElementById('seconds').innerText = seconds;
}

setInterval(updateTimer, 1000);
updateTimer(); // Chạy ngay lập tức khi tải trang