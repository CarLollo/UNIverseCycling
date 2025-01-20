import { APIService } from '../services/api-service.js';

export class ProductsManager {
    constructor() {
        console.log('ProductsManager constructor');
        // Cache dei prodotti
        this.products = new Map();
        this.selectedColor = null;
        this.currentView = null;
        this.productsContainer = null;
    }

    init() {
        console.log('ProductsManager init');
        this.productsContainer = document.querySelector('.products-container');
        console.log('Products container:', this.productsContainer);
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

        // Gestisci la navigazione del browser
        window.addEventListener('popstate', (e) => {
            this.handleNavigationState();
        });
    }

    handleInitialState() {
        const params = new URLSearchParams(window.location.search);
        const action = params.get('action');
        const id = params.get('id');

        if (action === 'product' && id) {
            this.showProductDetails(id, false);
        } else if (action === 'category' && id) {
            this.loadCategoryProducts(id);
        } else if (action === 'search') {
            const query = params.get('query');
            if (query) {
                this.loadSearchResults(query);
            }
        } else {
            this.loadNewArrivals();
        }
    }

    handleNavigationState() {
        const params = new URLSearchParams(window.location.search);
        const action = params.get('action');
        const id = params.get('id');

        if (action === 'product' && id) {
            this.showProductDetails(id, false);
        } else {
            this.showProductsList();
        }
    }

    async loadNewArrivals() {
        console.log('Loading new arrivals...');
        if (!this.productsContainer) {
            console.error('Products container not found!');
            return;
        }

        try {
            this.showLoading();
            this.currentView = 'home';

            // Carica i nuovi arrivi
            const products = await APIService.getNewArrivals();
            console.log(products);
            
            // Salva nella cache
            products.forEach(product => {
                this.products.set(product.product_id, product);
            });
            
            // Renderizza la griglia
            this.productsContainer.innerHTML = this.renderProductsGrid(products);
        } catch (error) {
            console.error('Error loading products:', error);
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
            console.error('Error loading category products:', error);
            this.showError('Error loading category products. Please try again later.');
        } finally {
            this.hideLoading();
        }
    }

