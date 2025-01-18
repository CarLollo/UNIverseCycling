<?php
// Template HTML per la pagina principale
?>

<!-- Navigation Tabs -->
<div class="nav-container sticky-top bg-white border-bottom mb-3">
    <nav class="nav nav-tabs justify-content-center">
        <a class="nav-link active" href="#" data-page="home">Home</a>
        <a class="nav-link" href="#" data-page="categories">Category</a>
    </nav>
</div>

<!-- Main Content -->
<div class="container py-4">
    <!-- Banner Promo -->
    <div class="promo-banner rounded-4 text-white text-center p-4 mb-4">
        <h2 class="h3 mb-2">Welcome to UNIverseCycling</h2>
        <p class="mb-1">Discover our amazing collection of cycling gear</p>
        <small class="text-white-50">by UNIverseCycling</small>
    </div>

    <div class="section mb-4">
        <div class="d-flex justify-content-between align-items-center mb-3">
            <h3 class="h5 mb-0">New Arrivals 🔥</h3>
            <a href="#" class="text-primary text-decoration-none">See All</a>
        </div>

    <!-- Products Container -->
    <div class="products-container">
        <!-- Products will be loaded here -->
        <div class="text-center">
            <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">Loading...</span>
            </div>
        </div>
    </div>
</div>

<script type="module" src="/UNIverseCycling/js/api-service.js"></script>
<script type="module" src="/UNIverseCycling/js/products.js"></script>
<script type="module" src="/UNIverseCycling/js/categories.js"></script>
