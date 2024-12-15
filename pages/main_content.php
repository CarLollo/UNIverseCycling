<?php
require_once 'config/db_config.php';

// Debug: Check database connection
if (!$mysqli) {
    die("Connection failed: " . mysqli_connect_error());
}

try {
    // Query to get products with newarrivals tag
    $newArrivalsQuery = "
        SELECT DISTINCT p.product_id, p.name, p.price, p.image_path 
        FROM product p
        INNER JOIN product_tag pt ON p.product_id = pt.product_id
        INNER JOIN tag t ON pt.tag_id = t.tag_id
        WHERE t.name = 'newarrivals'
        ORDER BY p.product_id DESC
        LIMIT 6";

    $newArrivals = $mysqli->query($newArrivalsQuery);
    
    if (!$newArrivals) {
        throw new Exception("Query failed: " . $mysqli->error);
    }

    // Query to get categories with product count
    $categoriesQuery = "
        SELECT c.category_id, c.name, c.image_path, COUNT(pc.product_id) as product_count
        FROM category c
        LEFT JOIN product_category pc ON c.category_id = pc.category_id
        GROUP BY c.category_id, c.name, c.image_path
        ORDER BY c.name";

    $categories = $mysqli->query($categoriesQuery);
    
    if (!$categories) {
        throw new Exception("Categories query failed: " . $mysqli->error);
    }
    
} catch(Exception $e) {
    error_log("Error: " . $e->getMessage());
    $newArrivals = null;
    $categories = null;
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
        <!-- New Arrivals -->
        <section class="new-arrivals">
            <div class="section-header">
                <h3>New Arrivals 🔥</h3>
                <a href="#" class="see-all">See All</a>
            </div>
            <div class="products-grid">
                <?php if ($newArrivals && $newArrivals->num_rows > 0): ?>
                    <?php while($product = $newArrivals->fetch_assoc()): ?>
                        <div class="product-card">
                            <div class="product-image">
                                <img src="/UNIverseCycling/<?php echo htmlspecialchars($product['image_path']); ?>" 
                                     alt="<?php echo htmlspecialchars($product['name']); ?>"
                                     onerror="this.src='/UNIverseCycling/img/placeholder.jpg'">
                            </div>
                            <div class="product-info">
                                <h3><?php echo htmlspecialchars($product['name']); ?></h3>
                                <p class="price">$<?php echo number_format($product['price'], 2); ?></p>
                            </div>
                        </div>
                    <?php endwhile; ?>
                <?php else: ?>
                    <p class="no-products">No new arrivals at the moment</p>
                <?php endif; ?>
            </div>
        </section>
    </div>

    <div class="page category-page">
        <div class="categories-list">
            <?php if ($categories && $categories->num_rows > 0): ?>
                <?php while($category = $categories->fetch_assoc()): ?>
                    <div class="category-item">
                        <div class="category-info">
                            <div class="category-text">
                                <h3><?php echo htmlspecialchars($category['name']); ?></h3>
                                <span class="product-count"><?php echo $category['product_count']; ?> Products</span>
                            </div>
                            <div class="category-image">
                                <img src="/UNIverseCycling/<?php echo htmlspecialchars($category['image_path']); ?>" 
                                     alt="<?php echo htmlspecialchars($category['name']); ?>"
                                     onerror="this.src='/UNIverseCycling/img/placeholder.jpg'">
                            </div>
                        </div>
                    </div>
                <?php endwhile; ?>
            <?php else: ?>
                <p class="no-categories">No categories available</p>
            <?php endif; ?>
        </div>
    </div>
</main>
