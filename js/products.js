// products.js
import APIService from './api-service.js';

class ProductsManager {
    constructor() {
        // Cache dei prodotti
        this.products = new Map();
        
        // Inizializza
        this.init();
    }

    init() {
        // Carica i prodotti all'avvio
        this.loadNewArrivals();
        
        // Aggiungi il listener per i click sulle card
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
        try {
            // Carica i nuovi arrivi
            const products = await APIService.getNewArrivals();
            
            // Salva nella cache
            products.forEach(product => {
                this.products.set(product.product_id, product);
            });
            
            // Renderizza la griglia
            const container = document.querySelector('.products-container');
            if (container) {
                container.innerHTML = this.renderProductsGrid(products);
            }
        } catch (error) {
            console.error('Error loading products:', error);
            this.showError('Error loading products. Please try again later.');
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
            // Mostra loading
            this.showLoading();
            
            // Prendi il prodotto dalla cache o caricalo
            let product = this.products.get(productId);
            if (!product) {
                product = await APIService.getProductDetails(productId);
                this.products.set(productId, product);
            }
            
            // Mostra i dettagli
            await this.showProductDetails(productId);
            
            // Aggiorna URL
            // this.updateURL(productId);
        } catch (error) {
            console.error('Error handling product click:', error);
            this.showError('Error loading product details. Please try again later.');
        } finally {
            this.hideLoading();
        }
    }

