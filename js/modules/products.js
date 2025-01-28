import { APIService } from '../services/api-service.js';
import { pageLoader } from './page-loader.js';
import { notificationManager } from './notification-manager.js';
import { AuthService } from '../services/auth.service.js';

export class ProductsManager {
    constructor() {
        // Cache dei prodotti
        this.products = new Map();
        this.selectedColor = null;
        this.currentView = null;
        this.productsContainer = null;
    }

    init() {
        if (!AuthService.isAuthenticated()) {
            console.log('User not logged in, skipping products initialization');
            return;
        }
        this.productsContainer = document.querySelector('.products-container');
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Click sulle card dei prodotti
        document.addEventListener('click', (e) => {
            const card = e.target.closest('.product-card');
            if (card) {
                const productId = card.dataset.productId;
                if (productId) {
                    this.handleProductClick(productId);
                }
            }
        });
    }

    async loadNewArrivals() {
        if (!this.productsContainer) {
            console.error('Products container not found!');
            return;
        }

        try {
            this.showLoading();
            this.currentView = 'home';

            // Carica i nuovi arrivi
            const products = await APIService.getNewArrivals();
            
            // Salva nella cache
            products.forEach(product => {
                this.products.set(product.product_id, product);
            });
            
            // Renderizza la griglia
            this.productsContainer.innerHTML = this.renderProductsGrid(products);
        } catch (error) {
            await notificationManager.createNotification('error', 'Errore durante il caricamento dei prodotti');
            this.showError('Error loading products. Please try again later.');
        } finally {
            this.hideLoading();
        }
    }

    async loadCategoryProducts(categoryId) {
        if (!this.productsContainer) return;

        try {
            this.showLoading();
            this.currentView = 'category';

            const products = await APIService.getProductsByCategory(categoryId);
            
            products.forEach(product => {
                this.products.set(product.product_id, product);
            });
            
            this.productsContainer.innerHTML = this.renderProductsGrid(products);
        } catch (error) {
            await notificationManager.createNotification('error', 'Errore durante la rimozione dal carrello');
            this.showError('Error loading category products. Please try again later.');
        } finally {
            this.hideLoading();
        }
    }

    renderProductsGrid(products) {
        if (!products || products.length === 0) {
            return '<div class="alert alert-info">No products available</div>';
        }

        return `
            <div class="row row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-lg-4 g-3">
                ${products.map(product => this.renderProductCard(product)).join('')}
            </div>
        `;
    }

    renderProductCard(product) {
        const imagePath = product.image_path.startsWith('/') 
            ? `/UNIverseCycling${product.image_path}`
            : `/UNIverseCycling/${product.image_path}`;

        return `
            <div class="col-md-4 mb-4">
                <div class="card h-100 product-card" data-product-id="${product.product_id}" role="button">
                    <img src="${imagePath}" 
                         class="card-img-top" 
                         alt="${product.name}"
                         style="height: 200px; object-fit: cover;"
                         onerror="this.src='/UNIverseCycling/img/placeholder.jpg'">
                    <div class="card-body d-flex flex-column">
                        <h5 class="card-title">${product.name}</h5>
                        <p class="card-text text-primary mb-0">€${parseFloat(product.price).toFixed(2)}</p>
                    </div>
                </div>
            </div>
        `;
    }

    handleProductClick(productId) {
        pageLoader.loadPage('product', { id: productId });
    }

    async showProductDetails(productId, updateHistory = true) {
        try {
            const product = await APIService.getProductDetails(productId);
            
            const mainContent = document.querySelector('.main-content');
            if (!mainContent) return;

            mainContent.innerHTML = `
                <div class="container mt-4">
                    ${pageLoader.getBackLink()}
                    <div class="row">
                        <div class="col-md-6">
                            <img src="${product.image_path.startsWith('/') ? `/UNIverseCycling${product.image_path}` : `/UNIverseCycling/${product.image_path}`}" 
                                 class="img-fluid rounded" 
                                 alt="${product.name}">
                        </div>
                        <div class="col-md-6">
                            <h1>${product.name}</h1>
                            <p class="h3 text-primary">€${parseFloat(product.price).toFixed(2)}</p>
                            <p class="my-4">${product.description || 'No description available.'}</p>
                            
                            <div class="mb-3">
                                <label class="form-label">Quantity:</label>
                                <div class="input-group" style="width: 140px;">
                                    <button class="btn btn-outline-secondary" type="button" onclick="productsManager.updateQuantity(-1)">
                                        <i class="bi bi-dash"></i>
                                    </button>
                                    <input type="number" class="form-control text-center quantity-input" 
                                           value="1" min="1" max="${product.stock || 10}">
                                    <button class="btn btn-outline-secondary" type="button" onclick="productsManager.updateQuantity(1)">
                                        <i class="bi bi-plus"></i>
                                    </button>
                                </div>
                            </div>

                            <button class="btn btn-primary w-100" onclick="productsManager.handleAddToCart(${productId})">
                                Add to Cart
                            </button>
                        </div>
                    </div>
                </div>
            `;
            
        } catch (error) {
            console.error('Error loading product details:', error);
            const mainContent = document.querySelector('.main-content');
            if (mainContent) {
                mainContent.innerHTML = `
                    <div class="container mt-4">
                        <div class="alert alert-danger">Error loading product details. Please try again.</div>
                    </div>
                `;
            }
        }
    }

