// search.js
import APIService from './api-service.js';

class SearchManager {
    constructor() {
        this.init();
        this.searchTimeout = null;
    }

    init() {
        // Controlla se c'è una query di ricerca nell'URL all'avvio
        const params = new URLSearchParams(window.location.search);
        const initialQuery = params.get('query');
        const searchInput = document.querySelector('.search-input');
        
        if (searchInput) {
            // Se c'è una query iniziale, esegui la ricerca
            if (initialQuery && params.get('action') === 'search') {
                searchInput.value = initialQuery;
                this.performSearch(initialQuery);
            }

            searchInput.addEventListener('input', (e) => {
                if (this.searchTimeout) {
                    clearTimeout(this.searchTimeout);
                }

                const query = e.target.value.trim();
                
                // Se il campo è vuoto o contiene solo spazi
                if (query.length === 0) {
                    this.clearSearchAndReturnHome();
                    return;
                }

                this.searchTimeout = setTimeout(() => {
                    if (query.length >= 3) {
                        this.performSearch(query);
                    } else {
                        // Se la query è troppo corta, torna alla home
                        this.clearSearchAndReturnHome();
                    }
                }, 300);
            });

            // Gestisci il tasto X del campo di ricerca
            const clearButton = searchInput.parentElement.querySelector('.clear-search');
            if (clearButton) {
                clearButton.addEventListener('click', () => {
                    searchInput.value = '';
                    this.clearSearchAndReturnHome();
                });
            }

            searchInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    const query = e.target.value.trim();
                    if (query.length === 0) {
                        this.clearSearchAndReturnHome();
                    } else if (query.length >= 3) {
                        this.performSearch(query);
                    } else {
                        // Se la query è troppo corta, mostra un messaggio
                        const mainContent = document.querySelector('.main-content');
                        if (mainContent) {
                            mainContent.innerHTML = `
                                <div class="container mt-4">
                                    <div class="alert alert-warning">
                                        Please enter at least 3 characters to search.
                                    </div>
                                </div>
                            `;
                        }
                    }
                }
            });
        }

        // Gestisci la navigazione
        window.addEventListener('popstate', (event) => {
            const state = event.state;
            const params = new URLSearchParams(window.location.search);
            
            // Aggiorna l'input di ricerca
            if (searchInput) {
                searchInput.value = params.get('query') || '';
            }

            if (state && state.action === 'search') {
                this.performSearch(state.query, false);
            } else if (state && state.action === 'product') {
                window.productsManager.showProductDetails(state.productId, false);
            } else {
                this.clearSearchAndReturnHome();
            }
        });

        // Chiudi i risultati quando si clicca fuori
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.search-container')) {
                this.clearResults();
            }
        });
    }

    async performSearch(query, updateHistory = true) {
        console.log(`Sto cercando: ${query}`);
        try {
            const mainContent = document.querySelector('.main-content');
            if (mainContent) {
                mainContent.innerHTML = `
                    <div class="container mt-4 text-center">
                        <div class="spinner-border text-primary" role="status">
                            <span class="visually-hidden">Loading...</span>
                        </div>
                    </div>
                `;
            }

            const results = await APIService.searchProducts(query);

            if (results && results.length > 0) {
                results.forEach(product => {
                    window.productsManager.products.set(product.product_id, product);
                });
            }

            if (updateHistory) {
                const newUrl = `${window.location.pathname}?action=search&query=${encodeURIComponent(query)}`;
                history.pushState({ action: 'search', query: query }, '', newUrl);
            }

            this.displayResults(results);
        } catch (error) {
            console.error('Error searching products:', error);
            if (mainContent) {
                mainContent.innerHTML = `
                    <div class="container mt-4">
                        <div class="alert alert-danger">Error searching products. Please try again.</div>
                    </div>
                `;
            }
        }
    }

    displayResults(results) {
        // Get the main content container
        const mainContent = document.querySelector('.main-content');
        if (!mainContent) return;

        // Clear ALL content
        document.querySelectorAll('.product-details, .products-container, .categories-container, .category-products-container, .promo-banner, .section').forEach(el => {
            if (el) el.remove();
        });

        // Clear the main content
        mainContent.innerHTML = '';

        // If no results
        if (!results || results.length === 0) {
            mainContent.innerHTML = `
                <div class="container mt-4">
                    <div class="alert alert-info">No products found</div>
                </div>
            `;
            return;
        }

        // Create container for search results
        mainContent.innerHTML = `
            <div class="container mt-4">
                <h2 class="mb-4">Search Results</h2>
                <div class="row row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-lg-4 g-3">
                    ${results.map(product => window.productsManager.renderProductCard(product)).join('')}
                </div>
            </div>
        `;
    }

    clearResults() {
        // Clear any existing search results
        const mainContent = document.querySelector('.main-content');
        if (mainContent) {
            // Restore the original content
            window.productsManager.loadNewArrivals();
        }
    }

    clearSearchAndReturnHome() {
        // Pulisci l'input di ricerca
        const searchInput = document.querySelector('.search-input');
        if (searchInput) {
            searchInput.value = '';
        }

        // Aggiorna l'URL rimuovendo i parametri di ricerca
        const newUrl = window.location.pathname;
        history.pushState({ action: 'home' }, '', newUrl);

        // Torna alla home
        window.productsManager.loadNewArrivals();
    }

    showLoading() {
        const searchContainer = document.querySelector('.search-container');
        let loadingEl = document.querySelector('.search-loading');
        if (!loadingEl) {
            loadingEl = document.createElement('div');
            loadingEl.className = 'search-loading';
            loadingEl.style.display = 'none';
            searchContainer.appendChild(loadingEl);
        }
        loadingEl.style.display = 'block';
    }

    hideLoading() {
        const loadingEl = document.querySelector('.search-loading');
        if (loadingEl) {
            loadingEl.style.display = 'none';
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
                <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
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

// Crea l'istanza globale
const searchManager = new SearchManager();
