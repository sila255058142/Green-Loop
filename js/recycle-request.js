    /**
     * GreenLoop - recycle-request.js
     * Logic สำหรับฟอร์มแจ้งความประสงค์รีไซเคิล: toggle E-Waste/Plastic, toggle ที่อยู่รับของ, submit
     * ในระบบจริงจะส่งไปยัง API PHP เช่น:
     *   fetch('api/recycle_request.php', { method: 'POST', body: formData })
     */

    document.addEventListener('DOMContentLoaded', () => {

    const ewasteRadio    = document.getElementById('typeEwaste');
    const plasticRadio   = document.getElementById('typePlastic');
    const ewasteSection  = document.getElementById('ewasteSection');
    const plasticSection = document.getElementById('plasticSection');
    const pickupRadio    = document.getElementById('pickup');
    const dropOffRadio   = document.getElementById('dropOff');
    const addressField   = document.getElementById('addressField');
    const form           = document.getElementById('recycleForm');

    function toggleWasteType() {
        const isEwaste = ewasteRadio.checked;
        ewasteSection.classList.toggle('section-hidden', !isEwaste);
        plasticSection.classList.toggle('section-hidden', isEwaste);
    }

    function togglePickup() {
        addressField.classList.toggle('section-hidden', !pickupRadio.checked);
    }

    if (ewasteRadio && plasticRadio) {
        ewasteRadio.addEventListener('change', toggleWasteType);
        plasticRadio.addEventListener('change', toggleWasteType);
    }

    if (pickupRadio && dropOffRadio) {
        pickupRadio.addEventListener('change', togglePickup);
        dropOffRadio.addEventListener('change', togglePickup);
    }

    if (form) {
        form.addEventListener('submit', (e) => {
        e.preventDefault();

        const formData = new FormData(form);
        const payload = Object.fromEntries(formData.entries());

        console.log('Recycle request payload:', payload);

        // TODO: เชื่อมกับ backend จริง เช่น
        // fetch('api/recycle_request.php', { method: 'POST', body: formData })
        //   .then(r => r.json())
        //   .then(res => { if (res.success) window.location.href = 'recycle-track.html?id=' + res.request_id; });

        alert('ส่งคำขอรีไซเคิลเรียบร้อย! ทีมงานจะติดต่อกลับเพื่อยืนยันการนัดหมาย');
        form.reset();
        toggleWasteType();
        togglePickup();
        });
    }
    });