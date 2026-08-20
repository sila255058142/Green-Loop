    -- ============================================================
    -- GreenLoop : Wallet Top-up & Payment schema
    -- รันไฟล์นี้ 1 ครั้งกับฐานข้อมูล green_loop เพื่อเพิ่มระบบเติมเงิน
    -- ============================================================

    -- ต้องมีคอลัมน์นี้อยู่แล้วในตาราง users (จาก login.php ที่มีอยู่)
    -- ถ้ายังไม่มีให้รันบรรทัดนี้ (ข้ามได้ถ้ามีอยู่แล้ว)
    ALTER TABLE users
    ADD COLUMN IF NOT EXISTS wallet_balance DECIMAL(10,2) NOT NULL DEFAULT 0;

    -- ตารางเก็บทุกรายการ เติมเงิน / จ่ายเงิน / คืนเงิน
    CREATE TABLE IF NOT EXISTS wallet_transactions (
    id              INT AUTO_INCREMENT PRIMARY KEY,
    user_id         INT NOT NULL,
    type            ENUM('topup', 'payment', 'refund') NOT NULL,
    amount          DECIMAL(10,2) NOT NULL,           -- ยอดเงินของรายการนี้ (บวกเสมอ)
    balance_after   DECIMAL(10,2) DEFAULT NULL,        -- ยอดคงเหลือหลังทำรายการ (เติมตอนอนุมัติ/จ่ายสำเร็จ)
    status          ENUM('pending', 'approved', 'rejected', 'completed') NOT NULL DEFAULT 'pending',
    slip_image      VARCHAR(255) DEFAULT NULL,         -- path รูปสลิป (เฉพาะ topup)
    reference_order_id INT DEFAULT NULL,               -- ผูกกับ orders.id (เฉพาะ payment)
    note            VARCHAR(255) DEFAULT NULL,
    reviewed_by     VARCHAR(100) DEFAULT NULL,         -- แอดมินที่อนุมัติ/ปฏิเสธ
    reviewed_at     DATETIME DEFAULT NULL,
    created_at      DATETIME DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_user (user_id),
    INDEX idx_status (status),
    CONSTRAINT fk_wallet_user FOREIGN KEY (user_id) REFERENCES users(id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;