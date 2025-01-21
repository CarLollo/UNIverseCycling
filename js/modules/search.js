import { APIService } from '../services/api-service.js';
import { productsManager } from './products.js';

export class SearchManager {
    constructor() {
        this.searchInput = null;
        this.searchTimeout = null;
    }

    init() {
        this.searchInput = document.querySelector('.search-input');
        
        if (this.searchInput) {
            this.bindEvents();
            this.handleInitialSearch();
        }
    }

    bindEvents() {
        // Ricerca quando si preme Enter
        this.searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                const query = e.target.value.trim();
                if (query.length > 0) {
                    this.performSearch(query);
                }
            }
        });
    }

    handleInitialSearch() {
        const params = new URLSearchParams(window.location.search);
        const query = params.get('query');
        
        if (query) {
            this.searchInput.value = query;
            this.performSearch(query);
        }
    }

    async performSearch(query) {
        try {
            // Aggiorna l'URL
            const url = new URL(window.location);
            url.searchParams.set('action', 'search');
            url.searchParams.set('query', query);
            history.pushState({ action: 'search', query }, '', url);

            // Mostra il loading
            productsManager.showLoading();
            
            // Esegui la ricerca
            const products = await APIService.searchProducts(query);
            
            // Aggiorna la cache dei prodotti
            products.forEach(product => {
                productsManager.products.set(product.product_id, product);
            });
            
            // Aggiorna la vista
            const container = document.querySelector('.products-container');
            if (container) {
                container.innerHTML = productsManager.renderProductsGrid(products);
            }
        } catch (error) {
            console.error('Search error:', error);
            const container = document.querySelector('.products-container');
            if (container) {
                container.innerHTML = `
                    <div class="alert alert-danger" role="alert">
                        Error performing search. Please try again.
                    </div>
                `;
            }
        } finally {
            productsManager.hideLoading();
        }
    }
}

export const searchManager = new SearchManager();
