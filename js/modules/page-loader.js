import { productsManager } from './products.js';
import { categoriesManager } from './categories.js';
import { cartManager } from './cart.js';
import { ordersManager } from './orders.js';
import { searchManager } from './search.js';
import { AuthService } from '../services/auth.service.js';
import { authManager } from './auth.js';

export class PageLoader {
    constructor() {
        this.mainContent = document.querySelector('.main-content');
        this.currentPage = null;
        this.pages = new Map();
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
                searchManager.init();
            }
        });

        this.pages.set('categories', {
            url: '/UNIverseCycling/pages/categories.php',
            onLoad: () => categoriesManager.showCategories()
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
                this.hideNavigationElements();
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
    }

    setupNavigationListeners() {
        document.querySelectorAll('[data-page]').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const page = e.currentTarget.dataset.page;
                this.loadPage(page);
            });
        });

        window.addEventListener('popstate', (e) => {
            if (e.state?.page) {
                this.loadPage(e.state.page, false);
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
    }

    showNavigationElements() {
        const bottomNav = document.querySelector('.navbar.fixed-bottom');
        if (bottomNav) bottomNav.style.display = 'flex';

        const searchContainer = document.querySelector('.search-container');
        if (searchContainer) searchContainer.style.display = 'block';
    }

    async loadPage(pageName, updateHistory = true) {
        if (!this.mainContent || !this.pages.has(pageName)) {
            console.error('Cannot load page:', pageName);
            return;
        }

        const pageConfig = this.pages.get(pageName);

        try {
            const response = await fetch(pageConfig.url);
            if (!response.ok) {
                throw new Error('Errore nel caricamento della pagina');
            }
            
            const html = await response.text();
            this.mainContent.innerHTML = html;
            
            if (pageConfig.onLoad) {
                pageConfig.onLoad();
            }

            if (updateHistory && !pageConfig.disableNavigation) {
                const url = new URL(window.location);
                url.searchParams.set('page', pageName);
                history.pushState({ page: pageName }, '', url);
            }

            if (pageConfig.hideNav) {
                this.hideNavigationElements();
            } else {
                this.showNavigationElements();
            }

            this.updateActiveNavItem(pageName);
        } catch (error) {
            console.error('Error loading page:', error);
            this.mainContent.innerHTML = '<div class="alert alert-danger">Error loading page</div>';
        }
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