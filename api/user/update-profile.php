<?php
require_once __DIR__ . '/../../config/db_config.php';

header('Content-Type: application/json');

try {
    // Get token
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

    // Get and validate input data
    $input = file_get_contents('php://input');
    $data = json_decode($input, true);
    if (!$data) {
        throw new Exception('Invalid JSON input: ' . json_last_error_msg());
    }

    // Validate required fields
    $requiredFields = ['firstName', 'lastName', 'email', 'phone'];
    foreach ($requiredFields as $field) {
        if (!isset($data[$field]) || trim($data[$field]) === '') {
            throw new Exception("Missing or empty required field: {$field}");
        }
    }

    // Trim all input data
    $data = array_map('trim', $data);

    // First check if any data has actually changed
    $stmt = $mysqli->prepare("SELECT first_name, last_name, email, phone FROM users WHERE email = ?");
    $stmt->bind_param("s", $userEmail);
    $stmt->execute();
    $result = $stmt->get_result();
    $currentUser = $result->fetch_assoc();

    if (!$currentUser) {
        throw new Exception('User not found');
    }

    // Check if anything has changed
    if ($currentUser['first_name'] === $data['firstName'] &&
        $currentUser['last_name'] === $data['lastName'] &&
        $currentUser['email'] === $data['email'] &&
        $currentUser['phone'] === $data['phone']) {
        echo json_encode([
            'success' => true,
            'message' => 'No changes were made to the profile'
        ]);
        exit;
    }

    // If email is being changed, check if new email is available
    if ($data['email'] !== $userEmail) {
        $stmt = $mysqli->prepare("SELECT id FROM users WHERE email = ?");
        $stmt->bind_param("s", $data['email']);
        $stmt->execute();
        if ($stmt->get_result()->num_rows > 0) {
            throw new Exception('Email already in use');
        }
    }

    // Update the user profile
    $stmt = $mysqli->prepare("UPDATE users SET first_name = ?, last_name = ?, phone = ?, email = ? WHERE email = ?");
    if (!$stmt) {
        throw new Exception("Database error: " . $mysqli->error);
    }

    $stmt->bind_param("sssss", 
        $data['firstName'],
        $data['lastName'],
        $data['phone'],
        $data['email'],
        $userEmail
    );

    if (!$stmt->execute()) {
        throw new Exception("Database error: " . $stmt->error);
    }

    if ($stmt->affected_rows === 0) {
        throw new Exception("Failed to update profile");
    }

    echo json_encode([
        'success' => true,
        'message' => 'Profile updated successfully',
        'user' => [
            'first_name' => $data['firstName'],
            'last_name' => $data['lastName'],
            'email' => $data['email'],
            'phone' => $data['phone']
        ]
    ]);

} catch (Exception $e) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}
