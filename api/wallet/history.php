    <?php
    // api/wallet/history.php?user_id=1
    // คืนยอดคงเหลือปัจจุบัน + ประวัติรายการทั้งหมดของผู้ใช้
    header('Content-Type: application/json; charset=utf-8');
    require_once '../../db.php';

    $userId = isset($_GET['user_id']) ? (int)$_GET['user_id'] : 0;

    if ($userId <= 0) {
        http_response_code(401);
        echo json_encode(['success' => false, 'message' => 'กรุณาเข้าสู่ระบบก่อน']);
        exit;
    }

    try {
        $userStmt = $pdo->prepare("SELECT wallet_balance FROM users WHERE id = ?");
        $userStmt->execute([$userId]);
        $user = $userStmt->fetch();

        if (!$user) {
            http_response_code(404);
            echo json_encode(['success' => false, 'message' => 'ไม่พบผู้ใช้งานนี้']);
            exit;
        }

        $txStmt = $pdo->prepare("
            SELECT id, type, amount, balance_after, status, slip_image,
                reference_order_id, note, created_at, reviewed_at
            FROM wallet_transactions
            WHERE user_id = ?
            ORDER BY created_at DESC
            LIMIT 100
        ");
        $txStmt->execute([$userId]);
        $transactions = $txStmt->fetchAll();

        echo json_encode([
            'success' => true,
            'balance' => (float)$user['wallet_balance'],
            'transactions' => $transactions,
        ]);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'ดึงข้อมูลไม่สำเร็จ: ' . $e->getMessage()]);
    }