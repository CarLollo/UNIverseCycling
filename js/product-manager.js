import APIService from './api-service.js';

class ProductManager {
    constructor(cartManager) {
        this.cartManager = cartManager;
        this.previousPage = null;
    }

    async showProductDetails(productId) {
        try {
            const product = await APIService.getProductDetails(productId);
            this.renderProductDetails(product);
        } catch (error) {
            console.error('Error loading product details:', error);
            alert('Unable to load product details');
        }
    }

    renderProductDetails(product) {
        this.previousPage = document.querySelector('.page.active');
        const productPage = document.querySelector('.product-page');
        
        document.querySelectorAll('.page').forEach(page => page.classList.remove('active'));
        document.querySelector('.tabs').style.display = 'none';

        this.updateProductPage(product, productPage);
        this.setupProductControls(product, productPage);
        
        productPage.classList.add('active');
    }

    updateProductPage(product, productPage) {
        productPage.querySelector('.product-title').textContent = product.name;
        productPage.querySelector('.product-image-large img').src = `/UNIverseCycling/${product.image_path}`;
        productPage.querySelector('.product-image-large img').alt = product.name;
        productPage.querySelector('.product-description p').textContent = product.description;
        productPage.querySelector('.product-price .amount').textContent = product.price;
        productPage.querySelector('.stock-amount').textContent = product.stock;
    }

    setupProductControls(product, productPage) {
        this.setupQuantityControls(product, productPage);
        this.setupColorSelection(productPage);
        this.setupAddToCart(product, productPage);
        this.setupBackButton(productPage);
    }

    setupQuantityControls(product, productPage) {
        const quantityInput = productPage.querySelector('.quantity-input');
        const minusBtn = productPage.querySelector('.quantity-btn.minus');
        const plusBtn = productPage.querySelector('.quantity-btn.plus');
        
        // Reset quantity to 1 for new product
        quantityInput.value = 1;
        
        const updateQuantityButtons = () => {
            const currentValue = parseInt(quantityInput.value);
            minusBtn.disabled = currentValue <= 1;
            plusBtn.disabled = currentValue >= product.stock;
        };

        minusBtn.onclick = () => {
            const currentValue = parseInt(quantityInput.value);
            if (currentValue > 1) {
                quantityInput.value = currentValue - 1;
                updateQuantityButtons();
            }
        };

        plusBtn.onclick = () => {
            const currentValue = parseInt(quantityInput.value);
            if (currentValue < product.stock) {
                quantityInput.value = currentValue + 1;
                updateQuantityButtons();
            }
        };

        quantityInput.onchange = () => {
            let value = parseInt(quantityInput.value);
            if (isNaN(value) || value < 1) {
                value = 1;
            } else if (value > product.stock) {
                value = product.stock;
            }
            quantityInput.value = value;
            updateQuantityButtons();
        };

        updateQuantityButtons();
    }

    setupColorSelection(productPage) {
        const colors = ['#CD5C5C', '#6A5ACD', '#2F4F4F', '#66CDAA'];
        const colorCircles = colors.map(color => `
            <div class="color-circle" style="background-color: ${color}"></div>
        `).join('');
        productPage.querySelector('.color-circles').innerHTML = colorCircles;

        const circles = productPage.querySelectorAll('.color-circle');
        circles.forEach(circle => {
            circle.addEventListener('click', () => {
                circles.forEach(c => c.classList.remove('active'));
                circle.classList.add('active');
            });
        });
    }

    setupAddToCart(product, productPage) {
        const addToCartBtn = productPage.querySelector('.add-to-cart');
        const quantityInput = productPage.querySelector('.quantity-input');

        addToCartBtn.onclick = async () => {
            const quantity = parseInt(quantityInput.value);
            
            try {
                const result = await this.cartManager.addToCart(product.product_id, quantity);
                
                // Reset quantity input
                quantityInput.value = 1;
                this.setupQuantityControls(product, productPage);
                
                // Show success message
                alert('Product added to cart successfully!');
                
                // Update cart count
                this.cartManager.updateCartCount(result.cartCount);
            } catch (error) {
                alert('Failed to add product to cart. Please try again.');
            }
        };
    }

    setupBackButton(productPage) {
        const backButton = productPage.querySelector('.back-button');
        backButton.onclick = () => {
            productPage.classList.remove('active');
            document.querySelector('.tabs').style.display = 'flex';
            if (this.previousPage) {
                this.previousPage.classList.add('active');
            } else {
                document.querySelector('.home-page').classList.add('active');
            }
        };
    }

    async searchProducts(query) {
        try {
            return await APIService.searchProducts(query);
        } catch (error) {
            console.error('Error searching products:', error);
            throw error;
        }
    }
}

export default ProductManager;