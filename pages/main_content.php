<?php
// Template HTML, i dati verranno caricati via AJAX
?>

<!-- Navigation Tabs -->
<div class="nav-container sticky-top bg-white border-bottom mb-3">
    <nav class="nav nav-tabs justify-content-center">
        <a class="nav-link active" href="#" data-page="home">Home</a>
        <a class="nav-link" href="#" data-page="categories">Categories</a>
    </nav>
</div>

<div class="container-fluid px-3">
    <!-- Home Page -->
    <div class="page home-page active">
        <!-- Banner Promo -->
        <div class="promo-banner rounded-4 text-white text-center p-4 mb-4">
            <h2 class="h3 mb-2">Welcome to UNIverseCycling</h2>
            <p class="mb-1">Discover our amazing collection of cycling gear</p>
            <small class="text-white-50">by UNIverseCycling</small>
        </div>

        <!-- New Arrivals Section -->
        <div class="section mb-4">
            <div class="d-flex justify-content-between align-items-center mb-3">
                <h3 class="h5 mb-0">New Arrivals 🔥</h3>
                <a href="#" class="text-primary text-decoration-none">See All</a>
            </div>
            
            <div id="newArrivalsContainer">
                <!-- Products will be loaded via AJAX -->
                <div class="row row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-lg-4 g-3">
                    <!-- Loading placeholder -->
                    <div class="col">
                        <div class="product-card h-100 placeholder-glow">
                            <div class="product-image-wrapper bg-light"></div>
                            <div class="product-info p-3">
                                <div class="placeholder col-8 mb-2"></div>
                                <div class="placeholder col-4"></div>
                            </div>
                        </div>
                    </div>
                    <div class="col">
                        <div class="product-card h-100 placeholder-glow">
                            <div class="product-image-wrapper bg-light"></div>
                            <div class="product-info p-3">
                                <div class="placeholder col-8 mb-2"></div>
                                <div class="placeholder col-4"></div>
                            </div>
                        </div>
                    </div>
                    <div class="col">
                        <div class="product-card h-100 placeholder-glow">
                            <div class="product-image-wrapper bg-light"></div>
                            <div class="product-info p-3">
                                <div class="placeholder col-8 mb-2"></div>
                                <div class="placeholder col-4"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- Categories Page -->
    <div class="page categories-page">
        <div class="categories-grid">
            <!-- Categories will be loaded via AJAX -->
        </div>
    </div>
</div>

<!-- Bottom Navigation -->
<nav class="navbar fixed-bottom bg-white border-top">
    <div class="container-fluid">
        <div class="row w-100">
            <div class="col text-center">
                <a href="#" class="nav-link active" data-page="home">
                    <i class="bi bi-house-door"></i>
                    <span class="d-block small">Home</span>
                </a>
            </div>
            <div class="col text-center">
                <a href="#" class="nav-link" data-page="orders">
                    <i class="bi bi-bag"></i>
                    <span class="d-block small">My Order</span>
                </a>
            </div>
            <div class="col text-center">
                <a href="#" class="nav-link" data-page="favorites">
                    <i class="bi bi-heart"></i>
                    <span class="d-block small">Favorite</span>
                </a>
            </div>
            <div class="col text-center">
                <a href="#" class="nav-link" data-page="profile">
                    <i class="bi bi-person"></i>
                    <span class="d-block small">My Profile</span>
                </a>
            </div>
        </div>
    </div>
</nav>
