import { productsManager } from './products.js';
import { categoriesManager } from './categories.js';
import { cartManager } from './cart.js';
import { searchManager } from './search.js';
import { AuthService } from '../services/auth.service.js';
import { authManager } from './auth.js';
import { profileManager } from './profile.js';

export class PageLoader {
    constructor() {
        this.mainContent = document.querySelector('.main-content');
        this.currentPage = null;
        this.pages = new Map();
        this.navigationHistory = [];
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
            onLoad: () => {
                categoriesManager.init();
                categoriesManager.showCategories();
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
            }
        });

        this.pages.set('cart', {
            url: '/UNIverseCycling/pages/cart.php',
            onLoad: () => {
                if (!AuthService.isAuthenticated()) {
                    this.loadPage('login');
                    return;
                }
                cartManager.loadCart();
                cartManager.showCart();
            }
        });

        this.pages.set('profile', {
            url: '/UNIverseCycling/pages/profile.php',
            onLoad: () => {
                if (!AuthService.isAuthenticated()) {
                    this.loadPage('login');
                    return;
                }
                profileManager.init();
            }
        });
    }

    setupNavigationListeners() {
        // Tab navigation
        document.querySelectorAll('.nav-link[data-page]').forEach(tab => {
            tab.addEventListener('click', (e) => {
                e.preventDefault();
                const page = tab.dataset.page;
                
                // Aggiorna i tab
                document.querySelectorAll('.nav-link').forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                
                // Carica la pagina
                this.loadPage(page);
            });
        });

        // Handle browser back/forward
        window.addEventListener('popstate', (event) => {
            if (event.state?.page) {
                this.loadPage(event.state.page, false);
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

    loadPage(pageName, params = {}) {
        // Salva la pagina corrente nella cronologia
        if (this.currentPage) {
            this.navigationHistory.push({
                page: this.currentPage,
                params: new URLSearchParams(window.location.search)
            });
        }

        const page = this.pages.get(pageName);
        if (!page) {
            console.error(`Page ${pageName} not found`);
            return;
        }

        this.currentPage = pageName;

        // Aggiorna il tab attivo solo se la pagina deve mostrare i tabs
        if (page.showTabs) {
            document.querySelectorAll('.nav-link').forEach(tab => {
                if (tab.dataset.page === pageName) {
                    tab.classList.add('active');
                } else {
                    tab.classList.remove('active');
                }
            });
        }

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
        const queryString = Object.entries(params)
            .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
            .join('&');
        const url = `${page.url}${queryString ? '?' + queryString : ''}`;

        fetch(url)
            .then(response => response.text())
            .then(html => {
                this.mainContent.innerHTML = html;
                if (page.onLoad) {
                    page.onLoad(params);
                }
                window.scrollTo(0, 0);
            })
            .catch(error => {
                console.error('Error loading page:', error);
            });
    }

    goBack() {
        if (this.navigationHistory.length > 0) {
            const lastPage = this.navigationHistory.pop();
            this.loadPage(lastPage.page, Object.fromEntries(lastPage.params));
        } else {
            this.loadPage('home');
        }
    }

    getBackLink() {
        return `
            <a href="#" class="text-primary text-decoration-none d-inline-flex align-items-center mb-3" onclick="pageLoader.goBack(); return false;">
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