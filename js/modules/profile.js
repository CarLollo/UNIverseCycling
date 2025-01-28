import { AuthService } from '../services/auth.service.js';
import { pageLoader } from './page-loader.js';
import { notificationManager } from './notification-manager.js';


class ProfileManager {
    constructor() {
        this.editProfileModal = null;
        this.changePasswordModal = null;
        this.notificationSettingsModal = null;
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
        const editProfileBtn = document.querySelector('[data-action="edit-profile"]');
        if (editProfileBtn) {
            editProfileBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.editProfileModal.show();
            });
        }

        // Change Password Button
        const changePasswordBtn = document.querySelector('[data-action="change-password"]');
        if (changePasswordBtn) {
            changePasswordBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.changePasswordModal.show();
            });
        }

        // Notification Settings Button
        const notificationSettingsBtn = document.querySelector('[data-action="notification-settings"]');
        if (notificationSettingsBtn) {
            notificationSettingsBtn.addEventListener('click', (e) => {
                e.preventDefault();
                if (this.notificationSettingsModal) {
                    this.notificationSettingsModal.show();
                } else {
                    console.error('Notification settings modal not initialized');
                }
            });
        } else {
            console.error('Notification settings button not found');
        }

        // Logout Button
        const logoutBtn = document.getElementById('logout-btn');
        if (logoutBtn) {
            console.log('Found logout button');
            logoutBtn.addEventListener('click', (e) => {
                console.log('Logout button clicked');
                e.preventDefault();
                this.handleLogout();
            });
        } else {
            console.error('Logout button not found');
        }

        // Edit Profile Form
        const editProfileForm = document.getElementById('edit-profile-form');
        if (editProfileForm) {
            editProfileForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                await this.handleProfileUpdate(e.target);
            });
        }

        // Change Password Form
        const changePasswordForm = document.getElementById('change-password-form');
        if (changePasswordForm) {
            changePasswordForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                await this.handlePasswordChange(e.target);
            });
        }

        // Notification Settings Form
        const notificationSettingsForm = document.getElementById('notification-settings-form');
        if (notificationSettingsForm) {
            notificationSettingsForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                await this.handleNotificationSettings(e.target);
            });
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
profileManager.init();
