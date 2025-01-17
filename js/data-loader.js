import APIService from './api-service.js';

class DataLoader {
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
            console.log(`Products for category ${categoryId}:`, products);
            return this.renderProductsGrid(products);
        } catch (error) {
            console.error(`Error loading products for category ${categoryId}:`, error);
            return '<p>Error loading products. Please try again later.</p>';
        }
    }

    renderProductsGrid(products) {
        return products.length > 0 
            ? products.map(product => `
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
        return categories.length > 0 
            ? categories.map(category => `
                <div class="category-item" data-category-id="${category.category_id}">
                    <div class="category-info">
                        <div class="category-text">
                            <h3>${category.name}</h3>
                            <span class="product-count">${category.product_count} Products</span>
                        </div>
                        <div class="category-image">
                            <img src="/UNIverseCycling/${category.image_path}" 
                                 alt="${category.name}"
                                 onerror="this.src='/UNIverseCycling/img/placeholder.jpg'">
                        </div>
                    </div>
                </div>
            `).join('')
            : '<p class="no-categories">No categories available</p>';
    }
}

export default DataLoader;