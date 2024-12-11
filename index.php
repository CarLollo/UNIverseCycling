<?php
require_once 'config/db_config.php';
session_start();
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>UNIverseCycling</title>
    <link rel="stylesheet" href="css/style.css">
</head>
<body>
    <div class="app">
        <?php include 'pages/header.php'; ?>
        <?php include 'pages/main_content.php'; ?>
        <?php include 'pages/bottom_nav.php'; ?>
    </div>
    <script src="js/app.js"></script>
</body>
</html>
