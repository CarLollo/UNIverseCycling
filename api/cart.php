<?php
require_once __DIR__ . '/../config/db_config.php';
require_once __DIR__ . '/queries/product_queries.php';

header('Content-Type: application/json');

$action = $_GET['action'] ?? '';
$productQueries = new ProductQueries($mysqli);

// Use test user email
$userEmail = 'test@example.com';

try {
    switch ($action) {
        case 'add':
            // Get product data
            $data = json_decode(file_get_contents('php://input'), true);
            
            if (!isset($data['productId']) || !isset($data['quantity'])) {
                throw new Exception('Missing required fields');
            }

            $productId = $data['productId'];
            $quantity = $data['quantity'];

            if ($quantity <= 0) {
                throw new Exception('Quantity must be greater than 0');
            }

            // Check if there's enough stock before adding to cart
            $product = $productQueries->getProductById($productId);
            if ($product['stock'] < $quantity) {
                throw new Exception('Not enough stock available');
            }

            // Add to cart
            $productQueries->addToCart($userEmail, $productId, $quantity);
            
            // Get updated cart count
            $cartCount = $productQueries->getCartCount($userEmail);
            
            echo json_encode(['success' => true, 'cartCount' => $cartCount]);
            break;

        case 'update':
            $data = json_decode(file_get_contents('php://input'), true);
            
            if (!isset($data['productId']) || !isset($data['quantity'])) {
                throw new Exception('Missing required fields');
            }

            $productId = $data['productId'];
            $quantity = $data['quantity'];

            if ($quantity <= 0) {
                throw new Exception('Quantity must be greater than 0');
            }

            // Update cart item
            $productQueries->updateCartItemQuantity($userEmail, $productId, $quantity);
            
            // Get updated cart count
            $cartCount = $productQueries->getCartCount($userEmail);
            
            echo json_encode(['success' => true, 'cartCount' => $cartCount]);
            break;

        case 'remove':
            $data = json_decode(file_get_contents('php://input'), true);
            
            if (!isset($data['productId'])) {
                throw new Exception('Missing product ID');
            }

            $productId = $data['productId'];

            // Remove from cart
            $productQueries->removeFromCart($userEmail, $productId);
            
            // Get updated cart count
            $cartCount = $productQueries->getCartCount($userEmail);
            
            echo json_encode(['success' => true, 'cartCount' => $cartCount]);
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
            throw new Exception('Invalid action');
    }
} catch (Exception $e) {
    http_response_code(400);
    echo json_encode(['error' => $e->getMessage()]);
}

// Close database connection
$mysqli->close();
