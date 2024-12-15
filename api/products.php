<?php
require_once '../config/db_config.php';
require_once 'queries/product_queries.php';
require_once 'queries/category_queries.php';

// Set headers
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

// Create query objects
$productQueries = new ProductQueries($mysqli);
$categoryQueries = new CategoryQueries($mysqli);

// Helper function to send JSON response
function sendJsonResponse($data) {
    echo json_encode($data);
    exit;
}

// Get the action from the request
$action = $_GET['action'] ?? '';

// Handle different actions
switch ($action) {
    case 'getAll':
        $products = $productQueries->getAllProducts();
        sendJsonResponse($products);
        break;
        
    case 'search':
        if (!isset($_GET['query'])) {
            http_response_code(400);
            sendJsonResponse(['error' => 'Search query is required']);
        }
        
        $products = $productQueries->searchProducts($_GET['query']);
        sendJsonResponse($products);
        break;
        
    case 'getNew':
        $products = $productQueries->getNewArrivals();
        sendJsonResponse($products);
        break;
        
    case 'getByCategory':
        if (!isset($_GET['category_id'])) {
            http_response_code(400);
            sendJsonResponse(['error' => 'Category ID is required']);
        }
        
        $products = $productQueries->getProductsByCategory($_GET['category_id']);
        sendJsonResponse($products);
        break;
        
    default:
        http_response_code(400);
        sendJsonResponse(['error' => 'Invalid action']);
        break;
}

// Close database connection
$mysqli->close();
?>
