export class APIService {
    static BASE_URL = '/UNIverseCycling/api';

    static async request(endpoint, options = {}) {
        try {
            const url = `${this.BASE_URL}${endpoint}`;
            //console.log('Making request to:', url);
            
            const response = await fetch(url, {
                headers: {
                    'Content-Type': 'application/json',
                    ...options.headers
                },
                ...options
            });
            
            const data = await response.json();
            //console.log('API Response:', data);
            
            if (!response.ok) {
                throw new Error(data.message || `HTTP error! status: ${response.status}`);
            }
            
            return data;
        } catch (error) {
            console.error('API Request Error:', error);
            throw error;
        }
    }

    static async post(endpoint, data = {}) {
        console.log('API: POST request to', endpoint, 'with data:', data);
        
        try {
            const response = await fetch(this.BASE_URL + endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });

            console.log('API: Response status:', response.status);
            const responseData = await response.json();
            console.log('API: Response data:', responseData);

            if (!response.ok) {
                throw new Error(responseData.message || 'API request failed');
            }

            return responseData;
        } catch (error) {
            console.error('API: Error in POST request:', error);
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
        return this.post('/cart.php?action=add', { productId, quantity });
    }

    static async removeFromCart(productId) {
        return this.post('/cart.php?action=remove', { productId });
    }

    static async updateCartQuantity(productId, quantity) {
        return this.post('/cart.php?action=update', { productId, quantity });
    }

    // Order endpoints
    static async createOrder() {
        return this.post('/orders.php?action=create', {});
    }

    static async getOrders() {
        return this.request('/orders.php?action=getAll');
    }

    static async getOrderById(orderId) {
        return this.request(`/orders.php?action=get&id=${orderId}`);
    }
}