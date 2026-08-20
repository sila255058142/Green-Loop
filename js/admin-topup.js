// js/admin-topup.js
// จัดการหน้า "คำขอเติมเงิน" ในฝั่ง Admin Dashboard
// ต้องมี element ต่อไปนี้อยู่ใน admin-dashboard.html:
//   <section class="admin-section" id="section-topup">...</section>  (ดู admin_dashboard_snippet.html)
//   <span id="topupNavBadge"></span>

const ADMIN_API_BASE = 'api/admin';
const ADMIN_NAME = 'Admin'; // เปลี่ยนเป็นชื่อแอดมินที่ล็อกอินจริงถ้ามีระบบ auth ฝั่งแอดมิน

let currentTopupFilter = 'pending';

function adminStatusLabel(status) {
    const map = { pending: 'รอตรวจสอบ', approved: 'อนุมัติแล้ว', rejected: 'ถูกปฏิเสธ' };
    return map[status] || status;
}

function adminFormatMoney(n) {
    return '฿' + Number(n).toLocaleString('th-TH', { minimumFractionDigits: 2 });
}

function adminFormatDate(str) {
    const d = new Date(str.replace(' ', 'T'));
    return d.toLocaleString('th-TH', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

async function loadTopupRequests(status = currentTopupFilter) {
    currentTopupFilter = status;
    const listEl = document.getElementById('topupList');
    if (!listEl) return;

    listEl.innerHTML = '<div class="text-center text-muted py-4"><span class="spinner-border spinner-border-sm"></span> กำลังโหลด...</div>';

    try {
        const res = await fetch(`${ADMIN_API_BASE}/topup_requests.php?status=${status}`);
        const data = await res.json();

        if (!data.success) {
            listEl.innerHTML = `<div class="text-center text-danger py-4">${data.message}</div>`;
            return;
        }

        const badge = document.getElementById('topupNavBadge');
        if (badge) badge.textContent = data.pending_count;

        const countEl = document.getElementById('topupCount');
        if (countEl) countEl.textContent = `พบ ${data.requests.length} รายการ`;

        if (data.requests.length === 0) {
            listEl.innerHTML = '<div class="text-center text-muted py-4"><i class="bi bi-inbox fs-2"></i><div class="small mt-2">ไม่มีรายการ</div></div>';
            return;
        }

        listEl.innerHTML = `
        <div class="table-responsive">
        <table class="table align-middle">
            <thead><tr>
                <th>ผู้ใช้</th><th>จำนวนเงิน</th><th>สลิป</th><th>วันที่แจ้ง</th><th>สถานะ</th><th class="text-end">จัดการ</th>
            </tr></thead>
            <tbody>
                ${data.requests.map((r) => `
                <tr>
                    <td>
                        <div class="fw-semibold">${r.username}</div>
                        <div class="text-muted small">${r.email}</div>
                    </td>
                    <td class="fw-bold text-success">${adminFormatMoney(r.amount)}</td>
                    <td>
                        ${r.slip_image
                            ? `<a href="${r.slip_image}" target="_blank" class="btn btn-sm btn-outline-secondary"><i class="bi bi-image"></i> ดูสลิป</a>`
                            : '<span class="text-muted small">-</span>'}
                    </td>
                    <td class="small">${adminFormatDate(r.created_at)}</td>
                    <td><span class="badge ${r.status === 'pending' ? 'bg-warning text-dark' : r.status === 'approved' ? 'bg-success' : 'bg-danger'}">${adminStatusLabel(r.status)}</span></td>
                    <td class="text-end">
                        ${r.status === 'pending' ? `
                        <button class="action-btn me-1" title="อนุมัติ" onclick="reviewTopup(${r.id}, 'approve')"><i class="bi bi-check-lg text-success"></i></button>
                        <button class="action-btn danger" title="ปฏิเสธ" onclick="reviewTopup(${r.id}, 'reject')"><i class="bi bi-x-lg"></i></button>
                        ` : `<span class="text-muted small">${r.reviewed_by || ''}</span>`}
                    </td>
                </tr>`).join('')}
            </tbody>
        </table>
        </div>`;
    } catch (e) {
        listEl.innerHTML = '<div class="text-center text-danger py-4">เชื่อมต่อเซิร์ฟเวอร์ไม่สำเร็จ</div>';
    }
}

async function reviewTopup(id, action) {
    let note = null;
    if (action === 'reject') {
        note = prompt('ระบุเหตุผลที่ปฏิเสธ (ไม่บังคับ):', 'สลิปไม่ชัดเจน / ยอดเงินไม่ตรง');
        if (note === null) return; // ผู้ใช้กดยกเลิก
    } else {
        if (!confirm('ยืนยันอนุมัติคำขอเติมเงินนี้? ระบบจะเพิ่มยอดเงินเข้า Wallet ผู้ใช้ทันที')) return;
    }

    try {
        const res = await fetch(`${ADMIN_API_BASE}/topup_action.php`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id, action, note, admin_name: ADMIN_NAME }),
        });
        const data = await res.json();
        alert(data.message);
        loadTopupRequests(currentTopupFilter);
    } catch (e) {
        alert('ดำเนินการไม่สำเร็จ กรุณาลองใหม่');
    }
}

// โหลดครั้งแรกเมื่อสลับมาที่แท็บ "คำขอเติมเงิน"
document.addEventListener('DOMContentLoaded', () => {
    const navLink = document.querySelector('[data-section="topup"]');
    if (navLink) {
        navLink.addEventListener('click', () => loadTopupRequests('pending'));
    }
    // โหลด badge จำนวนรอตรวจสอบตอนเปิดหน้า admin ครั้งแรก
    fetch(`${ADMIN_API_BASE}/topup_requests.php?status=pending`)
        .then((r) => r.json())
        .then((data) => {
            const badge = document.getElementById('topupNavBadge');
            if (badge && data.success) badge.textContent = data.pending_count;
        })
        .catch(() => {});

    const filterButtons = document.querySelectorAll('[data-topup-filter]');
    filterButtons.forEach((btn) => {
        btn.addEventListener('click', () => {
            filterButtons.forEach((b) => b.classList.remove('btn-success'));
            filterButtons.forEach((b) => b.classList.add('btn-outline-success'));
            btn.classList.remove('btn-outline-success');
            btn.classList.add('btn-success');
            loadTopupRequests(btn.dataset.topupFilter);
        });
    });
});