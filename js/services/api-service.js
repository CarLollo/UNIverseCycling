export class APIService {
    static request(endpoint, options = {}) {
        const token = localStorage.getItem('token');
        const headers = {
            'Content-Type': 'application/json',
            ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
            ...options.headers
        };
        
        const url = '/UNIverseCycling/api' + endpoint;
        console.log('Making request to:', url, options);
        
        return fetch(url, { ...options, headers })
            .then(async response => {
                const text = await response.text();
                console.log('Raw response:', text);
                
                let data;
                try {
                    data = JSON.parse(text);
                } catch (e) {
                    console.error('Failed to parse response:', e);
                    throw new Error('Invalid server response');
                }

                if (!response.ok) {
                    throw new Error(data.error || `HTTP error! status: ${response.status}`);
                }

                return data;
            });
    }

    // Product endpoints
    static getProducts() {
        return this.request('/products.php?action=getAll');
    }

    static async getNewArrivals() {
        return this.request('/products.php?action=getNew');
    }

    static getProductById(id) {
        return this.request('/products.php?action=get&id=' + id);
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
    static getCartItems() {
        return this.request('/cart.php?action=get');
    }

    static async addToCart(productId, quantity = 1) {
        console.log('Adding to cart:', { productId, quantity });
        return this.request('/cart.php?action=add', {
            method: 'POST',
            body: JSON.stringify({ 
                product_id: parseInt(productId), 
                quantity: parseInt(quantity) 
            })
        });
    }

    static async removeFromCart(productId) {
        return await this.request('/cart.php?action=remove', {
            method: 'POST',
            body: JSON.stringify({ product_id: productId })
        });
    }

    static async updateCartQuantity(productId, quantity) {
        return this.request('/cart.php?action=update', {
            method: 'POST',
            body: JSON.stringify({ 
                product_id: parseInt(productId), 
                quantity: parseInt(quantity) 
            })
        });
    }
    
    // Order endpoints
    static async createOrder(orderData) {
        return this.request('/orders.php?action=create', {
            method: 'POST',
            body: JSON.stringify(orderData)
        });
    }

    static async getOrders() {
        return this.request('/orders.php?action=getAll');
    }

    static async getOrderById(orderId) {
        return this.request(`/orders.php?action=get&id=${orderId}`);
    }
}