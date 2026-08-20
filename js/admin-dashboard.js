/**
 * GreenLoop - admin-dashboard.js
 * Logic สำหรับหน้า Admin Dashboard: ภาพรวมระบบ, จัดการสมาชิก/สินค้า/คำขอรีไซเคิล/บทความ, การแจ้งเตือน
 * ข้อมูลทั้งหมดเป็น mock data เก็บใน memory (ยังไม่เชื่อมต่อ backend จริง)
 */

/* ========================= MOCK DATA ========================= */

let members = [
    { id: 1, name: 'สมชาย ใจดี', email: 'somchai@example.com', joinDate: '2026-06-01', status: 'active', orders: 5 },
    { id: 2, name: 'สุดา แสนสุข', email: 'suda@example.com', joinDate: '2026-06-15', status: 'active', orders: 2 },
    { id: 3, name: 'วิชัย มั่นคง', email: 'wichai@example.com', joinDate: '2026-07-02', status: 'suspended', orders: 0 },
    { id: 4, name: 'พรทิพย์ รุ่งเรือง', email: 'porntip@example.com', joinDate: '2026-07-20', status: 'active', orders: 8 },
    { id: 5, name: 'อนุชา ทองดี', email: 'anucha@example.com', joinDate: '2026-08-05', status: 'active', orders: 1 },
];

let products = [
    { id: 1, title: 'iPhone 12 128GB สีดำ สภาพดี', seller: 'สมชาย ใจดี', category: 'mobile', price: 9900, status: 'active' },
    { id: 2, title: 'Notebook Dell Inspiron 14"', seller: 'สุดา แสนสุข', category: 'notebook', price: 12500, status: 'active' },
    { id: 3, title: 'iPad Gen 9 64GB Wi-Fi', seller: 'พรทิพย์ รุ่งเรือง', category: 'tablet', price: 8500, status: 'sold' },
    { id: 4, title: 'กล้อง Canon EOS M50', seller: 'อนุชา ทองดี', category: 'camera', price: 14900, status: 'reported' },
];

let recycleRequests = [
    { id: 1, user: 'สมชาย ใจดี', type: 'ewaste', detail: 'มือถือเก่า 2 ชิ้น', date: '2026-08-10', status: 'pending' },
    { id: 2, user: 'สุดา แสนสุข', type: 'plastic', detail: 'ขวด PET 1.5 กก.', date: '2026-08-12', status: 'approved' },
    { id: 3, user: 'วิชัย มั่นคง', type: 'ewaste', detail: 'แบตเตอรี่ 3 ก้อน', date: '2026-08-15', status: 'completed' },
    { id: 4, user: 'พรทิพย์ รุ่งเรือง', type: 'plastic', detail: 'บรรจุภัณฑ์พลาสติก 2 กก.', date: '2026-08-18', status: 'pending' },
];

let articles = [
    { id: 1, title: 'ขยะอิเล็กทรอนิกส์ไปไหนต่อ?', badge: 'E-Waste', date: '2026-08-15', status: 'published' },
    { id: 2, title: 'คัดแยกพลาสติกยังไงให้ได้ราคา', badge: 'พลาสติก', date: '2026-08-10', status: 'published' },
    { id: 3, title: 'วิธีสะสมแต้มแลกส่วนลด', badge: 'Green Points', date: '2026-08-05', status: 'published' },
    { id: 4, title: 'เทรนด์รีไซเคิลปี 2026', badge: 'E-Waste', date: '2026-08-19', status: 'draft' },
];

let notifications = [
    { id: 1, type: 'report', message: 'สินค้า "กล้อง Canon EOS M50" ถูกรายงานว่าข้อมูลไม่ตรงกับสภาพจริง', date: '2026-08-19', status: 'pending' },
    { id: 2, type: 'system', message: 'ระบบชำระเงินผ่าน Wallet มีความล่าช้าเมื่อคืนนี้ (ดำเนินการแก้ไขแล้ว)', date: '2026-08-18', status: 'resolved' },
    { id: 3, type: 'user', message: 'สมาชิก "วิชัย มั่นคง" ถูกระงับบัญชีชั่วคราวเนื่องจากพฤติกรรมผิดปกติ', date: '2026-08-17', status: 'pending' },
    { id: 4, type: 'report', message: 'มีผู้ใช้แจ้งว่าคำขอรีไซเคิล #2 ไม่มีเจ้าหน้าที่มารับตามนัด', date: '2026-08-16', status: 'pending' },
    { id: 5, type: 'system', message: 'อัปเดตระบบคำนวณ Green Point เรียบร้อยแล้ว', date: '2026-08-14', status: 'resolved' },
];