    async loadSearchResults(query) {
        if (!this.productsContainer) return;

        try {
            this.showLoading();
            this.currentView = 'search';

            const products = await APIService.searchProducts(query);
            
            products.forEach(product => {
                this.products.set(product.product_id, product);
            });
            
            this.productsContainer.innerHTML = this.renderProductsGrid(products);
        } catch (error) {
            console.error('Error loading search results:', error);
            this.showError('Error loading search results. Please try again later.');
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
            <div class="col">
                <div class="product-card h-100" 
                     data-product-id="${product.product_id}"
                     role="button"
                     tabindex="0">
                    <div class="product-image-wrapper">
                        <img src="${imagePath}" 
                             class="product-image" 
                             alt="${product.name}"
                             loading="lazy"
                             onerror="this.src='/UNIverseCycling/assets/images/placeholder.jpg'">
                    </div>
                    <div class="product-info p-3">
                        <h4 class="product-title h6 mb-2">${product.name}</h4>
                        <p class="product-price mb-0">€${parseFloat(product.price).toFixed(2)}</p>
                    </div>
                </div>
            </div>
        `;
    }

    async handleProductClick(productId) {
        try {
            this.showLoading();
            
            let product = this.products.get(productId);
            if (!product) {
                product = await APIService.getProductDetails(productId);
                this.products.set(productId, product);
            }
            
            await this.showProductDetails(productId);
        } catch (error) {
            console.error('Error handling product click:', error);
            this.showError('Error loading product details. Please try again later.');
        } finally {
            this.hideLoading();
        }
    }

    async showProductDetails(productId, updateHistory = true) {
        try {
            let product = this.products.get(productId);
            if (!product) {
                product = await APIService.getProductDetails(productId);
                if (!product) {
                    throw new Error('Product not found');
                }
                this.products.set(productId, product);
            }

            if (updateHistory) {
                const url = new URL(window.location);
                url.searchParams.set('action', 'product');
                url.searchParams.set('id', productId);
                history.pushState({ action: 'product', id: productId }, '', url);
            }

            const mainContent = document.querySelector('.main-content');
            if (!mainContent) {
                throw new Error('Main content container not found');
            }
            
            mainContent.innerHTML = this.renderProductDetails(product);
            
            // Nascondi altri contenuti
            this.hideOtherContent();
            
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
        // Mostra la vista appropriata in base allo stato corrente
        switch (this.currentView) {
            case 'category':
                const categoryId = new URLSearchParams(window.location.search).get('id');
                if (categoryId) {
                    this.loadCategoryProducts(categoryId);
                }
                break;
            case 'search':
                const query = new URLSearchParams(window.location.search).get('query');
                if (query) {
                    this.loadSearchResults(query);
                }
                break;
            default:
                this.loadNewArrivals();
        }

        // Mostra gli elementi nascosti
        const elementsToShow = [
            '.promo-banner',
            '.categories-container',
            '.products-container'
        ];
        
        elementsToShow.forEach(selector => {
            const element = document.querySelector(selector);
            if (element) {
                element.style.display = 'block';
            }
        });
    }

    renderProductDetails(product) {
        const imagePath = product.image_path.startsWith('/') 
            ? `/UNIverseCycling${product.image_path}`
            : `/UNIverseCycling/${product.image_path}`;

        // Determina il link back appropriato
        const backLink = this.getBackLink();

        return `
            <div class="container mt-4">
                <div class="d-flex align-items-center mb-4">
                    <a href="${backLink.url}" class="btn btn-link text-decoration-none p-0 me-3">
                        <i class="bi bi-arrow-left h5 mb-0"></i>
                        <span class="ms-2">${backLink.text}</span>
                    </a>
                </div>
                
                <div class="row">
                    <div class="col-md-6 mb-4 mb-md-0">
                        <img src="${imagePath}" 
                             class="img-fluid rounded shadow-sm" 
                             alt="${product.name}"
                             onerror="this.src='/UNIverseCycling/assets/images/placeholder.jpg'">
                    </div>
                    
                    <div class="col-md-6">
                        <h1 class="h2 mb-3">${product.name}</h1>
                        <p class="h3 text-primary mb-4">€${parseFloat(product.price).toFixed(2)}</p>
                        
                        <div class="mb-4">
                            <h5 class="mb-3">Description</h5>
                            <p class="text-muted">${product.description || 'No description available.'}</p>
                        </div>

                        <div class="mb-4">
                            <p class="text-muted mb-2">Available: ${product.stock || 10}</p>
                        </div>
                        
                        <div class="mb-4">
                            <h5 class="mb-3">Color</h5>
                            <div class="d-flex gap-2">
                                ${this.renderColorOptions()}
                            </div>
                        </div>

                        <div class="mb-4">
                            <label class="form-label">Quantity:</label>
                            <div class="input-group" style="width: 140px;">
                                <button class="btn btn-outline-secondary" type="button" onclick="this.nextElementSibling.stepDown()">-</button>
                                <input type="number" class="form-control text-center" value="1" min="1" max="${product.stock || 10}">
                                <button class="btn btn-outline-secondary" type="button" onclick="this.previousElementSibling.stepUp()">+</button>
                            </div>
                        </div>
                        
                        <button class="btn btn-primary w-100 py-2" onclick="productsManager.addToCart('${product.product_id}')">
                            <i class="bi bi-cart-plus me-2"></i>Add to cart
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    getBackLink() {
        const params = new URLSearchParams(window.location.search);
        const searchQuery = params.get('query');
        const categoryId = params.get('category_id');
        
        if (searchQuery) {
            return {
                url: `${window.location.pathname}?action=search&query=${encodeURIComponent(searchQuery)}`,
                text: 'Back to Search Results'
            };
        } else if (categoryId) {
            return {
                url: `${window.location.pathname}?action=category&id=${categoryId}`,
                text: 'Back to Category'
            };
        } else {
            return {
                url: window.location.pathname,
                text: 'Back to Home'
            };
        }
    }

    renderColorOptions() {
        const colors = [
            { name: 'red', class: 'bg-danger' },
            { name: 'blue', class: 'bg-primary' },
            { name: 'green', class: 'bg-success' },
            { name: 'cyan', class: 'bg-info' }
        ];

        return colors.map(color => `
            <button class="color-circle ${color.class} rounded-circle border-0" 
                    style="width: 30px; height: 30px; cursor: pointer; ${this.selectedColor === color.name ? 'outline: 2px solid var(--primary-color); outline-offset: 2px;' : ''}" 
                    onclick="productsManager.selectColor('${color.name}')"
                    data-color="${color.name}"
                    title="${color.name.charAt(0).toUpperCase() + color.name.slice(1)}">
            </button>
        `).join('');
    }

    selectColor(color) {
        this.selectedColor = color;
        document.querySelectorAll('.color-circle').forEach(circle => {
            const isSelected = circle.dataset.color === color;
            circle.style.outline = isSelected ? '2px solid var(--primary-color)' : 'none';
            circle.style.outlineOffset = isSelected ? '2px' : '0';
        });
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
        }
    }

    async addToCart(productId, quantity = 1) {
        try {
            await APIService.addToCart(productId, quantity);
            this.showError('Product added to cart successfully!');
        } catch (error) {
            console.error('Error adding to cart:', error);
            this.showError('Error adding product to cart. Please try again later.');
        }
    }
}

// Crea l'istanza globale
export const productsManager = new ProductsManager();