    async showProductDetails(productId, updateHistory = true) {
        try {
            console.log('Showing product details:', productId);
            let product = this.products.get(productId);
            if (!product) {
                product = await APIService.getProductDetails(productId);
                this.products.set(productId, product);
            }

            if (updateHistory) {
                const currentParams = new URLSearchParams(window.location.search);
                const searchQuery = currentParams.get('query');
                
                const newUrl = new URL(window.location.href);
                newUrl.searchParams.set('action', 'product');
                newUrl.searchParams.set('id', productId);
                if (searchQuery) {
                    newUrl.searchParams.set('query', searchQuery);
                }
                
                history.pushState({ 
                    action: 'product', 
                    productId: productId,
                    previousQuery: searchQuery 
                }, '', newUrl.toString());
            }

            const mainContent = document.querySelector('.main-content');
            if (mainContent) {
                mainContent.innerHTML = this.renderProductDetails(product);
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

    renderProductDetails(product) {
        const imagePath = product.image_path.startsWith('/') 
            ? `/UNIverseCycling${product.image_path}`
            : `/UNIverseCycling/${product.image_path}`;

        // Determina se siamo arrivati da una ricerca
        const params = new URLSearchParams(window.location.search);
        const searchQuery = params.get('query');
        
        // Prepara il link back
        const backLink = searchQuery 
            ? `${window.location.pathname}?action=search&query=${encodeURIComponent(searchQuery)}`
            : window.location.pathname;
        
        const backText = searchQuery ? 'Back to Search Results' : 'Back to Home';

        return `
            <div class="container mt-4">
                <div class="d-flex align-items-center mb-4">
                    <a href="${backLink}" class="btn btn-link text-decoration-none p-0 me-3 text-primary">
                        <i class="bi bi-arrow-left h5 mb-0"></i>
                        <span class="ms-2">${backText}</span>
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
                                <button class="color-circle bg-danger rounded-circle border-0" 
                                        style="width: 30px; height: 30px; cursor: pointer; ${this.selectedColor === 'red' ? 'outline: 2px solid var(--primary-color); outline-offset: 2px;' : ''}" 
                                        onclick="window.productsManager.selectColor('red')"
                                        title="Red"></button>
                                <button class="color-circle bg-primary rounded-circle border-0" 
                                        style="width: 30px; height: 30px; cursor: pointer; ${this.selectedColor === 'blue' ? 'outline: 2px solid var(--primary-color); outline-offset: 2px;' : ''}" 
                                        onclick="window.productsManager.selectColor('blue')"
                                        title="Blue"></button>
                                <button class="color-circle bg-success rounded-circle border-0" 
                                        style="width: 30px; height: 30px; cursor: pointer; ${this.selectedColor === 'green' ? 'outline: 2px solid var(--primary-color); outline-offset: 2px;' : ''}" 
                                        onclick="window.productsManager.selectColor('green')"
                                        title="Green"></button>
                                <button class="color-circle bg-info rounded-circle border-0" 
                                        style="width: 30px; height: 30px; cursor: pointer; ${this.selectedColor === 'cyan' ? 'outline: 2px solid var(--primary-color); outline-offset: 2px;' : ''}" 
                                        onclick="window.productsManager.selectColor('cyan')"
                                        title="Cyan"></button>
                            </div>
                        </div>

                        <div class="mb-4">
                            <label class="form-label">Quantity:</label>
                            <div class="input-group" style="width: 140px;">
                                <button class="btn btn-outline-secondary" type="button" onclick="this.nextElementSibling.stepDown()">-</button>
                                <input type="number" class="form-control text-center" value="1" min="1" max="${product.stock || 10}" style="border-color: var(--primary-color);">
                                <button class="btn btn-outline-secondary" type="button" onclick="this.previousElementSibling.stepUp()">+</button>
                            </div>
                        </div>
                        
                        <button class="btn btn-primary w-100 py-2" onclick="window.productsManager.addToCart('${product.product_id}')">
                            <i class="bi bi-cart-plus me-2"></i>Add to cart
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    selectColor(color) {
        this.selectedColor = color;
        console.log('Selected color:', color);
        
        // Evidenzia il colore selezionato
        document.querySelectorAll('.color-circle').forEach(circle => {
            circle.style.outline = 'none';
            circle.style.outlineOffset = '0px';
        });
        
        const selectedCircle = document.querySelector(`.color-circle[onclick*="${color}"]`);
        if (selectedCircle) {
            selectedCircle.style.outline = '2px solid var(--primary-color)';
            selectedCircle.style.outlineOffset = '2px';
        }
    }

    showProductsList() {
        // Nascondi i dettagli del prodotto
        const detailsContainer = document.querySelector('.product-details');
        if (detailsContainer) {
            detailsContainer.style.display = 'none';
        }

        // Se siamo nella vista categorie, torna alle categorie
        const categoriesContainer = document.querySelector('.categories-container');
        if (categoriesContainer && categoriesContainer.innerHTML) {
            // Mostra le categorie
            categoriesContainer.style.display = 'block';
            // Attiva il tab delle categorie
            document.querySelectorAll('.nav-link').forEach(link => {
                link.classList.remove('active');
            });
            const categoriesTab = document.querySelector('a[data-page="categories"]');
            if (categoriesTab) categoriesTab.classList.add('active');
        } else {
            // Altrimenti torna alla home
            const homeElements = document.querySelectorAll('.promo-banner, .section');
            homeElements.forEach(el => {
                if (el) el.style.display = 'block';
            });
            
            // Ricarica i new arrivals
            const productsContainer = document.querySelector('.products-container');
            if (productsContainer) {
                productsContainer.style.display = 'block';
                this.loadNewArrivals(); // Ricarica i prodotti
            }

            // Attiva il tab home
            document.querySelectorAll('.nav-link').forEach(link => {
                link.classList.remove('active');
            });
            const homeTab = document.querySelector('a[data-page="home"]');
            if (homeTab) homeTab.classList.add('active');
        }
    }

    updateURL(productId) {
        const url = new URL(window.location);
        url.searchParams.set('product', productId);
        history.pushState({}, '', url);
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
        container.appendChild(toast);
        
        const bsToast = new bootstrap.Toast(toast);
        bsToast.show();
    }

    async addToCart(productId) {
        try {
            await APIService.addToCart(productId);
            this.showError('Product added to cart successfully!');
        } catch (error) {
            console.error('Error adding to cart:', error);
            this.showError('Error adding product to cart. Please try again later.');
        }
    }
}

// Crea l'istanza globale
window.productsManager = new ProductsManager();
