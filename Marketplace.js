    /**
     * GreenLoop - marketplace.js
     * Logic สำหรับหน้า Marketplace: render สินค้า, กรองตามหมวดหมู่, Green Score range
     * ในระบบจริงข้อมูลชุดนี้จะดึงมาจาก API PHP เช่น:
     *   fetch('api/products.php?category=mobile&min_price=0&max_price=10000')
     */

    document.addEventListener('DOMContentLoaded', () => {

    // ตัวอย่างข้อมูลสินค้า (mock data)
    const sampleProducts = [
        { id: 1, title: 'iPhone 12 128GB สีดำ สภาพดี', price: 9900, condition: 'สภาพดี', greenScore: 82, category: 'mobile', image: 'https://placehold.co/300x200?text=iPhone+12' },
        { id: 2, title: 'Notebook Dell Inspiron 14"', price: 12500, condition: 'เหมือนใหม่', greenScore: 76, category: 'notebook', image: 'https://placehold.co/300x200?text=Dell+Notebook' },
        { id: 3, title: 'iPad Gen 9 64GB Wi-Fi', price: 8500, condition: 'สภาพดี', greenScore: 88, category: 'tablet', image: 'https://placehold.co/300x200?text=iPad+Gen9' },
        { id: 4, title: 'กล้อง Canon EOS M50', price: 14900, condition: 'เหมือนใหม่', greenScore: 70, category: 'camera', image: 'https://placehold.co/300x200?text=Canon+M50' },
        { id: 5, title: 'Samsung Galaxy S21', price: 7200, condition: 'พอใช้', greenScore: 65, category: 'mobile', image: 'https://placehold.co/300x200?text=Galaxy+S21' },
        { id: 6, title: 'หูฟังไร้สาย Sony WH-1000XM4', price: 5500, condition: 'สภาพดี', greenScore: 79, category: 'accessory', image: 'https://placehold.co/300x200?text=Sony+XM4' },
    ];

    const productGrid   = document.getElementById('productGrid');
    const resultCount   = document.getElementById('resultCount');
    const categoryFilters = document.getElementById('categoryFilters');
    const greenScoreRange = document.getElementById('greenScoreRange');
    const greenScoreValue = document.getElementById('greenScoreValue');

    function renderProducts(products) {
        if (!productGrid) return;
        productGrid.innerHTML = products.map(p => `
        <div class="col-6 col-md-4">
            <div class="card product-card h-100">
            <div class="position-relative">
                <img src="${p.image}" class="product-img" alt="${p.title}">
                <span class="green-score-badge"><i class="bi bi-leaf-fill"></i> ${p.greenScore}</span>
                <button class="fav-btn" data-action="toggle-fav">
                <i class="bi bi-heart text-danger"></i>
                </button>
            </div>
            <div class="card-body">
                <h6 class="card-title mb-1 text-truncate">${p.title}</h6>
                <div class="price-tag mb-1">฿${p.price.toLocaleString()}</div>
                <span class="badge bg-light text-secondary border">${p.condition}</span>
            </div>
            </div>
        </div>
        `).join('');

        if (resultCount) resultCount.textContent = `พบ ${products.length} รายการ`;
    }

    // Favorite toggle (event delegation เพราะการ์ดถูก render ใหม่ทุกครั้ง)
    if (productGrid) {
        productGrid.addEventListener('click', (e) => {
        const btn = e.target.closest('[data-action="toggle-fav"]');
        if (!btn) return;
        const icon = btn.querySelector('i');
        icon.classList.toggle('bi-heart');
        icon.classList.toggle('bi-heart-fill');
        // TODO: fetch('api/favorites.php', { method:'POST', body: JSON.stringify({ product_id }) })
        });
    }

    // Category filter
    if (categoryFilters) {
        categoryFilters.addEventListener('click', (e) => {
        if (e.target.tagName !== 'BUTTON') return;
        [...categoryFilters.children].forEach(btn => btn.classList.replace('btn-success', 'btn-outline-secondary'));
        e.target.classList.replace('btn-outline-secondary', 'btn-success');

        const cat = e.target.dataset.cat;
        const filtered = cat === 'all' ? sampleProducts : sampleProducts.filter(p => p.category === cat);
        renderProducts(filtered);
        });
    }

    // Green score range display
    if (greenScoreRange) {
        greenScoreRange.addEventListener('input', () => {
        greenScoreValue.textContent = greenScoreRange.value;
        });
    }

    renderProducts(sampleProducts);

    // TODO: เชื่อมกับ backend จริง เช่น
    // fetch('api/products.php').then(r => r.json()).then(renderProducts);
    });