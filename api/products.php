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

        case 'create':
            try {
                // Verifica l'autenticazione
                $headers = apache_request_headers();
                if (!isset($headers['Authorization'])) {
                    throw new Exception('No authorization token provided');
                }

                $token = str_replace('Bearer ', '', $headers['Authorization']);
                $tokenJson = json_decode(base64_decode($token), true);

                if (!isset($tokenJson['email'])) {
                    throw new Exception('Invalid token format - no email found');
                }

                $userEmail = $tokenJson['email'];

                // Get user ID from email
                $stmt = $mysqli->prepare("SELECT id, type FROM users WHERE email = ?");
                $stmt->bind_param("s", $userEmail);

                if (!$stmt->execute()) {
                    throw new Exception('Failed to get user: ' . $mysqli->error);
                }

                $result = $stmt->get_result();
                $user = $result->fetch_assoc();

                if (!$user) {
                    throw new Exception('User not found');
                }

                if ($user['type'] !== 'admin') {
                    throw new Exception('Unauthorized. Admin access required.');
                }

                // Verifica che sia una richiesta POST
                if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
                    throw new Exception('Method not allowed');
                }

                // Verifica i campi richiesti
                $requiredFields = ['name', 'description', 'price', 'stock', 'color'];
                foreach ($requiredFields as $field) {
                    if (!isset($_POST[$field]) || empty($_POST[$field])) {
                        throw new Exception("Missing required field: $field");
                    }
                }

                // Verifica che sia stato caricato un file
                if (!isset($_FILES['image']) || $_FILES['image']['error'] !== UPLOAD_ERR_OK) {
                    throw new Exception('Image file is required. Error: ' . $_FILES['image']['error']);
                }

                // Verifica la categoria
                $categories = json_decode($_POST['categories'] ?? '[]');
                if (empty($categories)) {
                    throw new Exception('At least one category is required');
                }

                // Prendi la prima categoria selezionata
                $categoryId = $categories[0];
                $stmt = $mysqli->prepare("SELECT name FROM category WHERE category_id = ?");
                $stmt->bind_param("i", $categoryId);
                if (!$stmt->execute()) {
                    throw new Exception('Failed to get category name: ' . $mysqli->error);
                }
                $result = $stmt->get_result();
                $category = $result->fetch_assoc();
                if (!$category) {
                    throw new Exception('Category not found');
                }

                // Crea il nome del file usando il nome del prodotto
                $fileExtension = strtolower(pathinfo($_FILES['image']['name'], PATHINFO_EXTENSION));
                $allowedExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp'];

                if (!in_array($fileExtension, $allowedExtensions)) {
                    throw new Exception('Invalid file type. Allowed: ' . implode(', ', $allowedExtensions));
                }

                // Crea un nome file semplice dal nome del prodotto
                $fileName = strtolower(str_replace(' ', '', $_POST['name'])) . '.' . $fileExtension;

                // Usa la directory della categoria
                $categoryDir = strtolower($category['name']);
                $baseDir = realpath(__DIR__ . '/../img');
                $targetDir = $baseDir . '/' . $categoryDir;
                $uploadFile = $targetDir . '/' . $fileName;

                // Debug info
                error_log("Base directory: " . $baseDir);
                error_log("Target directory: " . $targetDir);
                error_log("Upload file path: " . $uploadFile);
                error_log("Directory exists: " . (is_dir($targetDir) ? 'yes' : 'no'));
                error_log("Directory writable: " . (is_writable($targetDir) ? 'yes' : 'no'));

                // Carica il file
                if (!move_uploaded_file($_FILES['image']['tmp_name'], $uploadFile)) {
                    $error = error_get_last();
                    throw new Exception(sprintf(
                        'Failed to upload image. Error: %s. Source: %s, Target: %s',
                        $error['message'] ?? 'Unknown error',
                        $_FILES['image']['tmp_name'],
                        $uploadFile
                    ));
                }

                // Inizia la transazione
                $mysqli->begin_transaction();

                try {
                    // Inserisci il prodotto
                    $stmt = $mysqli->prepare("
                        INSERT INTO product (name, description, color, price, stock, image_path)
                        VALUES (?, ?, ?, ?, ?, ?)
                    ");

                    $imagePath = "img/$categoryDir/" . $fileName;
                    $stmt->bind_param("sssdis",
                        $_POST['name'],
                        $_POST['description'],
                        $_POST['color'],
                        $_POST['price'],
                        $_POST['stock'],
                        $imagePath
                    );

                    if (!$stmt->execute()) {
                        throw new Exception('Failed to insert product: ' . $mysqli->error);
                    }

                    $productId = $mysqli->insert_id;

                    // Collega le categorie
                    if (isset($_POST['categories'])) {
                        $categories = json_decode($_POST['categories']);
                        if (json_last_error() !== JSON_ERROR_NONE) {
                            throw new Exception('Invalid categories format: ' . json_last_error_msg());
                        }

                        if (!empty($categories)) {
                            $stmt = $mysqli->prepare("INSERT INTO product_category (product_id, category_id) VALUES (?, ?)");
                            foreach ($categories as $categoryId) {
                                $stmt->bind_param("ii", $productId, $categoryId);
                                if (!$stmt->execute()) {
                                    throw new Exception('Failed to link category: ' . $mysqli->error);
                                }
                            }
                        }
                    }

                    $mysqli->commit();
                    sendJsonResponse([
                        'success' => true,
                        'message' => 'Product added successfully',
                        'product_id' => $productId
                    ]);

                } catch (Exception $e) {
                    $mysqli->rollback();
                    // Delete uploaded image if exists
                    if (file_exists($uploadFile)) {
                        unlink($uploadFile);
                    }
                    throw $e;
                }

            } catch (Exception $e) {
                http_response_code(400);
                sendJsonResponse([
                    'success' => false,
                    'error' => $e->getMessage()
                ]);
            }
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
