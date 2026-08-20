async function handleRegister(event) {
    event.preventDefault(); // ป้องกันไม่ให้หน้าเว็บ รีเฟรช
    const form = event.target;

    // 1. ดึงข้อมูลจากอินพุตในฟอร์ม
    const payload = {
        username: form.querySelector('input[name="username"]').value,
        email: form.querySelector('input[type="email"]').value,
        firstName: form.querySelector('input[name="firstName"]').value,
        lastName: form.querySelector('input[name="lastName"]').value,
        password: form.querySelector('input[type="password"]').value,
    };

    try {
        // 2. ใส่ fetch ตรงนี้เพื่อส่งข้อมูลไปที่ไฟล์ register.php
        const res = await fetch('api/register.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        });

        const data = await res.json();

        // 3. เช็คผลลัพธ์ที่ตอบกลับมาจาก PHP
        if (data.success) {
            alert('ลงทะเบียนสำเร็จ! กรุณาเข้าสู่ระบบ');
            closeRegisterModal();
            openModal();
        } else {
            alert(data.message);
        }
    } catch (err) {
        console.error(err);
        alert('เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์');
    }
}
