<?php
require_once __DIR__ . '/../config/db_config.php';
require_once __DIR__ . '/queries/product_queries.php';

// Set headers
header('Content-Type: application/json');
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");

// Create query object
$productQueries = new ProductQueries($mysqli);

// Helper function to send JSON response
function sendJsonResponse($data) {
    echo json_encode($data);
    exit;
}

// Get the action from the request
$action = $_GET['action'] ?? '';

try {
    switch ($action) {
        case 'getNew':
            $products = $productQueries->getNewArrivals();
            sendJsonResponse($products);
            break;

        case 'getByCategory':
            $categoryId = $_GET['category_id'] ?? null;
            if (!$categoryId) {
                throw new Exception('Category ID is required');
            }
            $products = $productQueries->getProductsByCategory($categoryId);
            sendJsonResponse($products);
            break;

        case 'getProduct':
            $productId = $_GET['id'] ?? null;
            if (!$productId) {
                throw new Exception('Product ID is required');
            }
            $product = $productQueries->getProductById($productId);
            if (!$product) {
                throw new Exception('Product not found');
            }
            sendJsonResponse($product);
            break;

        case 'search':
            $query = $_GET['query'] ?? '';
            if (empty($query)) {
                throw new Exception('Search query is required');
            }
            $products = $productQueries->searchProducts($query);
            
            header("Content-Type: application/json");
            sendJsonResponse($products);
            break;

        default:
            throw new Exception('Invalid action');
    }
} catch (Exception $e) {
    http_response_code(400);
    sendJsonResponse(['error' => $e->getMessage()]);
}

// Close database connection
$mysqli->close();
?>
