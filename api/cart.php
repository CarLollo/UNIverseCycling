<?php
require_once __DIR__ . '/../config/db_config.php';
require_once __DIR__ . '/queries/product_queries.php';

header('Content-Type: application/json');

$action = $_GET['action'] ?? '';
$productQueries = new ProductQueries($mysqli);

// Using a fixed user ID for now
$userId = 1;

try {
    switch ($action) {
        case 'add':
            $productId = $_POST['productId'] ?? null;
            $quantity = $_POST['quantity'] ?? null;

            if (!$productId || !$quantity) {
                throw new Exception('Product ID and quantity are required');
            }

            // Check if there's enough stock before adding to cart
            $product = $productQueries->getProductById($productId);
            if ($product['stock'] < $quantity) {
                throw new Exception('Not enough stock available');
            }

            // Add to cart
            $productQueries->addToCart($userId, $productId, $quantity);
            
            // Get updated cart count
            $cartCount = $productQueries->getCartCount($userId);
            
            echo json_encode(['success' => true, 'cartCount' => $cartCount]);
            break;

        case 'get':
            $items = $productQueries->getCartItems($userId);
            echo json_encode($items);
            break;

        case 'count':
            $count = $productQueries->getCartCount($userId);
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
