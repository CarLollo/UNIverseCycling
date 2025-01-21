<?php
require_once __DIR__ . '/../../config/db_config.php';
require_once __DIR__ . '/../../config/jwt_utils.php';

header('Content-Type: application/json');

// Get bearer token
$headers = getallheaders();
$auth_header = isset($headers['Authorization']) ? $headers['Authorization'] : '';
$token = str_replace('Bearer ', '', $auth_header);

try {
    // Verify token
    $user_id = validateJWT($token);
    if (!$user_id) {
        throw new Exception('Invalid token');
    }

    // Get POST data
    $data = json_decode(file_get_contents('php://input'), true);
    
    if (!isset($data['currentPassword']) || !isset($data['newPassword'])) {
        throw new Exception('Missing required fields');
    }

    // Validate new password
    if (strlen($data['newPassword']) < 8) {
        throw new Exception('New password must be at least 8 characters long');
    }

    // Get current user data
    $stmt = $mysqli->prepare("SELECT password FROM users WHERE id = ?");
    $stmt->bind_param("i", $user_id);
    $stmt->execute();
    $result = $stmt->get_result();
    
    if ($result->num_rows === 0) {
        throw new Exception('User not found');
    }

    $user = $result->fetch_assoc();

    // Verify current password
    if (!password_verify($data['currentPassword'], $user['password'])) {
        throw new Exception('Current password is incorrect');
    }

    // Hash new password
    $hashedPassword = password_hash($data['newPassword'], PASSWORD_DEFAULT);

    // Update password
    $stmt = $mysqli->prepare("UPDATE users SET password = ? WHERE id = ?");
    $stmt->bind_param("si", $hashedPassword, $user_id);
    
    if (!$stmt->execute()) {
        throw new Exception('Failed to update password');
    }
    
    echo json_encode([
        'success' => true,
        'message' => 'Password updated successfully'
    ]);

} catch (Exception $e) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}
