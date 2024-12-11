<?php
require_once 'config/db_config.php';

// Debug: Check database connection
if (!$conn) {
    die("Connection failed: " . mysqli_connect_error());
}

try {
    // Query to get products with newarrivals tag
    $newArrivalsQuery = "
        SELECT DISTINCT p.* 
        FROM product p
        INNER JOIN product_tag pt ON p.product_id = pt.product_id
        INNER JOIN tag t ON pt.tag_id = t.tag_id
        WHERE t.name = 'newarrivals'
        ORDER BY p.product_id DESC
        LIMIT 6";

    echo "<!-- Debug: Query: " . htmlspecialchars($newArrivalsQuery) . " -->";

    $newArrivals = $conn->query($newArrivalsQuery);
    
    if (!$newArrivals) {
        throw new Exception("Query failed: " . $conn->error);
    }
    
    // Debug: Print number of results
    echo "<!-- Debug: Number of results: " . ($newArrivals ? $newArrivals->num_rows : 0) . " -->";
    
} catch(Exception $e) {
    error_log("Error: " . $e->getMessage());
    echo "<!-- Debug: Error: " . htmlspecialchars($e->getMessage()) . " -->";
    $newArrivals = null;
}
?>

<nav class="tabs">
    <div class="tab-container">
        <a href="#" class="active" data-page="home">Home</a>
        <a href="#" data-page="category">Category</a>
        <div class="tab-indicator"></div>
    </div>
</nav>

<main>
    <div class="page home-page active">
        <div class="promo-banner">
            <h2>24% off shipping today</h2>
            <p>on bags purchases</p>
            <span class="by">by UNIverseCycling</span>
        </div>

        <section class="new-arrivals">
            <div class="section-header">
                <h3>New Arrivals 🔥</h3>
                <a href="#" class="see-all">See All</a>
            </div>
            <div class="products-grid">
                <?php 
                if ($newArrivals && $newArrivals->num_rows > 0): 
                    while($product = $newArrivals->fetch_assoc()):
                ?>
                    <div class="product-card">
                        <img src="assets/products/<?php echo htmlspecialchars($product['product_tag']); ?>.jpg" 
                             alt="<?php echo htmlspecialchars($product['name']); ?>">
                        <h3><?php echo htmlspecialchars($product['name']); ?></h3>
                        <p class="price">$<?php echo number_format($product['price'], 2); ?></p>
                        <button class="add-to-cart" data-product-id="<?php echo $product['product_id']; ?>">
                            Add to Cart
                        </button>
                    </div>
                <?php 
                    endwhile;
                else: 
                ?>
                    <p>No new arrivals at the moment.</p>
                <?php endif; ?>
            </div>
        </section>
    </div>
</main>
