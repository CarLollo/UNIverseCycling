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
        $query = "
            SELECT p.product_id, p.name, p.description, p.price, p.image_path, p.stock
            FROM product p
            WHERE p.product_id = ?";

        try {
            $stmt = $this->mysqli->prepare($query);
            if (!$stmt) {
                throw new Exception("Prepare failed: " . $this->mysqli->error);
            }
            
            $stmt->bind_param("i", $productId);
            $stmt->execute();
            
            if ($stmt->error) {
                throw new Exception("Execute failed: " . $stmt->error);
            }

            $result = $stmt->get_result();
            return $result->fetch_assoc();
        } catch (Exception $e) {
            throw $e;
        }
    }

    public function addToCart($email, $productId, $quantity) {
        // First check if the product is already in the cart
        $checkQuery = "
            SELECT quantity 
            FROM cart 
            WHERE email = ? AND product_id = ?";

        try {
            $stmt = $this->mysqli->prepare($checkQuery);
            if (!$stmt) {
                throw new Exception("Prepare failed: " . $this->mysqli->error);
            }
            
            $stmt->bind_param("si", $email, $productId);
            $stmt->execute();
            
            $result = $stmt->get_result();
            
            if ($result->num_rows > 0) {
                // Update existing cart item
                $updateQuery = "
                    UPDATE cart 
                    SET quantity = quantity + ? 
                    WHERE email = ? AND product_id = ?";
                
                $stmt = $this->mysqli->prepare($updateQuery);
                $stmt->bind_param("isi", $quantity, $email, $productId);
            } else {
                // Insert new cart item
                $insertQuery = "
                    INSERT INTO cart (email, product_id, quantity) 
                    VALUES (?, ?, ?)";
                
                $stmt = $this->mysqli->prepare($insertQuery);
                $stmt->bind_param("sii", $email, $productId, $quantity);
            }
            
            $stmt->execute();
            
            if ($stmt->error) {
                throw new Exception("Execute failed: " . $stmt->error);
            }
            
            return true;
        } catch (Exception $e) {
            throw $e;
        }
    }

    public function getCartItems($email) {
        $query = "
            SELECT c.cart_id, p.product_id, p.name, p.price, p.image_path, c.quantity
            FROM cart c
            JOIN product p ON c.product_id = p.product_id
            WHERE c.email = ?
            ORDER BY c.cart_id DESC";

        try {
            $stmt = $this->mysqli->prepare($query);
            if (!$stmt) {
                throw new Exception("Prepare failed: " . $this->mysqli->error);
            }
            
            $stmt->bind_param("s", $email);
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

    public function getCartCount($email) {
        $query = "
            SELECT COUNT(*) as count
            FROM cart
            WHERE email = ?";

        try {
            $stmt = $this->mysqli->prepare($query);
            if (!$stmt) {
                throw new Exception("Prepare failed: " . $this->mysqli->error);
            }
            
            $stmt->bind_param("s", $email);
            $stmt->execute();
            
            if ($stmt->error) {
                throw new Exception("Execute failed: " . $stmt->error);
            }

            $result = $stmt->get_result();
            $row = $result->fetch_assoc();
            return $row['count'];
        } catch (Exception $e) {
            throw $e;
        }
    }

    public function updateCartItemQuantity($userEmail, $productId, $quantity) {
        $stmt = $this->mysqli->prepare("UPDATE cart SET quantity = ? WHERE email = ? AND product_id = ?");
        $stmt->bind_param("isi", $quantity, $userEmail, $productId);
        $stmt->execute();
        
        if ($stmt->affected_rows === 0) {
            throw new Exception("Cart item not found");
        }
    }

    public function removeFromCart($userEmail, $productId) {
        $stmt = $this->mysqli->prepare("DELETE FROM cart WHERE email = ? AND product_id = ?");
        $stmt->bind_param("si", $userEmail, $productId);
        $stmt->execute();
        
        if ($stmt->affected_rows === 0) {
            throw new Exception("Cart item not found");
        }
    }
}
