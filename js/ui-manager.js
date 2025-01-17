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
        const backButton = document.querySelector('.back-button');
        const categoriesPage = document.querySelector('.categories-page');
        const categoryProductsPage = document.querySelector('.category-products-page');
        const categoryTitle = document.querySelector('.category-title');
        const productsGrid = categoryProductsPage.querySelector('.products-grid');

        // Imposta evento per ciascun elemento di categoria
        categoryItems.forEach(item => {
            item.addEventListener('click', async () => {
                const categoryId = item.dataset.categoryId;
                const categoryName = item.querySelector('h3').textContent;

                // Mostra caricamento iniziale
                productsGrid.innerHTML = '<p>Loading products...</p>';

                try {
                    const products = await this.dataLoader.loadProductsByCategory(categoryId);

                    // Aggiorna il titolo della categoria e i prodotti
                    categoryTitle.textContent = categoryName;
                    productsGrid.innerHTML = this.dataLoader.renderProductsGrid(products);

                    // Naviga alla pagina della categoria
                    categoriesPage.classList.remove('active');
                    categoryProductsPage.classList.add('active');
                } catch (error) {
                    console.error('Error loading category products:', error);
                    productsGrid.innerHTML = '<p>Error loading products. Please try again later.</p>';
                }
            });
        });

        // Gestione pulsante "Indietro"
        if (backButton) {
            backButton.addEventListener('click', () => {
                categoryProductsPage.classList.remove('active');
                categoriesPage.classList.add('active');
            });
        }
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
                pages.forEach(page => page.classList.remove('active'));
                homePage.classList.add('active');
                tabs.style.display = '';
            };

            closeSearch.addEventListener('click', hideSearch);

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
                        const products = await this.dataLoader.loadSearch(query);

                        pages.forEach(page => page.classList.remove('active'));
                        tabs.style.display = 'none';

                        if (searchResults) {
                            searchResults.classList.add('active');
                            searchResults.innerHTML = this.dataLoader.renderSearchResults(products);
                        }
                    } catch (error) {
                        console.error('Search error:', error);
                        if (searchResults) {
                            searchResults.classList.add('active');
                            searchResults.innerHTML = '<p class="no-results">Error performing search. Please try again.</p>';
                        }
                    }
                }, 300);
            });

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

}

export default UIManager;