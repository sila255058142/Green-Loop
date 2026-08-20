<?php
// api/admin_login.php — ล็อกอินแอดมิน โดยเช็คคอลัมน์ role ในตาราง users
session_start();
header('Content-Type: application/json; charset=UTF-8');
require_once '../db.php';

$data = json_decode(file_get_contents('php://input'), true) ?: [];
$email = trim($data['email'] ?? '');
$password = $data['password'] ?? '';

if ($email === '' || $password === '') {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'กรุณากรอกอีเมลและรหัสผ่าน']);
    exit;
}

try {
    $stmt = $pdo->prepare('SELECT id, username, email, password, role FROM users WHERE email = ? LIMIT 1');
    $stmt->execute([$email]);
    $user = $stmt->fetch();

    if (!$user || !password_verify($password, $user['password'])) {
        http_response_code(401);
        echo json_encode(['success' => false, 'message' => 'อีเมลหรือรหัสผ่านไม่ถูกต้อง']);
        exit;
    }

    // เช็คสิทธิ์: ต้องเป็น role = admin เท่านั้น
    if ($user['role'] !== 'admin') {
        http_response_code(403);
        echo json_encode(['success' => false, 'message' => 'บัญชีนี้ไม่มีสิทธิ์เข้าถึงระบบผู้ดูแล']);
        exit;
    }

    // ตั้งค่า session ตามที่ auth.php ใช้เช็ค
    $_SESSION['admin_logged_in'] = true;
    $_SESSION['admin_id'] = $user['id'];
    $_SESSION['admin_name'] = $user['username'];

    echo json_encode([
        'success' => true,
        'admin' => [
            'id' => $user['id'],
            'username' => $user['username'],
            'email' => $user['email'],
        ]
    ]);
} catch (PDOException $e) {
    http_response_code(500);
    error_log($e->getMessage());
    echo json_encode(['success' => false, 'message' => 'เกิดข้อผิดพลาดในการเข้าสู่ระบบ']);
}