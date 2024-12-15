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

    <!-- Search Results Container -->
    <div class="search-results">
        <!-- Search results will be loaded via AJAX -->
    </div>
</main>
