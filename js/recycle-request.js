document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('recycleForm');
    if (!form) return;

    const typeEwaste = document.getElementById('typeEwaste');
    const typePlastic = document.getElementById('typePlastic');
    const ewasteSection = document.getElementById('ewasteSection');
    const plasticSection = document.getElementById('plasticSection');

    const dropOff = document.getElementById('dropOff');
    const pickup = document.getElementById('pickup');
    const addressField = document.getElementById('addressField');

    const imageInput = document.getElementById('imageInput');
    let selectedFiles = [];

    function syncWasteTypeSections() {
        const isEwaste = typeEwaste.checked;
        ewasteSection.classList.toggle('section-hidden', !isEwaste);
        plasticSection.classList.toggle('section-hidden', isEwaste);
    }

    function syncPickupSection() {
        addressField.classList.toggle('section-hidden', !pickup.checked);
    }

    typeEwaste.addEventListener('change', syncWasteTypeSections);
    typePlastic.addEventListener('change', syncWasteTypeSections);
    dropOff.addEventListener('change', syncPickupSection);
    pickup.addEventListener('change', syncPickupSection);
    syncWasteTypeSections();
    syncPickupSection();

    imageInput.addEventListener('change', (e) => {
        const files = Array.from(e.target.files).slice(0, 5);
        selectedFiles = files.filter(
            (f) => f.type.startsWith('image/') && f.size <= 5 * 1024 * 1024,
        );
        const uploadBox =
            document.getElementById('slipUploadBox') ||
            imageInput.closest('.upload-box');
        if (uploadBox && selectedFiles.length) {
            uploadBox.querySelector('div').textContent =
                `เลือกแล้ว ${selectedFiles.length} รูป`;
        }
    });

    imageInput.addEventListener('click', (e) => e.stopPropagation());

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        if (!form.checkValidity()) {
            form.reportValidity();
            return;
        }

        const userData = JSON.parse(localStorage.getItem('user') || 'null');
        if (!userData || !userData.id) {
            alert('กรุณาเข้าสู่ระบบก่อนแจ้งรีไซเคิล');
            window.location.href = 'login.html';
            return;
        }

        if (typePlastic.checked) {
            const weight = parseFloat(form.plasticWeight.value);
            if (!weight || weight <= 0) {
                alert('กรุณากรอกน้ำหนักโดยประมาณของพลาสติก');
                return;
            }
        }
        if (typeEwaste.checked) {
            const quantity = parseInt(form.ewasteQty.value, 10);
            if (!quantity || quantity < 1) {
                alert('กรุณากรอกจำนวน E-Waste อย่างน้อย 1 ชิ้น');
                form.ewasteQty.focus();
                return;
            }
        }
        if (pickup.checked && !form.pickupAddress.value.trim()) {
            alert('กรุณากรอกที่อยู่สำหรับเข้ารับ');
            return;
        }

        const submitBtn = form.querySelector('button[type="submit"]');
        const originalHtml = submitBtn.innerHTML;
        submitBtn.disabled = true;
        submitBtn.innerHTML =
            '<span class="spinner-border spinner-border-sm me-1"></span> กำลังส่งคำขอ...';

        const formData = new FormData();
        formData.append('user_id', userData.id);
        formData.append('wasteType', typeEwaste.checked ? 'ewaste' : 'plastic');
        formData.append('ewasteCategory', form.ewasteCategory.value);
        formData.append('ewasteQty', form.ewasteQty.value || '1');
        formData.append('plasticType', form.plasticType.value);
        formData.append('plasticWeight', form.plasticWeight.value || '0');
        formData.append('description', form.description.value.trim());
        formData.append('pickupMethod', pickup.checked ? 'pickup' : 'drop_off');
        formData.append('pickupAddress', form.pickupAddress.value.trim());
        selectedFiles.forEach((file) => formData.append('images[]', file));

        try {
            const res = await fetch('api/create_recycle_request.php', {
                method: 'POST',
                body: formData,
            });
            const result = await res.json();

            if (result.success) {
                alert(
                    `ส่งคำขอสำเร็จ! รอแอดมินตรวจสอบและอนุมัติแต้มสะสม (โดยประมาณ +${result.estimated_points} คะแนน)`,
                );
                form.reset();
                selectedFiles = [];
                imageInput.value = '';
                const uploadBox = imageInput.closest('.upload-box');
                if (uploadBox)
                    uploadBox.querySelector('div').textContent =
                        'คลิกเพื่ออัปโหลดรูปภาพ (สูงสุด 5 รูป)';
                syncWasteTypeSections();
                syncPickupSection();
                window.location.href = 'index.html';
            } else {
                alert(result.message || 'เกิดข้อผิดพลาดในการส่งคำขอ');
            }
        } catch (err) {
            console.error(err);
            alert('ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้ กรุณาลองใหม่อีกครั้ง');
        } finally {
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalHtml;
        }
    });
});
