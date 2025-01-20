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
            this.cartItems = await APIService.request('/cart.php?action=get');
            this.updateCartBadge();
        } catch (error) {
            console.error('Error loading cart:', error);
        }
    }

    async addToCart(productId) {
        if (!AuthService.isAuthenticated()) {
            window.location.href = '/pages/auth/login.php';
            return;
        }

        try {
            await APIService.request('/cart.php?action=add', {
                method: 'POST',
                body: JSON.stringify({ productId })
            });
            
            await this.loadCart();
            this.showSuccess('Product added to cart');
        } catch (error) {
            console.error('Error adding to cart:', error);
            this.showError('Error adding product to cart');
        }
    }

    async removeFromCart(productId) {
        try {
            await APIService.request('/cart.php?action=remove', {
                method: 'POST',
                body: JSON.stringify({ productId })
            });
            
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
                    <a href="/pages/auth/login.php" class="btn btn-primary">Login</a>
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
        return `
            <div class="card mb-3">
                <div class="row g-0">
                    <div class="col-md-4">
                        <img src="${item.image}" class="img-fluid rounded-start" alt="${item.name}">
                    </div>
                    <div class="col-md-8">
                        <div class="card-body">
                            <h5 class="card-title">${item.name}</h5>
                            <p class="card-text">
                                Price: €${item.price.toFixed(2)}<br>
                                Quantity: ${item.quantity}
                            </p>
                            <button class="btn btn-danger btn-sm" 
                                    onclick="cartManager.removeFromCart(${item.id})">
                                Remove
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    updateCartBadge() {
        const badge = document.querySelector('.cart-badge');
        if (badge) {
            const itemCount = this.cartItems.reduce((sum, item) => sum + item.quantity, 0);
            badge.textContent = itemCount;
            badge.style.display = itemCount > 0 ? 'block' : 'none';
        }
    }

    async checkout() {
        if (!AuthService.isAuthenticated()) {
            window.location.href = '/pages/auth/login.php';
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
        const toast = document.createElement('div');
        toast.className = 'toast align-items-center text-white bg-success border-0';
        toast.setAttribute('role', 'alert');
        toast.setAttribute('aria-live', 'assertive');
        toast.setAttribute('aria-atomic', 'true');
        
        toast.innerHTML = `
            <div class="d-flex">
                <div class="toast-body">${message}</div>
                <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
            </div>
        `;
        
        const container = document.querySelector('.toast-container');
        if (container) {
            container.appendChild(toast);
            const bsToast = new bootstrap.Toast(toast);
            bsToast.show();
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
                <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
            </div>
        `;
        
        const container = document.querySelector('.toast-container');
        if (container) {
            container.appendChild(toast);
            const bsToast = new bootstrap.Toast(toast);
            bsToast.show();
        }
    }
}

export const cartManager = new CartManager();