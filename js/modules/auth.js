import { AuthService } from '../services/auth.service.js';

export class AuthManager {
    constructor() {
        this.init();
    }

    init() {
        this.bindLoginForm();
        this.bindRegisterForm();
        this.bindLogoutButton();
        this.updateAuthUI();
    }

    bindLoginForm() {
        const loginForm = document.getElementById('login-form');
        if (loginForm) {
            loginForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                const email = loginForm.querySelector('[name="email"]').value;
                const password = loginForm.querySelector('[name="password"]').value;

                try {
                    await AuthService.login(email, password);
                    window.location.href = '/';
                } catch (error) {
                    this.showError(error.message);
                }
            });
        }
    }

    bindRegisterForm() {
        const registerForm = document.getElementById('register-form');
        if (registerForm) {
            registerForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                const formData = new FormData(registerForm);
                const userData = Object.fromEntries(formData.entries());

                try {
                    await AuthService.register(userData);
                    window.location.href = '/pages/auth/login.php?registered=true';
                } catch (error) {
                    this.showError(error.message);
                }
            });
        }
    }

    bindLogoutButton() {
        const logoutBtn = document.querySelector('[data-action="logout"]');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', (e) => {
                e.preventDefault();
                AuthService.logout();
            });
        }
    }

    updateAuthUI() {
        const isAuthenticated = AuthService.isAuthenticated();
        const user = AuthService.getCurrentUser();

        document.body.classList.toggle('is-authenticated', isAuthenticated);
        
        const userNameElements = document.querySelectorAll('[data-user-name]');
        userNameElements.forEach(el => {
            if (user) {
                el.textContent = user.name;
            }
        });
    }

    showError(message) {
        const errorContainer = document.querySelector('.auth-error');
        if (errorContainer) {
            errorContainer.textContent = message;
            errorContainer.style.display = 'block';
        }
    }
}

export const authManager = new AuthManager();