    updateQuantity(change) {
        const input = document.querySelector('.quantity-input');
        if (!input) return;

        const currentValue = parseInt(input.value) || 1;
        const maxValue = parseInt(input.max) || 10;
        const newValue = Math.max(1, Math.min(maxValue, currentValue + change));
        input.value = newValue;
    }

    async handleAddToCart(productId) {
        try {
            const quantityInput = document.querySelector('.quantity-input');
            if (!quantityInput) {
                throw new Error('Quantity input not found');
            }

            const quantity = parseInt(quantityInput.value);
            if (isNaN(quantity) || quantity < 1) {
                throw new Error('Please enter a valid quantity');
            }

            // Aggiungi al carrello
            await APIService.addToCart(productId, quantity);
            
            // Crea il toast
            const toastContainer = document.querySelector('.toast-container');
            const toastHtml = `
                <div class="toast align-items-center text-white bg-success border-0" role="alert" aria-live="assertive" aria-atomic="true">
                    <div class="d-flex">
                        <div class="toast-body">
                            <i class="bi bi-check-circle me-2"></i>
                            Item added to cart
                        </div>
                        <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
                    </div>
                </div>
            `;
            
            // Aggiungi il toast al container
            toastContainer.innerHTML = toastHtml;
            
            // Inizializza e mostra il toast
            const toastEl = toastContainer.querySelector('.toast');
            const toast = new bootstrap.Toast(toastEl);
            toast.show();

            // Aggiorna il carrello
            const { cartManager } = await import('./cart.js');
            await cartManager.loadCart();

        } catch (error) {
            await notificationManager.createNotification('error', 'Errore durante l\'aggiunta al carrello');
            this.showError(error.message || 'Error adding product to cart. Please try again later.');
        }
    }

    hideOtherContent() {
        // Nascondi altri contenuti quando mostri i dettagli del prodotto
        const elementsToHide = [
            '.promo-banner',
            '.categories-container',
            '.products-container'
        ];
        
        elementsToHide.forEach(selector => {
            const element = document.querySelector(selector);
            if (element) {
                element.style.display = 'none';
            }
        });
    }

    showProductsList() {
        const params = new URLSearchParams(window.location.search);
        const categoryId = params.get('id');
        
        if (categoryId) {
            this.loadCategoryProducts(categoryId);
        } else {
            this.loadNewArrivals();
        }
    }

    getBackLink() {
        return pageLoader.getBackLink();
    }

    showLoading() {
        const overlay = document.createElement('div');
        overlay.className = 'loading-overlay';
        overlay.innerHTML = `
            <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">Loading...</span>
            </div>
        `;
        document.body.appendChild(overlay);
    }

    hideLoading() {
        const overlay = document.querySelector('.loading-overlay');
        if (overlay) {
            overlay.remove();
        }
    }

    showError(message) {
        const toast = document.createElement('div');
        toast.className = 'toast align-items-center text-white bg-danger border-0';
        toast.setAttribute('role', 'alert');
        toast.setAttribute('aria-live', 'assertive');
        toast.setAttribute('aria-atomic', 'true');
        
        toast.innerHTML = `
            <div class="d-flex">
                <div class="toast-body">${message}</div>
                <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
            </div>
        `;
        
        const container = document.querySelector('.toast-container');
        if (container) {
            container.appendChild(toast);
            const bsToast = new bootstrap.Toast(toast);
            bsToast.show();

            // Rimuovi il toast dopo che è stato nascosto
            toast.addEventListener('hidden.bs.toast', () => {
                toast.remove();
            });
        }
    }
}

// Esporta l'istanza e rendila globale
export const productsManager = new ProductsManager();
window.productsManager = productsManager;