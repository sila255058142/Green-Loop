<?php
// api/admin_update_recycle_status.php — แอดมิน "ยืนยันสิทธิ์" (อนุมัติ) หรือปฏิเสธคำขอรีไซเคิล
// เมื่ออนุมัติ: เครดิตแต้ม points เข้า users.green_points ให้ผู้แจ้งทันที (ทำครั้งเดียวใน transaction)
session_start();
header('Content-Type: application/json; charset=UTF-8');
require_once '../db.php';

if (!isset($_SESSION['admin_logged_in']) || $_SESSION['admin_logged_in'] !== true) {
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => 'ไม่มีสิทธิ์เข้าถึง']);
    exit;
}

$data = json_decode(file_get_contents('php://input'), true) ?: [];
$requestId = filter_var($data['id'] ?? null, FILTER_VALIDATE_INT);
$action = $data['action'] ?? ''; // 'approve' | 'reject'

if (!$requestId || !in_array($action, ['approve', 'reject'], true)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'ข้อมูลไม่ถูกต้อง']);
    exit;
}

$newStatus = $action === 'approve' ? 'approved' : 'rejected';
$adminName = $_SESSION['admin_name'] ?? 'Admin';

try {
    $pdo->beginTransaction();

    $stmt = $pdo->prepare('SELECT id, user_id, points_earned, status FROM recycle_requests WHERE id = ? FOR UPDATE');
    $stmt->execute([$requestId]);
    $request = $stmt->fetch();

    if (!$request) {
        $pdo->rollBack();
        http_response_code(404);
        echo json_encode(['success' => false, 'message' => 'ไม่พบคำขอนี้']);
        exit;
    }
    if ($request['status'] !== 'pending') {
        $pdo->rollBack();
        http_response_code(409);
        echo json_encode(['success' => false, 'message' => 'คำขอนี้ถูกตรวจสอบไปแล้ว']);
        exit;
    }

    $updateStmt = $pdo->prepare('
        UPDATE recycle_requests
        SET status = ?, updated_at = NOW()
        WHERE id = ?
    ');
    $updateStmt->execute([$newStatus, $requestId]);

    if ($action === 'approve') {
        $pointsStmt = $pdo->prepare('UPDATE users SET green_points = green_points + ? WHERE id = ?');
        $pointsStmt->execute([$request['points_earned'], $request['user_id']]);
    }

    $pdo->commit();

    echo json_encode([
        'success' => true,
        'message' => $action === 'approve'
            ? "อนุมัติคำขอแล้ว เครดิต {$request['points_earned']} คะแนนให้ผู้ใช้เรียบร้อย"
            : 'ปฏิเสธคำขอเรียบร้อยแล้ว'
    ]);
} catch (Throwable $e) {
    if ($pdo->inTransaction()) {
        $pdo->rollBack();
    }
    http_response_code(500);
    error_log($e->getMessage());
    echo json_encode(['success' => false, 'message' => 'ดำเนินการไม่สำเร็จ: ' . $e->getMessage()]);
}