<?php
header('Content-Type: application/json; charset=UTF-8');
require_once '../db.php';

try {
    $stmt = $pdo->query('SELECT id, title, price, `condition`, green_score, category, image FROM `Products` ORDER BY id DESC');
    $products = $stmt->fetchAll();

    $categoryMap = [
        'mobile-phones' => 'mobile',
        'notebooks' => 'notebook',
        'tablets' => 'tablet',
        'cameras' => 'camera',
        'it-accessories' => 'accessory',
    ];
    $conditionMap = [
        'new' => 'ใหม่',
        'like_new' => 'เหมือนใหม่',
        'good' => 'สภาพดี',
        'fair' => 'พอใช้',
        'for_parts' => 'ซาก/อะไหล่',
    ];

    foreach ($products as &$product) {
        $product['price'] = (float) $product['price'];
        $product['category'] = $categoryMap[$product['category']] ?? $product['category'];
        $product['condition'] = $conditionMap[$product['condition']] ?? $product['condition'];
        $product['image'] = $product['image'] ?: 'https://placehold.co/300x200?text=GreenLoop';
    }
    unset($product);

    echo json_encode(['success' => true, 'products' => $products], JSON_UNESCAPED_UNICODE);
} catch (PDOException $e) {
    http_response_code(500);
    error_log($e->getMessage());
    echo json_encode(['success' => false, 'message' => 'ไม่สามารถโหลดสินค้าจาก Database ได้']);
}
?>
