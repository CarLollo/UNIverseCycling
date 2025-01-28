import { AuthService } from '../services/auth.service.js';

export class NotificationManager {
    constructor() {
        this.container = document.getElementById('notifications-container');
        this.notifications = [];
        this.badge = document.querySelector('.notification-badge');
        this.settings = this.loadSettings();
        this.init();
    }

    init() {
        if (!AuthService.isAuthenticated()) {
            console.log('User not logged in, skipping notifications initialization');
            return;
        }

        this.loadNotifications();
        if (this.badge) {
            this.updateBadgeCount();
            // Aggiorna il contatore ogni minuto
            setInterval(() => {
                if (AuthService.isAuthenticated()) {
                    this.updateBadgeCount();
                }
            }, 60000);
        }

        // Crea il container per i toast se non esiste
        if (!document.querySelector('.toast-container')) {
            const container = document.createElement('div');
            container.className = 'toast-container position-fixed bottom-0 end-0 p-3';
            document.body.appendChild(container);
        }
    }

    loadSettings() {
        const defaultSettings = {
            success: true,
            info: true,
            warning: true,
            error: true
        };

        const savedSettings = localStorage.getItem('notificationSettings');
        return savedSettings ? JSON.parse(savedSettings) : defaultSettings;
    }

    saveSettings(settings) {
        localStorage.setItem('notificationSettings', JSON.stringify(settings));
        this.settings = settings;
        // Ricarica le notifiche quando cambiano i settings
        this.loadNotifications();
    }

    async makeAuthenticatedRequest(url, options = {}) {
        if (!AuthService.isAuthenticated()) {
            throw new Error('User not authenticated');
        }

        const token = AuthService.getToken();
        const defaultOptions = {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        };

        const response = await fetch(url, { ...defaultOptions, ...options });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Request failed');
        }

