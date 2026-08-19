    /**
     * GreenLoop - index.js
     * Logic สำหรับหน้า Homepage: render สินค้าแนะนำ และรายการรับรีไซเคิลยอดนิยม
     * ในระบบจริงข้อมูลชุดนี้จะดึงมาจาก API PHP เช่น:
     *   fetch('api/products.php?featured=1')
     *   fetch('api/recycle_categories.php?popular=1')
     */

    document.addEventListener('DOMContentLoaded', () => {

    // ตัวอย่างข้อมูลสินค้าแนะนำ (mock data)
    const featured = [
        { title: 'iPhone 12 128GB สีดำ', price: 9900, score: 82, image: 'https://placehold.co/300x200?text=iPhone+12' },
        { title: 'Notebook Dell Inspiron 14"', price: 12500, score: 76, image: 'https://placehold.co/300x200?text=Dell+Notebook' },
        { title: 'iPad Gen 9 64GB Wi-Fi', price: 8500, score: 88, image: 'https://placehold.co/300x200?text=iPad+Gen9' },
        { title: 'กล้อง Canon EOS M50', price: 14900, score: 70, image: 'https://placehold.co/300x200?text=Canon+M50' },
    ];

    // ตัวอย่างข้อมูลรายการรับรีไซเคิลยอดนิยม (mock data)
    const recycleItems = [
        { title: 'มือถือ / Tablet เก่า', points: '+50', icon: 'bi-phone', color: '#1e8e5a' },
        { title: 'แบตเตอรี่ / อุปกรณ์ไฟฟ้า', points: '+50', icon: 'bi-battery-full', color: '#1e8e5a' },
        { title: 'ขวดพลาสติก PET', points: '+10-30', icon: 'bi-droplet-half', color: '#0d7bb5' },
        { title: 'ถุง / บรรจุภัณฑ์พลาสติก', points: '+10-30', icon: 'bi-bag', color: '#0d7bb5' },
    ];

    function renderFeatured(products) {
        const grid = document.getElementById('featuredGrid');
        if (!grid) return;
        grid.innerHTML = products.map(p => `
        <div class="col-6 col-md-3">
            <div class="card product-card h-100">
            <div class="position-relative">
                <img src="${p.image}" class="product-img" alt="${p.title}">
                <span class="green-score-badge"><i class="bi bi-leaf-fill"></i> ${p.score}</span>
            </div>
            <div class="card-body p-2">
                <div class="small text-truncate">${p.title}</div>
                <div class="price-tag">฿${p.price.toLocaleString()}</div>
            </div>
            </div>
        </div>
        `).join('');
    }

    function renderRecycleItems(items) {
        const grid = document.getElementById('recycleGrid');
        if (!grid) return;
        grid.innerHTML = items.map(r => `
        <div class="col-6 col-md-3">
            <div class="card product-card h-100 text-center p-3" style="border-top:3px solid ${r.color};">
            <i class="bi ${r.icon}" style="font-size:1.8rem;color:${r.color};"></i>
            <div class="small fw-semibold mt-2">${r.title}</div>
            <span class="badge mt-2" style="background:${r.color};">${r.points} คะแนน</span>
            </div>
        </div>
        `).join('');
    }

    renderFeatured(featured);
    renderRecycleItems(recycleItems);

    // TODO: เชื่อมกับ backend จริง เช่น
    // fetch('api/products.php?featured=1').then(r => r.json()).then(renderFeatured);
    });