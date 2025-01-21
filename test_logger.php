<?php
require_once __DIR__ . '/utils/logger.php';

$logger = new Logger(__DIR__ . '/logs/test.log');
$logger->log("Test message 1");
$logger->log("Test message 2");

echo "Test completato. Controlla il file logs/test.log";
?>
