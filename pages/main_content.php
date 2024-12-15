<?php
// Il file ora è solo un template HTML, tutti i dati verranno caricati via AJAX
?>

<nav class="tabs">
    <div class="tab-container">
        <a href="#" class="active" data-page="home">Home</a>
        <a href="#" data-page="categories">Categories</a>
        <div class="tab-indicator"></div>
    </div>
</nav>

<main>
    <!-- Home Page -->
    <div class="page home-page active">
        <!-- Banner Promo -->
        <div class="promo-banner">
            <h2>Welcome to UNIverseCycling</h2>
            <p>Discover our amazing collection of cycling gear</p>
            <span class="by">by UNIverseCycling</span>
        </div>

        <!-- New Arrivals Section -->
        <section class="new-arrivals">
            <div class="section-header">
                <h3>New Arrivals 🔥</h3>
                <a href="#" class="see-all">See All</a>
            </div>
            <div class="products-grid">
                <!-- Products will be loaded via AJAX -->
                <div class="loading">Loading new arrivals...</div>
            </div>
        </section>
    </div>

    <!-- Categories Page -->
    <div class="page categories-page">
        <div class="categories-list">
            <!-- Categories will be loaded via AJAX -->
            <div class="loading">Loading categories...</div>
        </div>
    </div>

    <!-- Category Products Page -->
    <div class="page category-products-page">
        <div class="page-header">
            <button class="back-button">
                <span class="back-arrow">←</span> Back
            </button>
            <h2 class="category-title"></h2>
        </div>
        <div class="products-grid">
            <!-- Category products will be loaded via AJAX -->
        </div>
    </div>

    <!-- Product Page -->
    <div class="page product-page">
        <div class="page-header">
            <button class="back-button">
                <span class="back-arrow">←</span> Back
            </button>
            <h2 class="product-title"></h2>
        </div>
        <div class="product-content">
            <div class="product-image-large">
                <img src="" alt="">
            </div>
            <div class="product-details">
                <div class="color-options">
                    <h3>Color</h3>
                    <div class="color-circles"></div>
                </div>
                <div class="product-description">
                    <h3>Description</h3>
                    <p></p>
                </div>
                <div class="product-price">
                    <span class="currency">€</span>
                    <span class="amount"></span>
                </div>
                <div class="product-stock">
                    <span class="stock-label">Available: </span>
                    <span class="stock-amount"></span>
                </div>
                <div class="product-quantity">
                    <label for="quantity">Quantity:</label>
                    <div class="quantity-controls">
                        <button class="quantity-btn minus">-</button>
                        <input type="number" id="quantity" value="1" min="1" class="quantity-input">
                        <button class="quantity-btn plus">+</button>
                    </div>
                </div>
                <button class="add-to-cart">
                    <span class="plus-icon">+</span>
                    Add to cart
                </button>
            </div>
        </div>
    </div>

    <!-- Search Results Container -->
    <div class="search-results">
        <!-- Search results will be loaded via AJAX -->
    </div>

    <div class="page cart-page">
        <div class="cart-header">
            <h2>Shopping Cart</h2>
        </div>
        
        <div class="cart-items">
            <!-- Cart items will be loaded here dynamically -->
        </div>
        
        <div class="cart-summary">
            <div class="subtotal">
                <span>Subtotal:</span>
                <span class="amount">€0.00</span>
            </div>
            <button class="checkout-btn">
                Proceed to Checkout
            </button>
        </div>
    </div>
</main>
