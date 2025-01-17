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
        const productCard = e.target.closest('.product-card, .search-result-item');
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
            alert('Unable to load product details');
        }
    }

    renderProductPage(product) {
        const productPage = document.querySelector('.product-page');
        if (!productPage) return;

        // Hide other pages and tabs
        document.querySelectorAll('.page').forEach(page => page.classList.remove('active'));
        document.querySelector('.tabs').style.display = 'none';
        
        // Update product details
        productPage.querySelector('.product-title').textContent = product.name;
        
        const productImage = productPage.querySelector('.product-image-large img');
        productImage.src = `/UNIverseCycling/${product.image_path}`;
        productImage.alt = product.name;
        productImage.onerror = () => {
            productImage.src = '/UNIverseCycling/img/placeholder.jpg';
        };
        
        productPage.querySelector('.product-description p').textContent = product.description;
        productPage.querySelector('.product-price .amount').textContent = product.price;
        productPage.querySelector('.stock-amount').textContent = product.stock;
        
        // Setup controls
        this.setupQuantityControls(product, productPage);
        this.setupColorSelection(productPage);
        this.setupBackButton(productPage);
        this.setupAddToCartButton(product, productPage);
        
        // Show product page
        productPage.classList.add('active');
    }

    setupQuantityControls(product, productPage) {
        const quantityInput = productPage.querySelector('.quantity-input');
        const minusBtn = productPage.querySelector('.quantity-btn.minus');
        const plusBtn = productPage.querySelector('.quantity-btn.plus');
        
        quantityInput.value = 1;
        
        const updateButtons = () => {
            const value = parseInt(quantityInput.value);
            minusBtn.disabled = value <= 1;
            plusBtn.disabled = value >= product.stock;
        };

        minusBtn.onclick = () => {
            const value = parseInt(quantityInput.value);
            if (value > 1) {
                quantityInput.value = value - 1;
                updateButtons();
            }
        };

        plusBtn.onclick = () => {
            const value = parseInt(quantityInput.value);
            if (value < product.stock) {
                quantityInput.value = value + 1;
                updateButtons();
            }
        };

        quantityInput.onchange = () => {
            let value = parseInt(quantityInput.value);
            value = Math.max(1, Math.min(value, product.stock));
            quantityInput.value = value;
            updateButtons();
        };

        updateButtons();
    }

    setupAddToCartButton(product, productPage) {
        const addToCartBtn = productPage.querySelector('.add-to-cart');
        const quantityInput = productPage.querySelector('.quantity-input');

        addToCartBtn.onclick = async () => {
            const quantity = parseInt(quantityInput.value);
            try {
                const result = await this.cartManager.addToCart(product.product_id, quantity);
                quantityInput.value = 1;
                this.setupQuantityControls(product, productPage);
                alert('Product added to cart successfully!');
                this.cartManager.updateCartCount(result.cartCount);
            } catch (error) {
                alert('Failed to add product to cart');
            }
        };
    }

    setupColorSelection(productPage) {
        const colors = ['#CD5C5C', '#6A5ACD', '#2F4F4F', '#66CDAA'];
        const colorCirclesHTML = colors.map(color => 
            `<div class="color-circle" style="background-color: ${color}"></div>`
        ).join('');
        
        const colorContainer = productPage.querySelector('.color-circles');
        colorContainer.innerHTML = colorCirclesHTML;
        
        colorContainer.querySelectorAll('.color-circle').forEach(circle => {
            circle.onclick = () => {
                colorContainer.querySelectorAll('.color-circle').forEach(c => 
                    c.classList.remove('active')
                );
                circle.classList.add('active');
            };
        });
    }

    setupBackButton(productPage) {
        const backButton = productPage.querySelector('.back-button');
        backButton.onclick = () => {
            // Remove product ID from URL
            const url = new URL(window.location);
            url.searchParams.delete('product');
            window.history.pushState({}, '', url);
            
            // Show previous page
            productPage.classList.remove('active');
            document.querySelector('.tabs').style.display = 'flex';
            
            if (this.previousPage) {
                this.previousPage.classList.add('active');
            } else {
                document.querySelector('.home-page').classList.add('active');
            }
        };
    }
}

export default ProductManager;