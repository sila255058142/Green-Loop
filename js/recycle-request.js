document.addEventListener('DOMContentLoaded', () => {
    const typeEwaste = document.getElementById('typeEwaste');
    const typePlastic = document.getElementById('typePlastic');
    const ewasteSection = document.getElementById('ewasteSection');
    const plasticSection = document.getElementById('plasticSection');

    const dropOff = document.getElementById('dropOff');
    const pickup = document.getElementById('pickup');
    const addressField = document.getElementById('addressField');

    // 1. สลับฟิลด์ตามประเภทขยะ
    typeEwaste.addEventListener('change', () => {
        ewasteSection.classList.remove('section-hidden');
        plasticSection.classList.add('section-hidden');
    });

    typePlastic.addEventListener('change', () => {
        plasticSection.classList.remove('section-hidden');
        ewasteSection.classList.add('section-hidden');
    });

    // 2. สลับฟิลด์ที่อยู่ตามวิธีการส่ง
    dropOff.addEventListener('change', () => addressField.classList.add('section-hidden'));
    pickup.addEventListener('change', () => addressField.classList.remove('section-hidden'));

    // 3. จัดการ Submit Form
    const recycleForm = document.getElementById('recycleForm');
    recycleForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        // ดึงข้อมูล User จาก localStorage
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        if (!user.id) {
            alert('กรุณาเข้าสู่ระบบก่อนทำรายการ');
            return;
        }

        const formData = new FormData(recycleForm);
        formData.append('user_id', user.id);

        try {
            const response = await fetch('api/create_recycle_request.php', {
                method: 'POST',
                body: formData
            });

            const result = await response.json();

            if (result.success) {
                alert(result.message);
                recycleForm.reset();
                ewasteSection.classList.remove('section-hidden');
                plasticSection.classList.add('section-hidden');
                addressField.classList.add('section-hidden');
            } else {
                alert('เกิดข้อผิดพลาด: ' + result.message);
            }
        } catch (error) {
            console.error('Error submitting recycle request:', error);
            alert('ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้');
        }
    });
});