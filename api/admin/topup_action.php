<?php
// api/admin/topup_action.php
// { "id": 12, "action": "approve" | "reject", "note": "...", "admin_name": "Admin" }
header('Content-Type: application/json; charset=utf-8');
require_once '../db.php';

$input = json_decode(file_get_contents('php://input'), true);

$id = isset($input['id']) ? (int)$input['id'] : 0;
$action = isset($input['action']) ? $input['action'] : '';
$note = isset($input['note']) ? trim($input['note']) : null;
$adminName = isset($input['admin_name']) ? trim($input['admin_name']) : 'Admin';

if ($id <= 0 || !in_array($action, ['approve', 'reject'], true)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'ระบุข้อมูลไม่ถูกต้อง']);
    exit;
}

try {
    $pdo->beginTransaction();

    $txStmt = $pdo->prepare("SELECT * FROM wallet_transactions WHERE id = ? AND type = 'topup' FOR UPDATE");
    $txStmt->execute([$id]);
    $tx = $txStmt->fetch();

    if (!$tx) {
        $pdo->rollBack();
        http_response_code(404);
        echo json_encode(['success' => false, 'message' => 'ไม่พบคำขอเติมเงินนี้']);
        exit;
    }

    if ($tx['status'] !== 'pending') {
        $pdo->rollBack();
        echo json_encode(['success' => false, 'message' => 'คำขอนี้ถูกดำเนินการไปแล้ว']);
        exit;
    }

    if ($action === 'approve') {
        $userStmt = $pdo->prepare("SELECT wallet_balance FROM users WHERE id = ? FOR UPDATE");
        $userStmt->execute([$tx['user_id']]);
        $user = $userStmt->fetch();

        if (!$user) {
            $pdo->rollBack();
            http_response_code(404);
            echo json_encode(['success' => false, 'message' => 'ไม่พบผู้ใช้งานนี้']);
            exit;
        }

        $newBalance = (float)$user['wallet_balance'] + (float)$tx['amount'];

        $pdo->prepare("UPDATE users SET wallet_balance = ? WHERE id = ?")
            ->execute([$newBalance, $tx['user_id']]);

        $pdo->prepare("
            UPDATE wallet_transactions
            SET status = 'approved', balance_after = ?, note = ?, reviewed_by = ?, reviewed_at = NOW()
            WHERE id = ?
        ")->execute([$newBalance, $note, $adminName, $id]);

        $message = 'อนุมัติการเติมเงินเรียบร้อยแล้ว ยอด Wallet ผู้ใช้ถูกอัปเดตแล้ว';
    } else {
        $pdo->prepare("
            UPDATE wallet_transactions
            SET status = 'rejected', note = ?, reviewed_by = ?, reviewed_at = NOW()
            WHERE id = ?
        ")->execute([$note ?: 'สลิปไม่ถูกต้องหรือตรวจสอบไม่ผ่าน', $adminName, $id]);

        $message = 'ปฏิเสธคำขอเติมเงินเรียบร้อยแล้ว';
    }

    $pdo->commit();
    echo json_encode(['success' => true, 'message' => $message]);
} catch (PDOException $e) {
    if ($pdo->inTransaction()) {
        $pdo->rollBack();
    }
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'ดำเนินการไม่สำเร็จ: ' . $e->getMessage()]);
}