import { APIService } from './api-service.js';
import { StorageService } from './storage-service.js';

export class AuthService {
    static TOKEN_KEY = 'auth_token';
    static USER_KEY = 'user_data';
    static _lastAuthCheck = null;

    static async login(email, password) {
        try {
            const response = await APIService.post('/auth/login.php', { email, password });

            if (!response || typeof response !== 'object') {
                console.error('Auth: Invalid response format', response);
                throw new Error('Invalid server response format');
            }

            if (!response.success) {
                console.error('Auth: Server returned error', response);
                throw new Error(response.message || 'Login failed');
            }

            // Verify response data
            if (!response.token) {
                console.error('Auth: Missing token in response');
                throw new Error('Missing token in response');
            }
            if (!response.user || !response.user.id) {
                console.error('Auth: Missing or invalid user data', response.user);
                throw new Error('Invalid user data in response');
            }

            // Store auth data
            const tokenSaved = StorageService.set(this.TOKEN_KEY, response.token);
            if (!tokenSaved) {
                console.error('Auth: Failed to save token');
                throw new Error('Failed to save token');
            }

            const userSaved = StorageService.set(this.USER_KEY, response.user);
            if (!userSaved) {
                this.clearAuth();
                throw new Error('Failed to save user data');
            }

            // Verifica lo storage senza redirect
            const savedToken = StorageService.get(this.TOKEN_KEY);
            const savedUser = StorageService.get(this.USER_KEY);
            
            if (!savedToken || !savedUser) {
                console.error('Auth: Stored data verification failed', { savedToken: !!savedToken, savedUser: !!savedUser });
                this.clearAuth();
                throw new Error('Failed to verify stored data');
            }

            console.log('Auth: Login successful, data stored');
            // DEBUG: Rimuovere o commentare questa riga quando finito il debug
            return response; // Non fare il redirect
            
            // PROD: Decommentare questa riga quando finito il debug
            // window.location.href = '?page=home';
            
        } catch (error) {
            console.error('Auth: Login error', error);
            this.clearAuth();
            throw error;
        }
    }

    static async register(userData) {
        try {
            const response = await APIService.post('/auth/register.php', userData);
            
            if (!response.success) {
                throw new Error(response.message || 'Registration failed');
            }
            return response;
        } catch (error) {
            throw error;
        }
    }

    static setAuthData(token, user) {
        console.log('Setting auth data:', { token: !!token, user: !!user });
        StorageService.set(this.TOKEN_KEY, token);
        StorageService.set(this.USER_KEY, user);
    }

    static logout() {
        console.log('Auth: Logout - rimozione dati');
        this.clearAuth();
    }

    static isAuthenticated() {
        const token = this.getToken();
        const user = this.getCurrentUser();
        
        // Log solo se è la prima chiamata
        if (!this._lastAuthCheck || Date.now() - this._lastAuthCheck > 1000) {
            console.log('Auth: Checking authentication status', {
                hasToken: !!token,
                hasUser: !!user,
                userData: user
            });
            this._lastAuthCheck = Date.now();
        }
        
        if (!token || !user || !user.id) {
            return false;
        }
        
        return true;
    }

    static clearAuth() {
        console.log('Auth: Clearing authentication data');
        StorageService.remove(this.TOKEN_KEY);
        StorageService.remove(this.USER_KEY);
    }

    static getCurrentUser() {
        return StorageService.get(this.USER_KEY);
    }

    static getToken() {
        return StorageService.get(this.TOKEN_KEY);
    }
}
