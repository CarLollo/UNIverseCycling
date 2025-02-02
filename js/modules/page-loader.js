import { productsManager } from './products.js';
import { categoriesManager } from './categories.js';
import { cartManager } from './cart.js';
import { searchManager } from './search.js';
import { AuthService } from '../services/auth.service.js';
import { authManager } from './auth.js';
import { profileManager } from './profile.js';
import { NotificationManager } from './notification-manager.js';
import { checkoutManager } from './checkout.js';

export class PageLoader {
    constructor() {
        this.mainContent = document.querySelector('.main-content');
        this.currentPage = null;
        this.pages = new Map();
        this.currentRequest = null;
        this.init();
    }

    init() {
        this.registerPages();
        this.setupNavigationListeners();
        this.handleInitialPage();
    }

    registerPages() {
        this.pages.set('home', {
            url: '/UNIverseCycling/pages/home.php',
            onLoad: () => {
                productsManager.init();
                productsManager.loadNewArrivals();
                categoriesManager.init();
                categoriesManager.showCategories();
                searchManager.init();
            },
            showTabs: true
        });

        this.pages.set('categories', {
            url: '/UNIverseCycling/pages/category.php',
            onLoad: (params) => {
                categoriesManager.init();
                if (params?.id) {
                    categoriesManager.showCategoryProducts(params.id);
                } else {
                    categoriesManager.showCategories();
                }
            },
            showTabs: true
        });

        this.pages.set('login', {
            url: '/UNIverseCycling/pages/auth/login.php',
            onLoad: () => {
                authManager.bindLoginForm();
            },
            hideNav: true
        });

        this.pages.set('register', {
            url: '/UNIverseCycling/pages/auth/register.php',
            onLoad: () => {
                authManager.bindRegisterForm();
            },
            hideNav: true
        });

        this.pages.set('search', {
            url: '/UNIverseCycling/pages/search.php',
            onLoad: () => {
                productsManager.init();
                searchManager.init();
            },
            showTabs: false
        });

        this.pages.set('cart', {
            url: '/UNIverseCycling/pages/cart.php',
            onLoad: () => {
                cartManager.init();
            },
            showTabs: false
        });

        this.pages.set('checkout', {
            url: '/UNIverseCycling/pages/checkout.php',
            onLoad: () => {
                checkoutManager.init();
            },
            showTabs: false
        });

        this.pages.set('profile', {
            url: '/UNIverseCycling/pages/profile.php',
            onLoad: () => {
                profileManager.init();
            },
            showTabs: false
        });

        this.pages.set('notifications', {
            url: '/UNIverseCycling/pages/notifications.php',
            onLoad: () => {
                const notificationManager = new NotificationManager();
                notificationManager.init();
            },
            showTabs: false
        });

        this.pages.set('product', {
            url: '/UNIverseCycling/pages/product.php',
            onLoad: (params) => {
                if (params.id) {
                    productsManager.showProductDetails(params.id, false);
                } else {
                    this.loadPage('home');
                }
            },
            showTabs: false
        });
    }

