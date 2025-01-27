<?php
require_once '../../config/database.php';
require_once '../../auth/auth_middleware.php';

// Verifica che l'utente sia autenticato
$user = authenticate();
if (!$user) {
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => 'Utente non autenticato']);
    exit;
}

// Verifica che la richiesta sia POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Metodo non consentito']);
    exit;
}

// Ottieni i dati dalla richiesta
$data = json_decode(file_get_contents('php://input'), true);
if (!isset($data['notification_id'])) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'ID notifica mancante']);
    exit;
}

$notificationId = $data['notification_id'];
$userId = $user['id'];

try {
    $db = new Database();
    $conn = $db->getConnection();

    // Verifica che la notifica appartenga all'utente
    $stmt = $conn->prepare('SELECT id FROM notifications WHERE id = ? AND user_id = ?');
    $stmt->bind_param('ii', $notificationId, $userId);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows === 0) {
        http_response_code(404);
        echo json_encode(['success' => false, 'message' => 'Notifica non trovata']);
        exit;
    }

    // Elimina la notifica
    $stmt = $conn->prepare('DELETE FROM notifications WHERE id = ? AND user_id = ?');
    $stmt->bind_param('ii', $notificationId, $userId);
    $stmt->execute();

    if ($stmt->affected_rows > 0) {
        echo json_encode(['success' => true, 'message' => 'Notifica eliminata con successo']);
    } else {
        throw new Exception('Errore durante l\'eliminazione della notifica');
    }

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Errore del server: ' . $e->getMessage()]);
}
