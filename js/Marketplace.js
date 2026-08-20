/**
 * GreenLoop - marketplace.js
 * Logic สำหรับหน้า Marketplace: render สินค้า, กรองตามหมวดหมู่, แบ่งหน้า (pagination) และการสั่งซื้อ
 */

document.addEventListener('DOMContentLoaded', () => {

    // ตัวอย่างข้อมูลสินค้า (mock data)
    const sampleProducts = [
        { id: 1, title: 'iPhone 12 128GB สีดำ สภาพดี', price: 9900, condition: 'สภาพดี', category: 'mobile', image: 'https://placehold.co/300x200?text=iPhone+12' },
        { id: 2, title: 'Notebook Dell Inspiron 14"', price: 12500, condition: 'เหมือนใหม่', category: 'notebook', image: 'https://placehold.co/300x200?text=Dell+Notebook' },
        { id: 3, title: 'iPad Gen 9 64GB Wi-Fi', price: 8500, condition: 'สภาพดี', category: 'tablet', image: 'https://placehold.co/300x200?text=iPad+Gen9' },
        { id: 4, title: 'กล้อง Canon EOS M50', price: 14900, condition: 'เหมือนใหม่', category: 'camera', image: 'https://placehold.co/300x200?text=Canon+M50' },
        { id: 5, title: 'Samsung Galaxy S21', price: 7200, condition: 'พอใช้', category: 'mobile', image: 'https://placehold.co/300x200?text=Galaxy+S21' },
        { id: 6, title: 'หูฟังไร้สาย Sony WH-1000XM4', price: 5500, condition: 'สภาพดี', category: 'accessory', image: 'https://placehold.co/300x200?text=Sony+XM4' },
        { id: 7, title: 'หูฟังไร้สาย Sony WH-1000XM4', price: 5500, condition: 'สภาพดี', category: 'accessory', image: 'https://placehold.co/300x200?text=Sony+XM4' },
        { id: 8, title: 'หูฟังไร้สาย Sony WH-1000XM4', price: 5500, condition: 'สภาพดี', category: 'accessory', image: 'https://placehold.co/300x200?text=Sony+XM4' },
        { id: 9, title: 'หูฟังไร้สาย Sony WH-1000XM4', price: 5500, condition: 'สภาพดี', category: 'accessory', image: 'https://placehold.co/300x200?text=Sony+XM4' },
    ];

    const ITEMS_PER_PAGE = 6;

    const productTrack     = document.getElementById('productTrack');
    const resultCount      = document.getElementById('resultCount');
    const categoryFilters  = document.getElementById('categoryFilters');
    const prevPageBtn      = document.getElementById('prevPageBtn');
    const nextPageBtn      = document.getElementById('nextPageBtn');

    let currentCategory = 'all';
    let currentPageIndex = 0; // 0-based

    function getFilteredProducts() {
        return currentCategory === 'all'
            ? sampleProducts
            : sampleProducts.filter(p => p.category === currentCategory);
    }

    function chunkIntoPages(items) {
        const pages = [];
        for (let i = 0; i < items.length; i += ITEMS_PER_PAGE) {
            pages.push(items.slice(i, i + ITEMS_PER_PAGE));
        }
        return pages.length ? pages : [[]];
    }

    function renderProductCard(p) {
        return `
        <div class="col-6 col-md-4">
            <div class="card product-card h-100 d-flex flex-column justify-content-between">
                <div>
                    <div class="position-relative">
                        <img src="${p.image}" class="product-img" alt="${p.title}">
                        <button class="fav-btn" data-action="toggle-fav">
                            <i class="bi bi-heart text-danger"></i>
                        </button>
                    </div>
                    <div class="card-body pb-0">
                        <h6 class="card-title mb-1 text-truncate">${p.title}</h6>
                        <div class="price-tag mb-1">฿${p.price.toLocaleString()}</div>
                        <span class="badge bg-light text-secondary border mb-2">${p.condition}</span>
                    </div>
                </div>

                <!-- ปุ่มสั่งซื้อสินค้า -->
                <div class="card-footer bg-white border-0 pt-0 pb-3 px-3">
                    <button class="btn btn-sm w-100 text-white fw-bold btn-buy" 
                            style="background-color: var(--gl-green);"
                            onclick="handleBuyNow(${p.id}, '${p.title.replace(/'/g, "\\'")}', ${p.price})">
                        <i class="bi bi-bag-check-fill me-1"></i> สั่งซื้อ
                    </button>
                </div>
            </div>
        </div>`;
    }

    function renderProducts() {
        if (!productTrack) return;

        const filtered = getFilteredProducts();

        if (resultCount) resultCount.textContent = `พบ ${filtered.length} รายการ`;

        if (filtered.length === 0) {
            productTrack.style.transform = 'translateX(0%)';
            productTrack.innerHTML = `
                <div class="carousel-page">
                    <div class="row g-3">
                        <div class="col-12 text-center text-muted py-5">
                            <h5>ไม่พบสินค้าในหมวดหมู่นี้</h5>
                        </div>
                    </div>
                </div>`;
            updateArrowStates(0, 1);
            return;
        }

        const pages = chunkIntoPages(filtered);
        if (currentPageIndex > pages.length - 1) currentPageIndex = pages.length - 1;

        productTrack.innerHTML = pages.map(pageItems => `
            <div class="carousel-page">
                <div class="row g-3">
                    ${pageItems.map(renderProductCard).join('')}
                </div>
            </div>
        `).join('');

        goToPage(currentPageIndex, pages.length, true);
    }

    function goToPage(index, totalPages, skipScroll) {
        currentPageIndex = Math.max(0, Math.min(index, totalPages - 1));
        productTrack.style.transform = `translateX(-${currentPageIndex * 100}%)`;
        updateArrowStates(currentPageIndex, totalPages);

        if (!skipScroll) {
            productTrack.closest('.carousel-shell').scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }

    function updateArrowStates(index, totalPages) {
        if (prevPageBtn) prevPageBtn.disabled = index <= 0;
        if (nextPageBtn) nextPageBtn.disabled = index >= totalPages - 1;
    }

    // Favorite toggle (event delegation)
    if (productTrack) {
        productTrack.addEventListener('click', (e) => {
            const btn = e.target.closest('[data-action="toggle-fav"]');
            if (!btn) return;
            const icon = btn.querySelector('i');
            icon.classList.toggle('bi-heart');
            icon.classList.toggle('bi-heart-fill');
        });
    }

    // Category filter
    if (categoryFilters) {
        categoryFilters.addEventListener('click', (e) => {
            if (e.target.tagName !== 'BUTTON') return;
            [...categoryFilters.children].forEach(btn => btn.classList.replace('btn-success', 'btn-outline-secondary'));
            e.target.classList.replace('btn-outline-secondary', 'btn-success');

            currentCategory = e.target.dataset.cat;
            currentPageIndex = 0; // รีเซ็ตกลับหน้าแรกทุกครั้งที่เปลี่ยนหมวดหมู่
            renderProducts();
        });
    }

    // Arrow navigation
    if (prevPageBtn) {
        prevPageBtn.addEventListener('click', () => {
            const totalPages = chunkIntoPages(getFilteredProducts()).length;
            goToPage(currentPageIndex - 1, totalPages);
        });
    }
    if (nextPageBtn) {
        nextPageBtn.addEventListener('click', () => {
            const totalPages = chunkIntoPages(getFilteredProducts()).length;
            goToPage(currentPageIndex + 1, totalPages);
        });
    }

    // แสดงผลข้อมูลเริ่มต้น
    renderProducts();
});

// ฟังก์ชันส่งข้อมูลการสั่งซื้อ
function handleBuyNow(productId, productTitle, price) {
    const checkoutUrl = `checkout.html?id=${productId}&title=${encodeURIComponent(productTitle)}&price=${price}`;
    window.location.href = checkoutUrl;
}