        return response.json();
    }

    async updateBadgeCount() {
        try {
            const result = await this.makeAuthenticatedRequest('/UNIverseCycling/api/notifications/count-unread.php');
            
            if (result.success && this.badge) {
                const count = result.count;
                if (count > 0) {
                    this.badge.textContent = count > 99 ? '99+' : count;
                    this.badge.classList.remove('d-none');
                } else {
                    this.badge.classList.add('d-none');
                }
            }
        } catch (error) {
            console.error('Error updating notification count:', error);
            this.badge?.classList.add('d-none');
        }
    }

    async loadNotifications() {
        try {
            const result = await this.makeAuthenticatedRequest('/UNIverseCycling/api/notifications/get.php', {
                method: 'POST',
                body: JSON.stringify({ settings: this.settings })
            });
            
            if (result.success) {
                this.notifications = result.notifications;
                this.renderNotifications();
                if (this.badge) {
                    this.updateBadgeCount();
                }
            }
        } catch (error) {
            console.error('Error loading notifications:', error);
            if (this.container) {
                this.container.innerHTML = '<div class="alert alert-danger">Errore nel caricamento delle notifiche</div>';
            }
        }
    }

    async createNotification(type, message) {
        // Se il tipo di notifica è disabilitato, non mostrare nulla
        if (!this.settings[type]) {
            return;
        }

        try {
            const result = await this.makeAuthenticatedRequest('/UNIverseCycling/api/notifications/create.php', {
                method: 'POST',
                body: JSON.stringify({ type, message })
            });
            
            if (result.success) {
                // Aggiorna il contatore delle notifiche non lette
                this.updateBadgeCount();
                return true;
            }
            return false;
        } catch (error) {
            console.error('Error creating notification:', error);
            return false;
        }

        const toast = document.createElement('div');
        toast.className = `toast align-items-center text-white bg-${this.getBackgroundColor(type)} border-0`;
        toast.setAttribute('role', 'alert');
        toast.setAttribute('aria-live', 'assertive');
        toast.setAttribute('aria-atomic', 'true');
        
        toast.innerHTML = `
            <div class="d-flex">
                <div class="toast-body">
                    <i class="${this.getIcon(type)} me-2"></i>
                    ${message}
                </div>
                <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
            </div>
        `;
        
        const container = document.querySelector('.toast-container');
        if (container) {
            container.appendChild(toast);
            const bsToast = new bootstrap.Toast(toast);
            bsToast.show();

            // Rimuovi il toast dopo che è stato nascosto
            toast.addEventListener('hidden.bs.toast', () => {
                toast.remove();
            });
        }
    }

    getBackgroundColor(type) {
        switch (type) {
            case 'success': return 'success';
            case 'info': return 'info';
            case 'warning': return 'warning';
            case 'error': return 'danger';
            default: return 'primary';
        }
    }

    getIcon(type) {
        switch (type) {
            case 'success': return 'bi bi-check-circle';
            case 'info': return 'bi bi-info-circle';
            case 'warning': return 'bi bi-exclamation-triangle';
            case 'error': return 'bi bi-exclamation-circle';
            default: return 'bi bi-bell';
        }
    }

    renderNotifications() {
        if (!this.container) return;
        
        this.container.innerHTML = '';
        
        if (this.notifications.length === 0) {
            this.container.innerHTML = '<div class="text-center py-5">Non ci sono notifiche</div>';
            return;
        }
        
        this.notifications.forEach(notification => {
            const element = this.createNotificationElement(notification);
            this.container.appendChild(element);
        });
    }

    getNotificationIcon(type) {
        switch (type) {
            case 'info':
                return 'bi-info-circle';
            case 'success':
                return 'bi-check-circle';
            case 'warning':
                return 'bi-exclamation-triangle';
            case 'error':
                return 'bi-exclamation-circle';
            default:
                return 'bi-bell';
        }
    }

    createNotificationElement(notification) {
        const div = document.createElement('div');
        div.className = `notification ${notification.type}`;
        
        const icon = this.getNotificationIcon(notification.type);
        
        div.innerHTML = `
            <div class="d-flex align-items-start">
                <i class="bi ${icon} notification-icon"></i>
                <div class="notification-content">
                    <div class="notification-message">${notification.message}</div>
                    <small class="text-muted">${new Date(notification.createdAt).toLocaleString()}</small>
                </div>
            </div>
            <button class="close-btn" aria-label="Close">
                <i class="bi bi-x"></i>
            </button>
        `;

        // Add click handler for X button
        const closeBtn = div.querySelector('.close-btn');
        if (closeBtn) {
            closeBtn.addEventListener('click', async (e) => {
                e.preventDefault();
                if (await this.deleteNotification(notification.id)) {
                    div.remove();
                    // Se non ci sono più notifiche, mostra il messaggio
                    if (this.container.children.length === 0) {
                        this.container.innerHTML = '<div class="text-center py-5">Non ci sono notifiche</div>';
                    }
                }
            });
        }

        return div;
    }

    async deleteNotification(notificationId) {
        try {
            const result = await this.makeAuthenticatedRequest('/UNIverseCycling/api/notifications/delete.php', {
                method: 'POST',
                body: JSON.stringify({ notification_id: notificationId })
            });
            
            if (result.success) {
                // Rimuovi la notifica dall'array locale
                this.notifications = this.notifications.filter(n => n.id !== notificationId);
                // Aggiorna il contatore
                this.updateBadgeCount();
                return true;
            }
            return false;
        } catch (error) {
            console.error('Error deleting notification:', error);
            return false;
        }
    }

    // Metodo statico per creare una nuova notifica
    static async create(type, message) {
        const manager = new NotificationManager();
        try {
            const result = await manager.makeAuthenticatedRequest('/UNIverseCycling/api/notifications/create.php', {
                method: 'POST',
                body: JSON.stringify({ type, message })
            });

            if (result.success) {
                // Aggiorna il contatore nella navbar se esiste
                manager.updateBadgeCount();
            }
            return result;
        } catch (error) {
            console.error('Error creating notification:', error);
            return { success: false, message: error.message };
        }
    }
}

export const notificationManager = new NotificationManager();
window.notificationManager = notificationManager;
