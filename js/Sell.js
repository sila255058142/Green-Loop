    /**
     * GreenLoop - sell.js
     * Logic สำหรับฟอร์มลงขายสินค้า: อัปโหลด/พรีวิวรูปภาพหลายรูป (รูปแรก = รูปปก), submit ฟอร์ม
     * ในระบบจริงจะส่งไปยัง API PHP เช่น:
     *   fetch('api/products.php', { method: 'POST', body: formData })
     */

    document.addEventListener('DOMContentLoaded', () => {

    const MAX_IMAGES = 8;
    const uploader   = document.getElementById('imageUploader');
    const addSlot    = document.getElementById('addImageSlot');
    const imageInput = document.getElementById('imageInput');
    const form       = document.getElementById('sellForm');

    let selectedFiles = []; // เก็บไฟล์รูปภาพทั้งหมดที่เลือกไว้

    function renderImagePreviews() {
        // ลบพรีวิวเดิมทั้งหมด (ยกเว้นปุ่ม "เพิ่มรูป")
        [...uploader.querySelectorAll('.preview-slot')].forEach(el => el.remove());

        selectedFiles.forEach((file, index) => {
        const url = URL.createObjectURL(file);
        const slot = document.createElement('div');
        slot.className = 'upload-slot preview-slot' + (index === 0 ? ' cover-slot' : '');
        slot.innerHTML = `
            <img src="${url}" alt="product-image-${index}">
            <button type="button" class="remove-img" data-index="${index}" aria-label="ลบรูปนี้">
            <i class="bi bi-x"></i>
            </button>
        `;
        uploader.insertBefore(slot, addSlot);
        });

        // ซ่อนปุ่ม "เพิ่มรูป" เมื่อครบจำนวนสูงสุด
        addSlot.style.display = selectedFiles.length >= MAX_IMAGES ? 'none' : 'flex';
    }

    if (imageInput) {
        imageInput.addEventListener('change', (e) => {
        const newFiles = Array.from(e.target.files);
        const remainingSlots = MAX_IMAGES - selectedFiles.length;
        selectedFiles = selectedFiles.concat(newFiles.slice(0, remainingSlots));
        renderImagePreviews();
        imageInput.value = ''; // reset input เพื่อให้เลือกไฟล์ซ้ำได้อีกครั้งถ้าต้องการ
        });
    }

    if (uploader) {
        uploader.addEventListener('click', (e) => {
        const removeBtn = e.target.closest('.remove-img');
        if (!removeBtn) return;
        e.preventDefault();
        const index = Number(removeBtn.dataset.index);
        selectedFiles.splice(index, 1);
        renderImagePreviews();
        });
    }

    if (form) {
        form.addEventListener('submit', (e) => {
        e.preventDefault();

        if (selectedFiles.length === 0) {
            alert('กรุณาอัปโหลดรูปภาพสินค้าอย่างน้อย 1 รูป');
            return;
        }

        const formData = new FormData(form);
        selectedFiles.forEach((file, i) => formData.append(`images[${i}]`, file));

        const payload = Object.fromEntries(
            [...formData.entries()].filter(([key]) => !key.startsWith('images['))
        );
        console.log('Sell item payload:', payload, 'images:', selectedFiles.length);

        // TODO: เชื่อมกับ backend จริง เช่น
        // fetch('api/products.php', { method: 'POST', body: formData })
        //   .then(r => r.json())
        //   .then(res => { if (res.success) window.location.href = 'profile-my-listings.html'; });

        alert('ลงขายสินค้าสำเร็จ! รายการของคุณกำลังรอการตรวจสอบจากทีมงาน (+20 Green Point เมื่ออนุมัติ)');
        form.reset();
        selectedFiles = [];
        renderImagePreviews();
        });
    }
    });