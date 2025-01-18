import APIService from './api-service.js';

class DataLoader {
    constructor() {
        this.categories = [];
        this.newArrivals = [];
    }

    async loadNewArrivals() {
        try {
            const products = await APIService.getNewArrivals();
            return this.renderProductsGrid(products);
        } catch (error) {
            console.error('Error loading new arrivals:', error);
            return `
                <div class="alert alert-danger d-flex align-items-center" role="alert">
                    <i class="bi bi-exclamation-triangle-fill me-2"></i>
                    <div>Error loading new arrivals. Please try again later.</div>
                </div>
            `;
        }
    }

    async loadCategories() {
        try {
            const categories = await APIService.getCategories();
            return this.renderCategoriesList(categories);
        } catch (error) {
            console.error('Error loading categories:', error);
            return `
                <div class="alert alert-danger d-flex align-items-center" role="alert">
                    <i class="bi bi-exclamation-triangle-fill me-2"></i>
                    <div>Error loading categories. Please try again later.</div>
                </div>
            `;
        }
    }

    async loadProductsByCategory(categoryId) {
        try {
            const products = await APIService.getProductsByCategory(categoryId);
            return Array.isArray(products) ? products : [];
        } catch (error) {
            console.error(`Error fetching products for category ${categoryId}:`, error);
            throw new Error('Failed to load products.');
        }
    }

    async loadSearch(query) {
        try {
            const products = await APIService.searchProducts(query);
            return Array.isArray(products) ? products : [];
        } catch (error) {
            console.error(`Error fetching products for search "${query}":`, error);
            throw new Error('Failed to load products.');
        }
    }

    renderProductsGrid(products) {
        if (!products) {
            return `
                <div class="alert alert-warning d-flex align-items-center" role="alert">
                    <i class="bi bi-exclamation-circle-fill me-2"></i>
                    <div>No product data available</div>
                </div>
            `;
        }

        const productArray = Array.isArray(products) ? products : [];

        return productArray.length > 0 
            ? `<div class="row row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-lg-4 g-3">
                ${productArray.map(product => {
                    // Ensure image path starts with /UNIverseCycling/
                    const imagePath = product.image_path.startsWith('/') 
                        ? `/UNIverseCycling${product.image_path}`
                        : `/UNIverseCycling/${product.image_path}`;
                    
                    return `
                        <div class="col">
                            <div class="product-card h-100" data-product-id="${product.product_id}">
                                <div class="product-image-wrapper">
                                    <img src="${imagePath}" 
                                        class="product-image" 
                                        alt="${product.name}"
                                        onerror="this.src='/UNIverseCycling/assets/images/placeholder.jpg'">
                                </div>
                                <div class="product-info p-3">
                                    <h4 class="product-title h6 mb-2">${product.name}</h4>
                                    <p class="product-price mb-0">€${parseFloat(product.price).toFixed(2)}</p>
                                </div>
                            </div>
                        </div>
                    `;
                }).join('')}
            </div>`
            : `
                <div class="alert alert-info d-flex align-items-center" role="alert">
                    <i class="bi bi-info-circle-fill me-2"></i>
                    <div>No products available</div>
                </div>
            `;
    }

    renderCategoriesList(categories) {
        if (!categories || categories.length === 0) {
            return `
                <div class="alert alert-info d-flex align-items-center" role="alert">
                    <i class="bi bi-info-circle-fill me-2"></i>
                    <div>No categories available</div>
                </div>
            `;
        }
    
        return `
            <div class="row g-4">
                ${categories.map(category => `
                    <div class="col-12 col-md-6">
                        <div class="card h-100 category-item" data-category-id="${category.category_id}">
                            <div class="row g-0 h-100">
                                <div class="col-4">
                                    <div class="h-100 bg-light rounded-start overflow-hidden">
                                        <img src="/UNIverseCycling/${category.image_path}" 
                                            class="w-100 h-100" 
                                            alt="${category.name}"
                                            style="object-fit: cover;"
                                            onerror="this.src='/UNIverseCycling/img/placeholder.jpg'">
                                    </div>
                                </div>
                                <div class="col-8">
                                    <div class="card-body h-100 d-flex flex-column">
                                        <h3 class="card-title h5 mb-3">${category.name}</h3>
                                        <div class="mt-auto">
                                            <span class="badge bg-primary rounded-pill">
                                                <i class="bi bi-box-seam me-1"></i>
                                                ${category.product_count} Products
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    }

    renderSearchResults(products) {
        if (!products || products.length === 0) {
            return `
                <div class="alert alert-info d-flex align-items-center" role="alert">
                    <i class="bi bi-info-circle-fill me-2"></i>
                    <div>No products found matching your search.</div>
                </div>
            `;
        }

        return `
            <div class="products-grid">
                ${products.map(product => this.renderProductCard(product)).join('')}
            </div>
        `;
    }

    renderProductCard(product) {
        return `
            <div class="product-card" data-product-id="${product.product_id}">
                <div class="product-image-wrapper">
                    <img src="/UNIverseCycling/${product.image_path}" 
                        class="product-image" 
                        alt="${product.name}"
                        onerror="this.src='/UNIverseCycling/img/placeholder.jpg'">
                </div>
                <div class="product-info">
                    <h3 class="product-title">${product.name}</h3>
                    <p class="product-price">€${product.price}</p>
                </div>
            </div>
        `;
    }
}

export default DataLoader;