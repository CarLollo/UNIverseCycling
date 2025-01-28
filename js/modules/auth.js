import { AuthService } from '../services/auth.service.js';
import { pageLoader } from './page-loader.js';

// Esporta la classe AuthManager
export class AuthManager {
    constructor() {
        console.log('Auth manager initialized');
        this.init();
    }

    init() {
        this.bindLoginForm();
        this.bindRegisterForm();
    }

    bindLoginForm() {
        const loginForm = document.getElementById('login-form');
        console.log('Form trovato:', !!loginForm);
        
        if (loginForm) {
            loginForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                console.log('Form submitted');
                
                const submitButton = loginForm.querySelector('button[type="submit"]');
                submitButton.disabled = true;
                this.clearError();
                
                try {
                    const email = loginForm.querySelector('[name="email"]').value;
                    const password = loginForm.querySelector('[name="password"]').value;
                    console.log('Dati form:', { email });
                    
                    const response = await AuthService.login(email, password);
                    console.log('Risposta login:', response);
                    
                    if (response.success) {
                        console.log('Login success, checking auth...');
                        // Redirect only after confirming data is stored
                        if (AuthService.isAuthenticated()) {
                            console.log('Auth confirmed, redirecting...');
                            pageLoader.loadPage('home');
                        } else {
                            throw new Error('Authentication failed after login');
                        }
                    } else {
                        throw new Error(response.message || 'Login failed');
                    }
                } catch (error) {
                    console.error('Form error:', error);
                    this.showError(error.message || 'Login failed');
                } finally {
                    submitButton.disabled = false;
                }
            });
        }
    }

    bindRegisterForm() {
        const registerForm = document.getElementById('register-form');
        if (registerForm) {
            registerForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                
                const submitButton = registerForm.querySelector('button[type="submit"]');
                submitButton.disabled = true;
                this.clearError();
                
                try {
                    const formData = new FormData(registerForm);
                    const data = {
                        email: formData.get('email'),
                        password: formData.get('password'),
                        firstName: formData.get('firstName'),
                        lastName: formData.get('lastName'),
                        phone: formData.get('phone')
                    };
                    
                    console.log('Sending registration data:', data);
                    
                    // Chiamata esplicita al metodo statico
                    const response = await AuthService.register(data);

                    console.log('Registration response:', response);
                    
                    if (response.success) {
                        pageLoader.loadPage('login');
                    } else {
                        throw new Error(response.message || 'Registration failed');
                    }
                } catch (error) {
                    console.error('Registration error:', error);
                    this.showError(error.message || 'Registration failed');
                } finally {
                    submitButton.disabled = false;
                }
            });
        }
    }

    showError(message) {
        const errorDiv = document.querySelector('.auth-error');
        if (errorDiv) {
            errorDiv.textContent = message;
            errorDiv.style.display = 'block';
        }
    }

    clearError() {
        const errorDiv = document.querySelector('.auth-error');
        if (errorDiv) {
            errorDiv.style.display = 'none';
        }
    }
}

// Esporta l'istanza
export const authManager = new AuthManager();
window.authManager = authManager;
