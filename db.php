<?php
// db.php - ไฟล์สำหรับเชื่อมต่อฐานข้อมูล MySQL ผ่าน PDO

$host     = 'localhost';
$dbname   = 'green_loop'; // ชื่อฐานข้อมูลใน phpMyAdmin
$username = 'root';       // ค่าเริ่มต้นของ XAMPP
$password = '';           // ค่าเริ่มต้นของ XAMPP (ปล่อยว่างไว้)

try {
    // 1. สร้างการเชื่อมต่อ PDO
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8mb4", $username, $password);
    
    // 2. ตั้งค่าให้แจ้งเตือน Error เป็น Exception และ Return ข้อมูลแบบ Associative Array
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $pdo->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);

    // [ปลดคอมเมนต์บรรทัดด้านล่างเพื่อทดสอบ]
    // echo "<h3 style='color:green;'>เชื่อมต่อ Database สำเร็จแล้ว!</h3>";

} catch (PDOException $e) {
    // กรณีเชื่อมต่อไม่สำเร็จ ส่ง Response กลับเป็น JSON แจ้งข้อผิดพลาด
    header('Content-Type: application/json; charset=utf-8');
    http_response_code(500);
    echo json_encode([
        'status'  => 'error',
        'message' => 'เชื่อมต่อ Database ไม่สำเร็จ: ' . $e->getMessage()
    ]);
    exit;
}
?>