<?php
header("Content-Type: application/json; charset=UTF-8");
require_once "../db.php"; 

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $username  = isset($_POST['username']) ? trim($_POST['username']) : '';
    $email     = isset($_POST['email']) ? trim($_POST['email']) : '';
    $firstName = isset($_POST['firstName']) ? trim($_POST['firstName']) : '';
    $lastName  = isset($_POST['lastName']) ? trim($_POST['lastName']) : '';
    $password  = isset($_POST['password']) ? $_POST['password'] : '';

    if (empty($username) || empty($email) || empty($password)) {
        echo json_encode(["success" => false, "message" => "กรอกข้อมูลไม่ครบถ้วน"]);
        exit();
    }

    $passwordHash = password_hash($password, PASSWORD_BCRYPT);

    try {
        $sql = "INSERT INTO users (username, email, first_name, last_name, password) VALUES (?, ?, ?, ?, ?)";
        $stmt = $pdo->prepare($sql);
        $stmt->execute([$username, $email, $firstName, $lastName, $passwordHash]);

        // ✅ ส่ง redirect: "login" กลับไปให้ JavaScript
        echo json_encode([
            "success" => true, 
            "message" => "ลงทะเบียนสำเร็จ! กรุณาเข้าสู่ระบบ",
            "redirect" => "login"
        ]);
    } catch (PDOException $e) {
        echo json_encode(["success" => false, "message" => "อีเมลหรือ Username นี้ถูกใช้งานแล้ว"]);
    }
}
?>