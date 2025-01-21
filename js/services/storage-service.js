export class StorageService {
    static PREFIX = 'universe_cycling_';

    static set(key, value) {
        try {
            const fullKey = this.PREFIX + key;
            const serializedValue = JSON.stringify(value);
            localStorage.setItem(fullKey, serializedValue);
            console.log(`Storage: Saved ${fullKey}`, { value });
            return true;
        } catch (error) {
            console.error('Storage: Error saving data:', error);
            return false;
        }
    }

    static get(key) {
        try {
            const fullKey = this.PREFIX + key;
            const item = localStorage.getItem(fullKey);
            const value = item ? JSON.parse(item) : null;
            console.log(`Storage: Retrieved ${fullKey}`, { value });
            return value;
        } catch (error) {
            console.error('Storage: Error retrieving data:', error);
            return null;
        }
    }

    static remove(key) {
        const fullKey = this.PREFIX + key;
        localStorage.removeItem(fullKey);
        console.log(`Storage: Removed ${fullKey}`);
    }
}