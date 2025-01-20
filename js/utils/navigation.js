class NavigationManager {
    constructor() {
        // Gestione della navigazione del browser
        window.addEventListener('popstate', this.handlePopState.bind(this));
    }

    handlePopState(event) {
        const params = new URLSearchParams(window.location.search);
        const action = params.get('action');
        const id = params.get('id');
        
        console.log('Navigation state:', { action, id, state: event.state });

        switch (action) {
            case 'product':
                if (id) window.productsManager.showProductDetails(id, false);
                break;
            case 'category':
                if (id) window.categoriesManager.showCategoryProducts(id, false);
                break;
            case 'search':
                const query = params.get('query');
                if (query) window.searchManager.performSearch(query, false);
                break;
            default:
                window.productsManager.loadNewArrivals();
        }
    }

    // Naviga a un prodotto
    navigateToProduct(productId, fromCategory = null, fromSearch = null) {
        const url = new URL(window.location.href);
        url.searchParams.set('action', 'product');
        url.searchParams.set('id', productId);

        if (fromCategory) {
            url.searchParams.set('from_category', fromCategory);
        }
        if (fromSearch) {
            url.searchParams.set('query', fromSearch);
        }

        history.pushState({ 
            action: 'product',
            productId,
            fromCategory,
            fromSearch
        }, '', url.toString());
    }

    // Naviga a una categoria
    navigateToCategory(categoryId) {
        const url = new URL(window.location.href);
        url.searchParams.set('action', 'category');
        url.searchParams.set('id', categoryId);

        history.pushState({
            action: 'category',
            categoryId
        }, '', url.toString());
    }

    // Naviga ai risultati di ricerca
    navigateToSearch(query) {
        const url = new URL(window.location.href);
        url.searchParams.set('action', 'search');
        url.searchParams.set('query', query);

        history.pushState({
            action: 'search',
            query
        }, '', url.toString());
    }

    // Torna alla home
    navigateToHome() {
        const url = new URL(window.location.href);
        url.search = '';
        history.pushState({ action: 'home' }, '', url.toString());
    }

    // Ottieni il link "back" appropriato
    getBackLink() {
        const params = new URLSearchParams(window.location.search);
        const fromCategory = params.get('from_category');
        const searchQuery = params.get('query');

        if (fromCategory) {
            return {
                url: `${window.location.pathname}?action=category&id=${fromCategory}`,
                text: 'Back to Category'
            };
        }
        if (searchQuery) {
            return {
                url: `${window.location.pathname}?action=search&query=${searchQuery}`,
                text: 'Back to Search Results'
            };
        }
        return {
            url: window.location.pathname,
            text: 'Back to Home'
        };
    }
}

// Inizializza il navigation manager globale
window.navigationManager = new NavigationManager();
