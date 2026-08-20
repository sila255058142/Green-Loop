    <?php
    // api/admin/topup_requests.php?status=pending|approved|rejected|all
    header('Content-Type: application/json; charset=utf-8');
    require_once '../../db.php';

    $status = isset($_GET['status']) ? $_GET['status'] : 'pending';
    $allowed = ['pending', 'approved', 'rejected', 'all'];
    if (!in_array($status, $allowed, true)) {
        $status = 'pending';
    }

    try {
        $sql = "
            SELECT wt.id, wt.user_id, u.username, u.email, wt.amount, wt.status,
                wt.slip_image, wt.note, wt.created_at, wt.reviewed_at, wt.reviewed_by
            FROM wallet_transactions wt
            JOIN users u ON u.id = wt.user_id
            WHERE wt.type = 'topup'
        ";
        $params = [];
        if ($status !== 'all') {
            $sql .= " AND wt.status = ?";
            $params[] = $status;
        }
        $sql .= " ORDER BY wt.created_at DESC LIMIT 200";

        $stmt = $pdo->prepare($sql);
        $stmt->execute($params);
        $rows = $stmt->fetchAll();

        $pendingCountStmt = $pdo->query("SELECT COUNT(*) FROM wallet_transactions WHERE type='topup' AND status='pending'");
        $pendingCount = (int)$pendingCountStmt->fetchColumn();

        echo json_encode([
            'success' => true,
            'requests' => $rows,
            'pending_count' => $pendingCount,
        ]);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'ดึงข้อมูลไม่สำเร็จ: ' . $e->getMessage()]);
    }   