<?php
try {
    $stmt = $pdo->query("SELECT p.*, c.name as category_name 
                         FROM product p 
                         JOIN product_category pc ON p.product_id = pc.product_id 
                         JOIN category c ON pc.category_name = c.name");
    $products = $stmt->fetchAll();
} catch(PDOException $e) {
    echo "Error: " . $e->getMessage();
    $products = [];
}
?>

<main>
    <div class="products-grid">
        <?php foreach($products as $product): ?>
            <div class="product-card">
                <img src="assets/products/<?php echo htmlspecialchars($product['product_tag']); ?>.jpg" 
                     alt="<?php echo htmlspecialchars($product['name']); ?>">
                <h3><?php echo htmlspecialchars($product['name']); ?></h3>
                <p class="price">$<?php echo number_format($product['price'], 2); ?></p>
                <button class="add-to-cart" data-product-id="<?php echo $product['product_id']; ?>">
                    Add to Cart
                </button>
            </div>
        <?php endforeach; ?>
    </div>
</main>
