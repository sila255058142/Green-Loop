document.addEventListener('DOMContentLoaded', () => {
    // ---------- Sidebar section switching ----------
    const navLinks = document.querySelectorAll(
        '.admin-sidebar .nav-link[data-section]',
    );
    const sections = document.querySelectorAll('.admin-section');
    const pageTitle = document.getElementById('pageTitle');
    const sidebar = document.getElementById('adminSidebar');
    const sidebarToggle = document.getElementById('sidebarToggle');
    const sidebarOverlay = document.getElementById('sidebarOverlay');

    const titleMap = {
        overview: 'ภาพรวมระบบ',
        members: 'จัดการสมาชิก',
        products: 'จัดการสินค้า',
        recycle: 'จัดการคำขอรีไซเคิล',
        articles: 'จัดการบทความ',
        notifications: 'การแจ้งเตือน',
    };

    function goToSection(name) {
        navLinks.forEach((l) =>
            l.classList.toggle('active', l.dataset.section === name),
        );
        sections.forEach((s) =>
            s.classList.toggle('active', s.id === `section-${name}`),
        );
        if (pageTitle) pageTitle.textContent = titleMap[name] || name;
        if (sidebar) sidebar.classList.remove('open');
        if (sidebarOverlay) sidebarOverlay.classList.remove('show');

        if (name === 'recycle') loadRecycleRequests();
        if (name === 'members') loadMembers();
        if (name === 'products') loadProducts();
        if (name === 'overview') loadStats();
    }

    navLinks.forEach((link) => {
        link.addEventListener('click', () => goToSection(link.dataset.section));
    });
    document.querySelectorAll('[data-goto]').forEach((link) => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            goToSection(link.dataset.goto);
        });
    });

    if (sidebarToggle) {
        sidebarToggle.addEventListener('click', () => {
            sidebar.classList.toggle('open');
            sidebarOverlay.classList.toggle('show');
        });
    }
    if (sidebarOverlay) {
        sidebarOverlay.addEventListener('click', () => {
            sidebar.classList.remove('open');
            sidebarOverlay.classList.remove('show');
        });
    }

    // ---------- Logout ----------
    const logoutBtn = document.getElementById('adminLogoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', async () => {
            if (!confirm('ต้องการออกจากระบบใช่หรือไม่?')) return;
            try {
                await fetch('api/admin_logout.php', { method: 'POST' });
            } catch (e) {
                /* ignore */
            }
            window.location.href = 'admin-login.html';
        });
    }

    // ---------- Overview stats ----------
    async function loadStats() {
        try {
            const res = await fetch('api/admin_stats.php');
            const result = await res.json();
            if (!result.success) return;

            const s = result.stats;
            document.getElementById('statMembers').textContent = s.members;
            document.getElementById('statProducts').textContent = s.products;
            document.getElementById('statRecycle').textContent =
                s.recyclePending;
            document.getElementById('statNotif').textContent = '0';

            renderCategoryBars(result.categoryBreakdown || []);
            renderSignupChart(result.signupTrend || []);
        } catch (err) {
            console.error('loadStats error:', err);
        }
    }

    function renderCategoryBars(rows) {
        const el = document.getElementById('categoryBars');
        if (!el) return;
        if (rows.length === 0) {
            el.innerHTML = '<div class="text-muted small">ยังไม่มีข้อมูล</div>';
            return;
        }
        const max = Math.max(...rows.map((r) => Number(r.cnt)), 1);
        el.innerHTML = rows
            .map(
                (r) => `
            <div class="cat-bar-row">
                <div class="cat-bar-label text-truncate">${escapeHtml(r.category)}</div>
                <div class="cat-bar-track"><div class="cat-bar-fill" style="width:${(r.cnt / max) * 100}%"></div></div>
                <div class="cat-bar-count">${r.cnt}</div>
            </div>
        `,
            )
            .join('');
    }

    function renderSignupChart(rows) {
        const el = document.getElementById('signupChart');
        if (!el) return;
        const days = [];
        for (let i = 6; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            days.push(d.toISOString().slice(0, 10));
        }
        const map = {};
        rows.forEach((r) => {
            map[r.d] = Number(r.cnt);
        });
        const max = Math.max(...days.map((d) => map[d] || 0), 1);

        el.innerHTML = days
            .map((d) => {
                const cnt = map[d] || 0;
                const label = new Date(d).toLocaleDateString('th-TH', {
                    day: 'numeric',
                    month: 'short',
                });
                return `
                <div class="mini-bar-col">
                    <div class="mini-bar" style="height:${(cnt / max) * 100}%"></div>
                    <small>${label}</small>
                </div>`;
            })
            .join('');
    }

    // ---------- Members ----------
    async function loadMembers() {
        const tbody = document.getElementById('membersTableBody');
        const countEl = document.getElementById('membersCount');
        tbody.innerHTML = `<tr><td colspan="6" class="text-center text-muted py-4">กำลังโหลด...</td></tr>`;

        try {
            const res = await fetch('api/admin_get_members.php');
            const result = await res.json();
            if (!result.success) throw new Error(result.message);

            const members = result.members;
            countEl.textContent = `พบ ${members.length} รายการ`;

            if (members.length === 0) {
                tbody.innerHTML = `<tr><td colspan="6" class="text-center text-muted py-4">ยังไม่มีสมาชิก</td></tr>`;
                return;
            }

            tbody.innerHTML = members
                .map(
                    (m) => `
                <tr>
                    <td>${escapeHtml(m.username)}${m.role === 'admin' ? ' <span class="badge bg-dark">admin</span>' : ''}</td>
                    <td>${escapeHtml(m.email)}</td>
                    <td>${formatDate(m.created_at)}</td>
                    <td><span class="badge bg-light text-success border">${m.green_points ?? 0} แต้ม</span></td>
                    <td>${m.order_count}</td>
                    <td class="text-end text-muted small">-</td>
                </tr>
            `,
                )
                .join('');
        } catch (err) {
            console.error('loadMembers error:', err);
            tbody.innerHTML = `<tr><td colspan="6" class="text-center text-danger py-4">โหลดข้อมูลไม่สำเร็จ</td></tr>`;
        }
    }

    document.getElementById('memberSearch')?.addEventListener('input', (e) => {
        filterTable('membersTableBody', e.target.value);
    });

    // ---------- Products ----------
    async function loadProducts() {
        const tbody = document.getElementById('productsTableBody');
        const countEl = document.getElementById('productsCount');
        tbody.innerHTML = `<tr><td colspan="6" class="text-center text-muted py-4">กำลังโหลด...</td></tr>`;

        try {
            const res = await fetch('api/admin_get_products.php');
            const result = await res.json();
            if (!result.success) throw new Error(result.message);

            const products = result.products;
            countEl.textContent = `พบ ${products.length} รายการ`;

            if (products.length === 0) {
                tbody.innerHTML = `<tr><td colspan="6" class="text-center text-muted py-4">ยังไม่มีสินค้า</td></tr>`;
                return;
            }

            tbody.innerHTML = products
                .map(
                    (p) => `
                <tr>
                    <td>${escapeHtml(p.title)}</td>
                    <td>${escapeHtml(p.seller || '-')}</td>
                    <td>${escapeHtml(p.category)}</td>
                    <td>฿${Number(p.price).toLocaleString()}</td>
                    <td>${statusBadge(p.status)}</td>
                    <td class="text-end text-muted small">-</td>
                </tr>
            `,
                )
                .join('');
        } catch (err) {
            console.error('loadProducts error:', err);
            tbody.innerHTML = `<tr><td colspan="6" class="text-center text-danger py-4">โหลดข้อมูลไม่สำเร็จ</td></tr>`;
        }
    }

    document.getElementById('productSearch')?.addEventListener('input', (e) => {
        filterTable('productsTableBody', e.target.value);
    });

    // ---------- Recycle requests ----------
    async function loadRecycleRequests() {
        const tbody = document.getElementById('recycleTableBody');
        const countEl = document.getElementById('recycleCount');
        tbody.innerHTML = `<tr><td colspan="6" class="text-center text-muted py-4">กำลังโหลด...</td></tr>`;

        try {
            const res = await fetch('api/admin_get_recycle_request.php');
            const result = await res.json();
            if (!result.success) throw new Error(result.message);

            const requests = result.requests;
            countEl.textContent = `พบ ${requests.length} รายการ`;

            if (requests.length === 0) {
                tbody.innerHTML = `<tr><td colspan="6" class="text-center text-muted py-4">ยังไม่มีคำขอรีไซเคิล</td></tr>`;
                return;
            }

            tbody.innerHTML = requests
                .map((r) => {
                    const typeLabel =
                        r.waste_type === 'ewaste' ? 'E-Waste' : 'พลาสติก';
                    const detail =
                        r.waste_type === 'ewaste'
                            ? `จำนวน ${r.quantity || 1} ชิ้น`
                            : `น้ำหนัก ${r.weight || 0} กก.`;

                    const actions =
                        r.status === 'pending'
                            ? `
                        <button class="action-btn text-success" title="อนุมัติ (ยืนยันแต้ม)" onclick="reviewRecycle(${r.id}, 'approve')">
                            <i class="bi bi-check-lg"></i>
                        </button>
                        <button class="action-btn danger" title="ปฏิเสธ" onclick="reviewRecycle(${r.id}, 'reject')">
                            <i class="bi bi-x-lg"></i>
                        </button>`
                            : `<span class="text-muted small">${escapeHtml(r.reviewed_by || '-')}</span>`;

                    return `
                    <tr>
                        <td>${escapeHtml(r.requester || '-')}</td>
                        <td>${typeLabel}</td>
                        <td class="small">${detail}${r.description ? '<br><span class="text-muted">' + escapeHtml(r.description) + '</span>' : ''}
                            <br><span class="badge bg-light text-success border mt-1">+${r.points_earned || 0} คะแนน</span></td>
                        <td>${formatDate(r.created_at)}</td>
                        <td>${recycleStatusBadge(r.status)}</td>
                        <td class="text-end">${actions}</td>
                    </tr>
                `;
                })
                .join('');
        } catch (err) {
            console.error('loadRecycleRequests error:', err);
            tbody.innerHTML = `<tr><td colspan="6" class="text-center text-danger py-4">โหลดข้อมูลไม่สำเร็จ</td></tr>`;
        }
    }

    document.getElementById('recycleSearch')?.addEventListener('input', (e) => {
        filterTable('recycleTableBody', e.target.value);
    });

    window.reviewRecycle = async function (id, action) {
        const confirmMsg =
            action === 'approve'
                ? 'ยืนยันอนุมัติคำขอนี้และเครดิตแต้มให้ผู้ใช้?'
                : 'ยืนยันปฏิเสธคำขอนี้?';
        if (!confirm(confirmMsg)) return;

        try {
            const res = await fetch('api/admin_get_recycle_status.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id, action }),
            });
            const result = await res.json();
            alert(result.message || (result.success ? 'สำเร็จ' : 'ไม่สำเร็จ'));
            if (result.success) {
                loadRecycleRequests();
                loadStats();
            }
        } catch (err) {
            console.error(err);
            alert('ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้');
        }
    };

    // ---------- Helpers ----------
    function escapeHtml(str) {
        const div = document.createElement('div');
        div.textContent = str ?? '';
        return div.innerHTML;
    }

    function formatDate(str) {
        if (!str) return '-';
        return new Date(str).toLocaleDateString('th-TH', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    }

    function statusBadge(status) {
        const map = {
            active: '<span class="badge bg-success-subtle text-success">กำลังขาย</span>',
            pending:
                '<span class="badge bg-warning-subtle text-warning">รอตรวจสอบ</span>',
            sold: '<span class="badge bg-secondary-subtle text-secondary">ขายแล้ว</span>',
            reported:
                '<span class="badge bg-danger-subtle text-danger">ถูกรายงาน</span>',
        };
        return (
            map[status] ||
            `<span class="badge bg-light text-dark border">${escapeHtml(status)}</span>`
        );
    }

    function recycleStatusBadge(status) {
        const map = {
            pending:
                '<span class="badge bg-warning-subtle text-warning">รอดำเนินการ</span>',
            approved:
                '<span class="badge bg-success-subtle text-success">อนุมัติแล้ว</span>',
            rejected:
                '<span class="badge bg-danger-subtle text-danger">ถูกปฏิเสธ</span>',
        };
        return (
            map[status] ||
            `<span class="badge bg-light text-dark border">${escapeHtml(status)}</span>`
        );
    }

    function filterTable(tbodyId, query) {
        const q = query.trim().toLowerCase();
        document.querySelectorAll(`#${tbodyId} tr`).forEach((row) => {
            row.style.display = row.textContent.toLowerCase().includes(q)
                ? ''
                : 'none';
        });
    }

    // ---------- Init ----------
    loadStats();
});
