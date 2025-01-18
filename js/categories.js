// categories.js
import APIService from './api-service.js';

class CategoriesManager {
    constructor() {
        this.categories = [];
        this.init();
    }

    async init() {
        // Aggiungi event listener per il tab delle categorie
        const categoriesTab = document.querySelector('a[data-page="categories"]');
        if (categoriesTab) {
            categoriesTab.addEventListener('click', (e) => {
                e.preventDefault();
                this.showCategories();
            });
        }

        // Aggiungi event listener per il tab home
        const homeTab = document.querySelector('a[data-page="home"]');
        if (homeTab) {
            homeTab.addEventListener('click', (e) => {
                e.preventDefault();
                
                // Mostra tutti gli elementi della home
                const homeElements = document.querySelectorAll('.promo-banner, .section');
                homeElements.forEach(el => {
                    if (el) el.style.display = 'block';
                });

                // Nascondi le sezioni delle categorie
                const categoriesContainer = document.querySelector('.categories-container');
                const categoryProductsContainer = document.querySelector('.category-products-container');
                if (categoriesContainer) categoriesContainer.style.display = 'none';
                if (categoryProductsContainer) categoryProductsContainer.style.display = 'none';

                // Attiva il tab home
                document.querySelectorAll('.nav-link').forEach(link => {
                    link.classList.remove('active');
                });
                homeTab.classList.add('active');
            });
        }
    }

    async showCategories() {
        try {
            console.log('Iniziando il caricamento delle categorie...');
            
            // Nascondi tutti i contenuti della home
            const homeElements = document.querySelectorAll('.promo-banner, .section');
            homeElements.forEach(el => {
                if (el) el.style.display = 'none';
            });
            
            const categoryProductsContainer = document.querySelector('.category-products-container');
            if (categoryProductsContainer) categoryProductsContainer.style.display = 'none';

            // Crea o seleziona il container delle categorie
            let categoriesContainer = document.querySelector('.categories-container');
            if (!categoriesContainer) {
                console.log('Creando il container delle categorie...');
                categoriesContainer = document.createElement('div');
                categoriesContainer.className = 'categories-container';
                const container = document.querySelector('.container');
                if (container) {
                    container.appendChild(categoriesContainer);
                } else {
                    throw new Error('Container principale non trovato');
                }
            }

            // Carica le categorie
            console.log('Chiamando API getCategories...');
            const response = await APIService.getCategories();
            console.log('Risposta API:', response);
            this.categories = response || [];

            if (!Array.isArray(this.categories)) {
                throw new Error('Le categorie non sono un array');
            }
            
            // Renderizza le categorie
            console.log('Renderizzando le categorie...');
            categoriesContainer.innerHTML = this.renderCategories();
            categoriesContainer.style.display = 'block';

            // Attiva il tab delle categorie
            const categoriesTab = document.querySelector('a[data-page="categories"]');
            if (categoriesTab) {
                document.querySelectorAll('.nav-link').forEach(link => {
                    link.classList.remove('active');
                });
                categoriesTab.classList.add('active');
            }
            
            console.log('Categorie caricate con successo!');
        } catch (error) {
            console.error('Errore dettagliato nel caricamento delle categorie:', error);
            console.error('Stack trace:', error.stack);
            this.showError(`Error loading categories: ${error.message}`);
        }
    }

    renderCategories() {
        return `
            <div class="categories-list mx-auto" style="max-width: 600px;">
                ${this.categories.map(category => `
                    <div class="mb-3">
                        <div class="category-card rounded-3 overflow-hidden position-relative" 
                             role="button"
                             onclick="window.categoriesManager.showCategoryProducts('${category.category_id}', '${category.name}')">
                            <img src="/UNIverseCycling/img/${category.name.toLowerCase()}/category.jpg" 
                                 class="w-100 h-100 object-fit-cover" 
                                 alt="${category.name}"
                                 style="height: 100px;"
                                 onerror="this.src='/UNIverseCycling/assets/images/placeholder.jpg'">
                            <div class="category-overlay position-absolute start-0 bottom-0 w-100 p-3 bg-gradient-dark">
                                <div class="d-flex justify-content-between align-items-center">
                                    <h2 class="h6 text-white mb-0">${category.name}</h2>
                                    <p class="text-white-50 small mb-0">${category.product_count || 0} Products</p>
                                </div>
                            </div>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    }

    async showCategoryProducts(categoryId, categoryName) {
        try {
            // Carica i prodotti della categoria
            const products = await APIService.getProductsByCategory(categoryId);
            
            // Nascondi le categorie
            const categoriesContainer = document.querySelector('.categories-container');
            if (categoriesContainer) categoriesContainer.style.display = 'none';

            // Crea o seleziona il container dei prodotti della categoria
            let categoryProductsContainer = document.querySelector('.category-products-container');
            if (!categoryProductsContainer) {
                categoryProductsContainer = document.createElement('div');
                categoryProductsContainer.className = 'category-products-container';
                const container = document.querySelector('.container');
                if (container) {
                    container.appendChild(categoryProductsContainer);
                } else {
                    throw new Error('Container principale non trovato');
                }
            }

            // Renderizza i prodotti
            categoryProductsContainer.innerHTML = `
                <div class="d-flex align-items-center mb-4">
                    <button class="btn btn-link text-decoration-none p-0 me-3 text-primary" onclick="window.categoriesManager.showCategories()">
                        <i class="bi bi-arrow-left h5 mb-0"></i>
                        <span class="ms-2">Back</span>
                    </button>
                    <h1 class="h4 mb-0">${categoryName}</h1>
                </div>

                <div class="row row-cols-2 row-cols-md-3 row-cols-lg-4 g-3">
                    ${products.map(product => `
                        <div class="col">
                            <div class="product-card h-100" 
                                 role="button"
                                 onclick="window.productsManager.showProductDetails(${JSON.stringify(product).replace(/"/g, '&quot;')})">
                                <div class="product-image-wrapper">
                                    <img src="${product.image_path}" 
                                         class="product-image" 
                                         alt="${product.name}"
                                         loading="lazy"
                                         onerror="this.src='/UNIverseCycling/assets/images/placeholder.jpg'">
                                </div>
                                <div class="product-info p-3">
                                    <h3 class="product-title h6 mb-2">${product.name}</h3>
                                    <p class="product-price mb-0">€${parseFloat(product.price).toFixed(2)}</p>
                                </div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            `;
            
            categoryProductsContainer.style.display = 'block';
        } catch (error) {
            console.error('Error loading category products:', error);
            this.showError('Error loading products. Please try again later.');
        }
    }

    showError(message) {
        const toast = document.createElement('div');
        toast.className = 'toast align-items-center text-white bg-danger border-0';
        toast.setAttribute('role', 'alert');
        toast.setAttribute('aria-live', 'assertive');
        toast.setAttribute('aria-atomic', 'true');
        
        toast.innerHTML = `
            <div class="d-flex">
                <div class="toast-body">${message}</div>
                <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
            </div>
        `;
        
        const container = document.querySelector('.toast-container');
        if (container) {
            container.appendChild(toast);
            const bsToast = new bootstrap.Toast(toast);
            bsToast.show();
        }
    }
}

// Crea l'istanza globale
window.categoriesManager = new CategoriesManager();
