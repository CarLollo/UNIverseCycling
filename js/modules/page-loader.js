import { productsManager } from './products.js';
import { categoriesManager } from './categories.js';
import { cartManager } from './cart.js';
import { ordersManager } from './orders.js';
import { searchManager } from './search.js';
import { AuthService } from '../services/auth.service.js';

export class PageLoader {
    constructor() {
        console.log('PageLoader constructor');
        this.mainContent = document.querySelector('.main-content');
        this.currentPage = null;
        this.pages = new Map();
        this.init();
    }

    init() {
        console.log('PageLoader init');
        this.registerPages();
        this.setupNavigationListeners();
        this.handleInitialPage();
    }

    registerPages() {
        console.log('PageLoader registerPages');
        this.pages.set('home', {
            url: '/UNIverseCycling/pages/home.php',
            onLoad: () => {
                console.log('Loading home page...');
                productsManager.init();
                productsManager.loadNewArrivals();
                searchManager.init();
            }
        });

        this.pages.set('categories', {
            url: '/UNIverseCycling/pages/categories.php',
            onLoad: () => categoriesManager.showCategories()
        });

        this.pages.set('cart', {
            url: '/UNIverseCycling/pages/cart.php',
            onLoad: () => cartManager.showCart(),
            requireAuth: true
        });

        this.pages.set('orders', {
            url: '/UNIverseCycling/pages/orders.php',
            onLoad: () => ordersManager.loadOrders(),
            requireAuth: true
        });

        this.pages.set('search', {
            url: '/UNIverseCycling/pages/search.php',
            onLoad: () => {
                console.log('Loading search page...');
                productsManager.init();
                searchManager.init();
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
        console.log('Handling initial page...');
        const urlParams = new URLSearchParams(window.location.search);
        const action = urlParams.get('action');
        const page = urlParams.get('page');

        if (action === 'search') {
            console.log('Loading search page...');
            this.loadPage('search');
        } else if (page && this.pages.has(page)) {
            console.log('Loading page:', page);
            this.loadPage(page);
        } else {
            console.log('Loading default home page...');
            this.loadPage('home');
        }
    }

    async loadPage(pageName, updateHistory = true) {
        console.log('Loading page:', pageName);
        if (!this.mainContent || !this.pages.has(pageName)) {
            console.error('Cannot load page:', pageName);
            console.error('mainContent:', this.mainContent);
            console.error('page config:', this.pages.get(pageName));
            return;
        }

        const pageConfig = this.pages.get(pageName);

        if (pageConfig.requireAuth && !AuthService.isAuthenticated()) {
            console.log('Auth required, redirecting to login...');
            window.location.href = '/pages/auth/login.php';
            return;
        }

        try {
            this.showLoading();
            console.log('Fetching page content from:', pageConfig.url);
            
            const response = await fetch(pageConfig.url);
            if (!response.ok) throw new Error('Failed to load page');
            
            const html = await response.text();
            console.log('Page content loaded, updating DOM...');
            this.mainContent.innerHTML = html;

            if (pageConfig.onLoad) {
                console.log('Running onLoad callback for:', pageName);
                await pageConfig.onLoad();
            }

            if (updateHistory) {
                const url = `${window.location.pathname}?page=${pageName}`;
                history.pushState({ page: pageName }, '', url);
            }

            this.updateActiveNavItem(pageName);
            this.currentPage = pageName;
            console.log('Page loaded successfully:', pageName);

        } catch (error) {
            console.error('Error loading page:', error);
            this.showError('Failed to load page. Please try again.');
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