    setupNavigationListeners() {
        // Setup tab navigation
        document.querySelectorAll('.nav-link').forEach(tab => {
            tab.addEventListener('click', (e) => {
                e.preventDefault();
                const page = tab.dataset.page;
                if (page) {
                    this.loadPage(page);
                }
            });
        });

        // Bottom navigation
        document.querySelectorAll('.navbar a[data-page]').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const page = e.currentTarget.dataset.page;
                this.loadPage(page);
            });
        });

        // Generic navigation
        document.addEventListener('click', (e) => {
            // Trova il link più vicino nell'albero degli eventi
            const link = e.target.closest('a[href]');
            
            // Se non è un link o è un link di un modale o ha data-page, ignora
            if (!link || 
                link.closest('.modal') || 
                link.hasAttribute('data-page') ||
                link.hasAttribute('data-action') ||
                link.hasAttribute('data-bs-toggle')) {
                return;
            }

            // Se è un link interno
            if (link.getAttribute('href').startsWith('#')) {
                const page = link.getAttribute('href').substring(1);
                if (this.pages.has(page)) {
                    e.preventDefault();
                    this.loadPage(page);
                }
            }
        });

        // Handle browser back/forward
        window.addEventListener('popstate', (e) => {
            if (e.state && e.state.page) {
                this.loadPage(e.state.page, null, false);
            }
        });
    }

    handleInitialPage() {
        // Check authentication first
        if (!AuthService.isAuthenticated() && 
            !['login', 'register'].includes(this.getCurrentPage())) {
            this.loadPage('login');
            return;
        }
    
        const urlParams = new URLSearchParams(window.location.search);
        const page = urlParams.get('page') || 'home';
        
        if (this.pages.has(page)) {
            this.loadPage(page);
        } else {
            this.loadPage('home');
        }
    }

    getCurrentPage() {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get('page') || 'home';
    }

    hideNavigationElements() {
        const bottomNav = document.querySelector('.navbar.fixed-bottom');
        if (bottomNav) bottomNav.style.display = 'none';

        const searchContainer = document.querySelector('.search-container');
        if (searchContainer) searchContainer.style.display = 'none';

        const tabs = document.querySelector('.nav.nav-tabs');
        if (tabs) tabs.style.display = 'none';

        const topNav = document.querySelector('.navbar:not(.fixed-bottom)');
        if (topNav) topNav.style.display = 'none';
    }

    showNavigationElements() {
        const bottomNav = document.querySelector('.navbar.fixed-bottom');
        if (bottomNav) bottomNav.style.display = 'flex';

        const searchContainer = document.querySelector('.search-container');
        if (searchContainer) searchContainer.style.display = 'block';

        const tabs = document.querySelector('.nav.nav-tabs');
        if (tabs) tabs.style.display = 'flex';

        const topNav = document.querySelector('.navbar:not(.fixed-bottom)');
        if (topNav) topNav.style.display = 'flex';
    }

    loadPage(pageName, params = {}, pushState = true) {
        const page = this.pages.get(pageName);
        if (!page) {
            console.error(`Page ${pageName} not found`);
            return;
        }

        // Controlla se stiamo solo aggiornando i parametri della stessa pagina
        const currentUrl = new URLSearchParams(window.location.search);
        const currentPage = currentUrl.get('page') || 'home';
        const isPageChange = currentPage !== pageName;

        this.currentPage = pageName;

        // Aggiorna SEMPRE il tab attivo, indipendentemente da page.showTabs
        document.querySelectorAll('.nav-link').forEach(tab => {
            if (tab.dataset.page === pageName) {
                tab.classList.add('active');
            } else {
                tab.classList.remove('active');
            }
        });

        // Gestisci la visibilità degli elementi di navigazione
        if (page.hideNav) {
            this.hideNavigationElements();
        } else {
            this.showNavigationElements();
            // Nascondi i tabs se la pagina non li richiede
            if (!page.showTabs) {
                const tabs = document.querySelector('.nav.nav-tabs');
                if (tabs) tabs.style.display = 'none';
            }
        }

        // Costruisci l'URL con i parametri
        const queryParams = new URLSearchParams(params).toString();
        const newUrl = `?page=${pageName}${queryParams ? '&' + queryParams : ''}`;
        
        // Aggiorna l'URL del browser e la history
        if (pushState) {
            const state = { page: pageName, params };
            // Se stiamo cambiando pagina, usa pushState
            // Se stiamo solo aggiornando parametri o non è un cambio di pagina, usa replaceState
            if (isPageChange) {
                window.history.pushState(state, '', newUrl);
            } else {
                window.history.replaceState(state, '', newUrl);
            }
        }

        // Annulla la richiesta precedente se esiste
        if (this.currentRequest && this.currentRequest.abort) {
            this.currentRequest.abort();
        }

        // Mostra loading state
        this.showLoading();

        // Crea un controller per poter annullare la richiesta
        const controller = new AbortController();
        const signal = controller.signal;
        this.currentRequest = controller;

        // Carica il contenuto della pagina
        fetch(page.url, { signal })
            .then(response => response.text())
            .then(html => {
                // Controlla se questa è ancora la richiesta corrente
                if (this.currentRequest === controller) {
                    this.mainContent.innerHTML = html;
                    if (page.onLoad) {
                        page.onLoad(params);
                    }
                    window.scrollTo(0, 0);
                }
            })
            .catch(error => {
                // Ignora gli errori di abort
                if (error.name === 'AbortError') {
                    return;
                }
                console.error('Error loading page:', error);
                if (this.currentRequest === controller) {
                    this.showError('Error loading page. Please try again.');
                }
            })
            .finally(() => {
                // Pulisci la richiesta corrente se è ancora questa
                if (this.currentRequest === controller) {
                    this.currentRequest = null;
                }
            });
    }

    getBackLink() {
        const currentPage = this.getCurrentPage();
        const params = new URLSearchParams(window.location.search);
        const state = window.history.state || {};
        
        // Se siamo nella pagina delle categorie e c'è un ID, torniamo alla lista delle categorie
        if (currentPage === 'categories' && params.has('id')) {
            return `
                <a href="#" class="text-primary text-decoration-none d-inline-flex align-items-center mb-3" onclick="event.preventDefault(); pageLoader.loadPage('categories'); return false;">
                    <i class="bi bi-arrow-left me-2"></i>
                    <span>Back to Categories</span>
                </a>
            `;
        }

        // Se siamo nei dettagli di un prodotto e veniamo da una categoria
        if (currentPage === 'product' && state.fromCategory) {
            return `
                <a href="#" class="text-primary text-decoration-none d-inline-flex align-items-center mb-3" onclick="event.preventDefault(); pageLoader.loadPage('categories', { id: '${state.fromCategory}' }); return false;">
                    <i class="bi bi-arrow-left me-2"></i>
                    <span>Back to Category</span>
                </a>
            `;
        }

        // Altrimenti usiamo il back standard del browser
        return `
            <a href="#" class="text-primary text-decoration-none d-inline-flex align-items-center mb-3" onclick="event.preventDefault(); window.history.back(); return false;">
                <i class="bi bi-arrow-left me-2"></i>
                <span>Back</span>
            </a>
        `;
    }

    showLoading() {
        this.mainContent.innerHTML = `
            <div class="text-center py-5">
                <div class="spinner-border text-primary" role="status">
                    <span class="visually-hidden">Loading...</span>
                </div>
            </div>
        `;
    }

    showError(message) {
        this.mainContent.innerHTML = `
            <div class="container py-5">
                <div class="alert alert-danger" role="alert">
                    ${message}
                </div>
            </div>
        `;
    }

    updateActiveNavItem(pageName) {
        document.querySelectorAll('[data-page]').forEach(link => {
            link.classList.toggle('active', link.dataset.page === pageName);
        });
    }
}

export const pageLoader = new PageLoader();
window.pageLoader = pageLoader;