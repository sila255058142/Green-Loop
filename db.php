<?php
$host     = 'localhost';
$dbname   = 'green_loop';
$username = 'root';
$password = '';   

try {
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8mb4", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $pdo->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);

    // ปิดบรรทัดนี้ไว้ ห้ามเปิด echo ออกมา
    // echo "<h2 style='color:green;'>เชื่อมต่อฐานข้อมูล green_loop สำเร็จแล้ว!</h2>";

} catch (PDOException $e) {
    // ปรับ error ให้ส่งออกเป็น JSON แทนการ echo HTML
    header("Content-Type: application/json; charset=UTF-8");
    die(json_encode(["success" => false, "message" => "Connect Error: " . $e->getMessage()]));
}
?>