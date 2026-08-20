<?php
// api/admin_logout.php
session_start();
header('Content-Type: application/json; charset=UTF-8');

$_SESSION = [];
session_destroy();

echo json_encode(['success' => true]);