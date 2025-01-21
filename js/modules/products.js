import { APIService } from '../services/api-service.js';

export class ProductsManager {
    constructor() {
        // Cache dei prodotti
        this.products = new Map();
        this.selectedColor = null;
        this.currentView = null;
        this.productsContainer = null;
    }

    init() {
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
            // La ricerca viene gestita dal SearchManager
            const query = params.get('query');
            if (query) {
                import('./search.js').then(module => {
                    module.searchManager.performSearch(query);
                });
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
        this.showProductDetails(productId);
    }

    async showProductDetails(productId, updateHistory = true) {
        try {
            const product = await APIService.getProductDetails(productId);
            
            const mainContent = document.querySelector('.main-content');
            if (!mainContent) return;

            mainContent.innerHTML = `
                <div class="container mt-4">
                    <a href="#" class="text-primary text-decoration-none d-inline-flex align-items-center mb-3" onclick="productsManager.getBackLink; return false;">
                        <i class="bi bi-arrow-left me-2"></i>
                        <span>Back</span>
                    </a>
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
                                    <button class="btn btn-outline-secondary" type="button" id="decrease-quantity">
                                        <i class="bi bi-dash"></i>
                                    </button>
                                    <input type="number" id="product-quantity" class="form-control text-center" 
                                           value="1" min="1" max="${product.stock || 10}">
                                    <button class="btn btn-outline-secondary" type="button" id="increase-quantity">
                                        <i class="bi bi-plus"></i>
                                    </button>
                                </div>
                            </div>

                            <button class="btn btn-primary w-100" id="add-to-cart-btn">
                                Add to Cart
                            </button>
                        </div>
                    </div>
                </div>
            `;

            // Aggiungi event listeners dopo aver creato gli elementi
            const decreaseBtn = document.getElementById('decrease-quantity');
            const increaseBtn = document.getElementById('increase-quantity');
            const addToCartBtn = document.getElementById('add-to-cart-btn');

            if (decreaseBtn) {
                decreaseBtn.addEventListener('click', () => this.updateQuantity(-1));
            }
            if (increaseBtn) {
                increaseBtn.addEventListener('click', () => this.updateQuantity(1));
            }
            if (addToCartBtn) {
                addToCartBtn.addEventListener('click', () => this.handleAddToCart(productId));
            }

            if (updateHistory) {
                const url = new URL(window.location);
                url.searchParams.set('action', 'product');
                url.searchParams.set('id', productId);
                window.history.pushState({}, '', url);
            }
            
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
        const input = document.getElementById('product-quantity');
        if (!input) return;

        const currentValue = parseInt(input.value) || 1;
        const maxValue = parseInt(input.max) || 10;
        const newValue = Math.max(1, Math.min(maxValue, currentValue + change));
        input.value = newValue;
    }

    async handleAddToCart(productId) {
        try {
            const quantityInput = document.getElementById('product-quantity');
            if (!quantityInput) {
                throw new Error('Quantity input not found');
            }

            const quantity = parseInt(quantityInput.value);
            if (isNaN(quantity) || quantity < 1) {
                throw new Error('Please enter a valid quantity');
            }

            console.log('Adding to cart:', { productId, quantity });
            try {
                await APIService.addToCart(productId, quantity);
                console.log('Product added to cart successfully');
                
                // Aggiorna il carrello
                if (window.cartManager) {
                    console.log('Updating cart...');
                    await window.cartManager.loadCart();
                } else {
                    console.error('Cart manager not found');
                }

                // Mostra messaggio di successo solo dopo che tutto è andato bene
                const toastContainer = document.querySelector('.toast-container');
                if (toastContainer) {
                    const toast = document.createElement('div');
                    toast.className = 'toast show';
                    toast.textContent = 'Product added to cart successfully';
                    toastContainer.appendChild(toast);
                    setTimeout(() => {
                        toast.remove();
                    }, 3000);
                }
            } catch (error) {
                console.error('Error adding to cart:', error);
                const toastContainer = document.querySelector('.toast-container');
                if (toastContainer) {
                    const toast = document.createElement('div');
                    toast.className = 'toast show error';
                    toast.textContent = error.message || 'Failed to add product to cart';
                    toastContainer.appendChild(toast);
                    setTimeout(() => {
                        toast.remove();
                    }, 3000);
                }
            }
        } catch (error) {
            console.error('Error adding to cart:', error);
            const toastContainer = document.querySelector('.toast-container');
            if (toastContainer) {
                const toast = document.createElement('div');
                toast.className = 'toast show error';
                toast.textContent = error.message || 'Failed to add product to cart';
                toastContainer.appendChild(toast);
                setTimeout(() => {
                    toast.remove();
                }, 3000);
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
                    import('./search.js').then(module => {
                        module.searchManager.performSearch(query);
                    });
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

    async addToCart(productId) {
        try {
            const quantityInput = document.getElementById(`product-quantity-${productId}`);
            if (!quantityInput) {
                throw new Error('Quantity input not found');
            }

            const quantity = parseInt(quantityInput.value);
            if (isNaN(quantity) || quantity < 1) {
                throw new Error('Invalid quantity');
            }

            await APIService.addToCart(productId, quantity);
            
            // Refresh cart badge
            const cartManager = (await import('./cart.js')).cartManager;
            await cartManager.loadCart();
            
            // Show success message using Bootstrap toast
            const toastContainer = document.querySelector('.toast-container');
            if (toastContainer) {
                const toast = document.createElement('div');
                toast.className = 'toast align-items-center text-white bg-success border-0';
                toast.setAttribute('role', 'alert');
                toast.setAttribute('aria-live', 'assertive');
                toast.setAttribute('aria-atomic', 'true');
                
                toast.innerHTML = `
                    <div class="d-flex">
                        <div class="toast-body">Product added to cart successfully!</div>
                        <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
                    </div>
                `;
                
                toastContainer.appendChild(toast);
                const bsToast = new bootstrap.Toast(toast);
                bsToast.show();
            }
        } catch (error) {
            console.error('Error adding to cart:', error);
            // Show error message using Bootstrap toast
            const toastContainer = document.querySelector('.toast-container');
            if (toastContainer) {
                const toast = document.createElement('div');
                toast.className = 'toast align-items-center text-white bg-danger border-0';
                toast.setAttribute('role', 'alert');
                toast.setAttribute('aria-live', 'assertive');
                toast.setAttribute('aria-atomic', 'true');
                
                toast.innerHTML = `
                    <div class="d-flex">
                        <div class="toast-body">Error adding product to cart: ${error.message}</div>
                        <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
                    </div>
                `;
                
                toastContainer.appendChild(toast);
                const bsToast = new bootstrap.Toast(toast);
                bsToast.show();
            }
        }
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

    goBack() {
        const params = new URLSearchParams(window.location.search);
        const fromCategory = params.get('fromCategory');
        
        if (fromCategory) {
            window.pageLoader.loadPage('category', { id: fromCategory });
        } else {
            window.pageLoader.loadPage('home');
        }
    }
}

// Esporta l'istanza e rendila globale
export const productsManager = new ProductsManager();
window.productsManager = productsManager;