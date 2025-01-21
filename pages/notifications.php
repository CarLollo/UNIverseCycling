<?php 
$pageTitle = "Notifications";
include_once __DIR__ . '/../components/header.php';
?>

<div class="container mt-4">
    <h1>Notifications</h1>
    
    <div id="notifications-container">
        <!-- Le notifiche verranno caricate qui dinamicamente -->
    </div>
</div>

<template id="notification-template">
    <div class="notification mb-3">
        <div class="alert" role="alert">
            <div class="d-flex justify-content-between align-items-center">
                <div>
                    <i class="notification-icon me-2"></i>
                    <span class="notification-message"></span>
                </div>
                <button type="button" class="btn-close" aria-label="Close"></button>
            </div>
        </div>
    </div>
</template>

<script type="module">
    import { NotificationManager } from '../js/modules/notification-manager.js';
    
    document.addEventListener('DOMContentLoaded', () => {
        const notificationManager = new NotificationManager();
        notificationManager.init();
    });
</script>

<?php include_once __DIR__ . '/../components/footer.php'; ?>
