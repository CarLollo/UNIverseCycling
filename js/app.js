// app.js
import UIManager from './ui-manager.js';
import DataLoader from './data-loader.js';
import ProductManager from './product-manager.js';
import CartManager from './cart-manager.js';
import APIService from './api-service.js';

class App {
    constructor() {
        this.initialized = false;
        document.addEventListener('DOMContentLoaded', () => {
            this.initializeApp();
        });
    }

    async initializeApp() {
        try {
            if (this.initialized) return;
            
            this.apiService = APIService;
            this.cartManager = new CartManager();
            this.dataLoader = new DataLoader();
            this.productManager = new ProductManager(this.cartManager);
            
            this.uiManager = new UIManager(
                this.dataLoader,
                this.productManager,
                this.cartManager
            );

            await this.uiManager.initialize();
            await this.handleInitialRoute();

            this.initialized = true;
            console.log('App initialized successfully');
        } catch (error) {
            console.error('Error initializing app:', error);
            console.error('Stack trace:', error.stack);
            if (error.response) {
                console.error('Response status:', error.response.status);
                console.error('Response data:', error.response.data);
            }
        }
    }

    async handleInitialRoute() {
        try {
            const urlParams = new URLSearchParams(window.location.search);
            const productId = urlParams.get('product');
            
            if (productId) {
                await this.productManager.showProductDetails(productId);
            }
        } catch (error) {
            console.error('Error handling initial route:', error);
            throw error;
        }
    }
}

const app = new App();
export default app;