<?php
require_once __DIR__ . '/../../config/db_config.php';

class CategoryQueries {
    private $mysqli;

    public function __construct($mysqli) {
        $this->mysqli = $mysqli;
    }

    public function getAllCategories() {
        $query = "
            SELECT c.category_id, c.name, c.image_path, COUNT(pc.product_id) as product_count
            FROM category c
            LEFT JOIN product_category pc ON c.category_id = pc.category_id
            GROUP BY c.category_id, c.name, c.image_path
            ORDER BY c.name";

        try {
            $result = $this->mysqli->query($query);
            if (!$result) {
                throw new Exception("Database error: " . $this->mysqli->error);
            }
            return $result->fetch_all(MYSQLI_ASSOC);
        } catch (Exception $e) {
            throw $e;
        }
    }

    public function getCategoryById($categoryId) {
        $query = "
            SELECT c.category_id, c.name, c.image_path
            FROM category c
            WHERE c.category_id = ?";

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
            return $result->fetch_assoc();
        } catch (Exception $e) {
            throw $e;
        }
    }
}
