<?php
require_once __DIR__ . '/../config/db_config.php';

// Set headers
header('Content-Type: application/json');
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");

// Helper function to send JSON response
function sendJsonResponse($data, $statusCode = 200) {
    http_response_code($statusCode);
    echo json_encode($data);
    exit;
}

// Get auth token from header
$headers = apache_request_headers();
error_log("Headers received: " . print_r($headers, true));

$token = null;
$userEmail = null;

if (isset($headers['Authorization'])) {
    $token = str_replace('Bearer ', '', $headers['Authorization']);
    error_log("Token: " . $token);
    
    try {
        $decoded = json_decode(base64_decode($token), true);
        error_log("Decoded token: " . print_r($decoded, true));
        
        if ($decoded && isset($decoded['email'])) {
            $userEmail = $decoded['email'];
            error_log("Email found: " . $userEmail);
        } else {
            error_log("No email in token");
        }
    } catch (Exception $e) {
        error_log("Error decoding token: " . $e->getMessage());
    }
}

if (!$userEmail) {
    sendJsonResponse(['error' => 'Unauthorized'], 401);
}

// Get user ID from email
$stmt = $mysqli->prepare("SELECT id FROM users WHERE email = ?");
$stmt->bind_param("s", $userEmail);
$stmt->execute();
$result = $stmt->get_result();

if (!$row = $result->fetch_assoc()) {
    sendJsonResponse(['error' => 'User not found'], 404);
}

$userId = $row['id'];
error_log("User ID: " . $userId);

$action = $_GET['action'] ?? '';
error_log("Action: " . $action);

