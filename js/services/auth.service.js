import { APIService } from './api-service.js';
import { StorageService } from './storage-service.js';

export class AuthService {
    static TOKEN_KEY = 'auth_token';
    static USER_KEY = 'user_data';

    static async login(email, password) {
        try {
            const response = await APIService.post('/api/auth/login.php', { email, password });
            if (response.token) {
                StorageService.set(this.TOKEN_KEY, response.token);
                StorageService.set(this.USER_KEY, response.user);
                return response.user;
            }
            throw new Error(response.message || 'Login failed');
        } catch (error) {
            console.error('Login error:', error);
            throw error;
        }
    }

    static async register(userData) {
        try {
            const response = await APIService.post('/api/auth/register.php', userData);
            if (response.success) {
                return response;
            }
            throw new Error(response.message || 'Registration failed');
        } catch (error) {
            console.error('Registration error:', error);
            throw error;
        }
    }

    static async logout() {
        StorageService.remove(this.TOKEN_KEY);
        StorageService.remove(this.USER_KEY);
        window.location.href = '/pages/auth/login.php';
    }

    static isAuthenticated() {
        return !!StorageService.get(this.TOKEN_KEY);
    }

    static getCurrentUser() {
        return StorageService.get(this.USER_KEY);
    }

    static getToken() {
        return StorageService.get(this.TOKEN_KEY);
    }
}
