document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('sellForm');
    const imageInput = document.getElementById('imageInput');
    const imageUploader = document.getElementById('imageUploader');
    const addImageSlot = document.getElementById('addImageSlot');
    const MAX_IMAGES = 8;
    let selectedFiles = [];

    // --- Image upload / preview ---
    imageInput.addEventListener('change', (e) => {
        const files = Array.from(e.target.files);
        for (const file of files) {
            if (selectedFiles.length >= MAX_IMAGES) break;
            if (!file.type.startsWith('image/')) continue;
            if (file.size > 5 * 1024 * 1024) {
                alert(`ไฟล์ "${file.name}" มีขนาดเกิน 5MB`);
                continue;
            }
            selectedFiles.push(file);
        }
        renderPreviews();
        imageInput.value = ''; // allow selecting the same file again
    });

    function renderPreviews() {
        imageUploader
            .querySelectorAll('.upload-slot:not(#addImageSlot)')
            .forEach((el) => el.remove());

        selectedFiles.forEach((file, index) => {
            const slot = document.createElement('div');
            slot.className = 'upload-slot' + (index === 0 ? ' cover-slot' : '');

            const img = document.createElement('img');
            img.src = URL.createObjectURL(file);
            img.alt = file.name;

            const removeBtn = document.createElement('button');
            removeBtn.type = 'button';
            removeBtn.className = 'remove-img';
            removeBtn.innerHTML = '&times;';
            removeBtn.addEventListener('click', (ev) => {
                ev.stopPropagation();
                selectedFiles.splice(index, 1);
                renderPreviews();
            });

            slot.appendChild(img);
            slot.appendChild(removeBtn);
            imageUploader.insertBefore(slot, addImageSlot);
        });

        addImageSlot.style.display =
            selectedFiles.length >= MAX_IMAGES ? 'none' : 'flex';
    }

    // --- Form submit ---
    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const userData = JSON.parse(localStorage.getItem('user') || 'null');
        if (!userData || !userData.id) {
            alert('กรุณาเข้าสู่ระบบก่อนลงขายสินค้า');
            window.location.href = 'login.html';
            return;
        }

        const conditionInput = form.querySelector(
            'input[name="condition"]:checked',
        );
        const title = form.title.value.trim();
        const category = form.category.value;
        const price = form.price.value;
        const description = form.description.value.trim();
        const agreeTerms = document.getElementById('agreeTerms');

        if (
            !title ||
            !category ||
            !price ||
            Number(price) < 0 ||
            !description ||
            !conditionInput
        ) {
            alert('กรุณากรอกข้อมูลสินค้าให้ครบถ้วนและถูกต้อง');
            return;
        }
        if (!agreeTerms.checked) {
            alert('กรุณายอมรับเงื่อนไขการลงขายสินค้า');
            return;
        }

        const submitBtn = form.querySelector('button[type="submit"]');
        const originalBtnHtml = submitBtn.innerHTML;
        submitBtn.disabled = true;
        submitBtn.innerHTML =
            '<span class="spinner-border spinner-border-sm me-1"></span> กำลังบันทึก...';

        const formData = new FormData();
        formData.append('user_id', userData.id);
        formData.append('title', title);
        formData.append('category', category);
        formData.append('price', price);
        formData.append('condition', conditionInput.value);
        formData.append('conditionNote', form.conditionNote.value.trim());
        formData.append('description', description);
        selectedFiles.forEach((file) => formData.append('images[]', file));

        try {
            const res = await fetch('api/create_product.php', {
                method: 'POST',
                body: formData,
            });
            const result = await res.json();

            if (result.success) {
                alert(
                    'ลงขายสินค้าสำเร็จ! สินค้าของคุณถูกเพิ่มเข้าสู่ตลาดมือสองแล้ว',
                );
                window.location.href = 'marketplace.html';
            } else {
                alert(
                    result.message ||
                        'เกิดข้อผิดพลาดในการลงขายสินค้า กรุณาลองใหม่อีกครั้ง',
                );
            }
        } catch (err) {
            console.error(err);
            alert('ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้ กรุณาลองใหม่อีกครั้ง');
        } finally {
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalBtnHtml;
        }
    });
});
