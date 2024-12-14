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
    
} catch(Exception $e) {
    error_log("Error: " . $e->getMessage());
    $newArrivals = null;
}

// Get categories
$categories = [
    ['name' => 'New Arrivals', 'count' => '208'],
    ['name' => 'Clothes', 'count' => '358'],
    ['name' => 'Bags', 'count' => '160'],
    ['name' => 'Shoes', 'count' => '230'],
    ['name' => 'Electronics', 'count' => '130']
];
?>

<nav class="tabs">
    <div class="tab-container">
        <a href="#" class="tab-item active" data-page="home">Home</a>
        <a href="#" class="tab-item" data-page="category">Category</a>
        <div class="tab-indicator"></div>
    </div>
</nav>

<div class="pages">
    <div class="page home-page active">
        <!-- Banner -->
        <div class="banner">
            <h2>24% off shipping today</h2>
            <p>on bags purchases</p>
            <small>by UNIverseCycling</small>
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
        <div class="categories-grid">
            <?php foreach ($categories as $category): ?>
                <a href="#" class="category-card">
                    <div class="category-image">
                        <img src="/UNIverseCycling/img/categories/<?php echo strtolower(str_replace(' ', '_', $category['name'])); ?>.jpg" 
                             alt="<?php echo $category['name']; ?>">
                    </div>
                    <div class="category-info">
                        <h3><?php echo $category['name']; ?></h3>
                        <span class="product-count"><?php echo $category['count']; ?> Product</span>
                    </div>
                </a>
            <?php endforeach; ?>
        </div>
    </div>
</div>
