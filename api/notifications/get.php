<?php
require_once __DIR__ . '/../../config/db_config.php';

header('Content-Type: application/json');

try {
    // Get token
    $headers = apache_request_headers();
    if (!isset($headers['Authorization'])) {
        throw new Exception('No authorization token provided');
    }

    $token = str_replace('Bearer ', '', $headers['Authorization']);
    $tokenJson = json_decode(base64_decode($token), true);

    if (!isset($tokenJson['email'])) {
        throw new Exception('Invalid token format - no email found');
    }

    $userEmail = $tokenJson['email'];

    // Get user ID from email
    $stmt = $mysqli->prepare("SELECT id FROM users WHERE email = ?");
    $stmt->bind_param("s", $userEmail);
    
    if (!$stmt->execute()) {
        throw new Exception('Failed to get user ID');
    }
    
    $result = $stmt->get_result();
    $user = $result->fetch_assoc();
    
    if (!$user) {
        throw new Exception('User not found');
    }

    // Get notification settings from request
    $data = json_decode(file_get_contents('php://input'), true);
    $settings = isset($data['settings']) ? $data['settings'] : [
        'success' => true,
        'info' => true,
        'warning' => true,
        'error' => true
    ];

    // Create array of active types
    $activeTypes = [];
    foreach ($settings as $type => $active) {
        if ($active) {
            $activeTypes[] = $type;
        }
    }

    if (empty($activeTypes)) {
        echo json_encode([
            'success' => true,
            'notifications' => []
        ]);
        exit;
    }

    // Create placeholders for the IN clause
    $placeholders = str_repeat('?,', count($activeTypes) - 1) . '?';
    
    // Get notifications with type filter
    $query = "
        SELECT notification_id as id, type, title as message, is_read, notification_date as created_at 
        FROM notification 
        WHERE user_id = ? AND type IN ($placeholders)
        ORDER BY notification_date DESC
        LIMIT 50
    ";
    
    $stmt = $mysqli->prepare($query);
    
    // Create array of parameters starting with user_id
    $params = array_merge([$user['id']], $activeTypes);
    $types = 'i' . str_repeat('s', count($activeTypes));
    
    // Bind parameters dynamically
    $stmt->bind_param($types, ...$params);

    if (!$stmt->execute()) {
        throw new Exception('Failed to fetch notifications');
    }

    $result = $stmt->get_result();
    $notifications = [];
    
    while ($row = $result->fetch_assoc()) {
        $notifications[] = [
            'id' => $row['id'],
            'type' => $row['type'],
            'message' => $row['message'],
            'isRead' => (bool)$row['is_read'],
            'createdAt' => $row['created_at']
        ];
    }

    echo json_encode([
        'success' => true,
        'notifications' => $notifications
    ]);

} catch (Exception $e) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}
