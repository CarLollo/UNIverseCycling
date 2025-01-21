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

    // Get notification ID
    $data = json_decode(file_get_contents('php://input'), true);
    if (!isset($data['notificationId'])) {
        throw new Exception('Missing notification ID');
    }

    // Mark as read
    $stmt = $mysqli->prepare("
        UPDATE notification 
        SET is_read = TRUE 
        WHERE notification_id = ? AND user_id = ?
    ");
    
    $stmt->bind_param("ii", $data['notificationId'], $user['id']);

    if (!$stmt->execute()) {
        throw new Exception('Failed to mark notification as read');
    }

    if ($stmt->affected_rows === 0) {
        throw new Exception('Notification not found or already read');
    }

    echo json_encode([
        'success' => true,
        'message' => 'Notification marked as read'
    ]);

} catch (Exception $e) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}
