<?php
$host     = 'localhost';
$dbname   = 'green_loop';
$username = 'root';
$password = '';   

try {
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8mb4", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $pdo->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);

    $pdo->exec("CREATE TABLE IF NOT EXISTS wallet_transactions (
        id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        user_id INT UNSIGNED NOT NULL,
        type VARCHAR(30) NOT NULL,
        amount DECIMAL(12,2) NOT NULL,
        balance_after DECIMAL(12,2) NULL,
        status VARCHAR(30) NOT NULL DEFAULT 'pending',
        slip_image VARCHAR(500) NULL,
        reference_order_id INT UNSIGNED NULL,
        note VARCHAR(500) NULL,
        reviewed_by VARCHAR(100) NULL,
        reviewed_at DATETIME NULL,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_wallet_user (user_id),
        INDEX idx_wallet_status (type, status)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");

} catch (PDOException $e) {
    // ปรับ error ให้ส่งออกเป็น JSON แทนการ echo HTML
    header("Content-Type: application/json; charset=UTF-8");
    die(json_encode(["success" => false, "message" => "Connect Error: " . $e->getMessage()]));
}
?>