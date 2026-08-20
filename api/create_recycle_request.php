<?php
// api/create_recycle_request.php
header('Content-Type: application/json; charset=UTF-8');
require_once '../db.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method ไม่ถูกต้อง']);
    exit;
}

$userId = filter_input(INPUT_POST, 'user_id', FILTER_VALIDATE_INT);
$wasteType = trim($_POST['wasteType'] ?? '');
$description = trim($_POST['description'] ?? '');
$pickupMethod = trim($_POST['pickupMethod'] ?? 'drop_off');
$pickupAddress = trim($_POST['pickupAddress'] ?? '');

if (!$userId || !in_array($wasteType, ['ewaste', 'plastic'], true)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'กรอกข้อมูลไม่ครบถ้วน']);
    exit;
}
if ($pickupMethod === 'pickup' && $pickupAddress === '') {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'กรุณากรอกที่อยู่สำหรับเข้ารับ']);
    exit;
}

$quantity = null;
$weight = null;
$images = [];
$points = 0;

if ($wasteType === 'ewaste') {
    $quantity = filter_input(INPUT_POST, 'ewasteQty', FILTER_VALIDATE_INT) ?: 1;
    $points = 50; // แต้มประมาณการ E-Waste (ยังไม่เครดิตจนกว่าแอดมินจะอนุมัติ)
} else {
    $weight = filter_input(INPUT_POST, 'plasticWeight', FILTER_VALIDATE_FLOAT) ?: 0;
    // 10-30 คะแนน ขึ้นกับน้ำหนัก
    $points = (int) max(10, min(30, round($weight * 10)));
}

try {
    $userStmt = $pdo->prepare('SELECT id FROM users WHERE id = ?');
    $userStmt->execute([$userId]);
    if (!$userStmt->fetch()) {
        http_response_code(401);
        echo json_encode(['success' => false, 'message' => 'ไม่พบผู้ใช้ กรุณาเข้าสู่ระบบใหม่']);
        exit;
    }

    $uploadDir = __DIR__ . '/../uploads/recycle';
    if (!empty($_FILES['images']['name'][0]) && !is_dir($uploadDir) && !mkdir($uploadDir, 0755, true)) {
        throw new RuntimeException('ไม่สามารถสร้างโฟลเดอร์เก็บรูปภาพได้');
    }

    if (!empty($_FILES['images']['name'][0])) {
        $image = $_FILES['images'];
        $allowedTypes = ['image/jpeg' => 'jpg', 'image/png' => 'png', 'image/webp' => 'webp'];
        foreach ($image['tmp_name'] as $index => $temporaryFile) {
            if ($index >= 5) {
                continue;
            }
            if ($image['error'][$index] !== UPLOAD_ERR_OK) {
                throw new RuntimeException('อัปโหลดรูปภาพไม่สำเร็จ');
            }
            if ($image['size'][$index] > 5 * 1024 * 1024) {
                throw new RuntimeException('รูปภาพต้องมีขนาดไม่เกิน 5MB ต่อรูป');
            }
            $imageType = mime_content_type($temporaryFile);
            if (!isset($allowedTypes[$imageType])) {
                throw new RuntimeException('รองรับเฉพาะ JPG, PNG และ WebP');
            }
            $fileName = bin2hex(random_bytes(16)) . '.' . $allowedTypes[$imageType];
            if (!move_uploaded_file($temporaryFile, $uploadDir . '/' . $fileName)) {
                throw new RuntimeException('ไม่สามารถบันทึกรูปภาพได้');
            }
            $images[] = 'uploads/recycle/' . $fileName;
        }
    }

    $stmt = $pdo->prepare('
        INSERT INTO recycle_requests
            (user_id, waste_type, quantity, weight, images, description,
             pickup_method, pickup_address, points_earned, status, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, \'pending\', NOW())
    ');
    $stmt->execute([
        $userId, $wasteType, $quantity, $weight, json_encode($images, JSON_UNESCAPED_UNICODE),
        $description, $pickupMethod, $pickupAddress ?: null, $points
    ]);

    echo json_encode([
        'success' => true,
        'message' => 'ส่งคำขอรีไซเคิลสำเร็จ รอแอดมินตรวจสอบและอนุมัติแต้ม',
        'request_id' => $pdo->lastInsertId(),
        'estimated_points' => $points
    ]);
} catch (Throwable $e) {
    http_response_code(500);
    error_log($e->getMessage());
    echo json_encode(['success' => false, 'message' => 'ไม่สามารถบันทึกคำขอได้: ' . $e->getMessage()]);
}