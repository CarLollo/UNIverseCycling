import { productsManager } from './products.js';
import { categoriesManager } from './categories.js';
import { cartManager } from './cart.js';
import { searchManager } from './search.js';
import { AuthService } from '../services/auth.service.js';
import { authManager } from './auth.js';

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
                if (!page.hideNav) {
                    this.showNavigationElements();
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