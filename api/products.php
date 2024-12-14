<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
require_once '../config/db_config.php';

// Get the requested action
$action = $_GET['action'] ?? '';

// Function to return JSON response
function sendJsonResponse($data) {
    echo json_encode($data);
    exit;
}

// Handle different actions
switch($action) {
    case 'getAll':
        $result = $mysqli->query('SELECT * FROM products');
        $products = $result->fetch_all(MYSQLI_ASSOC);
        sendJsonResponse($products);
        break;
        
    case 'getByCategory':
        $category = $_GET['category'] ?? '';
        
        // Prepare statement
        $stmt = $mysqli->prepare('SELECT * FROM products WHERE category = ?');
        $stmt->bind_param('s', $category);
        $stmt->execute();
        
        // Get results
        $result = $stmt->get_result();
        $products = $result->fetch_all(MYSQLI_ASSOC);
        $stmt->close();
        
        sendJsonResponse($products);
        break;
        
    case 'getNew':
        $result = $mysqli->query('SELECT * FROM products WHERE is_new = 1 LIMIT 10');
        $products = $result->fetch_all(MYSQLI_ASSOC);
        sendJsonResponse($products);
        break;
        
    default:
        sendJsonResponse(['error' => 'Invalid action']);
}

// Close database connection
$mysqli->close();
?>
