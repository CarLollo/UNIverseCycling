import { APIService } from '../services/api-service.js';

export class CategoriesManager {
    constructor() {
        this.categoriesContainer = null;
        this.init();
    }

    init() {
        this.categoriesContainer = document.querySelector('.categories-container');
        const categoriesTab = document.querySelector('a[data-page="categories"]');
        if (categoriesTab) {
            categoriesTab.addEventListener('click', () => this.showCategories());
        }
    }

    async showCategories() {
        if (!this.categoriesContainer) return;

        try {
            const categories = await APIService.getCategories();
            this.renderCategories(categories);
        } catch (error) {
            console.error('Error loading categories:', error);
            this.showError('Error loading categories. Please try again.');
        }
    }

    async showCategoryProducts(categoryId) {
        if (!this.categoriesContainer) return;

        try {
            const products = await APIService.getProductsByCategory(categoryId);
            if (!products || products.length === 0) {
                this.categoriesContainer.innerHTML = `
                    <div class="container py-4">
                        <div class="mb-3">
                            <a href="#" class="text-decoration-none text-dark" onclick="categoriesManager.showCategories(); return false;">
                                <i class="bi bi-arrow-left me-2"></i>Back to Categories
                            </a>
                        </div>
                        <div class="text-center py-4">
                            <p class="mb-0">No products available in this category</p>
                        </div>
                    </div>
                `;
                return;
            }

            this.categoriesContainer.innerHTML = `
                <div class="container py-4">
                    <div class="mb-4">
                        <a href="#" class="text-decoration-none text-dark" onclick="categoriesManager.showCategories(); return false;">
                            <i class="bi bi-arrow-left me-2"></i>Back to Categories
                        </a>
                    </div>
                    <div class="row row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-lg-4 g-3">
                        ${products.map(product => window.productsManager.renderProductCard(product)).join('')}
                    </div>
                </div>
            `;
        } catch (error) {
            console.error('Error loading category products:', error);
            this.categoriesContainer.innerHTML = `
                <div class="container py-4">
                    <div class="mb-3">
                        <a href="#" class="text-decoration-none text-dark" onclick="categoriesManager.showCategories(); return false;">
                            <i class="bi bi-arrow-left me-2"></i>Back to Categories
                        </a>
                    </div>
                    <div class="alert alert-danger">
                        Error loading products. Please try again.
                    </div>
                </div>
            `;
        }
    }

    renderCategories(categories) {
        if (!this.categoriesContainer) return;

        if (categories.length === 0) {
            this.categoriesContainer.innerHTML = `
                <div class="text-center py-4">
                    <p class="mb-0">No categories available</p>
                </div>
            `;
            return;
        }

        this.categoriesContainer.innerHTML = `
            <div class="categories-fullwidth">
                ${categories.map(category => this.renderCategoryCard(category)).join('')}
            </div>
        `;

        document.querySelectorAll('.category-banner').forEach(card => {
            card.addEventListener('click', () => {
                const categoryId = card.dataset.categoryId;
                this.showCategoryProducts(categoryId);
            });
        });
    }

    renderCategoryCard(category) {
        const imagePath = category.image_path.startsWith('/') 
            ? `/UNIverseCycling${category.image_path}`
            : `/UNIverseCycling/${category.image_path}`;

        return `
            <div class="category-banner" data-category-id="${category.category_id}">
                <div class="product-card card border-0 shadow-sm position-relative overflow-hidden" style="height: 150px;">
                    <img src="${imagePath}" 
                         class="position-absolute w-100 h-100" 
                         alt="${category.name}"
                         style="object-fit: cover; right: 0; top: 0;">
                    <div class="card-img-overlay d-flex flex-column justify-content-between bg-gradient">
                        <div class="d-flex justify-content-between align-items-start">
                            <h3 class="h5 text-white mb-0">${category.name}</h3>
                        </div>
                        <p class="text-white mb-0">${category.product_count || 0} Products</p>
                    </div>
                </div>
            </div>
        `;
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