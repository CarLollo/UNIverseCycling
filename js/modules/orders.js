import { APIService } from '../services/api-service.js';
import { AuthService } from '../services/auth.service.js';

export class OrdersManager {
    constructor() {
        this.init();
    }

    init() {
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
            return;
        }

        try {
            const orders = await APIService.request('/orders.php?action=getOrders');
            this.renderOrders(orders);
        } catch (error) {
            console.error('Error loading orders:', error);
        }
    }

    renderOrders(orders) {
        const container = document.querySelector('.orders-container');
        if (!container) return;

        if (orders.length === 0) {
            container.innerHTML = `
                <div class="text-center py-5">
                    <h3>No orders yet</h3>
                    <p>Start shopping to see your orders here!</p>
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
                    <h5 class="mb-1">Order #${order.id}</h5>
                    <small>${new Date(order.date).toLocaleDateString()}</small>
                </div>
                <p class="mb-1">Status: ${order.status}</p>
                <p class="mb-1">Total: €${order.total.toFixed(2)}</p>
                <small>Items: ${order.items.length}</small>
            </div>
        `;
    }
}

export const ordersManager = new OrdersManager();
