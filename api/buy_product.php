<?php
// api/buy_product.php
header('Content-Type: application/json; charset=utf-8');
require_once '../db.php';

// รับค่า JSON จากการกดซื้อสินค้าที่หน้าบ้าน
$input = json_decode(file_get_contents('php://input'), true);

if (!$input || !isset($input['product_id'])) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'ระบุข้อมูลสินค้าไม่ถูกต้อง']);
    exit;
}

$productId = (int)$input['product_id'];
// กำหนด user_id ชั่วคราวกรณีที่ยังไม่มีระบบ Login (เช่น Guest user ID = 1)
$userId = isset($input['user_id']) ? (int)$input['user_id'] : 1; 

try {
    // 1. ดึงข้อมูลราคาสินค้าจากตาราง products
    $stmt = $pdo->prepare("SELECT price FROM products WHERE id = ?");
    $stmt->execute([$productId]);
    $product = $stmt->fetch();

    if (!$product) {
        http_response_code(404);
        echo json_encode(['success' => false, 'message' => 'ไม่พบข้อมูลสินค้านี้ในระบบ']);
        exit;
    }

    // 2. บันทึกข้อมูลลงตาราง orders (ครอบคลุม user_id, product_id, total_price, status)
    $orderStmt = $pdo->prepare("
        INSERT INTO orders (user_id, product_id, total_price, status, created_at) 
        VALUES (?, ?, ?, 'completed', NOW())
    ");
    $orderStmt->execute([$userId, $productId, $product['price']]);

    echo json_encode([
        'success'  => true,
        'message'  => 'ทำรายการสั่งซื้อเรียบร้อยแล้ว!',
        'order_id' => $pdo->lastInsertId()
    ]);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false, 
        'message' => 'เกิดข้อผิดพลาดในการบันทึกคำสั่งซื้อ: ' . $e->getMessage()
    ]);
}
?>