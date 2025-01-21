<?php
require_once __DIR__ . '/../../config/db_config.php';

header('Content-Type: application/json');

try {
    // Get token from headers
    $headers = getallheaders();
    if (!isset($headers['Authorization'])) {
        throw new Exception('No authorization header');
    }

    $token = str_replace('Bearer ', '', $headers['Authorization']);
    $tokenJson = json_decode(base64_decode($token), true);

    if (!isset($tokenJson['email'])) {
        throw new Exception('Invalid token format - no email found');
    }

    $userEmail = $tokenJson['email'];
    
    // Get POST data
    $data = json_decode(file_get_contents('php://input'), true);
    if (!$data) {
        throw new Exception('Invalid JSON input');
    }

    if (!isset($data['currentPassword']) || !isset($data['newPassword'])) {
        throw new Exception('Missing required fields');
    }

    // Validate new password
    if (strlen($data['newPassword']) < 8) {
        throw new Exception('New password must be at least 8 characters long');
    }

    // Get current user's password
    $stmt = $mysqli->prepare("SELECT password FROM users WHERE email = ?");
    $stmt->bind_param("s", $userEmail);
    $stmt->execute();
    $result = $stmt->get_result();
    $user = $result->fetch_assoc();

    if (!$user) {
        throw new Exception('User not found');
    }

    // Verify current password
    if (!password_verify($data['currentPassword'], $user['password'])) {
        throw new Exception('Current password is incorrect');
    }

    // Hash new password
    $hashedPassword = password_hash($data['newPassword'], PASSWORD_DEFAULT);

    // Update password
    $stmt = $mysqli->prepare("UPDATE users SET password = ? WHERE email = ?");
    $stmt->bind_param("ss", $hashedPassword, $userEmail);

    if (!$stmt->execute()) {
        throw new Exception('Failed to update password');
    }

    if ($stmt->affected_rows === 0) {
        throw new Exception('No changes were made to the password');
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
