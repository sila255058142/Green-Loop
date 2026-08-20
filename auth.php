<?php
// auth.php
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

// เช็คว่ามี Session ของ Admin หรือไม่
if (!isset($_SESSION['admin_logged_in']) || $_SESSION['admin_logged_in'] !== true) {
    // ถ้าไม่มีสิทธิ์ ให้ดีดกลับไปหน้าล็อกอินแอดมิน
    header("Location: admin-login.html");
    exit();
}
?>