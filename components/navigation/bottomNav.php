<nav class="navbar fixed-bottom bg-light">
    <div class="container-fluid">
        <div class="row w-100">
            <div class="col text-center">
                <a class="nav-link active" href="#" data-page="home">
                    <i class="bi bi-house"></i>
                    <span class="d-block small">Home</span>
                </a>
            </div>
            <div class="col text-center">
                <a class="nav-link" href="#" data-page="cart">
                    <div class="position-relative d-inline-block">
                        <i class="bi bi-bag"></i>
                        <span class="cart-badge badge rounded-pill bg-danger d-flex align-items-center justify-content-center" style="display: none;">0</span>
                    </div>
                    <span class="d-block small">Cart</span>
                </a>
            </div>
            <div class="col text-center">
                <a class="nav-link position-relative" href="#" data-page="notifications">
                    <div class="position-relative d-inline-block">
                        <i class="bi bi-bell"></i>
                        <span class="notification-badge badge rounded-pill bg-danger d-flex align-items-center justify-content-center d-none">
                            0
                        </span>
                    </div>
                    <span class="d-block small">Notification</span>
                </a>
            </div>
            <div class="col text-center">
                <a class="nav-link" href="#" data-page="profile">
                    <i class="bi bi-person"></i>
                    <span class="d-block small">Profile</span>
                </a>
            </div>
        </div>
    </div>
</nav>

<script type="module">
    import { NotificationManager } from '/UNIverseCycling/js/modules/notification-manager.js';
    import { AuthService } from '/UNIverseCycling/js/services/auth.service.js';
    
    // Inizializza il badge solo se l'utente è autenticato
    if (AuthService.isAuthenticated()) {
        const notificationManager = new NotificationManager();
        notificationManager.init();
    }
</script>