import UIManager from './ui-manager.js';
import DataLoader from './data-loader.js';
import ProductManager from './product-manager.js';
import CartManager from './cart-manager.js';

document.addEventListener('DOMContentLoaded', function() {
    const dataLoader = new DataLoader();
    const cartManager = new CartManager();
    const productManager = new ProductManager(cartManager);
    const uiManager = new UIManager(dataLoader, productManager, cartManager);
    
    uiManager.initialize();
    cartManager.initializeCartCount();
});