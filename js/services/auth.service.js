export class AuthService {
    static login(email, password) {
        return fetch('/UNIverseCycling/api/auth/login.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        })
        .then(r => r.json())
        .then(data => {
            if (data.success) {
                localStorage.setItem('token', data.token);
                localStorage.setItem('email', data.email);
                localStorage.setItem('userType', data.type);
            }
            return data;
        });
    }

    static register(data) {
        return fetch('/UNIverseCycling/api/auth/register.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        })
        .then(r => r.json());
    }

    static isAuthenticated() {
        return !!localStorage.getItem('token');
    }

    static getEmail() {
        return localStorage.getItem('email');
    }

    static getToken() {
        return localStorage.getItem('token');
    }

    static getUserType() {
        return localStorage.getItem('userType');
    }

    static isAdmin() {
        return this.getUserType() === 'admin';
    }

    static logout() {
        localStorage.removeItem('token');
        localStorage.removeItem('email');
        localStorage.removeItem('userType');
    }
}
