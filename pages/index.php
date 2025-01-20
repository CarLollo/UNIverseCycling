<?php
require_once "config/db_config.php";
session_start();
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="description" content="UNIverseCycling - Your premier destination for cycling gear and accessories">
    <meta name="theme-color" content="#003D87">

    <title><?php echo isset($templateParams["titolo"]) ? $templateParams["titolo"] : 'UNIverseCycling'; ?></title>

    <!-- Favicon -->
    <link rel="icon" type="image/png" href="/UNIverseCycling/assets/favicon.png">

    <!-- Bootstrap CSS -->
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet">

    <!-- Bootstrap Icons -->
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.2/font/bootstrap-icons.css">

    <!-- Custom CSS -->
    <link rel="stylesheet" href="/UNIverseCycling/css/custom-bootstrap.css">

    <!-- Preload key resources -->
    <link rel="preconnect" href="https://cdn.jsdelivr.net">
    <link rel="preload" as="style" href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css">
    <link rel="preload" as="style" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.2/font/bootstrap-icons.css">
</head>
<body>
    <!-- Loading Overlay
    <div id="loading-overlay" class="position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center bg-white" style="z-index: 9999;">
        <div class="spinner-grow text-primary" role="status">
            <span class="visually-hidden">Loading...</span>
        </div>
    </div> -->

    <!-- Toast Container -->
    <div class="toast-container position-fixed bottom-0 end-0 p-3"></div>

    <!-- Main App Container -->
    <div class="app-container" id="app">
        <?php include "pages/header.php"; ?>

        <main class="main-content">
            <?php
            if(isset($templateParams["nome"])){
                require($templateParams["nome"]);
            }
            ?>
        </main>

        <?php
        if(isset($templateParams["navbar"])) {
            require($templateParams["navbar"]);
        }
        ?>
    </div>

    <!-- Bootstrap Dependencies -->
    <script src="https://cdn.jsdelivr.net/npm/@popperjs/core@2.11.8/dist/umd/popper.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js"></script>

    <!-- Permette di specificare i file js che servono alla pagina -->
    <?php
    if(isset($templateParams["js"])):
        foreach($templateParams["js"] as $script):
    ?>
        <script type="module" src="<?php echo $script; ?>"></script>
    <?php
        endforeach;
    endif;
    ?>
</body>
</html>