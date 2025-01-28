import { AuthService } from '../services/auth.service.js';
import { pageLoader } from './page-loader.js';
import { notificationManager } from './notification-manager.js';

class ProfileManager {
    constructor() {
        this.editProfileModal = null;
        this.changePasswordModal = null;
        this.notificationSettingsModal = null;
        this.orderHistoryModal = null;
        this.currentUserData = null;
    }

    init() {
        if (!AuthService.isAuthenticated()) {
            console.log('User not logged in, skipping profile initialization');
            return;
        }
        
        // Initialize Bootstrap modals
        const editProfileModalEl = document.getElementById('editProfileModal');
        const changePasswordModalEl = document.getElementById('changePasswordModal');
        const notificationSettingsModalEl = document.getElementById('notificationSettingsModal');
        const orderHistoryModalEl = document.getElementById('orderHistoryModal');
        
        if (editProfileModalEl) {
            this.editProfileModal = new bootstrap.Modal(editProfileModalEl);
        } else {
            console.error('Edit profile modal not found');
        }
        
        if (changePasswordModalEl) {
            this.changePasswordModal = new bootstrap.Modal(changePasswordModalEl);
        } else {
            console.error('Change password modal not found');
        }

        if (notificationSettingsModalEl) {
            this.notificationSettingsModal = new bootstrap.Modal(notificationSettingsModalEl);
        } else {
            console.error('Notification settings modal not found');
        }

        if (orderHistoryModalEl) {
            this.orderHistoryModal = new bootstrap.Modal(orderHistoryModalEl);
        } else {
            console.error('Order history modal not found');
        }

        // Load user data
        this.loadUserData();
        
        // Bind event listeners
        this.bindEventListeners();
    }

    async loadUserData() {
        try {
            console.log('Loading user data...');
            console.log('Token:', AuthService.getToken());
            
            const response = await fetch('/UNIverseCycling/api/user/profile.php', {
                headers: {
                    'Authorization': `Bearer ${AuthService.getToken()}`
                }
            });
            
            console.log('Response status:', response.status);
            const text = await response.text();
            console.log('Raw response:', text);
            
            try {
                const data = JSON.parse(text);
                console.log('Parsed data:', data);
                
                if (data.success) {
                    this.currentUserData = data.user;
                    this.populateProfileForm();
                    this.loadNotificationSettings();
                } else {
                    throw new Error(data.message || 'Failed to load user data');
                }
            } catch (parseError) {
                console.error('Error parsing JSON:', parseError);
                throw new Error('Invalid response format');
            }
        } catch (error) {
            console.error('Error loading user data:', error);
            await notificationManager.createNotification('error', 'Errore nel caricamento dei dati utente');
        }
    }

    populateProfileForm() {
        if (!this.currentUserData) {
            console.error('No user data available');
            return;
        }

        console.log('Populating form with:', this.currentUserData);
        const form = document.getElementById('edit-profile-form');
        if (!form) {
            console.error('Profile form not found');
            return;
        }

        form.firstName.value = this.currentUserData.first_name || '';
        form.lastName.value = this.currentUserData.last_name || '';
        form.email.value = this.currentUserData.email || '';
        form.phone.value = this.currentUserData.phone || '';
    }

    loadNotificationSettings() {
        const settings = notificationManager.loadSettings();
        
        // Imposta i checkbox in base alle impostazioni salvate
        const types = ['success', 'info', 'warning', 'error'];
        types.forEach(type => {
            const checkbox = document.getElementById(`${type}-notifications`);
            if (checkbox) {
                checkbox.checked = settings[type];
            }
        });
    }

    bindEventListeners() {
        // Edit Profile Button
        document.querySelector('[data-action="edit-profile"]')?.addEventListener('click', () => {
            this.editProfileModal.show();
        });

        // Change Password Button
        document.querySelector('[data-action="change-password"]')?.addEventListener('click', () => {
            this.changePasswordModal.show();
        });

        // Notification Settings Button
        document.querySelector('[data-action="notification-settings"]')?.addEventListener('click', () => {
            this.notificationSettingsModal.show();
        });

        // Order History Button
        document.querySelector('[data-action="order-history"]')?.addEventListener('click', async () => {
            await this.loadOrders();
            this.orderHistoryModal.show();
        });

        // Logout Button
        document.getElementById('logout-btn')?.addEventListener('click', () => this.handleLogout());

        // Edit Profile Form
        document.getElementById('edit-profile-form')?.addEventListener('submit', async (e) => {
            e.preventDefault();
            await this.handleProfileUpdate(e.target);
        });

        // Change Password Form
        document.getElementById('change-password-form')?.addEventListener('submit', async (e) => {
            e.preventDefault();
            await this.handlePasswordChange(e.target);
        });

        // Notification Settings Form
        document.getElementById('notification-settings-form')?.addEventListener('submit', async (e) => {
            e.preventDefault();
            await this.handleNotificationSettings(e.target);
        });
    }

