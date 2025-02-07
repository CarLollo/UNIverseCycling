import { APIService } from '../services/api-service.js';
import { AuthService } from '../services/auth.service.js';
import { pageLoader } from './page-loader.js';
import { notificationManager } from './notification-manager.js';

export class CategoriesManager {
    constructor() {
        this.categoriesContainer = null;
    }

    init() {
        if (!AuthService.isAuthenticated()) {
            console.log('User not logged in, skipping categories initialization');
            return;
        }
        this.categoriesContainer = document.querySelector('.categories-container');
    }

    async showCategories() {
        console.log('showing categories');
        if (!this.categoriesContainer) return;

        try {
            const categories = await APIService.getCategories();
            this.renderCategories(categories);
        } catch (error) {
            console.error('Error loading categories:', error);
            await notificationManager.createNotification('error', 'Error loading categories');
            this.showError('Error loading categories. Please try again.');
        }
    }

    renderCategories(categories) {
        if (!categories?.length) {
            this.categoriesContainer.innerHTML = `
                <div class="text-center py-4">
                    <p class="mb-0">No categories available</p>
                </div>
            `;
            return;
        }

        this.categoriesContainer.innerHTML = `
            <div class="container py-4">
                <h2 class="mb-4">Our Categories</h2>
                <div class="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
                    ${categories.map(category => `
                        <div class="col">
                            ${this.renderCategoryCard(category)}
                        </div>
                    `).join('')}
                </div>
            </div>
        `;

        document.querySelectorAll('.category-banner').forEach(card => {
            card.addEventListener('click', () => {
                const categoryId = card.dataset.categoryId;
                pageLoader.loadPage('categories', { id: categoryId });
            });
        });
    }

    renderCategoryCard(category) {
        const imagePath = category.image_path.startsWith('/') 
            ? `/UNIverseCycling${category.image_path}`
            : `/UNIverseCycling/${category.image_path}`;

        return `
            <div class="category-banner mb-4" data-category-id="${category.category_id}">
                <div class="product-card card border-0 shadow-sm position-relative overflow-hidden" style="height: 200px;">
                    <img src="${imagePath}" 
                         class="position-absolute w-100 h-100" 
                         alt="${category.name}"
                         style="object-fit: cover; right: 0; top: 0;"
                         onerror="this.src='/UNIverseCycling/img/placeholder.jpg'">
                    <div class="card-img-overlay d-flex flex-column justify-content-between" 
                         style="background: linear-gradient(to bottom, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.7) 100%);">
                        <div class="d-flex justify-content-between align-items-start">
                            <h3 class="h4 text-white mb-0 fw-bold" style="text-shadow: 2px 2px 4px rgba(0,0,0,0.5);">
                                ${category.name}
                            </h3>
                            <span class="badge bg-primary">
                                ${category.product_count || 0} Products
                            </span>
                        </div>
                        <div class="mt-auto">
                            <div class="d-flex align-items-center">
                                <span class="text-white small" style="text-shadow: 1px 1px 2px rgba(0,0,0,0.5);">
                                    Click to view all products
                                </span>
                                <i class="bi bi-arrow-right text-white ms-2"></i>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    async showCategoryProducts(categoryId) {
        if (!this.categoriesContainer) return;

        try {
            const products = await APIService.getProductsByCategory(categoryId);
            if (!products?.length) {
                this.categoriesContainer.innerHTML = `
                    <div class="container py-4">
                        <div class="mb-3">
                            ${pageLoader.getBackLink()}
                        </div>
                        <div class="text-center py-4">
                            <p class="mb-0">No products available in this category</p>
                        </div>
                    </div>
                `;
                return;
            }

            const { productsManager } = await import('./products.js');
            this.categoriesContainer.innerHTML = `
                <div class="container py-4">
                    <div class="mb-3">
                        ${pageLoader.getBackLink()}
                    </div>
                    ${productsManager.renderProductsGrid(products, categoryId)}
                </div>
            `;

            document.querySelectorAll('.product-card').forEach(card => {
                card.addEventListener('click', (e) => this.handleProductClick(e));
            });
        } catch (error) {
            console.error('Error loading category products:', error);
            await notificationManager.createNotification('error', 'Error loading category products');
            this.showError('Error loading category products. Please try again.');
        }
    }

    handleProductClick(e) {
        const card = e.target.closest('.product-card');
        if (card) {
            const productId = card.dataset.productId;
            const categoryId = card.dataset.categoryId;
            if (productId) {
                pageLoader.loadPage('product', { 
                    id: productId,
                    fromCategory: categoryId 
                });
            }
        }
    }

    showError(message) {
        if (this.categoriesContainer) {
            this.categoriesContainer.innerHTML = `
                <div class="alert alert-danger" role="alert">
                    ${message}
                </div>
            `;
        }
    }
}

export const categoriesManager = new CategoriesManager();
window.categoriesManager = categoriesManager;