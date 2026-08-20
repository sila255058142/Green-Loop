<?php
header("Content-Type: application/json; charset=UTF-8");
session_start();
require_once "../db.php";

if ($_SERVER["REQUEST_METHOD"] !== "POST") {
    echo json_encode(["success" => false, "message" => "Method ไม่ถูกต้อง"]);
    exit();
}

$userId = $_POST['user_id'] ?? ($_SESSION['user_id'] ?? null);

if (!$userId) {
    echo json_encode(["success" => false, "message" => "กรุณาเข้าสู่ระบบก่อนทำรายการ"]);
    exit();
}

$wasteType    = $_POST['wasteType'] ?? 'ewaste';
$description  = $_POST['description'] ?? '';
$pickupMethod = $_POST['pickupMethod'] ?? 'drop_off';
$pickupAddress = ($pickupMethod === 'pickup') ? ($_POST['pickupAddress'] ?? '') : null;

// แยกค่าตามประเภทขยะ
$category = null;
$quantity = null;
$weight   = null;

if ($wasteType === 'ewaste') {
    $category = $_POST['ewasteCategory'] ?? null;
    $quantity = isset($_POST['ewasteQty']) ? (int)$_POST['ewasteQty'] : 1;
} else {
    $category = $_POST['plasticType'] ?? null;
    $weight   = isset($_POST['plasticWeight']) ? (float)$_POST['plasticWeight'] : 0.0;
}

// จัดการอัปโหลดรูปภาพหลายรูป
$uploadedImages = [];
if (isset($_FILES['images']) && !empty($_FILES['images']['name'][0])) {
    $uploadDir = "../uploads/recycle/";
    if (!is_dir($uploadDir)) {
        mkdir($uploadDir, 0777, true);
    }

    $totalFiles = count($_FILES['images']['name']);
    for ($i = 0; $i < min($totalFiles, 5); $i++) { // ลิมิตไม่เกิน 5 รูป
        if ($_FILES['images']['error'][$i] === UPLOAD_ERR_OK) {
            $ext = pathinfo($_FILES['images']['name'][$i], PATHINFO_EXTENSION);
            $fileName = "recycle_" . time() . "_" . $i . "_" . uniqid() . "." . $ext;
            $targetPath = $uploadDir . $fileName;

            if (move_uploaded_file($_FILES['images']['tmp_name'][$i], $targetPath)) {
                $uploadedImages[] = $fileName;
            }
        }
    }
}

try {
    $sql = "INSERT INTO recycle_requests 
            (user_id, waste_type, category, quantity, weight, description, images, pickup_method, pickup_address) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)";
    
    $stmt = $pdo->prepare($sql);
    $stmt->execute([
        $userId,
        $wasteType,
        $category,
        $quantity,
        $weight,
        $description,
        json_encode($uploadedImages),
        $pickupMethod,
        $pickupAddress
    ]);

    echo json_encode([
        "success" => true,
        "message" => "ส่งคำขอรีไซเคิลสำเร็จ! กรุณารอการตรวจสอบเพื่อรับแต้ม"
    ]);

} catch (PDOException $e) {
    echo json_encode(["success" => false, "message" => "เกิดข้อผิดพลาด: " . $e->getMessage()]);
}
?>