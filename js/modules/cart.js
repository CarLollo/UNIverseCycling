import { APIService } from '../services/api-service.js';
import { AuthService } from '../services/auth.service.js';
import { notificationManager } from './notification-manager.js';

export class CartManager {
    constructor() {
        this.cartItems = [];
        this.isProcessing = false;
    }

    init() {
        if (!AuthService.isAuthenticated()) {
            console.log('User not logged in, skipping cart initialization');
            return;
        }
        
        console.log('Initializing cart...');
        this.bindEvents();
        this.loadCart();
    }

    bindEvents() {
        document.addEventListener('click', async (e) => {
            const removeBtn = e.target.closest('.remove-from-cart');
            if (removeBtn && !this.isProcessing) {
                e.preventDefault();
                const productId = removeBtn.dataset.productId;
                await this.removeFromCart(productId);
            }
        });

        // Bind checkout button
        const checkoutBtn = document.getElementById('checkout-btn');
        if (checkoutBtn) {
            checkoutBtn.addEventListener('click', () => this.checkout());
        }
    }

    async loadCart() {
        try {
            console.log('Loading cart...');
            this.cartItems = await APIService.getCartItems();
            this.updateCartBadge();
            
            const cartContainer = document.getElementById('cart-items');
            if (cartContainer) {
                this.showCart();
            }
        } catch (error) {
            console.error('Error loading cart:', error);
            await notificationManager.createNotification('error', 'Errore nel caricamento del carrello');
        }
    }

    showCart() {
        console.log('Showing cart...');
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

        // Riattacca gli event listeners dopo aver aggiornato il contenuto
        this.bindEvents();
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
                    <button class="btn btn-link text-danger p-0 remove-from-cart" data-product-id="${item.product_id}">
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
        if (this.isProcessing) return;

        this.isProcessing = true;
        try {
            const removeBtn = document.querySelector(`.remove-from-cart[data-product-id="${productId}"]`);
            if (removeBtn) {
                removeBtn.disabled = true;
                removeBtn.innerHTML = '<i class="bi bi-hourglass-split"></i>';
            }
            const product = this.cartItems.find(item => item.product_id == productId);
            const productName = product ? product.name : 'Prodotto';
            await APIService.removeFromCart(productId);
            await this.loadCart();
            await notificationManager.createNotification(
                'success', 
                `"${productName}" è stato rimosso dal carrello`
            );
        } catch (error) {
            console.error('Error removing from cart:', error);
            await notificationManager.createNotification('error', 'Errore durante la rimozione dal carrello');
        } finally {
            this.isProcessing = false;
            const removeBtn = document.querySelector(`.remove-from-cart[data-product-id="${productId}"]`);
            if (removeBtn) {
                removeBtn.disabled = false;
                removeBtn.innerHTML = '<i class="bi bi-trash"></i>';
            }
        }
    }

    async checkout() {
        if (this.cartItems.length === 0) {
            await notificationManager.createNotification('warning', 'Il carrello è vuoto');
            return;
        }

        pageLoader.loadPage('checkout');
    }
}

// Esporta l'istanza e rendila globale
export const cartManager = new CartManager();
window.cartManager = cartManager;