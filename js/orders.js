export class CartManager {
    constructor() {
        this.cartItems = [];
        this.initializeEventListeners();
        this.initializeCart();
    }

    initializeEventListeners() {
        // Listener per il pulsante My Order (carrello)
        document.querySelector('[data-page="orders"]').addEventListener('click', (e) => {
            e.preventDefault();
            this.showCart();
        });

        // Listener per il pulsante Home
        document.querySelector('[data-page="home"]').addEventListener('click', (e) => {
            e.preventDefault();
            this.showHome();
        });
    }

    // Inizializza il carrello
    initializeCart() {
        const cartPage = document.getElementById('cart-page');
        if (cartPage) {
            cartPage.innerHTML = `
                <div class="container">
                    <div class="mt-4">
                        <h2 class="mb-4">Shopping Cart</h2>
                        
                        <div id="cart-items" class="mb-4">
                            <!-- Gli elementi del carrello verranno inseriti qui -->
                        </div>

                        <div class="card">
                            <div class="card-body">
                                <div class="d-flex justify-content-between mb-3">
                                    <h5 class="card-title">Total</h5>
                                    <h5 id="cart-total">€0.00</h5>
                                </div>
                                <button id="checkout-btn" class="btn btn-primary w-100" onclick="window.cartManager.checkout()">
                                    Proceed to Checkout
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }
    }

    // Mostra la home page
    showHome() {
        // Nascondi tutte le pagine
        document.querySelectorAll('.page-content').forEach(page => {
            page.style.display = 'none';
        });

        // Mostra la home
        document.getElementById('home-page').style.display = 'block';

        // Aggiorna i link attivi
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
        });
        document.querySelector('[data-page="home"]').classList.add('active');
    }

    // Mostra la pagina del carrello
    showCart() {
        // Nascondi tutte le pagine
        document.querySelectorAll('.page-content').forEach(page => {
            page.style.display = 'none';
        });

        // Mostra il carrello
        document.getElementById('cart-page').style.display = 'block';

        // Aggiorna i link attivi
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
        });
        document.querySelector('[data-page="orders"]').classList.add('active');

        this.updateCartUI();
    }

    // Aggiorna l'interfaccia del carrello
    updateCartUI() {
        const cartItems = document.getElementById('cart-items');
        const cartTotal = document.getElementById('cart-total');
        
        if (cartItems) {
            if (this.cartItems.length === 0) {
                cartItems.innerHTML = '<p class="text-center text-muted">Your cart is empty</p>';
            } else {
                cartItems.innerHTML = this.cartItems.map(item => `
                    <div class="card mb-3">
                        <div class="card-body">
                            <div class="row align-items-center">
                                <div class="col-auto">
                                    <img src="${item.image_path}" class="rounded" width="80" height="80" 
                                         style="object-fit: cover;" alt="${item.name}"
                                         onerror="this.src='/UNIverseCycling/assets/images/placeholder.jpg'">
                                </div>
                                <div class="col">
                                    <h6 class="card-title mb-1">${item.name}</h6>
                                    <p class="card-text mb-0">€${item.price}</p>
                                </div>
                                <div class="col-auto">
                                    <div class="input-group" style="width: 120px;">
                                        <button class="btn btn-outline-secondary" type="button" 
                                                onclick="window.cartManager.updateQuantity(${item.id}, ${item.quantity - 1})">-</button>
                                        <input type="number" class="form-control text-center" value="${item.quantity}" min="1"
                                               onchange="window.cartManager.updateQuantity(${item.id}, parseInt(this.value))">
                                        <button class="btn btn-outline-secondary" type="button"
                                                onclick="window.cartManager.updateQuantity(${item.id}, ${item.quantity + 1})">+</button>
                                    </div>
                                </div>
                                <div class="col-auto">
                                    <button class="btn btn-link text-danger" 
                                            onclick="window.cartManager.removeFromCart(${item.id})">
                                        <i class="bi bi-trash"></i>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                `).join('');
            }
        }

        if (cartTotal) {
            cartTotal.textContent = `€${this.calculateTotal().toFixed(2)}`;
        }
    }

    // Aggiunge un prodotto al carrello
    addToCart(product, quantity = 1) {
        const existingItem = this.cartItems.find(item => item.id === product.id);
        
        if (existingItem) {
            existingItem.quantity += quantity;
        } else {
            this.cartItems.push({
                ...product,
                quantity: quantity
            });
        }

        this.updateCartUI();
    }

    // Rimuove un prodotto dal carrello
    removeFromCart(productId) {
        this.cartItems = this.cartItems.filter(item => item.id !== productId);
        this.updateCartUI();
    }

    // Aggiorna la quantità di un prodotto
    updateQuantity(productId, quantity) {
        const item = this.cartItems.find(item => item.id === productId);
        if (item) {
            if (quantity <= 0) {
                this.removeFromCart(productId);
            } else {
                item.quantity = quantity;
                this.updateCartUI();
            }
        }
    }

    // Calcola il totale del carrello
    calculateTotal() {
        return this.cartItems.reduce((total, item) => {
            return total + (item.price * item.quantity);
        }, 0);
    }

    // Gestisce il checkout
    checkout() {
        if (this.cartItems.length === 0) {
            alert('Your cart is empty');
            return;
        }

        // Qui implementeremo la logica di checkout
        alert('Proceeding to checkout...');
    }
}

// Inizializza il gestore del carrello
window.cartManager = new CartManager();
