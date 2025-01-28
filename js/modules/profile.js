import { AuthService } from '../services/auth.service.js';
import { notificationManager } from './notification-manager.js';

export class ProfileManager {
    constructor() {
        this.editProfileModal = null;
        this.changePasswordModal = null;
        this.notificationSettingsModal = null;
        this.orderHistoryModal = null;
        this.adminProductModal = null;
        this.currentUserData = null;
    }

    async init() {
        try {
            if (!AuthService.isAuthenticated()) {
                console.log('User not logged in, skipping profile initialization');
                return;
            }

            console.log('User type:', AuthService.getUserType());
            console.log('Is admin:', AuthService.isAdmin());

            // Rimuovi elementi admin se l'utente non è admin
            if (!AuthService.isAdmin()) {
                console.log('User is not admin, removing admin elements');
                const adminElements = document.querySelectorAll('.admin-only');
                adminElements.forEach(el => el.remove());
            } else {
                console.log('User is admin, keeping admin elements');
            }

            // Initialize modals
            this.initializeModals();
            
            // Setup event listeners and load data
            this.setupEventListeners();
            await this.loadUserData();

            // Load admin data if user is admin
            if (AuthService.isAdmin()) {
                await this.loadCategories();
            }

        } catch (error) {
            console.error('Error in init:', error);
        }
    }

    initializeModals() {
        try {
            // Initialize base modals
            const editProfileEl = document.getElementById('editProfileModal');
            const changePasswordEl = document.getElementById('changePasswordModal');
            const notificationSettingsEl = document.getElementById('notificationSettingsModal');
            const orderHistoryEl = document.getElementById('orderHistoryModal');

            if (editProfileEl) this.editProfileModal = new bootstrap.Modal(editProfileEl);
            if (changePasswordEl) this.changePasswordModal = new bootstrap.Modal(changePasswordEl);
            if (notificationSettingsEl) this.notificationSettingsModal = new bootstrap.Modal(notificationSettingsEl);
            if (orderHistoryEl) this.orderHistoryModal = new bootstrap.Modal(orderHistoryEl);

            // Initialize admin modal if user is admin
            if (AuthService.isAdmin()) {
                console.log('Initializing admin modal');
                const adminProductEl = document.getElementById('adminProductModal');
                console.log('Admin modal element:', adminProductEl);
                
                if (adminProductEl) {
                    this.adminProductModal = new bootstrap.Modal(adminProductEl);
                    console.log('Admin modal initialized:', this.adminProductModal);
                } else {
                    console.error('Admin modal element not found in DOM');
                }
            }
        } catch (error) {
            console.error('Error initializing modals:', error);
        }
    }

    setupEventListeners() {
        try {
            // Profile actions
            document.querySelector('[data-action="edit-profile"]')?.addEventListener('click', () => {
                this.editProfileModal?.show();
            });

            document.querySelector('[data-action="change-password"]')?.addEventListener('click', () => {
                this.changePasswordModal?.show();
            });

            document.querySelector('[data-action="notification-settings"]')?.addEventListener('click', () => {
                this.notificationSettingsModal?.show();
            });

            document.querySelector('[data-action="order-history"]')?.addEventListener('click', async () => {
                this.orderHistoryModal?.show();
                await this.loadOrders();
            });

            // Admin actions
            if (AuthService.isAdmin()) {
                console.log('Setting up admin event listeners');
                const adminModalBtn = document.querySelector('[data-action="adminProductModal"]');
                console.log('Admin modal button:', adminModalBtn);
                
                if (adminModalBtn && this.adminProductModal) {
                    console.log('Adding click listener to admin button');
                    adminModalBtn.addEventListener('click', () => {
                        console.log('Admin button clicked');
                        if (this.adminProductModal) {
                            console.log('Showing admin modal');
                            this.adminProductModal.show();
                        } else {
                            console.error('Admin modal not initialized');
                        }
                    });
                } else {
                    console.error('Admin modal button or modal not found');
                }

                const saveProductBtn = document.getElementById('saveProductBtn');
                if (saveProductBtn) {
                    saveProductBtn.addEventListener('click', async () => {
                        await this.handleSaveProduct();
                    });
                }
            }

            // Form submissions
            document.getElementById('edit-profile-form')?.addEventListener('submit', async (e) => {
                e.preventDefault();
                await this.handleProfileUpdate(e);
            });

            document.getElementById('change-password-form')?.addEventListener('submit', async (e) => {
                e.preventDefault();
                await this.handlePasswordChange(e);
            });

            document.getElementById('notification-settings-form')?.addEventListener('submit', async (e) => {
                e.preventDefault();
                await this.handleNotificationSettings(e);
            });

            // Logout
            document.getElementById('logout-btn')?.addEventListener('click', () => this.handleLogout());
        } catch (error) {
            console.error('Error in setupEventListeners:', error);
        }
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
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${AuthService.getToken()}`
                }
            });

            const data = await response.json();
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

    async handleProfileUpdate(e) {
        try {
            const formData = {
                firstName: e.target.firstName.value,
                lastName: e.target.lastName.value,
                email: e.target.email.value,
                phone: e.target.phone.value
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

    async handlePasswordChange(e) {
        try {
            const formData = {
                currentPassword: e.target.currentPassword.value,
                newPassword: e.target.newPassword.value,
                confirmPassword: e.target.confirmPassword.value
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
                e.target.reset();
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

    async handleNotificationSettings(e) {
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

    async loadCategories() {
        try {
            const response = await fetch('/UNIverseCycling/api/categories.php?action=getAll');
            const categories = await response.json();
            
            if (Array.isArray(categories)) {
                const select = document.getElementById('productCategories');
                select.innerHTML = '';
                    
                categories.forEach(category => {
                    const option = document.createElement('option');
                    option.value = category.category_id;
                    option.textContent = category.name;
                    select.appendChild(option);
                });
            } else {
                throw new Error('Invalid response format');
            }
        } catch (error) {
            console.error('Error loading categories:', error);
            await notificationManager.createNotification('error', 'Failed to load categories');
        }
    }

    async handleSaveProduct() {
        try {
            const form = document.getElementById('addProductForm');
            const formData = new FormData();

            // Get form values
            const productData = {
                name: document.getElementById('productName').value,
                description: document.getElementById('productDescription').value,
                price: document.getElementById('productPrice').value,
                stock: document.getElementById('productStock').value,
                color: document.getElementById('productColor').value,
                image: document.getElementById('productImage').files[0],
                categories: Array.from(document.getElementById('productCategories').selectedOptions)
                    .map(option => option.value)
            };

            console.log('Product data:', productData);

            // Append to FormData
            formData.append('name', productData.name);
            formData.append('description', productData.description);
            formData.append('price', productData.price);
            formData.append('stock', productData.stock);
            formData.append('color', productData.color);
            formData.append('image', productData.image);
            formData.append('categories', JSON.stringify(productData.categories));

            console.log('Sending request to create product...');
            const response = await fetch('/UNIverseCycling/api/products.php?action=create', {
                method: 'POST',
                body: formData,
                headers: {
                    'Authorization': `Bearer ${AuthService.getToken()}`
                }
            });

            console.log('Response status:', response.status);
            const data = await response.json();
            console.log('Response data:', data);

            if (data.success) {
                this.adminProductModal.hide();
                form.reset();
                await notificationManager.createNotification('success', 'Product added successfully');
            } else {
                throw new Error(data.error || data.message || 'Error adding product');
            }
        } catch (error) {
            console.error('Error saving product:', error);
            await notificationManager.createNotification('error', error.message);
        }
    }
}

export const profileManager = new ProfileManager();
