<?php
// api/admin_check.php — ให้ js ฝั่งแอดมินเช็คว่ายัง login อยู่ไหม (สำหรับเรียกจาก fetch)
session_start();
header('Content-Type: application/json; charset=UTF-8');

if (!isset($_SESSION['admin_logged_in']) || $_SESSION['admin_logged_in'] !== true) {
    http_response_code(401);
    echo json_encode(['success' => false]);
    exit;
}

echo json_encode(['success' => true, 'admin_name' => $_SESSION['admin_name'] ?? 'Admin']);