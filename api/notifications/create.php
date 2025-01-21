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

    // Get POST data
    $data = json_decode(file_get_contents('php://input'), true);
    if (!$data) {
        throw new Exception('Invalid JSON input');
    }

    // Validate required fields
    if (!isset($data['type']) || !isset($data['message'])) {
        throw new Exception('Missing required fields');
    }

    // Validate type
    $validTypes = ['info', 'error', 'warning', 'success'];
    if (!in_array($data['type'], $validTypes)) {
        throw new Exception('Invalid notification type');
    }

    // Create notification
    $stmt = $mysqli->prepare("
        INSERT INTO notification (user_id, title, description, type) 
        VALUES (?, ?, ?, ?)
    ");
    $stmt->bind_param("isss", 
        $user['id'],
        $data['message'], // Usiamo il message come title
        $data['message'], // E anche come description per ora
        $data['type']
    );

    if (!$stmt->execute()) {
        throw new Exception('Failed to create notification');
    }

    echo json_encode([
        'success' => true,
        'message' => 'Notification created successfully',
        'id' => $mysqli->insert_id
    ]);

} catch (Exception $e) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}
