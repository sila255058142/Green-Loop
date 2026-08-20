<?php
header('Content-Type: application/json; charset=UTF-8');
require_once '../db.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method ไม่ถูกต้อง']);
    exit;
}

$userId = filter_input(INPUT_POST, 'user_id', FILTER_VALIDATE_INT);
$title = trim($_POST['title'] ?? '');
$category = trim($_POST['category'] ?? '');
$price = filter_input(INPUT_POST, 'price', FILTER_VALIDATE_FLOAT);
$condition = trim($_POST['condition'] ?? '');
$conditionNote = trim($_POST['conditionNote'] ?? '');
$description = trim($_POST['description'] ?? '');

if (!$userId || $title === '' || $category === '' || $price === false || $price < 0 || $description === '') {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'กรอกข้อมูลสินค้าไม่ครบถ้วน']);
    exit;
}

try {
    $userStmt = $pdo->prepare('SELECT id FROM users WHERE id = ?');
    $userStmt->execute([$userId]);
    if (!$userStmt->fetch()) {
        http_response_code(401);
        echo json_encode(['success' => false, 'message' => 'ไม่พบผู้ขาย กรุณาเข้าสู่ระบบใหม่']);
        exit;
    }

    $imagePath = null;
    if (!empty($_FILES['images']['name'][0])) {
        $image = $_FILES['images'];
        if ($image['error'][0] !== UPLOAD_ERR_OK || $image['size'][0] > 5 * 1024 * 1024) {
            throw new RuntimeException('รูปภาพไม่ถูกต้องหรือมีขนาดเกิน 5MB');
        }

        $allowedTypes = ['image/jpeg' => 'jpg', 'image/png' => 'png', 'image/webp' => 'webp'];
        $imageType = mime_content_type($image['tmp_name'][0]);
        if (!isset($allowedTypes[$imageType])) {
            throw new RuntimeException('รองรับเฉพาะ JPG, PNG และ WebP');
        }

        $uploadDir = __DIR__ . '/../uploads/products';
        if (!is_dir($uploadDir) && !mkdir($uploadDir, 0755, true)) {
            throw new RuntimeException('ไม่สามารถสร้างโฟลเดอร์อัปโหลดได้');
        }

        $fileName = bin2hex(random_bytes(16)) . '.' . $allowedTypes[$imageType];
        if (!move_uploaded_file($image['tmp_name'][0], $uploadDir . '/' . $fileName)) {
            throw new RuntimeException('ไม่สามารถบันทึกรูปภาพได้');
        }
        $imagePath = 'uploads/products/' . $fileName;
    }

    $scoreMap = ['new' => 95, 'like_new' => 85, 'good' => 70, 'fair' => 50, 'for_parts' => 25];
    $greenScore = $scoreMap[$condition] ?? 0;
    $stmt = $pdo->prepare('INSERT INTO `Products` (title, category, price, `condition`, condition_note, description, image, green_score) VALUES (?, ?, ?, ?, ?, ?, ?, ?)');
    $stmt->execute([$title, $category, $price, $condition, $conditionNote, $description, $imagePath, $greenScore]);

    echo json_encode(['success' => true, 'message' => 'ลงขายสินค้าสำเร็จ', 'product_id' => $pdo->lastInsertId()]);
} catch (Throwable $e) {
    http_response_code(500);
    error_log($e->getMessage());
    echo json_encode(['success' => false, 'message' => 'ไม่สามารถบันทึกสินค้าได้: ' . $e->getMessage()]);
}
?>
