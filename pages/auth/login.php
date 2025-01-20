<?php
$pageTitle = "Login - UNIverseCycling";
?>

<div class="container py-5">
    <div class="row justify-content-center">
        <div class="col-md-6 col-lg-4">
            <div class="card shadow-sm">
                <div class="card-body">
                    <h2 class="text-center mb-4">Login</h2>
                    
                    <?php if (isset($_GET['registered']) && $_GET['registered'] === 'true'): ?>
                        <div class="alert alert-success" role="alert">
                            Registration successful! Please login with your credentials.
                        </div>
                    <?php endif; ?>

                    <div class="auth-error alert alert-danger" style="display: none;" role="alert"></div>

                    <form id="login-form">
                        <div class="mb-3">
                            <label for="email" class="form-label">Email address</label>
                            <input type="email" class="form-control" id="email" name="email" required>
                        </div>
                        <div class="mb-3">
                            <label for="password" class="form-label">Password</label>
                            <input type="password" class="form-control" id="password" name="password" required>
                        </div>
                        <div class="d-grid">
                            <button type="submit" class="btn btn-primary">Login</button>
                        </div>
                    </form>

                    <div class="text-center mt-3">
                        <p class="mb-0">Don't have an account? <a href="register.php">Register here</a></p>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>

<script type="module" src="/js/modules/auth.js"></script>