const signupStats = [
    { day: 'จ.', count: 3 },
    { day: 'อ.', count: 5 },
    { day: 'พ.', count: 2 },
    { day: 'พฤ.', count: 6 },
    { day: 'ศ.', count: 4 },
    { day: 'ส.', count: 8 },
    { day: 'อา.', count: 5 },
];

let nextMemberId = 6;
let nextProductId = 5;
let nextRecycleId = 5;
let nextArticleId = 5;

/* ========================= HELPERS ========================= */

const memberModal = () => bootstrap.Modal.getOrCreateInstance(document.getElementById('memberModal'));
const productModal = () => bootstrap.Modal.getOrCreateInstance(document.getElementById('productModal'));
const recycleModal = () => bootstrap.Modal.getOrCreateInstance(document.getElementById('recycleModal'));
const articleModal = () => bootstrap.Modal.getOrCreateInstance(document.getElementById('articleModal'));

function statusBadge(status) {
    const map = {
        active:    '<span class="badge bg-success-subtle text-success border border-success-subtle">Active</span>',
        suspended: '<span class="badge bg-danger-subtle text-danger border border-danger-subtle">Suspended</span>',
        sold:      '<span class="badge bg-secondary-subtle text-secondary border">ขายแล้ว</span>',
        reported:  '<span class="badge bg-danger-subtle text-danger border border-danger-subtle">ถูกรายงาน</span>',
        pending:   '<span class="badge bg-warning-subtle text-warning-emphasis border border-warning-subtle">รอดำเนินการ</span>',
        approved:  '<span class="badge bg-info-subtle text-info-emphasis border border-info-subtle">อนุมัติแล้ว</span>',
        completed: '<span class="badge bg-success-subtle text-success border border-success-subtle">เสร็จสิ้น</span>',
        published: '<span class="badge bg-success-subtle text-success border border-success-subtle">เผยแพร่แล้ว</span>',
        draft:     '<span class="badge bg-secondary-subtle text-secondary border">ฉบับร่าง</span>',
    };
    return map[status] || `<span class="badge bg-light text-dark border">${status}</span>`;
}

function actionButtons(onEdit, onDelete) {
    return `
        <div class="d-flex gap-2 justify-content-end">
            <button class="action-btn" onclick="${onEdit}" title="แก้ไข"><i class="bi bi-pencil"></i></button>
            <button class="action-btn danger" onclick="${onDelete}" title="ลบ"><i class="bi bi-trash"></i></button>
        </div>`;
}

/* ========================= SIDEBAR NAVIGATION ========================= */

const pageTitles = {
    overview: 'ภาพรวมระบบ',
    members: 'จัดการสมาชิก',
    products: 'จัดการสินค้า',
    recycle: 'จัดการคำขอรีไซเคิล',
    articles: 'จัดการบทความ',
    notifications: 'การแจ้งเตือน',
};

function showSection(section) {
    document.querySelectorAll('.admin-section').forEach(el => el.classList.remove('active'));
    document.getElementById(`section-${section}`).classList.add('active');

    document.querySelectorAll('.admin-sidebar .nav-link').forEach(el => el.classList.remove('active'));
    const navEl = document.querySelector(`.admin-sidebar .nav-link[data-section="${section}"]`);
    if (navEl) navEl.classList.add('active');

    document.getElementById('pageTitle').textContent = pageTitles[section] || '';

    // ปิด sidebar บนมือถือหลังเลือกเมนู
    document.getElementById('adminSidebar').classList.remove('open');
    document.getElementById('sidebarOverlay').classList.remove('show');
}

document.querySelectorAll('.admin-sidebar .nav-link[data-section]').forEach(link => {
    link.addEventListener('click', () => showSection(link.dataset.section));
});

