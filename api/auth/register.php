<?php
require_once __DIR__ . '/../../config/db_config.php';

header('Content-Type: application/json');

try {
    // Get POST data
    $data = json_decode(file_get_contents('php://input'), true);
    
    if (!isset($data['email']) || !isset($data['password']) || !isset($data['firstName']) || 
        !isset($data['lastName']) || !isset($data['phone'])) {
        throw new Exception('Missing required fields');
    }

    // Validate email
    if (!filter_var($data['email'], FILTER_VALIDATE_EMAIL)) {
        throw new Exception('Invalid email format');
    }

    // Validate password
    if (strlen($data['password']) < 8) {
        throw new Exception('Password must be at least 8 characters long');
    }

    // Check if email already exists
    $stmt = $mysqli->prepare("SELECT id FROM users WHERE email = ?");
    $stmt->bind_param("s", $data['email']);
    $stmt->execute();
    $result = $stmt->get_result();
    
    if ($result->num_rows > 0) {
        throw new Exception('Email already registered');
    }

    $email = trim($data['email']);
    $password = trim($data['password']);
    $firstName = trim($data['firstName']);
    $lastName = trim($data['lastName']);
    $phone = trim($data['phone']);

    // Hash della password
    $hashedPassword = password_hash($password, PASSWORD_DEFAULT);

    // Insert new user
    $stmt = $mysqli->prepare("
        INSERT INTO users (email, password, first_name, last_name, phone) 
        VALUES (?, ?, ?, ?, ?)
    ");
    
    $stmt->bind_param(
        "sssss",
        $email,
        $hashedPassword,
        $firstName,
        $lastName,
        $phone
    );
    
    if (!$stmt->execute()) {
        throw new Exception('Failed to create account');
    }

    // Generate auth token
    $userId = $mysqli->insert_id;
    $token = bin2hex(random_bytes(32));
    
    // Store token
    $stmt = $mysqli->prepare("
        INSERT INTO auth_tokens (user_id, token, expires_at) 
        VALUES (?, ?, DATE_ADD(NOW(), INTERVAL 30 DAY))
    ");
    
    $stmt->bind_param("is", $userId, $token);
    
    if (!$stmt->execute()) {
        throw new Exception('Failed to create authentication token');
    }

    // Return success response with token
    echo json_encode([
        'success' => true,
        'message' => 'Account created successfully',
        'token' => $token,
        'user' => [
            'id' => $userId,
            'email' => $email,
            'firstName' => $firstName,
            'lastName' => $lastName,
            'phone' => $phone
        ]
    ]);

} catch (Exception $e) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}
