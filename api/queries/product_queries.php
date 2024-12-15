<?php
require_once __DIR__ . '/../../config/db_config.php';

class ProductQueries {
    private $mysqli;

    public function __construct($mysqli) {
        $this->mysqli = $mysqli;
    }

    public function getNewArrivals($limit = 6) {
        $query = "
            SELECT DISTINCT p.product_id, p.name, p.price, p.image_path 
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
}
