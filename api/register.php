<?php
// บังคับคืนค่าเป็น JSON เท่านั้น
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST");

// ปิดการแสดง HTML Error Notice บนหน้าจอ
error_reporting(0);
ini_set('display_errors', 0);

require_once "../db.php"; 

$data = json_decode(file_get_contents("php://input"), true);

if (!empty($data['username']) && !empty($data['email']) && !empty($data['password'])) {
    $username  = trim($data['username']);
    $email     = trim($data['email']);
    $firstName = trim($data['firstName']);
    $lastName  = trim($data['lastName']);
    $password  = password_hash($data['password'], PASSWORD_BCRYPT);

    try {
        $sql = "INSERT INTO users (username, email, first_name, last_name, password) VALUES (?, ?, ?, ?, ?)";
        $stmt = $pdo->prepare($sql);
        $stmt->execute([$username, $email, $firstName, $lastName, $password]);

        echo json_encode(["success" => true, "message" => "ลงทะเบียนสำเร็จ"]);
    } catch (PDOException $e) {
        // หากมี Error จาก Database จะส่งข้อความแจ้งเตือนกลับไปที่ Alert บนหน้าเว็บ
        echo json_encode(["success" => false, "message" => "DB Error: " . $e->getMessage()]);
    }
} else {
    echo json_encode(["success" => false, "message" => "กรอกข้อมูลไม่ครบถ้วน"]);
}
?>