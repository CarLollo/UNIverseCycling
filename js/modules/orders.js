import { APIService } from '../services/api-service.js';
import { AuthService } from '../services/auth.service.js';
import { notificationManager } from './notification-manager.js';

export class OrdersManager {
    constructor() {
        this.init();
        this.statusSimulations = new Map();
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
            <div class="list-group-item" data-order-id="${order.id}">
                <div class="d-flex w-100 justify-content-between">
                    <h5 class="mb-1">Ordine #${order.id}</h5>
                    <small>${new Date(order.date).toLocaleDateString()}</small>
                </div>
                <p class="mb-1">Stato: <span class="badge bg-${this.getStatusBadgeClass(order.status)}">${order.status}</span></p>
                <p class="mb-1">Totale: €${order.total.toFixed(2)}</p>
                <small>Articoli: ${order.items.length}</small>
                <button class="btn btn-sm btn-primary" onclick="ordersManager.startStatusSimulation(${order.id})">Simula stato</button>
            </div>
        `;
    }

    getStatusBadgeClass(status) {
        switch (status.toLowerCase()) {
            case 'processing':
                return 'warning';
            case 'shipped':
                return 'info';
            case 'delivered':
                return 'success';
            case 'cancelled':
                return 'danger';
            default:
                return 'secondary';
        }
    }

    async updateOrderStatus(orderId, newStatus) {
        try {
            const response = await fetch('/UNIverseCycling/api/orders.php?action=updateStatus', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${AuthService.getToken()}`
                },
                body: JSON.stringify({ 
                    order_id: orderId,  
                    status: newStatus 
                })
            });

            const data = await response.json();
            if (!data.success) {
                throw new Error(data.error || 'Failed to update order status');
            }

            // Aggiorna l'UI se il modale degli ordini è aperto
            const orderElement = document.querySelector(`[data-order-id="${orderId}"]`);
            if (orderElement) {
                const statusBadge = orderElement.querySelector('.badge');
                if (statusBadge) {
                    statusBadge.className = `badge bg-${this.getStatusBadgeClass(newStatus)}`;
                    statusBadge.textContent = newStatus;
                }

                // Se c'è il pulsante di simulazione, lo nascondiamo
                const simulateButton = orderElement.querySelector('button[onclick*="startStatusSimulation"]');
                if (simulateButton && newStatus !== 'processing') {
                    simulateButton.remove();
                }
            }

            return data;
        } catch (error) {
            console.error('Error updating order status:', error);
            await notificationManager.createNotification('error', 'Order Update Error', error.message);
            throw error;
        }
    }

    startStatusSimulation(orderId) {
        // Se c'è già una simulazione attiva per questo ordine, la fermiamo
        this.stopStatusSimulation(orderId);

        const simulation = {
            timeouts: []
        };

        // Dopo 30 secondi, cambia da processing a shipped
        const shippedTimeout = setTimeout(async () => {
            try {
                await this.updateOrderStatus(orderId, 'shipped');
                // La notifica di successo viene creata solo se l'aggiornamento riesce
                await notificationManager.createNotification('info', 'Order Status Update', `Order #${orderId} has been shipped! 🚚`);
            } catch (error) {
                // L'errore è già gestito in updateOrderStatus
                console.error('Error updating to shipped:', error);
            }
        }, 30000);

        // Dopo 2 minuti, cambia da shipped a delivered
        const deliveredTimeout = setTimeout(async () => {
            try {
                await this.updateOrderStatus(orderId, 'delivered');
                // La notifica di successo viene creata solo se l'aggiornamento riesce
                await notificationManager.createNotification('success', 'Order Status Update', `Order #${orderId} has been delivered! 📦`);
                this.stopStatusSimulation(orderId); // Puliamo i timeout dopo la consegna
            } catch (error) {
                // L'errore è già gestito in updateOrderStatus
                console.error('Error updating to delivered:', error);
            }
        }, 120000);

        simulation.timeouts.push(shippedTimeout, deliveredTimeout);
        this.statusSimulations.set(orderId, simulation);
    }

    stopStatusSimulation(orderId) {
        const simulation = this.statusSimulations.get(orderId);
        if (simulation) {
            simulation.timeouts.forEach(timeout => clearTimeout(timeout));
            this.statusSimulations.delete(orderId);
        }
    }

    stopAllSimulations() {
        for (const orderId of this.statusSimulations.keys()) {
            this.stopStatusSimulation(orderId);
        }
    }
}

export const ordersManager = new OrdersManager();
window.ordersManager = ordersManager;
