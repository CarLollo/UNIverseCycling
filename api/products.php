<?php
require_once '../config/db_config.php';
require_once 'queries/product_queries.php';

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
$action = isset($_GET['action']) ? $_GET['action'] : '';

// Handle different actions
switch ($action) {
    case 'getNew':
        try {
            $products = $productQueries->getNewArrivals();
            sendJsonResponse($products);
        } catch (Exception $e) {
            http_response_code(500);
            sendJsonResponse(['error' => $e->getMessage()]);
        }
        break;

    case 'getByCategory':
        if (!isset($_GET['category_id'])) {
            http_response_code(400);
            sendJsonResponse(['error' => 'Category ID is required']);
        }
        
        try {
            $products = $productQueries->getProductsByCategory($_GET['category_id']);
            sendJsonResponse($products);
        } catch (Exception $e) {
            http_response_code(500);
            sendJsonResponse(['error' => $e->getMessage()]);
        }
        break;

    case 'search':
        if (!isset($_GET['query'])) {
            http_response_code(400);
            sendJsonResponse(['error' => 'Search query is required']);
        }
        
        try {
            $products = $productQueries->searchProducts($_GET['query']);
            sendJsonResponse($products);
        } catch (Exception $e) {
            http_response_code(500);
            sendJsonResponse(['error' => $e->getMessage()]);
        }
        break;
        
    default:
        http_response_code(400);
        sendJsonResponse(['error' => 'Invalid action']);
        break;
}

// Close database connection
$mysqli->close();
?>
