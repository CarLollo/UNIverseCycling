import { AuthService } from '../services/auth.service.js';

export class NotificationManager {
    constructor() {
        this.container = document.getElementById('notifications-container');
        this.notifications = [];
        this.badge = document.querySelector('.notification-badge');
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
            const result = await this.makeAuthenticatedRequest('/UNIverseCycling/api/notifications/get.php');
            
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
                this.container.innerHTML = '<div class="alert alert-danger">Error loading notifications</div>';
            }
        }
    }

    async createNotification(type, message) {
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
        div.className = `notification ${notification.type} ${notification.isRead ? 'read' : 'unread'}`;
        
        const icon = this.getNotificationIcon(notification.type);
        
        div.innerHTML = `
            <div class="d-flex align-items-start">
                <i class="bi ${icon} notification-icon"></i>
                <div class="notification-content">
                    <div class="notification-title">${notification.type.charAt(0).toUpperCase() + notification.type.slice(1)}</div>
                    <p class="notification-message">${notification.message}</p>
                    <small class="text-muted">${new Date(notification.createdAt).toLocaleString()}</small>
                </div>
            </div>
            ${!notification.isRead ? `
                <button class="close-btn" aria-label="Mark as read">
                    <i class="bi bi-x"></i>
                </button>
            ` : ''}
        `;

        // Add click handler for mark as read button
        const closeBtn = div.querySelector('.close-btn');
        if (closeBtn) {
            closeBtn.addEventListener('click', async (e) => {
                e.preventDefault();
                await this.markAsRead(notification.id);
                div.classList.remove('unread');
                div.classList.add('read');
                closeBtn.remove();
            });
        }

        return div;
    }

    async markAsRead(notificationId) {
        try {
            const result = await this.makeAuthenticatedRequest('/UNIverseCycling/api/notifications/mark-read.php', {
                method: 'POST',
                body: JSON.stringify({ notificationId })
            });
            
            if (result.success) {
                // Update the local notification object
                const notification = this.notifications.find(n => n.id === notificationId);
                if (notification) {
                    notification.isRead = true;
                }
                // Update the badge count
                this.updateBadgeCount();
                return true;
            }
            return false;
        } catch (error) {
            console.error('Error marking notification as read:', error);
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
