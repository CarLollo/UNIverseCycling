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
            }
            return data;
        });
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

    static logout() {
        localStorage.removeItem('token');
        localStorage.removeItem('email');
    }
}
