<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST");

require_once "db.php";

$data = json_decode(file_get_contents("php://input"), true);

if (!empty($data['email']) && !empty($data['password'])) {
    $email = $data['email'];
    $password = $data['password'];

    $stmt = $conn->prepare("SELECT id, username, email, password, wallet_balance FROM users WHERE email = ?");
    $stmt->bind_param("s", $email);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($user = $result->fetch_assoc()) {
        // ถ้ารหัสผ่านถูกต้อง
        if (password_verify($password, $user['password'])) {
            echo json_encode([
                "success" => true,
                "user" => [
                    "id" => $user['id'],
                    "username" => $user['username'],
                    "email" => $user['email'],
                    "walletBalance" => (float)$user['wallet_balance']
                ]
            ]);
        } else {
            echo json_encode(["success" => false, "message" => "รหัสผ่านไม่ถูกต้อง"]);
        }
    } else {
        echo json_encode(["success" => false, "message" => "ไม่พบอีเมลนี้ในระบบ"]);
    }
    $stmt->close();
}
?>