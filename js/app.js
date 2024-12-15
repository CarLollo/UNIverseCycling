// app.js
import UIManager from './ui-manager.js';
import ProductLoader from './product-loader.js';

document.addEventListener('DOMContentLoaded', () => {
    // Initialize UI Manager
    const uiManager = new UIManager();
    uiManager.initialize();
});