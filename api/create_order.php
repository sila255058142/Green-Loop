<?php
header('Content-Type: application/json');

// 1. รับข้อมูล JSON ที่ส่งมาจากหน้า checkout.html
$data = json_decode(file_get_contents('php://input'), true);

if (!$data) {
    echo json_encode(['success' => false, 'message' => 'ไม่มีข้อมูลส่งมา']);
    exit;
}

// 2. ตั้งค่าเชื่อมต่อ Database (ปรับ host, username, password ตามของคุณ)
$host = "localhost";
$user = "root";
$pass = "";
$dbname = "green_loop";

$conn = new mysqli($host, $user, $pass, $dbname);
$conn->set_charset("utf8mb4");

if ($conn->connect_error) {
    echo json_encode(['success' => false, 'message' => 'เชื่อมต่อ Database ไม่สำเร็จ']);
    exit;
}

// 3. เตรียมคำสั่งบันทึกข้อมูล
$stmt = $conn->prepare("INSERT INTO orders (product_id, price, customer_name, customer_phone, customer_address) VALUES (?, ?, ?, ?, ?)");
$stmt->bind_param("idsss", $data['product_id'], $data['price'], $data['customer_name'], $data['customer_phone'], $data['customer_address']);

// 4. ประมวลผลและส่งผลลัพธ์กลับ
if ($stmt->execute()) {
    echo json_encode(['success' => true, 'order_id' => $stmt->insert_id]);
} else {
    echo json_encode(['success' => false, 'message' => 'บันทึกข้อมูลไม่สำเร็จ']);
}

$stmt->close();
$conn->close();
?>