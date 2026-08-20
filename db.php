<?php
// db.php - ไฟล์สำหรับเชื่อมต่อฐานข้อมูล MySQL ผ่าน PDO

$host     = 'localhost';
$dbname   = 'green_loop'; // ต้องเป็น green_loop ตัวพิมพ์เล็กและมี _
$username = 'root';
$password = '';           // XAMPP ค่าเริ่มต้นปล่อยว่างไว้   

try {
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8mb4", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $pdo->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);

    // ปลดคอมเมนต์บรรทัดนี้ออกเพื่อดูผล
    echo "<h2 style='color:green;'>เชื่อมต่อฐานข้อมูล green_loop สำเร็จแล้ว!</h2>";

} catch (PDOException $e) {
    echo "<h2 style='color:red;'>Error: " . $e->getMessage() . "</h2>";
}
?>