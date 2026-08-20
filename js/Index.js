function openRegisterModal() {
    document.getElementById('registerModalOverlay').style.display = 'flex';
}
function closeRegisterModal() {
    document.getElementById('registerModalOverlay').style.display = 'none';
}

function updateUI() {
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    const walletDisplays = document.querySelectorAll('.walletDisplay');
    const walletAmounts = document.querySelectorAll('.walletAmount');
    const userNameDisplay = document.getElementById('userNameDisplay');

    if (isLoggedIn) {
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        const walletBalance = Number(user.walletBalance || 0);

        document.getElementById('guestNav').classList.add('d-none');
        document.getElementById('guestContent').classList.add('d-none');

        document.getElementById('userNav').classList.remove('d-none');
        document.getElementById('userNav').classList.add('d-flex');
        document.getElementById('userContent').classList.remove('d-none');

        walletDisplays.forEach((display) => {
            display.classList.remove('d-none');
            display.classList.add('d-flex');
        });
        walletAmounts.forEach((amount) => {
            amount.textContent = `฿${walletBalance.toLocaleString('th-TH', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
            })}`;
        });
        if (userNameDisplay)
            userNameDisplay.textContent = user.username || 'My Account';

        if (typeof renderData === 'function') renderData();
    } else {
        document.getElementById('userNav').classList.add('d-none');
        document.getElementById('userNav').classList.remove('d-flex');
        document.getElementById('userContent').classList.add('d-none');

        document.getElementById('guestNav').classList.remove('d-none');
        document.getElementById('guestContent').classList.remove('d-none');
        walletDisplays.forEach((display) => {
            display.classList.add('d-none');
            display.classList.remove('d-flex');
        });
    }
}

// บันทึกข้อมูลลง Database แล้วให้ผู้ใช้เข้าสู่ระบบด้วยตนเอง
async function handleRegister(e) {
    e.preventDefault();
    const form = e.target;

    // อ่านค่าจากฟอร์มลง Form Data
    const formData = new FormData(form);

    try {
        const response = await fetch('api/register.php', {
            method: 'POST',
            body: formData,
        });

        const result = await response.json();

        if (result.success) {
            alert('ลงทะเบียนสำเร็จ!');
            closeRegisterModal();
            const loginForm = document.querySelector('#loginModalOverlay form');
            if (loginForm) {
                loginForm.reset();
                loginForm.elements.email.value = form.elements.email.value;
            }
            openModal();
        } else {
            alert(result.message);
        }
    } catch (error) {
        console.error('Error:', error);
        alert('เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์');
    }
}

async function handleLogin(e) {
    e.preventDefault();
    const form = e.target;

    try {
        const response = await fetch('api/login.php', {
            method: 'POST',
            body: new FormData(form),
        });
        const result = await response.json();

        if (!result.success) {
            alert(result.message || 'เข้าสู่ระบบไม่สำเร็จ');
            return;
        }

        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('user', JSON.stringify(result.user));
        if (typeof closeModal === 'function') closeModal();
        updateUI();
    } catch (error) {
        console.error('Login error:', error);
        alert('เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์');
    }
}

function logout() {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('user');
    updateUI();
}

document.addEventListener('DOMContentLoaded', updateUI);
