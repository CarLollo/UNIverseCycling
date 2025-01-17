// api-service.js
class APIService {
    static BASE_URL = '/UNIverseCycling/api';

    static async request(endpoint, options = {}) {
        try {
            const url = `${this.BASE_URL}${endpoint}`;
            const response = await fetch(url, {
                headers: {
                    'Content-Type': 'application/json',
                    ...options.headers
                },
                ...options
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error('API Request Error:', error);
            throw error;
        }
    }

    static async getNewArrivals() {
        return this.request('/products.php?action=getNew');
    }

    static async getCategories() {
        return this.request('/categories.php?action=getAll');
    }

    static async getProductsByCategory(categoryId) {
        return this.request(`/products.php?action=getByCategory=${categoryId}`);
    }

    static async searchProducts(query) {
        return this.request(`/products.php?action=search&query=${encodeURIComponent(query)}`);
    }

    static async getProductDetails(productId) {
        return this.request(`/products.php?action=getProduct=${productId}`);
    }

    static async getCartItems() {
        return this.request('/cart.php?action=get');
    }

    static async getCartCount() {
        return this.request('/cart.php?action=count');
    }

    static async addToCart(productId, quantity) {
        return this.request('/cart.php?action=add', {
            method: 'POST',
            body: JSON.stringify({ productId, quantity })
        });
    }

    static async updateCartItem(productId, quantity) {
        return this.request('/cart.php?action=update', {
            method: 'POST',
            body: JSON.stringify({ productId, quantity })
        });
    }

    static async removeFromCart(productId) {
        return this.request('/cart.php?action=remove', {
            method: 'POST',
            body: JSON.stringify({ productId })
        });
    }
}

export default APIService;