document.querySelectorAll('[data-goto]').forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        showSection(link.dataset.goto);
    });
});

// Mobile sidebar toggle
document.getElementById('sidebarToggle').addEventListener('click', () => {
    document.getElementById('adminSidebar').classList.add('open');
    document.getElementById('sidebarOverlay').classList.add('show');
});
document.getElementById('sidebarOverlay').addEventListener('click', () => {
    document.getElementById('adminSidebar').classList.remove('open');
    document.getElementById('sidebarOverlay').classList.remove('show');
});

/* ========================= OVERVIEW ========================= */

function renderOverview() {
    document.getElementById('statMembers').textContent = members.length;
    document.getElementById('statProducts').textContent = products.length;
    document.getElementById('statRecycle').textContent = recycleRequests.filter(r => r.status === 'pending').length;

    const pendingNotif = notifications.filter(n => n.status === 'pending').length;
    document.getElementById('statNotif').textContent = pendingNotif;
    document.getElementById('notifNavBadge').textContent = pendingNotif;
    document.getElementById('notifNavBadge').style.display = pendingNotif > 0 ? 'inline-block' : 'none';

    // Mini bar chart - สมาชิกใหม่รายวัน
    const maxCount = Math.max(...signupStats.map(s => s.count), 1);
    document.getElementById('signupChart').innerHTML = signupStats.map(s => `
        <div class="mini-bar-col">
            <div class="mini-bar" style="height:${(s.count / maxCount) * 100}%;" title="${s.count} คน"></div>
            <small>${s.day}</small>
        </div>
    `).join('');

    // สินค้าตามหมวดหมู่
    const catLabels = { mobile: 'โทรศัพท์', notebook: 'Notebook', tablet: 'Tablet', camera: 'กล้อง', accessory: 'อุปกรณ์ IT' };
    const catCounts = {};
    products.forEach(p => { catCounts[p.category] = (catCounts[p.category] || 0) + 1; });
    const maxCat = Math.max(...Object.values(catCounts), 1);

    document.getElementById('categoryBars').innerHTML = Object.keys(catLabels).map(key => {
        const count = catCounts[key] || 0;
        return `
            <div class="cat-bar-row">
                <div class="cat-bar-label">${catLabels[key]}</div>
                <div class="cat-bar-track"><div class="cat-bar-fill" style="width:${(count / maxCat) * 100}%;"></div></div>
                <div class="cat-bar-count">${count}</div>
            </div>`;
    }).join('');

    // แจ้งเตือนล่าสุด (3 รายการ)
    const latest = [...notifications].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 3);
    document.getElementById('overviewNotifList').innerHTML = latest.map(renderNotifItem).join('');
}

/* ========================= MEMBERS ========================= */

function renderMembers() {
    const term = document.getElementById('memberSearch').value.trim().toLowerCase();
    const filtered = members.filter(m =>
        m.name.toLowerCase().includes(term) || m.email.toLowerCase().includes(term)
    );

    document.getElementById('membersCount').textContent = `พบ ${filtered.length} รายการ`;

    if (filtered.length === 0) {
        document.getElementById('membersTableBody').innerHTML = `<tr><td colspan="6" class="text-center text-muted py-4">ไม่พบข้อมูลสมาชิก</td></tr>`;
        return;
    }

    document.getElementById('membersTableBody').innerHTML = filtered.map(m => `
        <tr>
            <td class="fw-semibold">${m.name}</td>
            <td class="text-muted">${m.email}</td>
            <td>${m.joinDate}</td>
            <td>${statusBadge(m.status)}</td>
            <td>${m.orders}</td>
            <td>${actionButtons(`openMemberModal(${m.id})`, `deleteMember(${m.id})`)}</td>
        </tr>
    `).join('');
}

function openMemberModal(id) {
    const form = document.getElementById('memberForm');
    form.reset();
    document.getElementById('memberId').value = '';

    if (id) {
        const m = members.find(x => x.id === id);
        document.getElementById('memberModalTitle').textContent = 'แก้ไขสมาชิก';
        document.getElementById('memberId').value = m.id;
        document.getElementById('memberName').value = m.name;
        document.getElementById('memberEmail').value = m.email;
        document.getElementById('memberStatus').value = m.status;
    } else {
        document.getElementById('memberModalTitle').textContent = 'เพิ่มสมาชิก';
    }
    memberModal().show();
}

