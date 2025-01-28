import { APIService } from '../services/api-service.js';
import { notificationManager } from './notification-manager.js';
import { pageLoader } from './page-loader.js';
import { AuthService } from '../services/auth.service.js';

export class CheckoutManager {
    constructor() {
        this.form = null;
        this.cartItems = [];
        this.currentUserData = null;
    }

    async init() {
        if (!AuthService.isAuthenticated()) {
            console.log('User not logged in, skipping checkout initialization');
            return;
        }

        this.form = document.getElementById('checkout-form');
        if (this.form) {
            await this.loadUserData();
            await this.loadCartItems();
            this.form.addEventListener('submit', (e) => this.handleSubmit(e));
            this.setupCardValidation();
        }
    }

    async loadUserData() {
        try {
            console.log('Loading user data...');
            
            const response = await fetch('/UNIverseCycling/api/user/profile.php', {
                headers: {
                    'Authorization': `Bearer ${AuthService.getToken()}`
                }
            });
            
            const text = await response.text();
            console.log('Raw response:', text);
            
            try {
                const data = JSON.parse(text);
                console.log('Parsed data:', data);
                
                if (data.success) {
                    this.currentUserData = data.user;
                    this.populateUserData();
                } else {
                    throw new Error(data.message || 'Failed to load user data');
                }
            } catch (parseError) {
                console.error('Error parsing JSON:', parseError);
                throw new Error('Invalid response format');
            }
        } catch (error) {
            console.error('Error loading user data:', error);
            await notificationManager.createNotification('error', 'Errore nel caricamento dei dati utente');
        }
    }

    populateUserData() {
        if (!this.currentUserData) {
            console.error('No user data available');
            return;
        }

        console.log('Populating form with:', this.currentUserData);
        
        document.getElementById('firstName').value = this.currentUserData.first_name || '';
        document.getElementById('lastName').value = this.currentUserData.last_name || '';
    }

    async loadCartItems() {
        try {
            const items = await APIService.getCartItems();
            this.cartItems = Array.isArray(items) ? items : [];
            this.updateOrderSummary();
        } catch (error) {
            console.error('Error loading cart items:', error);
            await notificationManager.createNotification('error', 'Error loading cart items');
        }
    }

    updateOrderSummary() {
        const orderItems = document.getElementById('order-items');
        const subtotalElement = document.getElementById('subtotal');
        const shippingElement = document.getElementById('shipping');
        const totalElement = document.getElementById('total');

        // Clear existing items
        orderItems.innerHTML = '';

        // Calculate subtotal
        let subtotal = 0;
        this.cartItems.forEach(item => {
            subtotal += item.price * item.quantity;
            
            // Add item to summary
            const itemElement = document.createElement('div');
            itemElement.className = 'd-flex justify-content-between align-items-center mb-2';
            itemElement.innerHTML = `
                <div>
                    <span>${item.name}</span>
                    <small class="text-muted"> x ${item.quantity}</small>
                </div>
                <span>€${(item.price * item.quantity).toFixed(2)}</span>
            `;
            orderItems.appendChild(itemElement);
        });

        // Fixed shipping cost
        const shipping = 0; // Free shipping

        // Update summary
        subtotalElement.textContent = `€${subtotal.toFixed(2)}`;
        shippingElement.textContent = `€${shipping.toFixed(2)}`;
        totalElement.textContent = `€${(subtotal + shipping).toFixed(2)}`;
    }

