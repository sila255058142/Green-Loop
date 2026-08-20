<?php
// api/admin_stats.php — ตัวเลขสรุปหน้าภาพรวม
session_start();
header('Content-Type: application/json; charset=UTF-8');
require_once '../db.php';

if (!isset($_SESSION['admin_logged_in']) || $_SESSION['admin_logged_in'] !== true) {
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => 'ไม่มีสิทธิ์เข้าถึง']);
    exit;
}

try {
    $members = (int) $pdo->query("SELECT COUNT(*) FROM users WHERE role = 'user'")->fetchColumn();
    $products = (int) $pdo->query("SELECT COUNT(*) FROM `Products`")->fetchColumn();
    $recyclePending = (int) $pdo->query("SELECT COUNT(*) FROM recycle_requests WHERE status = 'pending'")->fetchColumn();

    $categoryRows = $pdo->query("SELECT category, COUNT(*) AS cnt FROM `Products` GROUP BY category")->fetchAll();

    $signupRows = $pdo->query("
        SELECT DATE(created_at) AS d, COUNT(*) AS cnt
        FROM users
        WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 6 DAY)
        GROUP BY DATE(created_at)
    ")->fetchAll();

    echo json_encode([
        'success' => true,
        'stats' => [
            'members' => $members,
            'products' => $products,
            'recyclePending' => $recyclePending,
        ],
        'categoryBreakdown' => $categoryRows,
        'signupTrend' => $signupRows,
    ]);
} catch (Throwable $e) {
    http_response_code(500);
    error_log($e->getMessage());
    echo json_encode(['success' => false, 'message' => 'โหลดข้อมูลสรุปไม่สำเร็จ']);
}