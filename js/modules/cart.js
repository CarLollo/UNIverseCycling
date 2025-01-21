import { APIService } from '../services/api-service.js';
import { AuthService } from '../services/auth.service.js';

export class CartManager {
    constructor() {
        this.cartItems = [];
        this.init();
    }

    init() {
        this.loadCart();
        this.bindEvents();
    }

    bindEvents() {
        document.addEventListener('click', async (e) => {
            if (e.target.matches('.remove-from-cart')) {
                e.preventDefault();
                const productId = e.target.dataset.productId;
                await this.removeFromCart(productId);
            }
        });
    }

    async loadCart() {
        try {
            console.log('Loading cart...');
            this.cartItems = await APIService.getCartItems();
            console.log('Cart items loaded:', this.cartItems);
            this.updateCartBadge();
            
            // Mostra il carrello solo se siamo nella pagina del carrello
            const cartContainer = document.getElementById('cart-items');
            if (cartContainer) {
                this.showCart();
            }
        } catch (error) {
            console.error('Error loading cart:', error);
        }
    }

    showCart() {
        const cartContainer = document.getElementById('cart-items');
        if (!cartContainer) return;

        if (this.cartItems.length === 0) {
            cartContainer.innerHTML = '<div class="text-center py-5">Il tuo carrello è vuoto</div>';
            // Aggiorna anche il totale a 0
            const totalElement = document.getElementById('cart-total');
            if (totalElement) {
                totalElement.textContent = '€0.00';
            }
            return;
        }

        let total = 0;
        const items = this.cartItems.map(item => {
            total += item.price * item.quantity;
            return this.renderCartItem(item);
        });

        cartContainer.innerHTML = items.join('');
        
        // Aggiorna il totale nel campo esistente
        const totalElement = document.getElementById('cart-total');
        if (totalElement) {
            totalElement.textContent = `€${total.toFixed(2)}`;
        }
    }

    renderCartItem(item) {
        return `
            <div class="cart-item d-flex justify-content-between align-items-center mb-3">
                <div class="d-flex align-items-center">
                    <img src="${item.image_path}" alt="${item.name}" style="width: 100px; margin-right: 20px;">
                    <div>
                        <h5 class="mb-1">${item.name}</h5>
                        <p class="text-muted mb-0">${item.description}</p>
                    </div>
                </div>
                <div class="d-flex align-items-center">
                    <div class="me-4">Quantità: ${item.quantity}</div>
                    <div class="me-3">€${(item.price * item.quantity).toFixed(2)}</div>
                    <button class="btn btn-link text-danger p-0" onclick="cartManager.removeFromCart(${item.product_id})">
                        <i class="bi bi-trash"></i>
                    </button>
                </div>
            </div>
        `;
    }

    updateCartBadge() {
        const badge = document.querySelector('.cart-badge');
        if (!badge) return;

        const totalItems = this.cartItems.reduce((sum, item) => sum + item.quantity, 0);
        badge.textContent = totalItems;
        badge.style.display = totalItems > 0 ? 'block' : 'none';
    }

    async removeFromCart(productId) {
        try {
            await APIService.removeFromCart(productId);
            await this.loadCart();
            this.showCart();
        } catch (error) {
            console.error('Error removing item from cart:', error);
        }
    }

    async checkout() {
        // Implementare il checkout
        alert('Funzionalità di checkout non ancora implementata');
    }
}

export const cartManager = new CartManager();
window.cartManager = cartManager;