try {
    switch ($action) {
        case 'create':
            // Leggi i dati dell'ordine dal body della richiesta
            $rawInput = file_get_contents('php://input');
            if (empty($rawInput)) {
                sendJsonResponse(['error' => 'No data received'], 400);
            }

            $data = json_decode($rawInput, true);
            if (json_last_error() !== JSON_ERROR_NONE) {
                sendJsonResponse(['error' => 'Invalid JSON data: ' . json_last_error_msg()], 400);
            }

            // Valida i dati richiesti
            if (!isset($data['shipping']) || !isset($data['items']) || !isset($data['total'])) {
                sendJsonResponse(['error' => 'Missing required data (shipping, items, or total)'], 400);
            }

            // Valida gli items
            if (!is_array($data['items']) || empty($data['items'])) {
                sendJsonResponse(['error' => 'Order must contain at least one item'], 400);
            }

            // Inizia la transazione
            $mysqli->begin_transaction();

            try {
                // Crea l'ordine
                $stmt = $mysqli->prepare("
                    INSERT INTO `order` (
                        user_id, 
                        address,
                        street,
                        street_number,
                        city,
                        postal_code,
                        status
                    ) VALUES (?, ?, ?, ?, ?, ?, 'processing')
                ");
                
                $address = $data['shipping']['address'];
                $city = $data['shipping']['city'];
                $postalCode = $data['shipping']['zip'];
                
                // Estrai il numero civico dall'indirizzo
                preg_match('/(\d+)/', $address, $matches);
                $streetNumber = $matches[0] ?? '';
                $street = trim(str_replace($streetNumber, '', $address));
                
                $stmt->bind_param("isssss", 
                    $userId,
                    $address,
                    $street,
                    $streetNumber,
                    $city,
                    $postalCode
                );
                
                $stmt->execute();
                $orderId = $mysqli->insert_id;

                // Inserisci gli elementi dell'ordine
                $stmt = $mysqli->prepare("
                    INSERT INTO order_product (order_id, product_id, quantity, unit_price)
                    VALUES (?, ?, ?, ?)
                ");

                foreach ($data['items'] as $item) {
                    $stmt->bind_param("iiid", 
                        $orderId, 
                        $item['product_id'], 
                        $item['quantity'], 
                        $item['price']
                    );
                    $stmt->execute();

                    // Aggiorna lo stock del prodotto
                    $updateStock = $mysqli->prepare("
                        UPDATE product 
                        SET stock = stock - ? 
                        WHERE product_id = ?
                    ");
                    $updateStock->bind_param("ii", $item['quantity'], $item['product_id']);
                    $updateStock->execute();
                }

                // Svuota il carrello dell'utente
                $stmt = $mysqli->prepare("
                    DELETE cp FROM cart_product cp
                    INNER JOIN cart c ON cp.cart_id = c.cart_id
                    WHERE c.user_id = ?
                ");
                $stmt->bind_param("i", $userId);
                $stmt->execute();

                // Commit della transazione
                $mysqli->commit();

                sendJsonResponse([
                    'success' => true,
                    'order_id' => $orderId
                ]);

            } catch (Exception $e) {
                // Rollback in caso di errore
                $mysqli->rollback();
                throw $e;
            }
            break;

        case 'getAll':
            $stmt = $mysqli->prepare("
                SELECT 
                    o.order_id,
                    o.date,
                    o.status,
                    o.address,
                    o.street,
                    o.street_number,
                    o.city,
                    o.postal_code,
                    COUNT(op.product_id) as item_count,
                    SUM(op.quantity * op.unit_price) as total_amount
                FROM `order` o
                LEFT JOIN order_product op ON o.order_id = op.order_id
                WHERE o.user_id = ?
                GROUP BY o.order_id
                ORDER BY o.date DESC
            ");
            
            $stmt->bind_param("i", $userId);
            $stmt->execute();
            $result = $stmt->get_result();
            $orders = $result->fetch_all(MYSQLI_ASSOC);

            // Format dates and addresses
            foreach ($orders as &$order) {
                $order['date'] = date('Y-m-d H:i:s', strtotime($order['date']));
                $order['total_amount'] = number_format($order['total_amount'], 2, '.', '');
                $order['full_address'] = trim($order['street'] . ' ' . $order['street_number'] . ', ' . $order['postal_code'] . ' ' . $order['city']);
            }

            sendJsonResponse(['success' => true, 'orders' => $orders]);
            break;

        case 'get':
            $orderId = $_GET['id'] ?? null;
            if (!$orderId) {
                sendJsonResponse(['error' => 'Order ID is required'], 400);
            }

            // Verifica che l'ordine appartenga all'utente
            $stmt = $mysqli->prepare("
                SELECT 
                    o.*,
                    p.name as product_name,
                    op.quantity,
                    op.unit_price
                FROM `order` o
                LEFT JOIN order_product op ON o.order_id = op.order_id
                LEFT JOIN product p ON op.product_id = p.product_id
                WHERE o.order_id = ? AND o.user_id = ?
            ");
            
            $stmt->bind_param("ii", $orderId, $userId);
            $stmt->execute();
            $result = $stmt->get_result();
            
            if ($result->num_rows === 0) {
                sendJsonResponse(['error' => 'Order not found'], 404);
            }

            $orderDetails = [];
            while ($row = $result->fetch_assoc()) {
                if (empty($orderDetails)) {
                    $orderDetails = [
                        'order_id' => $row['order_id'],
                        'date' => $row['date'],
                        'status' => $row['status'],
                        'address' => $row['address'],
                        'city' => $row['city'],
                        'postal_code' => $row['postal_code'],
                        'items' => []
                    ];
                }
                
                $orderDetails['items'][] = [
                    'product_name' => $row['product_name'],
                    'quantity' => $row['quantity'],
                    'unit_price' => $row['unit_price'],
                    'total' => $row['quantity'] * $row['unit_price']
                ];
            }

            sendJsonResponse(['success' => true, 'order' => $orderDetails]);
            break;

        case 'updateStatus':
            // Verifica i parametri richiesti
            $data = json_decode(file_get_contents('php://input'), true);
            if (!isset($data['order_id']) || !isset($data['status'])) {
                sendJsonResponse(['error' => 'Missing required parameters'], 400);
                return;
            }

            // Verifica che lo stato sia valido
            $validStatuses = ['processing', 'shipped', 'delivered', 'cancelled'];
            if (!in_array($data['status'], $validStatuses)) {
                sendJsonResponse(['error' => 'Invalid status'], 400);
                return;
            }

            // Verifica che l'ordine appartenga all'utente
            $stmt = $mysqli->prepare("
                SELECT status 
                FROM `order` 
                WHERE order_id = ? AND user_id = ?
            ");
            $stmt->bind_param("ii", $data['order_id'], $userId);
            $stmt->execute();
            $result = $stmt->get_result();
            
            if (!$result->fetch_assoc()) {
                sendJsonResponse(['error' => 'Order not found or unauthorized'], 404);
                return;
            }

            // Aggiorna lo stato
            $stmt = $mysqli->prepare("
                UPDATE `order` 
                SET status = ? 
                WHERE order_id = ? AND user_id = ?
            ");
            $stmt->bind_param("sii", $data['status'], $data['order_id'], $userId);
            
            if ($stmt->execute()) {
                sendJsonResponse([
                    'success' => true, 
                    'message' => 'Status updated successfully',
                    'order_id' => $data['order_id'],
                    'status' => $data['status']
                ]);
            } else {
                sendJsonResponse(['error' => 'Failed to update status'], 500);
            }
            break;

        default:
            sendJsonResponse(['error' => 'Invalid action'], 400);
    }
} catch (Exception $e) {
    sendJsonResponse(['error' => $e->getMessage()], 500);
}

// Close database connection
$mysqli->close();
