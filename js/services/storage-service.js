export class StorageService {
    static PREFIX = 'universe_cycling_';

    static set(key, value) {
        localStorage.setItem(this.PREFIX + key, JSON.stringify(value));
    }

    static get(key) {
        const item = localStorage.getItem(this.PREFIX + key);
        return item ? JSON.parse(item) : null;
    }

    static remove(key) {
        localStorage.removeItem(this.PREFIX + key);
    }

    static clear() {
        Object.keys(localStorage)
            .filter(key => key.startsWith(this.PREFIX))
            .forEach(key => localStorage.removeItem(key));
    }
}