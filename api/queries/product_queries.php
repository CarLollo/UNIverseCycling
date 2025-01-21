<?php
require_once __DIR__ . '/../../config/db_config.php';

class ProductQueries {
    private $mysqli;

    public function __construct($mysqli) {
        $this->mysqli = $mysqli;
    }

    public function getNewArrivals($limit = 6) {
        $query = "
            SELECT DISTINCT p.product_id, p.name, p.description, p.price, p.image_path
            FROM product p
            INNER JOIN product_tag pt ON p.product_id = pt.product_id
            INNER JOIN tag t ON pt.tag_id = t.tag_id
            WHERE t.name = 'newarrivals'
            ORDER BY p.product_id DESC
            LIMIT ?";

        try {
            $stmt = $this->mysqli->prepare($query);
            $stmt->bind_param("i", $limit);
            $stmt->execute();
            $result = $stmt->get_result();
            return $result->fetch_all(MYSQLI_ASSOC);
        } catch (Exception $e) {
            error_log("Error in getNewArrivals: " . $e->getMessage());
            return [];
        }
    }

    public function getProductsByCategory($categoryId) {
        $query = "
            SELECT p.product_id, p.name, p.description, p.price, p.image_path
            FROM product p
            JOIN product_category pc ON p.product_id = pc.product_id
            WHERE pc.category_id = ?
            ORDER BY p.name";

        try {
            $stmt = $this->mysqli->prepare($query);
            if (!$stmt) {
                throw new Exception("Prepare failed: " . $this->mysqli->error);
            }

            $stmt->bind_param("i", $categoryId);
            $stmt->execute();

            if ($stmt->error) {
                throw new Exception("Execute failed: " . $stmt->error);
            }

            $result = $stmt->get_result();
            return $result->fetch_all(MYSQLI_ASSOC);
        } catch (Exception $e) {
            throw $e;
        }
    }

    public function searchProducts($searchTerm) {
        $query = "
            SELECT DISTINCT p.product_id, p.name, p.price, p.image_path
            FROM product p
            WHERE p.name LIKE ?
            ORDER BY p.name
            LIMIT 20";

        try {
            $searchTerm = "%$searchTerm%";
            $stmt = $this->mysqli->prepare($query);
            $stmt->bind_param("s", $searchTerm);
            $stmt->execute();
            $result = $stmt->get_result();
            return $result->fetch_all(MYSQLI_ASSOC);
        } catch (Exception $e) {
            error_log("Error in searchProducts: " . $e->getMessage());
            return [];
        }
    }

    public function getProductById($productId) {
        error_log("Getting product by ID: $productId");
        $query = "SELECT * FROM product WHERE product_id = ?";
        error_log("Query: $query");
        
        try {
            $stmt = $this->mysqli->prepare($query);
            if (!$stmt) {
                error_log("Failed to prepare query: " . $this->mysqli->error);
                return null;
            }

            $stmt->bind_param("i", $productId);
            if (!$stmt->execute()) {
                error_log("Failed to execute query: " . $stmt->error);
                return null;
            }

            $result = $stmt->get_result();
            $product = $result->fetch_assoc();
            error_log("Product found: " . ($product ? json_encode($product) : "null"));
            
            return $product;
        } catch (Exception $e) {
            error_log("Error in getProductById: " . $e->getMessage());
            return null;
        }
    }

