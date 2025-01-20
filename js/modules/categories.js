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
            const categories = await APIService.request('/categories.php?action=getAll');
            this.renderCategories(categories);
        } catch (error) {
            console.error('Error loading categories:', error);
            this.showError('Error loading categories. Please try again.');
        }
    }

    async showCategoryProducts(categoryId) {
        if (!this.categoriesContainer) return;

        try {
            const products = await APIService.request('/products.php?action=getByCategory&id=' + categoryId);
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
            <div class="row row-cols-2 row-cols-md-3 row-cols-lg-4 g-3">
                ${categories.map(category => this.renderCategoryCard(category)).join('')}
            </div>
        `;
    }

    renderCategoryCard(category) {
        return `
            <div class="col">
                <div class="card h-100" onclick="categoriesManager.showCategoryProducts(${category.id})">
                    <img src="${category.image}" class="card-img-top" alt="${category.name}">
                    <div class="card-body">
                        <h5 class="card-title">${category.name}</h5>
                        <p class="card-text">${category.description}</p>
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
            <div class="row row-cols-2 row-cols-md-3 row-cols-lg-4 g-3">
                ${products.map(product => this.renderProductCard(product)).join('')}
            </div>
        `;
    }

    renderProductCard(product) {
        return `
            <div class="col">
                <div class="card h-100">
                    <img src="${product.image}" class="card-img-top" alt="${product.name}">
                    <div class="card-body">
                        <h5 class="card-title">${product.name}</h5>
                        <p class="card-text">€${product.price.toFixed(2)}</p>
                        <button class="btn btn-primary btn-sm" 
                                onclick="cartManager.addToCart(${product.id})">
                            Add to Cart
                        </button>
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