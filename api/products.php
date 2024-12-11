<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
require_once '../config/db_config.php';

$action = $_GET['action'] ?? '';

switch($action) {
    case 'getAll':
        $stmt = $pdo->query('SELECT * FROM products');
        echo json_encode($stmt->fetchAll());
        break;
        
    case 'getByCategory':
        $category = $_GET['category'] ?? '';
        $stmt = $pdo->prepare('SELECT * FROM products WHERE category = ?');
        $stmt->execute([$category]);
        echo json_encode($stmt->fetchAll());
        break;
        
    case 'getNew':
        $stmt = $pdo->query('SELECT * FROM products WHERE is_new = 1 LIMIT 10');
        echo json_encode($stmt->fetchAll());
        break;
        
    default:
        echo json_encode(['error' => 'Invalid action']);
}
?>
