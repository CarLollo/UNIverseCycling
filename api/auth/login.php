<?php
// api/auth/login.php
require_once __DIR__ . '/../../config/db_config.php';
require_once __DIR__ . '/../../utils/logger.php';

// Inizializza il logger
$logger = new Logger(__DIR__ . '/../../logs/auth.log');
$logger->log("Login attempt started");

header('Content-Type: application/json');
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Allow-Headers: Content-Type");

try {
    $data = json_decode(file_get_contents('php://input'), true);
    $logger->log("Received data: " . json_encode($data));
    
    if (!$data || !isset($data['email']) || !isset($data['password'])) {
        $logger->log("Error: Missing email or password");
        throw new Exception('Email and password are required');
    }

    $email = trim($data['email']);
    $password = trim($data['password']);

    $logger->log("Attempting login for email: " . $email);

    $stmt = $mysqli->prepare("SELECT id, email, password, first_name, last_name, phone, type FROM users WHERE email = ? LIMIT 1");
    if (!$stmt) {
        $logger->log("Error: " . $mysqli->error);
        throw new Exception('Database error');
    }

    $stmt->bind_param("s", $email);
    if (!$stmt->execute()) {
        $logger->log("Error: " . $stmt->error);
        throw new Exception('Database error');
    }

    $result = $stmt->get_result();
    $user = $result->fetch_assoc();
    
    $logger->log("User found: " . ($user ? "YES" : "NO"));
    if ($user) {
        $logger->log("User data: " . json_encode($user));
    }
    
    if (!$user) {
        $logger->log("Error: User not found for email: " . $email);
        throw new Exception('Invalid credentials');
    }

    // Verifica la password
    $logger->log("Verifica password per user: " . $user['email']);
    $passwordMatch = password_verify($password, $user['password']);
    $logger->log("Password match: " . ($passwordMatch ? "YES" : "NO"));
    
    if ($passwordMatch) {
        // Generate token
        $token = bin2hex(random_bytes(32));
        $logger->log("Token generato: " . $token);
        
        // Store token
        $stmt = $mysqli->prepare("INSERT INTO auth_tokens (user_id, token, expires_at) VALUES (?, ?, DATE_ADD(NOW(), INTERVAL 30 DAY))");
        if (!$stmt) {
            $logger->log("Error: " . $mysqli->error);
            throw new Exception('Failed to create auth token');
        }

        $stmt->bind_param("is", $user['id'], $token);
        if (!$stmt->execute()) {
            $logger->log("Error: " . $stmt->error);
            throw new Exception('Failed to create auth token');
        }

        // Remove password from user data
        unset($user['password']);
        
        $logger->log("Login successful for user: " . $email);

        echo json_encode([
            'success' => true,
            'token' => $token,
            'user' => $user
        ]);
    } else {
        $logger->log("Error: Invalid password for user: " . $email);
        throw new Exception('Invalid credentials');
    }

} catch (Exception $e) {
    $logger->log("Error: " . $e->getMessage());
    http_response_code(401);
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}
?>