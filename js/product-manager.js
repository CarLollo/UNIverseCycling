import APIService from './api-service.js';

class ProductManager {
    constructor(cartManager) {
        this.cartManager = cartManager;
        this.previousPage = null;
        this.setupEventListeners();
    }

    setupEventListeners() {
        document.addEventListener('click', (e) => this.handleProductClick(e));
    }

    async handleProductClick(e) {
        const productCard = e.target.closest('.product-card');
        if (!productCard) return;

        const productId = productCard.dataset.productId;
        if (!productId) return;

        await this.showProductDetails(productId);
    }

    async showProductDetails(productId) {
        try {
            const product = await APIService.getProductDetails(productId);
            if (!product) throw new Error('Product not found');
            
            this.previousPage = document.querySelector('.page.active');
            this.renderProductPage(product);
            
            // Store product ID in URL without affecting page load
            const url = new URL(window.location);
            url.searchParams.set('product', productId);
            window.history.pushState({}, '', url);
            
        } catch (error) {
            console.error('Error loading product details:', error);
            const toastHtml = `
                <div class="toast-container position-fixed bottom-0 end-0 p-3">
                    <div class="toast align-items-center text-white bg-danger border-0" role="alert" aria-live="assertive" aria-atomic="true">
                        <div class="d-flex">
                            <div class="toast-body">
                                Unable to load product details
                            </div>
                            <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
                        </div>
                    </div>
                </div>
            `;
            document.body.insertAdjacentHTML('beforeend', toastHtml);
            const toastEl = document.querySelector('.toast:last-child');
            const toast = new bootstrap.Toast(toastEl);
            toast.show();
        }
    }

    renderProductPage(product) {
        const productPage = document.querySelector('.product-page');
        if (!productPage) return;

        // Hide other pages and show product page
        document.querySelectorAll('.page').forEach(page => page.classList.remove('active'));
        document.querySelector('.nav-tabs')?.classList.add('d-none');
        
        // Render product details
        const template = `
            <div class="container py-4">
                <div class="row g-4">
                    <div class="col-md-6">
                        <div class="product-image-large rounded overflow-hidden bg-light">
                            <img src="/UNIverseCycling/${product.image_path}" 
                                 class="img-fluid w-100 h-100 object-fit-cover" 
                                 alt="${product.name}"
                                 onerror="this.src='/UNIverseCycling/img/placeholder.jpg'">
                        </div>
                    </div>
                    <div class="col-md-6">
                        <nav aria-label="breadcrumb">
                            <ol class="breadcrumb">
                                <li class="breadcrumb-item"><a href="#" class="back-link text-decoration-none"><i class="bi bi-arrow-left"></i> Back</a></li>
                            </ol>
                        </nav>
                        <h1 class="product-title h2 mb-3">${product.name}</h1>
                        <div class="product-description mb-4">
                            <p class="text-secondary">${product.description}</p>
                        </div>
                        <div class="d-flex align-items-center mb-4">
                            <h2 class="h4 mb-0 me-2">Price:</h2>
                            <span class="amount h4 mb-0">€${product.price}</span>
                        </div>
                        <div class="mb-4">
                            <p class="mb-2">Stock: <span class="stock-amount badge bg-success">${product.stock}</span></p>
                        </div>
                        <div class="quantity-selector d-flex align-items-center mb-4">
                            <label class="me-3">Quantity:</label>
                            <div class="input-group" style="width: 140px;">
                                <button class="btn btn-outline-secondary quantity-decrease" type="button">-</button>
                                <input type="number" class="form-control text-center quantity-input" value="1" min="1" max="${product.stock}">
                                <button class="btn btn-outline-secondary quantity-increase" type="button">+</button>
                            </div>
                        </div>
                        <button class="btn btn-primary btn-lg w-100 add-to-cart-btn">
                            <i class="bi bi-cart-plus me-2"></i>Add to Cart
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        productPage.innerHTML = template;
        
        // Setup event handlers
        this.setupQuantityControls(product, productPage);
        this.setupBackButton(productPage);
        this.setupAddToCartButton(product, productPage);
        
        // Show product page
        productPage.classList.add('active');
    }

    setupQuantityControls(product, productPage) {
        const quantityInput = productPage.querySelector('.quantity-input');
        const minusBtn = productPage.querySelector('.quantity-decrease');
        const plusBtn = productPage.querySelector('.quantity-increase');
        
        const updateQuantity = (value) => {
            value = Math.max(1, Math.min(value, product.stock));
            quantityInput.value = value;
            
            minusBtn.disabled = value <= 1;
            minusBtn.classList.toggle('disabled', value <= 1);
            
            plusBtn.disabled = value >= product.stock;
            plusBtn.classList.toggle('disabled', value >= product.stock);
        };
        
        minusBtn.addEventListener('click', () => {
            updateQuantity(parseInt(quantityInput.value) - 1);
        });
        
        plusBtn.addEventListener('click', () => {
            updateQuantity(parseInt(quantityInput.value) + 1);
        });
        
        quantityInput.addEventListener('change', () => {
            updateQuantity(parseInt(quantityInput.value));
        });
        
        updateQuantity(1);
    }

    setupBackButton(productPage) {
        const backLink = productPage.querySelector('.back-link');
        if (backLink) {
            backLink.addEventListener('click', (e) => {
                e.preventDefault();
                if (this.previousPage) {
                    document.querySelector('.nav-tabs')?.classList.remove('d-none');
                    document.querySelectorAll('.page').forEach(page => page.classList.remove('active'));
                    this.previousPage.classList.add('active');
                    
                    // Update URL
                    const url = new URL(window.location);
                    url.searchParams.delete('product');
                    window.history.pushState({}, '', url);
                }
            });
        }
    }

    setupAddToCartButton(product, productPage) {
        const addToCartBtn = productPage.querySelector('.add-to-cart-btn');
        const quantityInput = productPage.querySelector('.quantity-input');
        
        if (addToCartBtn && this.cartManager) {
            addToCartBtn.addEventListener('click', async () => {
                const quantity = parseInt(quantityInput.value);
                if (quantity > 0 && quantity <= product.stock) {
                    addToCartBtn.disabled = true;
                    addToCartBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Adding...';
                    
                    try {
                        await this.cartManager.addToCart(product.id, quantity);
                        
                        // Show success toast
                        const toastHtml = `
                            <div class="toast-container position-fixed bottom-0 end-0 p-3">
                                <div class="toast align-items-center text-white bg-success border-0" role="alert" aria-live="assertive" aria-atomic="true">
                                    <div class="d-flex">
                                        <div class="toast-body">
                                            Product added to cart successfully!
                                        </div>
                                        <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
                                    </div>
                                </div>
                            </div>
                        `;
                        document.body.insertAdjacentHTML('beforeend', toastHtml);
                        const toastEl = document.querySelector('.toast:last-child');
                        const toast = new bootstrap.Toast(toastEl);
                        toast.show();
                    } catch (error) {
                        console.error('Error adding to cart:', error);
                    } finally {
                        addToCartBtn.disabled = false;
                        addToCartBtn.innerHTML = '<i class="bi bi-cart-plus me-2"></i>Add to Cart';
                    }
                }
            });
        }
    }
}

export default ProductManager;