    public function getCartItems($userEmail) {
        error_log("Getting cart items for user: $userEmail");
        
        try {
            // Prima otteniamo lo user_id dall'email
            $userQuery = "SELECT id FROM users WHERE email = ?";
            $stmt = $this->mysqli->prepare($userQuery);
            if (!$stmt) {
                error_log("Failed to prepare user query: " . $this->mysqli->error);
                return [];
            }

            $stmt->bind_param("s", $userEmail);
            if (!$stmt->execute()) {
                error_log("Failed to execute user query: " . $stmt->error);
                return [];
            }

            $result = $stmt->get_result();
            if ($result->num_rows === 0) {
                error_log("User not found: $userEmail");
                return [];
            }

            $user = $result->fetch_assoc();
            $userId = $user['id'];

            // Ora prendiamo il carrello dell'utente
            $query = "
                SELECT 
                    p.*,
                    cp.quantity,
                    cp.added_date
                FROM cart c
                JOIN cart_product cp ON c.cart_id = cp.cart_id
                JOIN product p ON cp.product_id = p.product_id
                WHERE c.user_id = ?
                ORDER BY cp.added_date DESC
            ";

            error_log("Cart query: " . $query);
            
            $stmt = $this->mysqli->prepare($query);
            if (!$stmt) {
                error_log("Failed to prepare cart query: " . $this->mysqli->error);
                return [];
            }

            $stmt->bind_param("i", $userId);
            if (!$stmt->execute()) {
                error_log("Failed to execute cart query: " . $stmt->error);
                return [];
            }

            $result = $stmt->get_result();
            $items = [];
            while ($row = $result->fetch_assoc()) {
                $items[] = [
                    'product_id' => $row['product_id'],
                    'name' => $row['name'],
                    'description' => $row['description'],
                    'price' => $row['price'],
                    'image_path' => $row['image_path'],
                    'quantity' => $row['quantity'],
                    'added_date' => $row['added_date']
                ];
            }

            error_log("Found " . count($items) . " items in cart");
            return $items;
        } catch (Exception $e) {
            error_log("Error getting cart items: " . $e->getMessage());
            return [];
        }
    }

    public function updateCartItemQuantity($userEmail, $productId, $quantity) {
        // First check if the product has enough stock
        $product = $this->getProductById($productId);
        if (!$product || $product['stock'] < $quantity) {
            return false;
        }

        $query = "UPDATE cart SET quantity = ? WHERE email = ? AND product_id = ?";
        try {
            $stmt = $this->mysqli->prepare($query);
            $stmt->bind_param("isi", $quantity, $userEmail, $productId);
            return $stmt->execute();
        } catch (Exception $e) {
            error_log("Error in updateCartItemQuantity: " . $e->getMessage());
            return false;
        }
    }

    public function removeFromCart($productId, $userEmail) {
        try {
            // Prima otteniamo lo user_id dall'email
            $userQuery = "SELECT id FROM users WHERE email = ?";
            $stmt = $this->mysqli->prepare($userQuery);
            if (!$stmt) {
                error_log("Failed to prepare user query: " . $this->mysqli->error);
                return false;
            }

            $stmt->bind_param("s", $userEmail);
            if (!$stmt->execute()) {
                error_log("Failed to execute user query: " . $stmt->error);
                return false;
            }

            $result = $stmt->get_result();
            if ($result->num_rows === 0) {
                error_log("User not found: $userEmail");
                return false;
            }

            $user = $result->fetch_assoc();
            $userId = $user['id'];

            // Ora otteniamo il cart_id
            $cartQuery = "SELECT cart_id FROM cart WHERE user_id = ?";
            $stmt = $this->mysqli->prepare($cartQuery);
            if (!$stmt) {
                error_log("Failed to prepare cart query: " . $this->mysqli->error);
                return false;
            }

            $stmt->bind_param("i", $userId);
            if (!$stmt->execute()) {
                error_log("Failed to execute cart query: " . $stmt->error);
                return false;
            }

            $result = $stmt->get_result();
            if ($result->num_rows === 0) {
                error_log("Cart not found for user: $userEmail");
                return false;
            }

            $cart = $result->fetch_assoc();
            $cartId = $cart['cart_id'];

            // Rimuoviamo il prodotto dal carrello
            $removeQuery = "DELETE FROM cart_product WHERE cart_id = ? AND product_id = ?";
            $stmt = $this->mysqli->prepare($removeQuery);
            if (!$stmt) {
                error_log("Failed to prepare remove query: " . $this->mysqli->error);
                return false;
            }

            $stmt->bind_param("ii", $cartId, $productId);
            if (!$stmt->execute()) {
                error_log("Failed to execute remove query: " . $stmt->error);
                return false;
            }

            return true;
        } catch (Exception $e) {
            error_log("Error removing from cart: " . $e->getMessage());
            return false;
        }
    }

    public function getCartCount($userEmail) {
        $query = "SELECT SUM(quantity) as count FROM cart WHERE email = ?";
        try {
            $stmt = $this->mysqli->prepare($query);
            $stmt->bind_param("s", $userEmail);
            $stmt->execute();

            $result = $stmt->get_result();
            $row = $result->fetch_assoc();

            return $row['count'] ?? 0;
        } catch (Exception $e) {
            error_log("Error in getCartCount: " . $e->getMessage());
            return 0;
        }
    }

