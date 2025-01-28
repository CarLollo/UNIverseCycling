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

    // Get notification ID from request
    $data = json_decode(file_get_contents('php://input'), true);
    if (!isset($data['notification_id'])) {
        throw new Exception('Notification ID is required');
    }

    $notificationId = $data['notification_id'];

    // Delete notification
    $stmt = $mysqli->prepare("DELETE FROM notification WHERE notification_id = ? AND user_id = ?");
    $stmt->bind_param("ii", $notificationId, $user['id']);
    
    if (!$stmt->execute()) {
        throw new Exception('Failed to delete notification');
    }

    if ($stmt->affected_rows === 0) {
        throw new Exception('Notification not found or already deleted');
    }

    echo json_encode([
        'success' => true,
        'message' => 'Notification deleted successfully'
    ]);

} catch (Exception $e) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}
