import { APIService } from '../services/api-service.js';
import { AuthService } from '../services/auth.service.js';
import { notificationManager } from './notification-manager.js';

export class OrdersManager {
    constructor() {
        this.init();
    }

    init() {
        if (!AuthService.isAuthenticated()) {
            console.log('User not logged in, skipping orders initialization');
            return;
        }
        this.bindOrderHistoryButton();
    }

    bindOrderHistoryButton() {
        const orderHistoryBtn = document.querySelector('[data-page="orders"]');
        if (orderHistoryBtn) {
            orderHistoryBtn.addEventListener('click', () => this.loadOrders());
        }
    }

    async loadOrders() {
        if (!AuthService.isAuthenticated()) {
            window.location.href = '/pages/auth/login.php';
            await notificationManager.createNotification('warning', 'Devi effettuare il login per vedere i tuoi ordini');
            return;
        }

        try {
            const orders = await APIService.request('/orders.php?action=getOrders');
            this.renderOrders(orders);
            if (orders.length > 0) {
                await notificationManager.createNotification('info', `Hai ${orders.length} ordini`);
            }
        } catch (error) {
            console.error('Error loading orders:', error);
            await notificationManager.createNotification('error', 'Errore nel caricamento degli ordini');
        }
    }

    renderOrders(orders) {
        const container = document.querySelector('.orders-container');
        if (!container) return;

        if (orders.length === 0) {
            container.innerHTML = `
                <div class="text-center py-5">
                    <h3>Nessun ordine</h3>
                    <p>Inizia a fare acquisti per vedere i tuoi ordini qui!</p>
                </div>
            `;
            return;
        }

        container.innerHTML = `
            <div class="list-group">
                ${orders.map(order => this.renderOrderItem(order)).join('')}
            </div>
        `;
    }

    renderOrderItem(order) {
        return `
            <div class="list-group-item">
                <div class="d-flex w-100 justify-content-between">
                    <h5 class="mb-1">Ordine #${order.id}</h5>
                    <small>${new Date(order.date).toLocaleDateString()}</small>
                </div>
                <p class="mb-1">Stato: ${order.status}</p>
                <p class="mb-1">Totale: €${order.total.toFixed(2)}</p>
                <small>Articoli: ${order.items.length}</small>
            </div>
        `;
    }

    async updateOrderStatus(orderId, newStatus) {
        try {
            await APIService.request('/orders.php?action=updateStatus', {
                method: 'POST',
                body: JSON.stringify({ orderId, status: newStatus })
            });
            await notificationManager.createNotification('success', `Stato dell'ordine #${orderId} aggiornato a ${newStatus}`);
            await this.loadOrders(); // Ricarica gli ordini
        } catch (error) {
            console.error('Error updating order status:', error);
            await notificationManager.createNotification('error', `Errore nell'aggiornamento dello stato dell'ordine #${orderId}`);
        }
    }
}

export const ordersManager = new OrdersManager();
