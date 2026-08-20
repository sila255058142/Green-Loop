<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST");

require_once "../db.php";

$data = $_POST;
if (empty($data)) {
    $data = json_decode(file_get_contents("php://input"), true) ?: [];
}

if (!empty($data['email']) && !empty($data['password'])) {
    $email = trim($data['email']);
    $password = $data['password'];

    try {
        $stmt = $pdo->prepare("SELECT id, username, email, password, wallet_balance FROM users WHERE email = ? LIMIT 1");
        $stmt->execute([$email]);
        $user = $stmt->fetch();

        if ($user && password_verify($password, $user['password'])) {
            echo json_encode([
                "success" => true,
                "user" => [
                    "id" => $user['id'],
                    "username" => $user['username'],
                    "email" => $user['email'],
                    "walletBalance" => (float)$user['wallet_balance']
                ]
            ]);
        } elseif ($user) {
            echo json_encode(["success" => false, "message" => "รหัสผ่านไม่ถูกต้อง"]);
        } else {
            echo json_encode(["success" => false, "message" => "ไม่พบอีเมลนี้ในระบบ"]);
        }
    } catch (PDOException $e) {
        http_response_code(500);
        error_log($e->getMessage());
        echo json_encode(["success" => false, "message" => "เกิดข้อผิดพลาดในการเข้าสู่ระบบ"]);
    }
} else {
    http_response_code(400);
    echo json_encode(["success" => false, "message" => "กรุณากรอกอีเมลและรหัสผ่าน"]);
}
?>