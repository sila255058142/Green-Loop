<?php
header('Content-Type: application/json; charset=utf-8');
require_once '../../db.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method ไม่ถูกต้อง']);
    exit;
}

$userId = filter_input(INPUT_POST, 'user_id', FILTER_VALIDATE_INT);
$amount = filter_input(INPUT_POST, 'amount', FILTER_VALIDATE_FLOAT);

if (!$userId || $amount === false || $amount < 20 || empty($_FILES['slip'])) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'กรุณากรอกยอดเงินและแนบสลิปให้ครบถ้วน']);
    exit;
}

try {
    $userStmt = $pdo->prepare('SELECT id FROM users WHERE id = ?');
    $userStmt->execute([$userId]);
    if (!$userStmt->fetch()) {
        http_response_code(404);
        echo json_encode(['success' => false, 'message' => 'ไม่พบผู้ใช้งานนี้']);
        exit;
    }

    $slip = $_FILES['slip'];
    if ($slip['error'] !== UPLOAD_ERR_OK || $slip['size'] > 5 * 1024 * 1024) {
        throw new RuntimeException('ไฟล์สลิปไม่ถูกต้องหรือมีขนาดเกิน 5MB');
    }

    $mime = mime_content_type($slip['tmp_name']);
    $extensions = ['image/jpeg' => 'jpg', 'image/png' => 'png', 'image/webp' => 'webp'];
    if (!isset($extensions[$mime])) {
        throw new RuntimeException('รองรับเฉพาะไฟล์ JPG, PNG และ WebP');
    }

    $directory = __DIR__ . '/../../uploads/wallet_slips';
    if (!is_dir($directory) && !mkdir($directory, 0755, true)) {
        throw new RuntimeException('ไม่สามารถสร้างโฟลเดอร์สลิปได้');
    }

    $fileName = bin2hex(random_bytes(16)) . '.' . $extensions[$mime];
    if (!move_uploaded_file($slip['tmp_name'], $directory . '/' . $fileName)) {
        throw new RuntimeException('ไม่สามารถบันทึกสลิปได้');
    }

    $slipPath = 'uploads/wallet_slips/' . $fileName;
    $stmt = $pdo->prepare("INSERT INTO wallet_transactions (user_id, type, amount, balance_after, status, slip_image, created_at) VALUES (?, 'topup', ?, NULL, 'pending', ?, NOW())");
    $stmt->execute([$userId, $amount, $slipPath]);

    echo json_encode(['success' => true, 'message' => 'ส่งคำขอเติมเงินแล้ว รอแอดมินตรวจสอบ']);
} catch (Throwable $e) {
    http_response_code(500);
    error_log($e->getMessage());
    echo json_encode(['success' => false, 'message' => 'บันทึกคำขอเติมเงินไม่สำเร็จ: ' . $e->getMessage()]);
}
?>