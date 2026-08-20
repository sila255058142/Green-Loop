<?php
header('Content-Type: application/json; charset=utf-8');
require_once '../../db.php';

$userId = filter_input(INPUT_GET, 'user_id', FILTER_VALIDATE_INT);
if (!$userId) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'ไม่พบผู้ใช้']);
    exit;
}

try {
    $stmt = $pdo->prepare('SELECT id, username, wallet_balance FROM users WHERE id = ?');
    $stmt->execute([$userId]);
    $user = $stmt->fetch();
    if (!$user) {
        http_response_code(404);
        echo json_encode(['success' => false, 'message' => 'ไม่พบผู้ใช้งานนี้']);
        exit;
    }

    echo json_encode([
        'success' => true,
        'username' => $user['username'],
        'balance' => (float) $user['wallet_balance'],
    ], JSON_UNESCAPED_UNICODE);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'ดึงยอดเงินไม่สำเร็จ']);
}
?>