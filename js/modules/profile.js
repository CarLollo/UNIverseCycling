import { AuthService } from '../services/auth.service.js';
import { pageLoader } from './page-loader.js';

class ProfileManager {
    constructor() {
        this.editProfileModal = null;
        this.changePasswordModal = null;
        this.currentUserData = null;
    }

    init() {
        console.log('ProfileManager initialized');
        
        // Initialize Bootstrap modals
        const editProfileModalEl = document.getElementById('editProfileModal');
        const changePasswordModalEl = document.getElementById('changePasswordModal');
        
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
                } else {
                    throw new Error(data.message || 'Failed to load user data');
                }
            } catch (parseError) {
                console.error('Error parsing JSON:', parseError);
                throw new Error('Invalid response format');
            }
        } catch (error) {
            console.error('Error loading user data:', error);
            alert('Error loading user data: ' + error.message);
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

        // Save Profile Changes
        const saveProfileBtn = document.getElementById('save-profile');
        if (saveProfileBtn) {
            saveProfileBtn.addEventListener('click', () => {
                this.saveProfileChanges();
            });
        }

        // Save Password Changes
        const savePasswordBtn = document.getElementById('save-password');
        if (savePasswordBtn) {
            savePasswordBtn.addEventListener('click', () => {
                this.savePasswordChanges();
            });
        }

        // Logout Button
        const logoutBtn = document.getElementById('logout-btn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => {
                AuthService.logout();
                pageLoader.loadPage('login');
            });
        }
    }

    async saveProfileChanges() {
        const form = document.getElementById('edit-profile-form');
        if (!form) return;

        const currentEmail = this.currentUserData?.email;
        const newEmail = form.email.value.trim();

        const data = {
            firstName: form.firstName.value.trim(),
            lastName: form.lastName.value.trim(),
            email: newEmail,
            phone: form.phone.value.trim()
        };

        try {
            const response = await fetch('/UNIverseCycling/api/user/update-profile.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${AuthService.getToken()}`
                },
                body: JSON.stringify(data)
            });

            const responseText = await response.text();
            
            try {
                const result = JSON.parse(responseText);
                
                if (result.success) {
                    this.editProfileModal.hide();
                    
                    // Se l'email è stata cambiata, fai il logout
                    if (currentEmail && newEmail !== currentEmail) {
                        alert('Email changed. Please login again with your new email.');
                        AuthService.logout();
                        pageLoader.loadPage('login');
                    } else {
                        // Altrimenti ricarica solo la pagina profilo
                        alert(result.message);
                        pageLoader.loadPage('profile');
                    }
                } else {
                    throw new Error(result.message || 'Failed to update profile');
                }
            } catch (parseError) {
                console.error('Response parsing error:', parseError);
                console.error('Raw response:', responseText);
                throw new Error('Server response was not in the expected format');
            }
        } catch (error) {
            console.error('Error updating profile:', error);
            alert(error.message || 'An error occurred while updating your profile');
        }
    }

    async savePasswordChanges() {
        const form = document.getElementById('change-password-form');
        if (!form) return;

        const newPassword = form.newPassword.value;
        const confirmPassword = form.confirmPassword.value;

        if (newPassword !== confirmPassword) {
            alert('New passwords do not match');
            return;
        }

        const data = {
            currentPassword: form.currentPassword.value,
            newPassword: newPassword
        };

        try {
            const response = await fetch('/UNIverseCycling/api/user/change-password.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${AuthService.getToken()}`
                },
                body: JSON.stringify(data)
            });

            const result = await response.json();
            if (result.success) {
                this.changePasswordModal.hide();
                form.reset();
                alert('Password changed successfully');
                pageLoader.loadPage('profile');
            } else {
                alert(result.message || 'Failed to change password');
            }
        } catch (error) {
            console.error('Error changing password:', error);
            alert('An error occurred while changing your password');
        }
    }
}

export const profileManager = new ProfileManager();
