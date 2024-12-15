<?php
require_once '../config/db_config.php';
require_once 'queries/category_queries.php';

// Set headers
header('Content-Type: application/json');
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");

// Create query object
$categoryQueries = new CategoryQueries($mysqli);

// Helper function to send JSON response
function sendJsonResponse($data) {
    echo json_encode($data);
    exit;
}

// Get the action from the request
$action = isset($_GET['action']) ? $_GET['action'] : '';

// Handle different actions
switch ($action) {
    case 'getAll':
        try {
            $categories = $categoryQueries->getAllCategories();
            sendJsonResponse($categories);
        } catch (Exception $e) {
            http_response_code(500);
            sendJsonResponse(['error' => $e->getMessage()]);
        }
        break;
        
    case 'getById':
        if (!isset($_GET['category_id'])) {
            http_response_code(400);
            sendJsonResponse(['error' => 'Category ID is required']);
        }
        
        try {
            $category = $categoryQueries->getCategoryById($_GET['category_id']);
            if (!$category) {
                http_response_code(404);
                sendJsonResponse(['error' => 'Category not found']);
            }
            sendJsonResponse($category);
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