function saveMember() {
    const form = document.getElementById('memberForm');
    if (!form.checkValidity()) { form.reportValidity(); return; }

    const id = document.getElementById('memberId').value;
    const data = {
        name: document.getElementById('memberName').value.trim(),
        email: document.getElementById('memberEmail').value.trim(),
        status: document.getElementById('memberStatus').value,
    };

    if (id) {
        const m = members.find(x => x.id === parseInt(id, 10));
        Object.assign(m, data);
    } else {
        members.push({ id: nextMemberId++, joinDate: new Date().toISOString().slice(0, 10), orders: 0, ...data });
    }

    memberModal().hide();
    renderMembers();
    renderOverview();
}

function deleteMember(id) {
    if (!confirm('ยืนยันการลบสมาชิกนี้หรือไม่?')) return;
    members = members.filter(m => m.id !== id);
    renderMembers();
    renderOverview();
}

document.getElementById('memberSearch').addEventListener('input', renderMembers);

/* ========================= PRODUCTS ========================= */

const categoryLabel = { mobile: 'โทรศัพท์', notebook: 'Notebook', tablet: 'Tablet', camera: 'กล้อง', accessory: 'อุปกรณ์ IT' };

function renderProducts() {
    const term = document.getElementById('productSearch').value.trim().toLowerCase();
    const filtered = products.filter(p =>
        p.title.toLowerCase().includes(term) || p.seller.toLowerCase().includes(term)
    );

    document.getElementById('productsCount').textContent = `พบ ${filtered.length} รายการ`;

    if (filtered.length === 0) {
        document.getElementById('productsTableBody').innerHTML = `<tr><td colspan="6" class="text-center text-muted py-4">ไม่พบข้อมูลสินค้า</td></tr>`;
        return;
    }

    document.getElementById('productsTableBody').innerHTML = filtered.map(p => `
        <tr>
            <td class="fw-semibold">${p.title}</td>
            <td class="text-muted">${p.seller}</td>
            <td>${categoryLabel[p.category] || p.category}</td>
            <td>฿${p.price.toLocaleString()}</td>
            <td>${statusBadge(p.status)}</td>
            <td>${actionButtons(`openProductModal(${p.id})`, `deleteProduct(${p.id})`)}</td>
        </tr>
    `).join('');
}

function openProductModal(id) {
    const form = document.getElementById('productForm');
    form.reset();
    document.getElementById('productId').value = '';

    if (id) {
        const p = products.find(x => x.id === id);
        document.getElementById('productModalTitle').textContent = 'แก้ไขสินค้า';
        document.getElementById('productId').value = p.id;
        document.getElementById('productTitle').value = p.title;
        document.getElementById('productSeller').value = p.seller;
        document.getElementById('productCategory').value = p.category;
        document.getElementById('productPrice').value = p.price;
        document.getElementById('productStatus').value = p.status;
    } else {
        document.getElementById('productModalTitle').textContent = 'เพิ่มสินค้า';
    }
    productModal().show();
}

function saveProduct() {
    const form = document.getElementById('productForm');
    if (!form.checkValidity()) { form.reportValidity(); return; }

    const id = document.getElementById('productId').value;
    const data = {
        title: document.getElementById('productTitle').value.trim(),
        seller: document.getElementById('productSeller').value.trim(),
        category: document.getElementById('productCategory').value,
        price: parseFloat(document.getElementById('productPrice').value) || 0,
        status: document.getElementById('productStatus').value,
    };

    if (id) {
        const p = products.find(x => x.id === parseInt(id, 10));
        Object.assign(p, data);
    } else {
        products.push({ id: nextProductId++, ...data });
    }

    productModal().hide();
    renderProducts();
    renderOverview();
}

function deleteProduct(id) {
    if (!confirm('ยืนยันการลบสินค้านี้หรือไม่?')) return;
    products = products.filter(p => p.id !== id);
    renderProducts();
    renderOverview();
}

