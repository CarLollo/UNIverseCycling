<header>
    <div class="logo">
        <img src="assets/logo.svg" alt="UNIverseCycling">
    </div>
    <div class="search-container">
        <button class="search-icon">
            <img src="icons/search-outline.svg" alt="Search">
        </button>
        <div class="search-input">
            <input type="search" placeholder="Search...">
            <button class="close-search">×</button>
        </div>
    </div>
    <div class="user-actions">
        <?php if(isset($_SESSION['user'])): ?>
            <a href="pages/cart.php" class="cart-icon">
                <img src="icons/cart-outline.svg" alt="Cart">
            </a>
            <a href="pages/profile.php" class="profile-icon">
                <img src="icons/person-outline.svg" alt="Profile">
            </a>
        <?php else: ?>
            <a href="pages/login.php" class="login-btn">Login</a>
        <?php endif; ?>
    </div>
</header>
