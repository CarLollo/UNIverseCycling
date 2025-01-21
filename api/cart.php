<?php
require_once __DIR__ . '/../config/db_config.php';
require_once __DIR__ . '/queries/product_queries.php';

session_start();
header('Content-Type: application/json');

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
    http_response_code(401);
    echo json_encode(['error' => 'Non autenticato']);
    exit;
}

$action = $_GET['action'] ?? '';
error_log("Action: " . $action);

$productQueries = new ProductQueries($mysqli);

try {
    switch ($action) {
        case 'add':
            $rawInput = file_get_contents('php://input');
            $data = json_decode($rawInput, true);
            if (json_last_error() !== JSON_ERROR_NONE) {
                error_log("JSON decode error: " . json_last_error_msg());
                throw new Exception('Invalid JSON: ' . json_last_error_msg());
            }
            
            $product_id = $data['product_id'] ?? null;
            $quantity = $data['quantity'] ?? 1;
            
            if (!$product_id) {
                error_log("Missing product ID");
                throw new Exception('Missing product ID');
            }

            // Verifica che il prodotto esista
            $product = $productQueries->getProductById($product_id);
            if (!$product) {
                error_log("Product not found: $product_id");
                throw new Exception('Product not found');
            }
            error_log("Product found: " . print_r($product, true));

            // Verifica la disponibilità
            if ($product['stock'] < $quantity) {
                error_log("Not enough stock. Requested: $quantity, Available: {$product['stock']}");
                throw new Exception('Not enough stock available');
            }

            $result = $productQueries->addToCart($userEmail, $product_id, $quantity);
            if (!$result) {
                error_log("Failed to add item to cart. Last SQL Error: " . $mysqli->error);
                throw new Exception('Failed to add item to cart');
            }

            // Create notification using the create.php API
            $notificationData = [
                'type' => 'success',
                'message' => "{$product['name']} aggiunto al carrello"
            ];

            $ch = curl_init();
            curl_setopt($ch, CURLOPT_URL, 'http://localhost/UNIverseCycling/api/notifications/create.php');
            curl_setopt($ch, CURLOPT_POST, 1);
            curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($notificationData));
            curl_setopt($ch, CURLOPT_HTTPHEADER, [
                'Content-Type: application/json',
                'Authorization: Bearer ' . $token
            ]);
            curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
            
            $response = curl_exec($ch);
            $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
            curl_close($ch);

            if ($httpCode !== 200) {
                error_log("Failed to create notification. Response: " . $response);
                // Non lanciamo l'eccezione qui perché il prodotto è stato comunque aggiunto al carrello
            }

            echo json_encode(['success' => true]);
            break;

        case 'update':
            $data = json_decode(file_get_contents('php://input'), true);
            
            if (!isset($data['productId']) || !isset($data['quantity'])) {
                error_log("Missing required fields");
                throw new Exception('Missing required fields');
            }

            $product_id = $data['productId'];
            $quantity = $data['quantity'];

            if ($quantity <= 0) {
                error_log("Quantity must be greater than 0");
                throw new Exception('Quantity must be greater than 0');
            }

            // Check stock
            $product = $productQueries->getProductById($product_id);
            if (!$product) {
                error_log("Product not found: $product_id");
                throw new Exception('Product not found');
            }
            error_log("Product found: " . print_r($product, true));
            
            if ($product['stock'] < $quantity) {
                error_log("Not enough stock. Requested: $quantity, Available: {$product['stock']}");
                throw new Exception('Not enough stock available');
            }

            // Update cart item
            $result = $productQueries->updateCartItemQuantity($userEmail, $product_id, $quantity);
            if (!$result) {
                error_log("Failed to update cart item. Last SQL Error: " . $mysqli->error);
                throw new Exception('Failed to update cart item');
            }
            
            // Get updated cart items and count
            $items = $productQueries->getCartItems($userEmail);
            $cartCount = $productQueries->getCartCount($userEmail);
            
            echo json_encode([
                'success' => true, 
                'cartCount' => $cartCount,
                'items' => $items
            ]);
            break;

        case 'remove':
            $data = json_decode(file_get_contents('php://input'), true);
            $productId = $data['product_id'];
            $email = $userEmail;
            
            if ($productQueries->removeFromCart($productId, $email)) {
                echo json_encode(['success' => true]);
            } else {
                http_response_code(500);
                echo json_encode(['error' => 'Failed to remove item from cart']);
            }
            break;

        case 'get':
            $items = $productQueries->getCartItems($userEmail);
            echo json_encode($items);
            break;

        case 'count':
            $count = $productQueries->getCartCount($userEmail);
            echo json_encode(['count' => $count]);
            break;

        default:
            error_log("Invalid action");
            throw new Exception('Invalid action');
    }
} catch (Exception $e) {
    http_response_code(400);
    echo json_encode(['error' => $e->getMessage()]);
}

// Close database connection
$mysqli->close();
