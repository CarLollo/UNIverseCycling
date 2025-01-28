<?php
require_once __DIR__ . '/../../config/db_config.php';

header('Content-Type: application/json');

try {
    $data = json_decode(file_get_contents('php://input'), true);
    
    if (!isset($data['email']) || !isset($data['password'])) {
        throw new Exception('Email e password richiesti');
    }

    $stmt = $mysqli->prepare("SELECT * FROM users WHERE email = ?");
    $stmt->bind_param("s", $data['email']);
    $stmt->execute();
    $user = $stmt->get_result()->fetch_assoc();
    
    if ($user && password_verify($data['password'], $user['password'])) {
        // Create token as JSON with email and type
        $token = base64_encode(json_encode([
            'email' => $user['email'],
            'type' => $user['type']
        ]));
        
        echo json_encode([
            'success' => true,
            'token' => $token,
            'email' => $user['email'],
            'type' => $user['type']
        ]);
    } else {
        echo json_encode([
            'success' => false,
            'message' => 'Credenziali non valide'
        ]);
    }
} catch (Exception $e) {
    http_response_code(401);
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}
?>