    setupCardValidation() {
        const cardNumber = document.getElementById('cardNumber');
        const cardName = document.getElementById('cardName');
        const expiryDate = document.getElementById('expiryDate');
        const cvv = document.getElementById('cvv');
        const creditCard = document.querySelector('.credit-card');

        // Format card number
        cardNumber.addEventListener('input', (e) => {
            let value = e.target.value.replace(/\D/g, '');
            let formattedValue = '';
            for (let i = 0; i < value.length; i++) {
                if (i > 0 && i % 4 === 0) {
                    formattedValue += ' ';
                }
                formattedValue += value[i];
            }
            e.target.value = formattedValue;
            document.getElementById('card-number-display').textContent = 
                formattedValue || '•••• •••• •••• ••••';
        });

        // Update card name
        cardName.addEventListener('input', (e) => {
            const value = e.target.value.toUpperCase();
            document.getElementById('card-name-display').textContent = 
                value || 'YOUR NAME HERE';
        });

        // Format expiry date
        expiryDate.addEventListener('input', (e) => {
            let value = e.target.value.replace(/\D/g, '');
            if (value.length >= 2) {
                value = value.slice(0, 2) + '/' + value.slice(2);
            }
            e.target.value = value;
            document.getElementById('card-expiry-display').textContent = 
                value || 'MM/YY';
        });

        // Handle CVV focus/blur
        cvv.addEventListener('focus', () => {
            creditCard.classList.add('flipped');
        });

        cvv.addEventListener('blur', () => {
            creditCard.classList.remove('flipped');
        });

        // Update CVV display
        cvv.addEventListener('input', (e) => {
            let value = e.target.value.replace(/\D/g, '');
            e.target.value = value;
            document.getElementById('card-cvv-display').textContent = 
                value || '•••';
        });
    }

    async handleSubmit(e) {
        e.preventDefault();

        if (!this.validateForm()) {
            return;
        }

        try {
            const formData = new FormData(this.form);
            
            // Estrai il numero civico dall'indirizzo
            const fullAddress = 'Via dell\'Università, 50';
            const addressMatch = fullAddress.match(/(\d+)/);
            const streetNumber = addressMatch ? addressMatch[0] : '';
            const street = fullAddress.replace(streetNumber, '').trim();

            const orderData = {
                shipping: {
                    firstName: this.currentUserData.first_name,
                    lastName: this.currentUserData.last_name,
                    address: fullAddress,
                    street: street,
                    street_number: streetNumber,
                    city: 'Cesena',
                    zip: '47521',
                    postal_code: '47521',
                    country: 'IT'
                },
                payment: {
                    cardNumber: formData.get('cardNumber').replace(/\s/g, ''),
                    expiryDate: formData.get('expiryDate'),
                    cvv: formData.get('cvv')
                },
                items: this.cartItems,
                total: parseFloat(document.getElementById('total').textContent.replace('€', ''))
            };

            const response = await fetch('/UNIverseCycling/api/orders.php?action=create', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${AuthService.getToken()}`
                },
                body: JSON.stringify(orderData)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to create order');
            }

            const data = await response.json();
            if (data.success) {
                await notificationManager.createNotification('success', 'Order placed successfully!');
                pageLoader.loadPage('profile');
            } else {
                throw new Error(data.error || 'Failed to create order');
            }
        } catch (error) {
            console.error('Error submitting order:', error);
            await notificationManager.createNotification('error', error.message || 'Error placing order');
        }
    }

    validateForm() {
        const cardNumber = document.getElementById('cardNumber').value.replace(/\s/g, '');
        const expiryDate = document.getElementById('expiryDate').value;
        const cvv = document.getElementById('cvv').value;

        // Validate card number (basic check for 16 digits)
        if (!/^\d{16}$/.test(cardNumber)) {
            notificationManager.createNotification('error', 'Invalid card number');
            return false;
        }

        // Validate expiry date (MM/YY format)
        if (!/^(0[1-9]|1[0-2])\/([0-9]{2})$/.test(expiryDate)) {
            notificationManager.createNotification('error', 'Invalid expiry date (use MM/YY format)');
            return false;
        }

        // Validate expiry date is not in the past
        const [month, year] = expiryDate.split('/');
        const expiry = new Date(2000 + parseInt(year), parseInt(month) - 1);
        if (expiry < new Date()) {
            notificationManager.createNotification('error', 'Card has expired');
            return false;
        }

        // Validate CVV (3 digits)
        if (!/^\d{3}$/.test(cvv)) {
            notificationManager.createNotification('error', 'Invalid CVV');
            return false;
        }

        return true;
    }
}

export const checkoutManager = new CheckoutManager();
window.checkoutManager = checkoutManager;
