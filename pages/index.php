<?php
require_once "config/db_config.php";
session_start();
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title><?php echo $templateParams["titolo"]; ?></title>
    <link rel="stylesheet" type="text/css" href="css/style.css">
</head>
<body>
    <div class="app">
        <main>
        <?php include "header.php"; ?>
        <?php
        if(isset($templateParams["nome"])){
            require($templateParams["nome"]);
        }
        ?>
        <?php
        if(isset($templateParams["navbar"])) {
            require($templateParams["navbar"]);
        }
        ?>
        </main>
    </div>

    <script src="/UNIverseCycling/js/app2.js"></script>
</body>
</html>
