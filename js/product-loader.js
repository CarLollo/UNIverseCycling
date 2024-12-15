// product-loader.js
import APIService from './api-service.js';

class ProductLoader {
    constructor(uiManager) {
        this.uiManager = uiManager;
    }

    async loadInitialData() {
        try {
            const [newArrivals, categories] = await Promise.all([
                APIService.getNewArrivals(),
                APIService.getCategories()
            ]);

            this.renderNewArrivals(newArrivals);
            this.renderCategories(categories);
        } catch (error) {
            console.error('Errore nel caricamento dei dati:', error);
            this.showErrorMessage('Impossibile caricare i prodotti');
        }
    }

    renderNewArrivals(products) {
        const productsGrid = document.querySelector('.home-page .products-grid');
        productsGrid.innerHTML = products.length > 0 
            ? products.map(this.createProductCard).join('')
            : '<p>Nessun nuovo arrivo disponibile</p>';
        
        // Attach click events to product cards
        this.attachProductClickHandlers();
    }

    renderCategories(categories) {
        const categoriesList = document.querySelector('.categories-page .categories-list');
        categoriesList.innerHTML = categories.length > 0 
            ? categories.map(this.createCategoryItem).join('')
            : '<p class="no-categories">Nessuna categoria disponibile</p>';
        
        this.setupCategoryNavigation();
    }

    createProductCard(product) {
        return `
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
        `;
    }

    createCategoryItem(category) {
        return `
            <div class="category-item" data-category-id="${category.category_id}">
                <div class="category-info">
                    <div class="category-text">
                        <h3>${category.name}</h3>
                        <span class="product-count">${category.product_count} Prodotti</span>
                    </div>
                    <div class="category-image">
                        <img src="/UNIverseCycling/${category.image_path}" 
                             alt="${category.name}"
                             onerror="this.src='/UNIverseCycling/img/placeholder.jpg'">
                    </div>
                </div>
            </div>
        `;
    }

    attachProductClickHandlers() {
        const productCards = document.querySelectorAll('.product-card');
        productCards.forEach(card => {
            card.addEventListener('click', () => {
                const productId = card.dataset.productId;
                this.uiManager.showProductDetails(productId);
            });
        });
    }

    setupCategoryNavigation() {
        const categoryItems = document.querySelectorAll('.category-item');
        categoryItems.forEach(item => {
            item.addEventListener('click', async () => {
                const categoryId = item.dataset.categoryId;
                const categoryName = item.querySelector('h3').textContent;
                
                try {
                    const response = await APIService.request(`/products.php?action=getByCategory&category_id=${categoryId}`);
                    this.renderCategoryProducts(response, categoryName);
                } catch (error) {
                    console.error('Errore nel caricamento dei prodotti della categoria:', error);
                    this.showErrorMessage('Impossibile caricare i prodotti della categoria');
                }
            });
        });
    }

    renderCategoryProducts(products, categoryName) {
        const categoryProductsPage = document.querySelector('.category-products-page');
        const productsGrid = categoryProductsPage.querySelector('.products-grid');
        
        document.querySelector('.category-title').textContent = categoryName;
        
        productsGrid.innerHTML = products.length > 0 
            ? products.map(this.createProductCard).join('')
            : '<p>Nessun prodotto trovato in questa categoria</p>';
        
        this.attachProductClickHandlers();
        
        // Mostra la pagina dei prodotti della categoria
        document.querySelector('.categories-page').classList.remove('active');
        categoryProductsPage.classList.add('active');
    }

    showErrorMessage(message) {
        // Implementa una modalità di gestione degli errori
        alert(message);
    }
}

export default ProductLoader;