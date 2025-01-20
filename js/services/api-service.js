export class APIService {
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
            
            const data = await response.json();
            console.log('API Response:', data);
            return data;
        } catch (error) {
            console.error('API Request Error:', error);
            throw error;
        }
    }

    // Product endpoints
    static async getNewArrivals() {
        return this.request('/products.php?action=getNew');
    }

    static async getProductsByCategory(categoryId) {
        return this.request(`/products.php?action=getByCategory&category_id=${categoryId}`);
    }

    static async getProductDetails(productId) {
        return this.request(`/products.php?action=getProduct&id=${productId}`);
    }

    static async searchProducts(query) {
        return this.request(`/products.php?action=search&query=${encodeURIComponent(query)}`);
    }

    // Category endpoints
    static async getCategories() {
        return this.request('/categories.php?action=getAll');
    }

    static async getCategoryById(categoryId) {
        return this.request(`/categories.php?action=getCategory&id=${categoryId}`);
    }

    // Cart endpoints
    static async getCartItems() {
        return this.request('/cart.php?action=get');
    }

    static async addToCart(productId, quantity = 1) {
        return this.request('/cart.php?action=add', {
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

    static async updateCartQuantity(productId, quantity) {
        return this.request('/cart.php?action=update', {
            method: 'POST',
            body: JSON.stringify({ productId, quantity })
        });
    }

    // Order endpoints
    static async createOrder() {
        return this.request('/orders.php?action=create', {
            method: 'POST'
        });
    }

    static async getOrders() {
        return this.request('/orders.php?action=getAll');
    }

    static async getOrderById(orderId) {
        return this.request(`/orders.php?action=get&id=${orderId}`);
    }
}