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

    // Count unread notifications
    $stmt = $mysqli->prepare("
        SELECT COUNT(*) as count 
        FROM notification 
        WHERE user_id = ? AND is_read = FALSE
    ");
    
    $stmt->bind_param("i", $user['id']);

    if (!$stmt->execute()) {
        throw new Exception('Failed to count notifications');
    }

    $result = $stmt->get_result();
    $count = $result->fetch_assoc()['count'];

    echo json_encode([
        'success' => true,
        'count' => (int)$count
    ]);

} catch (Exception $e) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}
