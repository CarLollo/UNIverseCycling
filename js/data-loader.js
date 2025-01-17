import APIService from './api-service.js';

class DataLoader {
    constructor() {
        this.categories = [];
        this.newArrivals = [];
    }

    async loadNewArrivals() {
        try {
            const products = await APIService.getNewArrivals();
            console.log('New Arrivals:', products);
            return this.renderProductsGrid(products);
        } catch (error) {
            console.error('Error loading new arrivals:', error);
            return '<p>Error loading new arrivals. Please try again later.</p>';
        }
    }

    async loadCategories() {
        try {
            const categories = await APIService.getCategories();
            console.log('Categories:', categories);
            return this.renderCategoriesList(categories);
        } catch (error) {
            console.error('Error loading categories:', error);
            return '<p>Error loading categories. Please try again later.</p>';
        }
    }

    async loadProductsByCategory(categoryId) {
        try {
            const products = await APIService.getProductsByCategory(categoryId);
            console.log('Products fetched for category:', products);
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
            console.error(`Error fetching products for category ${categoryId}:`, error);
            throw new Error('Failed to load products.');
        }
    }
    

    renderProductsGrid(products) {
        if (!products) {
            return '<p>Error: No product data available</p>';
        }

        const productArray = Array.isArray(products) ? products : [];

        return productArray.length > 0 
            ? productArray.map(product => `
                <div class="product-card" data-product-id="${product.product_id}">
                    <div class="product-image">
                        <img src="/UNIverseCycling/${product.image_path}" 
                             alt="${product.name}"
                             onerror="this.src='/UNIverseCycling/img/placeholder.jpg'">
                    </div>
                    <div class="product-info">
                        <h3>${product.name}</h3>
                        <p class="description">${product.description}</p>
                        <p class="price">€${product.price}</p>
                    </div>
                </div>
            `).join('')
            : '<p>No products available</p>';
    }

    renderCategoriesList(categories) {
        if (!categories || categories.length === 0) {
            return '<p class="no-categories">No categories available</p>';
        }
    
        return categories.map(category => `
            <div class="category-item" data-category-id="${category.category_id}">
                <div class="category-info">
                    <div class="category-text">
                        <h3>${category.name}</h3>
                        <span class="product-count">${category.product_count} Products</span>
                    </div>
                    <div class="category-image">
                        <img 
                            src="/UNIverseCycling/${category.image_path}" 
                            alt="${category.name}" 
                            onerror="this.src='/UNIverseCycling/img/placeholder.jpg'">
                    </div>
                </div>
            </div>
        `).join('');
    }

    renderSearchResults(products) {
        if (!products) {
            return '<p>Error: No search results available</p>';
        }
    
        const productArray = Array.isArray(products) ? products : [];
    
        return productArray.length > 0
            ? productArray.map(product => `
                <div class="search-result-item" data-product-id="${product.product_id}">
                    <div class="search-result-image">
                        <img src="/UNIverseCycling/${product.image_path}" 
                             alt="${product.name}"
                             onerror="this.src='/UNIverseCycling/img/placeholder.jpg'">
                    </div>
                    <div class="search-result-info">
                        <h4>${product.name}</h4>
                        <p class="price">€${product.price}</p>
                    </div>
                </div>
            `).join('')
            : '<p class="no-results">No matching products found</p>';
    }
    
    
}

export default DataLoader;