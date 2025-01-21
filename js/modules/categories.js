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
            const products = await APIService.getCategoryById(categoryId);
            this.renderCategoryProducts(products);
        } catch (error) {
            console.error('Error loading category products:', error);
            this.showError('Error loading products for this category. Please try again.');
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

        // Aggiungi gli event listeners dopo aver renderizzato
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
                <div class="position-relative">
                    <img src="${imagePath}" 
                         alt="${category.name}"
                         class="w-100 category-img">
                    <div class="category-overlay">
                        <div>
                            <h3 class="category-title">${category.name}</h3>
                            <p class="text-white mb-0 mt-2 opacity-75">${category.product_count || 0} Products</p>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    renderCategoryProducts(products) {
        if (!this.categoriesContainer) return;

        if (products.length === 0) {
            this.categoriesContainer.innerHTML = `
                <div class="text-center py-4">
                    <p class="mb-0">No products available in this category</p>
                </div>
            `;
            return;
        }

        this.categoriesContainer.innerHTML = `
            <div class="mb-3">
                <a href="#" class="text-decoration-none text-dark" onclick="categoriesManager.showCategories(); return false;">
                    <i class="bi bi-arrow-left me-2"></i>Back to Categories
                </a>
            </div>
            <div class="row row-cols-2 row-cols-md-3 g-3">
                ${products.map(product => this.renderProductCard(product)).join('')}
            </div>
        `;

        // Aggiungi gli event listeners dopo aver renderizzato
        document.querySelectorAll('.product-card').forEach(card => {
            card.addEventListener('click', () => {
                const productId = card.dataset.productId;
                window.productsManager.showProductDetails(productId);
            });
        });
    }

    renderProductCard(product) {
        const imagePath = product.image_path.startsWith('/') 
            ? `/UNIverseCycling${product.image_path}`
            : `/UNIverseCycling/${product.image_path}`;

        return `
            <div class="col">
                <div class="product-card card h-100 border-0 shadow-sm" data-product-id="${product.product_id}">
                    <img src="${imagePath}" 
                         class="card-img-top" 
                         alt="${product.name}"
                         style="height: 200px; object-fit: cover;">
                    <div class="card-body">
                        <h5 class="card-title">${product.name}</h5>
                        <p class="card-text text-primary mb-0">€${parseFloat(product.price).toFixed(2)}</p>
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