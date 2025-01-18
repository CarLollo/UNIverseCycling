import APIService from './api-service.js';

class CartManager {
    async loadCartItems() {
        const cartItemsContainer = document.querySelector('.cart-items');
        if (!cartItemsContainer) return;

        try {
            const items = await APIService.getCartItems();
            
            if (items.length === 0) {
                this.renderEmptyCart(cartItemsContainer);
                return;
            }

            this.renderCartItems(items, cartItemsContainer);
            this.setupCartControls();

        } catch (error) {
            console.error('Error loading cart items:', error);
            cartItemsContainer.innerHTML = `
                <div class="text-center py-5">
                    <p class="text-muted">Error loading cart. Please try again later.</p>
                </div>
            `;
        }
    }

    async addToCart(productId, quantity) {
        try {
            const result = await APIService.addToCart(productId, quantity);
            this.updateCartCount(result.cartCount);
            return result;
        } catch (error) {
            console.error('Error adding to cart:', error);
            throw error;
        }
    }

    async updateCartItemQuantity(productId, quantity) {
        try {
            const result = await APIService.updateCartItem(productId, quantity);
            if (result.success) {
                await this.loadCartItems();
                this.updateCartCount(result.cartCount);
            }
        } catch (error) {
            console.error('Error updating quantity:', error);
        }
    }

    async removeFromCart(productId) {
        try {
            const result = await APIService.removeFromCart(productId);
            if (result.success) {
                await this.loadCartItems();
                this.updateCartCount(result.cartCount);
            }
        } catch (error) {
            console.error('Error removing item:', error);
        }
    }

    async initializeCartCount() {
        try {
            const result = await APIService.getCartCount();
            this.updateCartCount(result.count);
        } catch (error) {
            console.error('Error getting cart count:', error);
        }
    }

    updateCartCount(count) {
        const cartLink = document.querySelector('.navbar .nav-link[href="#cart"]');
        if (cartLink) {
            let badge = cartLink.querySelector('.badge');
            if (!badge) {
                badge = document.createElement('span');
                badge.className = 'badge rounded-pill bg-primary position-absolute top-0 end-0';
                cartLink.appendChild(badge);
            }
            badge.textContent = count;
            badge.style.display = count > 0 ? 'block' : 'none';
        }
    }

    renderCartItems(items, container) {
        let cartHTML = '';
        let subtotal = 0;

        items.forEach(item => {
            const total = item.price * item.quantity;
            subtotal += total;

            cartHTML += `
                <div class="card mb-3 border-0" data-product-id="${item.product_id}">
                    <div class="row g-0">
                        <div class="col-4">
                            <img src="/UNIverseCycling/${item.image_path}" alt="${item.name}" 
                                class="img-fluid rounded" style="object-fit: cover; height: 100%;">
                        </div>
                        <div class="col-8">
                            <div class="card-body">
                                <h5 class="card-title h6">${item.name}</h5>
                                <p class="card-text mb-2">€${item.price}</p>
                                <div class="input-group input-group-sm" style="max-width: 150px;">
                                    <button class="btn btn-outline-secondary quantity-decrease" type="button">-</button>
                                    <input type="number" class="form-control text-center quantity-input" 
                                        value="${item.quantity}" min="1" aria-label="Quantity">
                                    <button class="btn btn-outline-secondary quantity-increase" type="button">+</button>
                                </div>
                                <button class="btn btn-link text-danger p-0 mt-2 remove-item">Remove</button>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        });

        // Aggiungi il subtotale
        cartHTML += `
            <div class="card mt-4 border-0 bg-light">
                <div class="card-body">
                    <div class="d-flex justify-content-between align-items-center">
                        <h5 class="card-title mb-0">Subtotal</h5>
                        <span class="h5 mb-0">€${subtotal.toFixed(2)}</span>
                    </div>
                    <button class="btn btn-primary w-100 mt-3">Proceed to Checkout</button>
                </div>
            </div>
        `;

        container.innerHTML = cartHTML;
    }

    renderEmptyCart(container) {
        container.innerHTML = `
            <div class="text-center py-5">
                <i class="bi bi-cart-x display-1 text-muted mb-4"></i>
                <h3 class="h5 mb-3">Your cart is empty</h3>
                <p class="text-muted mb-4">Add some items to your cart to continue shopping</p>
                <a href="#" class="btn btn-primary" data-page="home">Continue Shopping</a>
            </div>
        `;
    }

    setupCartControls() {
        const cartItems = document.querySelectorAll('.card[data-product-id]');
        
        cartItems.forEach(item => {
            const productId = item.dataset.productId;
            const quantityInput = item.querySelector('.quantity-input');
            const decreaseBtn = item.querySelector('.quantity-decrease');
            const increaseBtn = item.querySelector('.quantity-increase');
            const removeBtn = item.querySelector('.remove-item');

            if (decreaseBtn && increaseBtn && quantityInput) {
                decreaseBtn.addEventListener('click', () => {
                    const newQuantity = Math.max(1, parseInt(quantityInput.value) - 1);
                    if (newQuantity !== parseInt(quantityInput.value)) {
                        this.updateCartItemQuantity(productId, newQuantity);
                    }
                });

                increaseBtn.addEventListener('click', () => {
                    const newQuantity = parseInt(quantityInput.value) + 1;
                    this.updateCartItemQuantity(productId, newQuantity);
                });

                quantityInput.addEventListener('change', () => {
                    const newQuantity = Math.max(1, parseInt(quantityInput.value));
                    this.updateCartItemQuantity(productId, newQuantity);
                });
            }

            if (removeBtn) {
                removeBtn.addEventListener('click', () => {
                    this.removeFromCart(productId);
                });
            }
        });
    }
}

export default CartManager;