<?php
// api/buy_product.php
header('Content-Type: application/json; charset=utf-8');
session_start();
require_once '../db.php';

$input = json_decode(file_get_contents('php://input'), true);

if (!$input || !isset($input['product_id'])) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'ระบุข้อมูลสินค้าไม่ถูกต้อง']);
    exit;
}

$productId = (int)$input['product_id'];

// ดึง User ID จาก Session (ถ้าไม่มีล็อกอิน ให้ใช้ค่า Default เช่น 1)
$userId = $_SESSION['user_id'] ?? (isset($input['user_id']) ? (int)$input['user_id'] : 1);

try {
    // เริ่ม Transaction
    $pdo->beginTransaction();

    // 1. ดึงข้อมูลราคาสินค้า
    $stmt = $pdo->prepare("SELECT price FROM `Products` WHERE id = ?");
    $stmt->execute([$productId]);
    $product = $stmt->fetch();

    if (!$product) {
        $pdo->rollBack();
        http_response_code(404);
        echo json_encode(['success' => false, 'message' => 'ไม่พบข้อมูลสินค้านี้ในระบบ']);
        exit;
    }

    // 2. บันทึกข้อมูลลงตาราง orders
    $orderStmt = $pdo->prepare("
        INSERT INTO orders (user_id, product_id, total_price, status, created_at) 
        VALUES (?, ?, ?, 'completed', NOW())
    ");
    $orderStmt->execute([$userId, $productId, $product['price']]);

    $orderId = $pdo->lastInsertId();

    // ยืนยันการทำงานลง Database
    $pdo->commit();

    echo json_encode([
        'success'  => true,
        'message'  => 'ทำรายการสั่งซื้อเรียบร้อยแล้ว!',
        'order_id' => $orderId
    ]);

} catch (PDOException $e) {
    if ($pdo->inTransaction()) {
        $pdo->rollBack();
    }
    http_response_code(500);
    echo json_encode([
        'success' => false, 
        'message' => 'เกิดข้อผิดพลาดในการบันทึกคำสั่งซื้อ: ' . $e->getMessage()
    ]);
}
?>