<?php
session_start();
require_once "config/db_config.php";

$templateParams = [
    "title" => "UNIverseCycling",
    "js" => [
        "js/services/api-service.js",
        "js/services/auth.service.js",
        "js/modules/page-loader.js",
        "js/modules/auth.js",
        "js/modules/products.js",
        "js/modules/cart.js",
        "js/modules/categories.js",
        "js/modules/search.js",
        "js/modules/orders.js",
        "js/modules/profile.js",
        "js/modules/notification-manager.js",
        "js/modules/checkout.js",
        "js/main.js"
    ]
];
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title><?php echo $templateParams["title"]; ?></title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.2/font/bootstrap-icons.css">
    <link rel="stylesheet" href="css/custom-bootstrap.css">
    <link rel="stylesheet" href="css/credit-card.css">
</head>
<body>
    <div id="app">
        <?php include "components/header/header.php"; ?>
        
        <?php include "components/navigation/tabsNav.php"; ?>
        <main class="main-content">
            <?php include "pages/home.php"; ?>
        </main>

        <?php include "components/navigation/bottomNav.php"; ?>
    </div>

    <div class="toast-container position-fixed bottom-0 end-0 p-3"></div>

    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js"></script>
    <?php foreach($templateParams["js"] as $script): ?>
        <script type="module" src="<?php echo $script; ?>"></script>
    <?php endforeach; ?>
</body>
</html>