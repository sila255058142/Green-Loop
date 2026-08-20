// js/wallet.js
// ใช้ localStorage key "user" ที่ถูกเซ็ตตอน login สำเร็จ (ดูตัวอย่างใน Index.js)
// รูปแบบที่คาดหวัง: { id, username, email, walletBalance }

const API_BASE = 'api';

function getCurrentUser() {
    try {
        return JSON.parse(localStorage.getItem('user'));
    } catch (e) {
        return null;
    }
}

function showToast(message, isError = false) {
    const toastEl = document.getElementById('glToast');
    const body = document.getElementById('glToastBody');
    body.textContent = message;
    toastEl.classList.remove('bg-success', 'bg-danger');
    toastEl.classList.add(isError ? 'bg-danger' : 'bg-success');
    new bootstrap.Toast(toastEl, { delay: 3500 }).show();
}

function formatMoney(n) {
    return (
        '฿' +
        Number(n).toLocaleString('th-TH', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        })
    );
}

function formatDate(str) {
    const d = new Date(str.replace(' ', 'T'));
    return d.toLocaleString('th-TH', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
}

function statusLabel(status) {
    const map = {
        pending: 'รอตรวจสอบ',
        approved: 'อนุมัติแล้ว',
        completed: 'สำเร็จ',
        rejected: 'ถูกปฏิเสธ',
    };
    return map[status] || status;
}

function txMeta(type, status) {
    if (type === 'topup') {
        return {
            icon: 'bi-arrow-down-circle-fill',
            color: '#1e8e5a',
            sign: '+',
            amountClass: 'tx-amount-in',
            label: 'เติมเงิน',
        };
    }
    if (type === 'refund') {
        return {
            icon: 'bi-arrow-counterclockwise',
            color: '#0d7bb5',
            sign: '+',
            amountClass: 'tx-amount-in',
            label: 'คืนเงิน',
        };
    }
    return {
        icon: 'bi-cart-check-fill',
        color: '#e03131',
        sign: '-',
        amountClass: 'tx-amount-out',
        label: 'ชำระเงินซื้อสินค้า',
    };
}

async function loadWallet() {
    const user = getCurrentUser();
    if (!user || !user.id) {
        document.getElementById('historyList').innerHTML =
            '<div class="empty-state"><i class="bi bi-person-x fs-1"></i><div class="small mt-2">กรุณาเข้าสู่ระบบก่อนใช้งาน Wallet</div></div>';
        return;
    }

    document.getElementById('userNameLabel').textContent =
        user.username || user.email || '';

    try {
        const res = await fetch(
            `${API_BASE}/wallet/history.php?user_id=${user.id}`,
        );
        const data = await res.json();

        if (!data.success) {
            showToast(data.message || 'โหลดข้อมูลไม่สำเร็จ', true);
            return;
        }

        document.getElementById('balanceValue').textContent = formatMoney(
            data.balance,
        );

        // sync ค่าล่าสุดกลับเข้า localStorage เผื่อหน้าอื่นอ่านต่อ
        user.walletBalance = data.balance;
        localStorage.setItem('user', JSON.stringify(user));

        renderHistory(data.transactions);
    } catch (e) {
        showToast('เชื่อมต่อเซิร์ฟเวอร์ไม่สำเร็จ', true);
    }
}

function renderHistory(transactions) {
    const container = document.getElementById('historyList');

    if (!transactions || transactions.length === 0) {
        container.innerHTML =
            '<div class="empty-state"><i class="bi bi-inbox fs-1"></i><div class="small mt-2">ยังไม่มีรายการ</div></div>';
        return;
    }

    container.innerHTML = transactions
        .map((tx) => {
            const meta = txMeta(tx.type, tx.status);
            return `
        <div class="tx-item">
            <div class="tx-icon" style="background:${meta.color}"><i class="bi ${meta.icon}"></i></div>
            <div class="flex-grow-1">
                <div class="d-flex justify-content-between">
                    <span class="fw-semibold small">${meta.label}</span>
                    <span class="${meta.amountClass}">${meta.sign}${formatMoney(tx.amount)}</span>
                </div>
                <div class="d-flex justify-content-between align-items-center mt-1">
                    <span class="text-muted small">${formatDate(tx.created_at)}</span>
                    <span class="status-badge status-${tx.status}">${statusLabel(tx.status)}</span>
                </div>
                ${tx.note ? `<div class="text-muted small mt-1"><i class="bi bi-chat-left-text"></i> ${tx.note}</div>` : ''}
            </div>
        </div>`;
        })
        .join('');
}

function copyAccNo() {
    navigator.clipboard
        .writeText('1234567890')
        .then(() => showToast('คัดลอกเลขบัญชีแล้ว'));
}

document.addEventListener('DOMContentLoaded', () => {
    loadWallet();

    // quick amount buttons
    document.querySelectorAll('.quick-amt').forEach((btn) => {
        btn.addEventListener('click', () => {
            document
                .querySelectorAll('.quick-amt')
                .forEach((b) => b.classList.remove('active'));
            btn.classList.add('active');
            document.getElementById('amountInput').value = btn.dataset.amt;
        });
    });

    // slip preview
    document.getElementById('slipInput').addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (ev) => {
            document.getElementById('slipPlaceholder').classList.add('d-none');
            const img = document.getElementById('slipPreview');
            img.src = ev.target.result;
            img.classList.remove('d-none');
        };
        reader.readAsDataURL(file);
    });

    // submit top-up
    document
        .getElementById('topupForm')
        .addEventListener('submit', async (e) => {
            e.preventDefault();
            const user = getCurrentUser();
            if (!user || !user.id) {
                showToast('กรุณาเข้าสู่ระบบก่อนทำรายการ', true);
                return;
            }

            const amount = document.getElementById('amountInput').value;
            const slipFile = document.getElementById('slipInput').files[0];

            if (!amount || Number(amount) < 20) {
                showToast('กรุณาระบุจำนวนเงินขั้นต่ำ 20 บาท', true);
                return;
            }
            if (!slipFile) {
                showToast('กรุณาแนบรูปสลิปการโอนเงิน', true);
                return;
            }

            const submitBtn = document.getElementById('submitTopupBtn');
            submitBtn.disabled = true;
            submitBtn.innerHTML =
                '<span class="spinner-border spinner-border-sm"></span> กำลังส่งคำขอ...';

            const formData = new FormData();
            formData.append('user_id', user.id);
            formData.append('amount', amount);
            formData.append('slip', slipFile);

            try {
                const res = await fetch(
                    `${API_BASE}/wallet/topup_request.php`,
                    { method: 'POST', body: formData },
                );
                const data = await res.json();

                if (data.success) {
                    showToast(data.message);
                    document.getElementById('topupForm').reset();
                    document
                        .getElementById('slipPlaceholder')
                        .classList.remove('d-none');
                    document
                        .getElementById('slipPreview')
                        .classList.add('d-none');
                    document
                        .querySelectorAll('.quick-amt')
                        .forEach((b) => b.classList.remove('active'));
                    loadWallet();
                } else {
                    showToast(data.message || 'ส่งคำขอไม่สำเร็จ', true);
                }
            } catch (err) {
                console.error('Top-up error:', err);
                showToast(err.message || 'เชื่อมต่อเซิร์ฟเวอร์ไม่สำเร็จ', true);
            } finally {
                submitBtn.disabled = false;
                submitBtn.innerHTML =
                    '<i class="bi bi-send-check"></i> ส่งคำขอเติมเงิน';
            }
        });
});

// ---------------------------------------------------------------
// ฟังก์ชันสำหรับหน้าอื่น (เช่น Marketplace) เรียกใช้ตอนกดซื้อสินค้า
// ตัวอย่าง: await payWithWallet(productId)
// ---------------------------------------------------------------
async function payWithWallet(productId) {
    const user = getCurrentUser();
    if (!user || !user.id) {
        showToast && showToast('กรุณาเข้าสู่ระบบก่อนทำรายการ', true);
        return { success: false, message: 'ไม่ได้เข้าสู่ระบบ' };
    }

    const res = await fetch(`${API_BASE}/wallet/checkout.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: user.id, product_id: productId }),
    });
    const data = await res.json();

    if (data.success) {
        user.walletBalance = data.new_balance;
        localStorage.setItem('user', JSON.stringify(user));
    }
    return data;
}