    async loadOrders() {
        try {
            const ordersList = document.getElementById('orders-list');
            if (!ordersList) {
                console.error('Orders list container not found');
                return;
            }

            // Mostra loading spinner
            ordersList.innerHTML = `
                <div class="text-center p-4">
                    <div class="spinner-border text-primary" role="status">
                        <span class="visually-hidden">Loading...</span>
                    </div>
                    <p class="mt-3">Loading orders...</p>
                </div>
            `;

            const response = await fetch('/UNIverseCycling/api/orders.php?action=getAll', {
                headers: {
                    'Authorization': `Bearer ${AuthService.getToken()}`
                }
            });

            const data = await response.json();
            console.log(data);
            if (data.success) {
                this.displayOrders(data.orders);
            } else {
                throw new Error(data.error || 'Failed to load orders');
            }
        } catch (error) {
            console.error('Error loading orders:', error);
            const ordersList = document.getElementById('orders-list');
            if (ordersList) {
                ordersList.innerHTML = `
                    <div class="text-center p-4 text-danger">
                        <i class="bi bi-exclamation-circle fs-1"></i>
                        <p class="mt-3">Error loading orders: ${error.message}</p>
                    </div>
                `;
            }
            await notificationManager.createNotification('error', 'Error loading orders');
        }
    }

    displayOrders(orders) {
        const ordersList = document.getElementById('orders-list');
        if (!ordersList) {
            console.error('Orders list container not found');
            return;
        }

        if (!Array.isArray(orders) || orders.length === 0) {
            ordersList.innerHTML = `
                <div class="text-center p-4">
                    <i class="bi bi-bag-x fs-1 text-muted"></i>
                    <p class="mt-3">No orders found</p>
                </div>
            `;
            return;
        }

        ordersList.innerHTML = '';
        orders.forEach(order => {
            const orderElement = document.createElement('div');
            orderElement.className = 'list-group-item';
            
            const date = new Date(order.date).toLocaleDateString('it-IT', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });

            orderElement.innerHTML = `
                <div class="d-flex justify-content-between align-items-center" data-order-id="${order.order_id}">
                    <div>
                        <h6 class="mb-1">Order #${order.order_id}</h6>
                        <p class="mb-1 text-muted">
                            <small>
                                <i class="bi bi-calendar me-1"></i>${date}
                                <i class="bi bi-geo-alt ms-3 me-1"></i>${order.full_address}
                                <i class="bi bi-box ms-3 me-1"></i>${order.item_count} items
                            </small>
                        </p>
                    </div>
                    <div class="text-end">
                        <span class="badge bg-${this.getStatusBadgeClass(order.status)}">${order.status}</span>
                        <div class="mt-1">
                            <strong>€${order.total_amount}</strong>
                        </div>
                        ${order.status === 'processing' ? `
                            <button class="btn btn-sm btn-outline-primary mt-2" onclick="ordersManager.startStatusSimulation(${order.order_id})">
                                <i class="bi bi-play-fill"></i> Simula consegna
                            </button>
                        ` : ''}
                    </div>
                </div>
            `;
            ordersList.appendChild(orderElement);
        });
    }

    getStatusBadgeClass(status) {
        switch (status.toLowerCase()) {
            case 'processing':
                return 'warning';
            case 'shipped':
                return 'info';
            case 'delivered':
                return 'success';
            case 'cancelled':
                return 'danger';
            default:
                return 'secondary';
        }
    }

    async handleProfileUpdate(form) {
        try {
            const formData = {
                firstName: form.firstName.value,
                lastName: form.lastName.value,
                email: form.email.value,
                phone: form.phone.value
            };

            const response = await fetch('/UNIverseCycling/api/user/update-profile.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${AuthService.getToken()}`
                },
                body: JSON.stringify(formData)
            });

            const data = await response.json();
            if (data.success) {
                this.editProfileModal.hide();
                await this.loadUserData();
                await notificationManager.createNotification('success', 'Profilo aggiornato con successo');
            } else {
                throw new Error(data.message || 'Failed to update profile');
            }
        } catch (error) {
            console.error('Error updating profile:', error);
            await notificationManager.createNotification('error', 'Errore durante l\'aggiornamento del profilo');
        }
    }

    async handlePasswordChange(form) {
        try {
            const formData = {
                currentPassword: form.currentPassword.value,
                newPassword: form.newPassword.value,
                confirmPassword: form.confirmPassword.value
            };

            const response = await fetch('/UNIverseCycling/api/user/change-password.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${AuthService.getToken()}`
                },
                body: JSON.stringify(formData)
            });

            const data = await response.json();
            if (data.success) {
                form.reset();
                this.changePasswordModal.hide();
                await notificationManager.createNotification('success', 'Password modificata con successo');
            } else {
                throw new Error(data.message || 'Failed to change password');
            }
        } catch (error) {
            console.error('Error changing password:', error);
            await notificationManager.createNotification('error', 'Errore durante il cambio password');
        }
    }

    async handleNotificationSettings(form) {
        try {
            const settings = {
                success: document.getElementById('success-notifications').checked,
                info: document.getElementById('info-notifications').checked,
                warning: document.getElementById('warning-notifications').checked,
                error: document.getElementById('error-notifications').checked
            };

            notificationManager.saveSettings(settings);
            await notificationManager.createNotification('success', 'Impostazioni notifiche salvate');
            this.notificationSettingsModal.hide();
        } catch (error) {
            console.error('Error saving notification settings:', error);
            await notificationManager.createNotification('error', 'Errore durante il salvataggio delle impostazioni');
        }
    }

    async handleLogout() {
        try {
            await notificationManager.createNotification('info', 'Logout effettuato con successo');
            await AuthService.logout();
            pageLoader.loadPage('login');
        } catch (error) {
            console.error('Error during logout:', error);
            await notificationManager.createNotification('error', 'Errore durante il logout');
        }
    }
}


export const profileManager = new ProfileManager();
window.profileManager = profileManager;
