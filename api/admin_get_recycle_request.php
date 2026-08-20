<?php
// api/admin_get_recycle_request.php
session_start();
header('Content-Type: application/json; charset=UTF-8');
require_once '../db.php';

if (!isset($_SESSION['admin_logged_in']) || $_SESSION['admin_logged_in'] !== true) {
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => 'ไม่มีสิทธิ์เข้าถึง']);
    exit;
}

try {
    $stmt = $pdo->query("
         SELECT r.id, r.user_id, r.waste_type, r.category, r.quantity, r.weight,
             r.description, r.images, r.pickup_method, r.pickup_address,
             r.points_earned, r.status, r.created_at, r.updated_at,
             u.username AS requester
        FROM recycle_requests r
        LEFT JOIN users u ON u.id = r.user_id
        ORDER BY r.id DESC
    ");
    $requests = $stmt->fetchAll();

    echo json_encode(['success' => true, 'requests' => $requests]);
} catch (Throwable $e) {
    http_response_code(500);
    error_log($e->getMessage());
    echo json_encode(['success' => false, 'message' => 'โหลดคำขอรีไซเคิลไม่สำเร็จ']);
}