    public function addToCart($userEmail, $productId, $quantity = 1) {
        error_log("Adding to cart - Email: $userEmail, Product: $productId, Quantity: $quantity");
        
        // First get user_id from email
        $userQuery = "SELECT id FROM users WHERE email = ?";
        try {
            $stmt = $this->mysqli->prepare($userQuery);
            if (!$stmt) {
                error_log("Failed to prepare user query: " . $this->mysqli->error);
                return false;
            }

            $stmt->bind_param("s", $userEmail);
            if (!$stmt->execute()) {
                error_log("Failed to execute user query: " . $stmt->error);
                return false;
            }

            $result = $stmt->get_result();
            if ($result->num_rows === 0) {
                error_log("User not found with email: $userEmail");
                return false;
            }

            $user = $result->fetch_assoc();
            $userId = $user['id'];
            error_log("Found user ID: $userId");

            // Check if user has a cart
            $cartQuery = "SELECT cart_id FROM cart WHERE user_id = ?";
            $stmt = $this->mysqli->prepare($cartQuery);
            if (!$stmt) {
                error_log("Failed to prepare cart query: " . $this->mysqli->error);
                return false;
            }

            $stmt->bind_param("i", $userId);
            if (!$stmt->execute()) {
                error_log("Failed to execute cart query: " . $stmt->error);
                return false;
            }

            $result = $stmt->get_result();
            
            // If user doesn't have a cart, create one
            if ($result->num_rows === 0) {
                error_log("Creating new cart for user: $userId");
                $createCartQuery = "INSERT INTO cart (user_id) VALUES (?)";
                $stmt = $this->mysqli->prepare($createCartQuery);
                if (!$stmt) {
                    error_log("Failed to prepare create cart query: " . $this->mysqli->error);
                    return false;
                }

                $stmt->bind_param("i", $userId);
                if (!$stmt->execute()) {
                    error_log("Failed to execute create cart query: " . $stmt->error);
                    return false;
                }

                $cartId = $this->mysqli->insert_id;
            } else {
                $cart = $result->fetch_assoc();
                $cartId = $cart['cart_id'];
            }
            error_log("Using cart ID: $cartId");

            // Check if product exists in cart
            $checkQuery = "SELECT quantity FROM cart_product WHERE cart_id = ? AND product_id = ?";
            $stmt = $this->mysqli->prepare($checkQuery);
            if (!$stmt) {
                error_log("Failed to prepare check query: " . $this->mysqli->error);
                return false;
            }

            $stmt->bind_param("ii", $cartId, $productId);
            if (!$stmt->execute()) {
                error_log("Failed to execute check query: " . $stmt->error);
                return false;
            }

            $result = $stmt->get_result();

            if ($result->num_rows > 0) {
                // Update existing quantity
                $row = $result->fetch_assoc();
                $newQuantity = $row['quantity'] + $quantity;
                error_log("Updating quantity from {$row['quantity']} to $newQuantity");

                $updateQuery = "UPDATE cart_product SET quantity = ? WHERE cart_id = ? AND product_id = ?";
                $stmt = $this->mysqli->prepare($updateQuery);
                if (!$stmt) {
                    error_log("Failed to prepare update query: " . $this->mysqli->error);
                    return false;
                }

                $stmt->bind_param("iii", $newQuantity, $cartId, $productId);
                if (!$stmt->execute()) {
                    error_log("Failed to execute update query: " . $stmt->error);
                    return false;
                }
            } else {
                // Insert new product
                error_log("Adding new product to cart");
                $insertQuery = "INSERT INTO cart_product (cart_id, product_id, quantity) VALUES (?, ?, ?)";
                $stmt = $this->mysqli->prepare($insertQuery);
                if (!$stmt) {
                    error_log("Failed to prepare insert query: " . $this->mysqli->error);
                    return false;
                }

                $stmt->bind_param("iii", $cartId, $productId, $quantity);
                if (!$stmt->execute()) {
                    error_log("Failed to execute insert query: " . $stmt->error);
                    return false;
                }
            }

            return true;
        } catch (Exception $e) {
            error_log("Error in addToCart: " . $e->getMessage());
            return false;
        }
    }
}
?>