document.getElementById('productSearch').addEventListener('input', renderProducts);

/* ========================= RECYCLE REQUESTS ========================= */

const recycleTypeLabel = { ewaste: 'E-Waste', plastic: 'พลาสติก' };

function renderRecycle() {
    const term = document.getElementById('recycleSearch').value.trim().toLowerCase();
    const filtered = recycleRequests.filter(r => r.user.toLowerCase().includes(term));

    document.getElementById('recycleCount').textContent = `พบ ${filtered.length} รายการ`;

    if (filtered.length === 0) {
        document.getElementById('recycleTableBody').innerHTML = `<tr><td colspan="6" class="text-center text-muted py-4">ไม่พบคำขอรีไซเคิล</td></tr>`;
        return;
    }

    document.getElementById('recycleTableBody').innerHTML = filtered.map(r => `
        <tr>
            <td class="fw-semibold">${r.user}</td>
            <td>${recycleTypeLabel[r.type] || r.type}</td>
            <td class="text-muted">${r.detail}</td>
            <td>${r.date}</td>
            <td>${statusBadge(r.status)}</td>
            <td>${actionButtons(`openRecycleModal(${r.id})`, `deleteRecycle(${r.id})`)}</td>
        </tr>
    `).join('');
}

function openRecycleModal(id) {
    const form = document.getElementById('recycleForm');
    form.reset();
    document.getElementById('recycleId').value = '';

    if (id) {
        const r = recycleRequests.find(x => x.id === id);
        document.getElementById('recycleModalTitle').textContent = 'แก้ไขคำขอรีไซเคิล';
        document.getElementById('recycleId').value = r.id;
        document.getElementById('recycleUser').value = r.user;
        document.getElementById('recycleType').value = r.type;
        document.getElementById('recycleStatus').value = r.status;
        document.getElementById('recycleDetail').value = r.detail;
    } else {
        document.getElementById('recycleModalTitle').textContent = 'เพิ่มคำขอรีไซเคิล';
    }
    recycleModal().show();
}

function saveRecycle() {
    const form = document.getElementById('recycleForm');
    if (!form.checkValidity()) { form.reportValidity(); return; }

    const id = document.getElementById('recycleId').value;
    const data = {
        user: document.getElementById('recycleUser').value.trim(),
        type: document.getElementById('recycleType').value,
        status: document.getElementById('recycleStatus').value,
        detail: document.getElementById('recycleDetail').value.trim(),
    };

    if (id) {
        const r = recycleRequests.find(x => x.id === parseInt(id, 10));
        Object.assign(r, data);
    } else {
        recycleRequests.push({ id: nextRecycleId++, date: new Date().toISOString().slice(0, 10), ...data });
    }

    recycleModal().hide();
    renderRecycle();
    renderOverview();
}

function deleteRecycle(id) {
    if (!confirm('ยืนยันการลบคำขอนี้หรือไม่?')) return;
    recycleRequests = recycleRequests.filter(r => r.id !== id);
    renderRecycle();
    renderOverview();
}

document.getElementById('recycleSearch').addEventListener('input', renderRecycle);

/* ========================= ARTICLES ========================= */

function renderArticles() {
    const term = document.getElementById('articleSearch').value.trim().toLowerCase();
    const filtered = articles.filter(a => a.title.toLowerCase().includes(term));

    document.getElementById('articlesCount').textContent = `พบ ${filtered.length} รายการ`;

    if (filtered.length === 0) {
        document.getElementById('articlesTableBody').innerHTML = `<tr><td colspan="5" class="text-center text-muted py-4">ไม่พบบทความ</td></tr>`;
        return;
    }

    document.getElementById('articlesTableBody').innerHTML = filtered.map(a => `
        <tr>
            <td class="fw-semibold">${a.title}</td>
            <td><span class="badge bg-light text-dark border">${a.badge}</span></td>
            <td>${a.date}</td>
            <td>${statusBadge(a.status)}</td>
            <td>${actionButtons(`openArticleModal(${a.id})`, `deleteArticle(${a.id})`)}</td>
        </tr>
    `).join('');
}

