import { APIService } from '../services/api-service.js';
import { AuthService } from '../services/auth.service.js';

export class CartManager {
    constructor() {
        this.cartContainer = null;
        this.cartItems = [];
        this.init();
    }

    init() {
        this.cartContainer = document.querySelector('.cart-container');
        this.bindEvents();
        this.loadCart();
    }

    bindEvents() {
        const cartTab = document.querySelector('a[data-page="cart"]');
        if (cartTab) {
            cartTab.addEventListener('click', () => this.showCart());
        }
    }

    async loadCart() {
        if (!AuthService.isAuthenticated()) return;

        try {
            this.cartItems = await APIService.getCartItems();
            this.updateCartBadge();
        } catch (error) {
            console.error('Error loading cart:', error);
        }
    }

    async addToCart(productId) {
        if (!AuthService.isAuthenticated()) {
            window.location.href = '/UNIverseCycling/?page=login&redirect=cart';
            return;
        }

        try {
            await APIService.addToCart(productId);
            
            await this.loadCart();
            this.showSuccess('Product added to cart');
        } catch (error) {
            console.error('Error adding to cart:', error);
            this.showError('Error adding product to cart');
        }
    }

    async removeFromCart(productId) {
        try {
            await APIService.removeFromCart(productId);
            await this.loadCart();
            this.showCart();
        } catch (error) {
            console.error('Error removing from cart:', error);
            this.showError('Error removing product from cart');
        }
    }

    showCart() {
        if (!this.cartContainer) return;

        if (!AuthService.isAuthenticated()) {
            this.cartContainer.innerHTML = `
                <div class="text-center py-4">
                    <p class="mb-3">Please login to view your cart</p>
                    <a href="/UNIverseCycling/?page=login&redirect=cart" class="btn btn-primary">Login</a>
                </div>
            `;
            return;
        }

        if (this.cartItems.length === 0) {
            this.cartContainer.innerHTML = `
                <div class="text-center py-4">
                    <p class="mb-0">Your cart is empty</p>
                </div>
            `;
            return;
        }

        const total = this.cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

        this.cartContainer.innerHTML = `
            <div class="container py-4">
                <div class="row">
                    <div class="col-md-8">
                        ${this.cartItems.map(item => this.renderCartItem(item)).join('')}
                    </div>
                    <div class="col-md-4">
                        <div class="card">
                            <div class="card-body">
                                <h5 class="card-title">Order Summary</h5>
                                <p class="card-text">Total: €${total.toFixed(2)}</p>
                                <button class="btn btn-primary w-100" onclick="cartManager.checkout()">
                                    Checkout
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    renderCartItem(item) {
        const imagePath = item.image_path.startsWith('/') 
            ? `/UNIverseCycling${item.image_path}`
            : `/UNIverseCycling/${item.image_path}`;

        return `
            <div class="card mb-3 cart-item" data-product-id="${item.product_id}">
                <div class="row g-0">
                    <div class="col-4">
                        <img src="${imagePath}" 
                             class="img-fluid rounded-start" 
                             alt="${item.name}"
                             style="object-fit: cover; height: 100%;">
                    </div>
                    <div class="col-8">
                        <div class="card-body">
                            <div class="d-flex justify-content-between align-items-start">
                                <h5 class="card-title">${item.name}</h5>
                                <button class="btn btn-link text-danger remove-item" 
                                        onclick="cartManager.removeFromCart(${item.product_id})">
                                    <i class="bi bi-trash"></i>
                                </button>
                            </div>
                            <p class="card-text">€${parseFloat(item.price).toFixed(2)}</p>
                            <div class="d-flex align-items-center">
                                <button class="btn btn-outline-secondary btn-sm me-2" 
                                        onclick="cartManager.updateQuantity(${item.product_id}, ${item.quantity - 1})"
                                        ${item.quantity <= 1 ? 'disabled' : ''}>
                                    <i class="bi bi-dash"></i>
                                </button>
                                <span class="quantity">${item.quantity}</span>
                                <button class="btn btn-outline-secondary btn-sm ms-2" 
                                        onclick="cartManager.updateQuantity(${item.product_id}, ${item.quantity + 1})"
                                        ${item.quantity >= item.stock ? 'disabled' : ''}>
                                    <i class="bi bi-plus"></i>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    updateCartBadge() {
        const badge = document.querySelector('.cart-badge');
        if (!badge) return;

        if (this.cartItems.length > 0) {
            badge.style.display = 'block';
            badge.textContent = this.cartItems.length;
        } else {
            badge.style.display = 'none';
        }
    }

    async updateQuantity(productId, newQuantity) {
        if (newQuantity < 1) return;

        try {
            await APIService.request('/cart.php?action=update', {
                method: 'POST',
                body: JSON.stringify({ 
                    productId,
                    quantity: newQuantity
                })
            });
            
            await this.loadCart();
            this.showCart();
        } catch (error) {
            console.error('Error updating quantity:', error);
            this.showError('Error updating quantity');
        }
    }

    async checkout() {
        if (!AuthService.isAuthenticated()) {
            window.location.href = '/UNIverseCycling/?page=login&redirect=cart';
            return;
        }

        try {
            await APIService.request('/orders.php?action=create', {
                method: 'POST'
            });
            
            this.cartItems = [];
            this.updateCartBadge();
            this.showSuccess('Order placed successfully!');
            this.showCart();
        } catch (error) {
            console.error('Error during checkout:', error);
            this.showError('Error processing your order');
        }
    }

    showSuccess(message) {
        console.log('Success:', message);
    }

    showError(message) {
        console.error('Error:', message);
    }
}

export const cartManager = new CartManager();