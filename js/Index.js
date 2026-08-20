function openRegisterModal() {
    document.getElementById('registerModalOverlay').style.display = 'flex';
}
function closeRegisterModal() {
    document.getElementById('registerModalOverlay').style.display = 'none';
}

function updateUI() {
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    const walletDisplay = document.getElementById('walletDisplay');

    if (isLoggedIn) {
        document.getElementById('guestNav').classList.add('d-none');
        document.getElementById('guestContent').classList.add('d-none');

        document.getElementById('userNav').classList.remove('d-none');
        document.getElementById('userNav').classList.add('d-flex');
        document.getElementById('userContent').classList.remove('d-none');

        if (walletDisplay) {
            walletDisplay.classList.remove('d-none');
            walletDisplay.classList.add('d-flex');
        }

        if (typeof renderData === 'function') renderData();
    } else {
        document.getElementById('userNav').classList.add('d-none');
        document.getElementById('userNav').classList.remove('d-flex');
        document.getElementById('userContent').classList.add('d-none');

        document.getElementById('guestNav').classList.remove('d-none');
        document.getElementById('guestContent').classList.remove('d-none');
        if (walletDisplay) {
            walletDisplay.classList.add('d-none');
            walletDisplay.classList.remove('d-flex');
        }
    }
}

// 🟢 เพิ่มฟังก์ชันนี้สำหรับ บันทึกข้อมูลลง Database + ล็อกอินทันที
async function handleRegister(e) {
    e.preventDefault(); // ป้องกันไม่ให้หน้าเว็บรีเฟรช
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
            localStorage.setItem('isLoggedIn', 'true'); // เปลี่ยนสถานะเป็นล็อกอิน
            closeRegisterModal();
            updateUI(); // อัปเดตหน้าตาเว็บทันที
        } else {
            alert(result.message); // แสดงข้อความ error จาก PHP (เช่น อีเมลซ้ำ)
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