function openArticleModal(id) {
    const form = document.getElementById('articleForm');
    form.reset();
    document.getElementById('articleId').value = '';

    if (id) {
        const a = articles.find(x => x.id === id);
        document.getElementById('articleModalTitle').textContent = 'แก้ไขบทความ';
        document.getElementById('articleId').value = a.id;
        document.getElementById('articleTitle').value = a.title;
        document.getElementById('articleBadge').value = a.badge;
        document.getElementById('articleStatus').value = a.status;
        document.getElementById('articleExcerpt').value = a.excerpt || '';
    } else {
        document.getElementById('articleModalTitle').textContent = 'เพิ่มบทความ';
    }
    articleModal().show();
}

function saveArticle() {
    const form = document.getElementById('articleForm');
    if (!form.checkValidity()) { form.reportValidity(); return; }

    const id = document.getElementById('articleId').value;
    const data = {
        title: document.getElementById('articleTitle').value.trim(),
        badge: document.getElementById('articleBadge').value,
        status: document.getElementById('articleStatus').value,
        excerpt: document.getElementById('articleExcerpt').value.trim(),
    };

    if (id) {
        const a = articles.find(x => x.id === parseInt(id, 10));
        Object.assign(a, data);
    } else {
        articles.push({ id: nextArticleId++, date: new Date().toISOString().slice(0, 10), ...data });
    }

    articleModal().hide();
    renderArticles();
    renderOverview();
}

function deleteArticle(id) {
    if (!confirm('ยืนยันการลบบทความนี้หรือไม่?')) return;
    articles = articles.filter(a => a.id !== id);
    renderArticles();
    renderOverview();
}

document.getElementById('articleSearch').addEventListener('input', renderArticles);

/* ========================= NOTIFICATIONS ========================= */

const notifIcon = {
    report: { icon: 'bi-flag-fill', bg: '#e03131' },
    system: { icon: 'bi-gear-fill', bg: '#0d7bb5' },
    user:   { icon: 'bi-person-fill', bg: '#f08c00' },
};

function renderNotifItem(n) {
    const cfg = notifIcon[n.type] || notifIcon.system;
    const statusClass = n.status === 'pending' ? 'notif-badge-pending' : 'notif-badge-resolved';
    const statusText = n.status === 'pending' ? 'รอดำเนินการ' : 'แก้ไขแล้ว';

    return `
        <div class="notif-item">
            <div class="notif-icon" style="background:${cfg.bg};"><i class="bi ${cfg.icon}"></i></div>
            <div class="flex-grow-1">
                <div class="d-flex justify-content-between align-items-start gap-2">
                    <p class="mb-1 small">${n.message}</p>
                    <span class="badge ${statusClass} flex-shrink-0">${statusText}</span>
                </div>
                <div class="d-flex justify-content-between align-items-center">
                    <small class="text-muted">${n.date}</small>
                    ${n.status === 'pending'
                        ? `<button class="btn btn-sm btn-outline-success" onclick="resolveNotification(${n.id})">
                             <i class="bi bi-check2"></i> ทำเครื่องหมายว่าแก้ไขแล้ว
                           </button>`
                        : ''}
                </div>
            </div>
        </div>`;
}

function renderNotifications() {
    const filter = document.getElementById('notifFilter').value;
    const filtered = notifications
        .filter(n => filter === 'all' || n.status === filter)
        .sort((a, b) => new Date(b.date) - new Date(a.date));

    document.getElementById('notifCount').textContent = `พบ ${filtered.length} รายการ`;

    document.getElementById('notificationsList').innerHTML = filtered.length
        ? filtered.map(renderNotifItem).join('')
        : `<p class="text-center text-muted py-4 mb-0">ไม่พบการแจ้งเตือน</p>`;
}

function resolveNotification(id) {
    const n = notifications.find(x => x.id === id);
    if (n) n.status = 'resolved';
    renderNotifications();
    renderOverview();
}

document.getElementById('notifFilter').addEventListener('change', renderNotifications);

/* ========================= INIT ========================= */

document.addEventListener('DOMContentLoaded', () => {
    renderOverview();
    renderMembers();
    renderProducts();
    renderRecycle();
    renderArticles();
    renderNotifications();
});