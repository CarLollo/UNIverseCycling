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
                <div class="empty-cart">
                    <p>Error loading cart. Please try again later.</p>
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
        const cartIcon = document.querySelector('.bottom-nav a[href="#cart"] i');
        if (cartIcon) {
            const badge = cartIcon.querySelector('.cart-badge') || document.createElement('span');
            badge.className = 'cart-badge';
            badge.textContent = count;
            if (!badge.parentNode) {
                cartIcon.appendChild(badge);
            }
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
                <div class="cart-item" data-product-id="${item.product_id}">
                    <img src="/UNIverseCycling/${item.image_path}" alt="${item.name}" class="cart-item-image">
                    <div class="cart-item-details">
                        <div class="cart-item-name">${item.name}</div>
                        <div class="cart-item-price">€${item.price}</div>
                        <div class="cart-item-quantity">
                            <div class="quantity-controls">
                                <button class="quantity-btn minus">-</button>
                                <span class="quantity">${item.quantity}</span>
                                <button class="quantity-btn plus">+</button>
                            </div>
                        </div>
                    </div>
                    <div class="cart-item-total">€${total.toFixed(2)}</div>
                    <button class="remove-item">×</button>
                </div>
            `;
        });

        container.innerHTML = cartHTML;
        this.updateCartSummary(subtotal);

        // Add event listeners for quantity controls and remove buttons
        this.setupCartControls();
    }

    updateCartSummary(subtotal) {
        const summaryAmount = document.querySelector('.cart-summary .amount');
        if (summaryAmount) {
            summaryAmount.textContent = `€${subtotal.toFixed(2)}`;
        }
    }

    setupCartControls() {
        // Setup quantity controls
        document.querySelectorAll('.quantity-controls').forEach(control => {
            const minusBtn = control.querySelector('.minus');
            const plusBtn = control.querySelector('.plus');
            const quantitySpan = control.querySelector('.quantity');
            const cartItem = control.closest('.cart-item');

            if (!cartItem) {
                console.warn('Cart item not found for control:', control);
                return; // Salta se cartItem è null
            }

            const productId = cartItem.dataset.productId;

            minusBtn.addEventListener('click', async () => {
                let quantity = parseInt(quantitySpan.textContent);
                if (quantity > 1) {
                    await this.updateCartItemQuantity(productId, quantity - 1);
                }
            });

            plusBtn.addEventListener('click', async () => {
                let quantity = parseInt(quantitySpan.textContent);
                await this.updateCartItemQuantity(productId, quantity + 1);
            });
        });

        // Setup remove buttons
        document.querySelectorAll('.remove-item').forEach(button => {
            const cartItem = button.closest('.cart-item');

            if (!cartItem) {
                console.warn('Cart item not found for button:', button);
                return; // Salta se cartItem è null
            }

            const productId = cartItem.dataset.productId;

            button.addEventListener('click', async () => {
                await this.removeFromCart(productId);
            });
        });
    }
}

export default CartManager;