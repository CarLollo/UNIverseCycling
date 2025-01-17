class UIManager {
    constructor(dataLoader, productManager, cartManager) {
        this.dataLoader = dataLoader;
        this.productManager = productManager;
        this.cartManager = cartManager;
        this.searchTimeout = null;
    }

    initialize() {
        this.setupNavigation();
        this.setupTabs();
        this.setupSearch();
        this.setupProductClick();
        this.loadInitialData();
        this.cartManager.initializeCartCount();
    }

    loadInitialData() {
        // Usa DataLoader per caricare i nuovi arrivi
        this.dataLoader.loadNewArrivals().then(html => {
            const productsGrid = document.querySelector('.home-page .products-grid');
            if (productsGrid) {
                productsGrid.innerHTML = html;
            }
        });

        // Usa DataLoader per caricare le categorie
        this.dataLoader.loadCategories().then(html => {
            const categoriesList = document.querySelector('.categories-page .categories-list');
            if (categoriesList) {
                categoriesList.innerHTML = html;
                this.setupCategoryNavigation();
            }
        });
    }

    setupCategoryNavigation() {
        const categoryItems = document.querySelectorAll('.category-item');
        const categoriesPage = document.querySelector('.categories-page');
        const categoryProductsPage = document.querySelector('.category-products-page');

        categoryItems.forEach(item => {
            item.addEventListener('click', async () => {
                const categoryId = item.dataset.categoryId;
                const categoryName = item.querySelector('h3').textContent;

                try {
                    const products = await this.dataLoader.loadProductsByCategory(categoryId);

                    // Update category title
                    document.querySelector('.category-title').textContent = categoryName;

                    // Update products grid
                    const productsGrid = categoryProductsPage.querySelector('.products-grid');
                    productsGrid.innerHTML = products.length > 0 
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
                        : '<p>No products found in this category</p>';

                    // Show category products page
                    categoriesPage.classList.remove('active');
                    categoryProductsPage.classList.add('active');

                } catch (error) {
                    console.error('Error loading products:', error);
                    categoryProductsPage.querySelector('.products-grid').innerHTML = 
                        '<p>Error loading products. Please try again.</p>';
                }
            });
        });
    }

    setupNavigation() {
        const navLinks = document.querySelectorAll('.bottom-nav a');
        const pages = document.querySelectorAll('.page');
    
        navLinks.forEach(link => {
            link.addEventListener('click', async (e) => {
                e.preventDefault();
                
                // Rimuovi lo stato attivo dai link e aggiungilo a quello cliccato
                navLinks.forEach(l => l.classList.remove('active'));
                link.classList.add('active');
    
                // Trova la pagina target
                const targetPage = link.getAttribute('href').substring(1); // Rimuove il "#" dall'href
                pages.forEach(page => page.classList.remove('active'));
                
                if (targetPage === 'cart') {
                    // Nascondi i tab quando mostri il carrello
                    document.querySelector('.tabs').style.display = 'none';
                    await this.cartManager.loadCartItems();
                } else {
                    // Mostra i tab per altre pagine
                    document.querySelector('.tabs').style.display = 'flex';
                }
                
                document.querySelector(`.${targetPage}-page`).classList.add('active');
            });
        });
    }

    setupTabs() {
        const tabLinks = document.querySelectorAll('.tabs a');
        const tabIndicator = document.querySelector('.tab-indicator');
        const pages = document.querySelectorAll('.page');
        
        // Set initial indicator position
        const activeTab = document.querySelector('.tabs a.active');
        if (activeTab) {
            tabIndicator.style.width = `${activeTab.offsetWidth}px`;
            tabIndicator.style.transform = `translateX(${activeTab.offsetLeft}px)`;
        }
        
        tabLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                
                // Update active tab
                tabLinks.forEach(l => l.classList.remove('active'));
                link.classList.add('active');
                
                // Move indicator
                tabIndicator.style.width = `${link.offsetWidth}px`;
                tabIndicator.style.transform = `translateX(${link.offsetLeft}px)`;
                
                // Show corresponding page
                const targetPage = link.getAttribute('data-page');
                pages.forEach(page => {
                    page.classList.remove('active');
                    if (page.classList.contains(`${targetPage}-page`)) {
                        page.classList.add('active');
                    }
                });
            });
        });
    }

    setupSearch() {
        const searchIcon = document.querySelector('.search-icon');
        const searchInput = document.querySelector('.search-input');
        const closeSearch = document.querySelector('.close-search');
        const searchField = searchInput ? searchInput.querySelector('input') : null;
        const searchResults = document.querySelector('.search-results');
        const pages = document.querySelectorAll('.page');
        const homePage = document.querySelector('.home-page');
        const tabs = document.querySelector('.tabs');

        if (searchIcon && searchInput && closeSearch && searchField) {
            searchIcon.addEventListener('click', () => {
                searchInput.classList.add('active');
                searchField.focus();
                searchIcon.style.visibility = 'hidden';
            });

            const hideSearch = () => {
                searchInput.classList.remove('active');
                searchField.value = '';
                searchIcon.style.visibility = 'visible';
                searchResults.classList.remove('active');
                // Mostra la home page
                pages.forEach(page => page.classList.remove('active'));
                homePage.classList.add('active');
                tabs.style.display = '';
            };

            closeSearch.addEventListener('click', hideSearch);

            // Add search functionality
            let searchTimeout;
            searchField.addEventListener('input', (e) => {
                clearTimeout(searchTimeout);
                const query = e.target.value.trim();
                
                if (query.length < 2) {
                    searchResults.classList.remove('active');
                    return;
                }

                searchTimeout = setTimeout(async () => {
                    try {
                        const products = await this.productManager.searchProducts(query);

                        // Nascondi tutte le pagine quando mostri i risultati
                        pages.forEach(page => page.classList.remove('active'));
                        tabs.style.display = 'none';

                        // Update search results
                        if (searchResults) {
                            searchResults.classList.add('active');
                            searchResults.innerHTML = products.length > 0
                                ? products.map(product => `
                                    <div class="search-result-item">
                                        <img src="/UNIverseCycling/${product.image_path}" 
                                             alt="${product.name}"
                                             onerror="this.src='/UNIverseCycling/img/placeholder.jpg'">
                                        <div class="search-result-info">
                                            <h4>${product.name}</h4>
                                            <p class="price">€${product.price}</p>
                                        </div>
                                    </div>
                                `).join('')
                                : '<p class="no-results">No products found</p>';
                        }
                    } catch (error) {
                        console.error('Search error:', error);
                        if (searchResults) {
                            searchResults.classList.add('active');
                            searchResults.innerHTML = '<p class="no-results">Error performing search. Please try again.</p>';
                        }
                    }
                }, 300); // Debounce search requests
            });

            // Handle search on enter key
            searchField.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    clearTimeout(searchTimeout);
                    const query = searchField.value.trim();
                    if (query.length >= 2) {
                        searchField.dispatchEvent(new Event('input'));
                    }
                }
            });
        }
    }

    setupProductClick() {
        document.addEventListener('click', async (e) => {
            const productCard = e.target.closest('.product-card');
            if (!productCard) return;

            const productId = productCard.dataset.productId;
            if (!productId) return;

            try {
                // Usa ProductManager per mostrare i dettagli del prodotto
                await this.productManager.showProductDetails(productId);
            } catch (error) {
                console.error('Error loading product details:', error);
            }
        });
    }
}

export default UIManager;