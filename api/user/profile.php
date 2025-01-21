<?php
require_once __DIR__ . '/../../config/db_config.php';

header('Content-Type: application/json');

try {
    // Get token from headers
    $headers = apache_request_headers();
    if (!isset($headers['Authorization'])) {
        throw new Exception('No authorization token provided');
    }

    $token = str_replace('Bearer ', '', $headers['Authorization']);
    $decoded = json_decode(base64_decode($token), true);

    $payload = json_decode(base64_decode($tokenParts[1]), true);
    if ($decoded && isset($decoded['email'])) {
        $userEmail = $decoded['email'];
        error_log("Email found: " . $userEmail);
    } else {
        error_log("No email in token");
    }

    // Get user data by email
    $stmt = $mysqli->prepare("SELECT id, email, first_name, last_name, phone FROM users WHERE email = ?");
    $stmt->bind_param("s", $userEmail);
    $stmt->execute();
    $result = $stmt->get_result();
    
    if ($result->num_rows === 0) {
        throw new Exception('User not found');
    }

    $user = $result->fetch_assoc();
    
    echo json_encode([
        'success' => true,
        'user' => $user
    ]);

} catch (Exception $e) {
    error_log("Profile error: " . $e->getMessage());
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}
