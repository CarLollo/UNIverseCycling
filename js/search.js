// search.js
class SearchManager {
    constructor() {
        this.init();
        this.searchTimeout = null;
    }

    init() {
        // Trova l'input di ricerca
        const searchInput = document.querySelector('.search-input');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                // Cancella il timeout precedente
                if (this.searchTimeout) {
                    clearTimeout(this.searchTimeout);
                }

                // Imposta un nuovo timeout per evitare troppe richieste
                this.searchTimeout = setTimeout(() => {
                    const query = e.target.value.trim();
                    if (query.length >= 3) {
                        this.performSearch(query);
                    } else {
                        this.clearResults();
                    }
                }, 300);
            });

            // Gestisci il tasto Invio
            searchInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    const query = e.target.value.trim();
                    if (query) {
                        const newUrl = `${window.location.origin}${window.location.pathname}?action=search&query=${encodeURIComponent(query)}`;
                        history.pushState(null, '', newUrl);
                        if (query.length >= 3) {
                            this.performSearch(query);
                        }
                    } else {
                        console.log('Il campo di ricerca è vuoto.');
                    }
                }
            });

            // Chiudi i risultati quando si clicca fuori
            document.addEventListener('click', (e) => {
                if (!e.target.closest('.search-container')) {
                    this.clearResults();
                }
            });
        }
    }

    async performSearch(query) {
        console.log(`Sto cercando: ${query}`);
        try {
            // Mostra il loading
            this.showLoading();

            // Esegui la ricerca
            const response = await fetch(`/UNIverseCycling/api/products.php?action=search&query=${encodeURIComponent(query)}`);
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            const results = await response.json();

            console.log("Ecco results:");
            console.log(results);

            // Mostra i risultati
            this.displayResults(results);
        } catch (error) {
            console.error('Error searching products:', error);
            this.showError('Error searching products. Please try again.');
        } finally {
            this.hideLoading();
        }
    }

    displayResults(results) {
        // Trova o crea il container dei risultati
        let resultsContainer = document.querySelector('.search-results');
        if (!resultsContainer) {
            resultsContainer = document.createElement('div');
            resultsContainer.className = 'search-results';
            document.querySelector('.search-container').appendChild(resultsContainer);
        }

        // Se non ci sono risultati
        if (!results || results.length === 0) {
            resultsContainer.innerHTML = `
                <div class="no-results p-3 text-center text-muted">
                    No products found
                </div>
            `;
            return;
        }

        // Renderizza i risultati
        resultsContainer.innerHTML = `
            <div class="results-list">
                ${results.map(product => `
                    <div class="search-result-item p-2" onclick="window.productsManager.showProductDetails(${product.id})">
                        <div class="d-flex align-items-center">
                            <img src="${product.image_path}"
                                 class="search-result-image me-2"
                                 alt="${product.name}"
                                 onerror="this.src='/UNIverseCycling/assets/images/placeholder.jpg'">
                            <div class="search-result-info">
                                <div class="search-result-title">${product.name}</div>
                                <div class="search-result-price">€${parseFloat(product.price).toFixed(2)}</div>
                            </div>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    }

    clearResults() {
        const resultsContainer = document.querySelector('.search-results');
        if (resultsContainer) {
            resultsContainer.innerHTML = '';
        }
    }

    showLoading() {
        let resultsContainer = document.querySelector('.search-results');
        if (!resultsContainer) {
            resultsContainer = document.createElement('div');
            resultsContainer.className = 'search-results';
            document.querySelector('.search-container').appendChild(resultsContainer);
        }

        resultsContainer.innerHTML = `
            <div class="text-center p-3">
                <div class="spinner-border text-primary" role="status">
                    <span class="visually-hidden">Loading...</span>
                </div>
            </div>
        `;
    }

    hideLoading() {
        // Il loading verrà nascosto quando si mostrano i risultati
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
