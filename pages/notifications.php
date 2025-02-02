<?php
$pageTitle = "Notifications";
?>

<div class="container mt-4">
    <h2>Notifications</h2>

    <div id="notifications-container">
        <!-- Le notifiche verranno caricate qui dinamicamente -->
    </div>
</div>

<template id="notification-template">
    <div class="notification mb-3">
        <div class="alert" role="alert">
            <div class="d-flex justify-content-between align-items-center">
                <div>
                    <em class="notification-icon me-2"></em>
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

<?php include_once __DIR__ . '/../components/navigation/bottomNav.php'; ?>
