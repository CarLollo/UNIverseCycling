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
            const newArrivalsContainer = document.getElementById('newArrivalsContainer');
            if (newArrivalsContainer) {
                newArrivalsContainer.innerHTML = html;
            } else {
                console.error('New arrivals container not found');
            }
        }).catch(error => {
            console.error('Error loading new arrivals:', error);
            const newArrivalsContainer = document.getElementById('newArrivalsContainer');
            if (newArrivalsContainer) {
                newArrivalsContainer.innerHTML = `
                    <div class="alert alert-danger d-flex align-items-center" role="alert">
                        <i class="bi bi-exclamation-triangle-fill me-2"></i>
                        <div>Error loading new arrivals. Please try again later.</div>
                    </div>
                `;
            }
        });

        // Usa DataLoader per caricare le categorie
        this.dataLoader.loadCategories().then(html => {
            const categoriesGrid = document.querySelector('.categories-grid');
            if (categoriesGrid) {
                categoriesGrid.innerHTML = html;
                this.setupCategoryNavigation();
            }
        }).catch(error => {
            console.error('Error loading categories:', error);
            const categoriesGrid = document.querySelector('.categories-grid');
            if (categoriesGrid) {
                categoriesGrid.innerHTML = `
                    <div class="alert alert-danger d-flex align-items-center" role="alert">
                        <i class="bi bi-exclamation-triangle-fill me-2"></i>
                        <div>Error loading categories. Please try again later.</div>
                    </div>
                `;
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
        const navLinks = document.querySelectorAll('.navbar .nav-link');
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

                // Attiva la pagina corrispondente
                const activePage = document.querySelector(`.${targetPage}-page`);
                if (activePage) {
                    activePage.classList.add('active');
                }
            });
        });
    }

    setupTabs() {
        const tabLinks = document.querySelectorAll('.nav-tabs .nav-link');
        const tabIndicator = document.querySelector('.tab-indicator');
        const pages = document.querySelectorAll('.page');

        const updateIndicator = (activeTab) => {
            if (tabIndicator && activeTab) {
                tabIndicator.style.width = `${activeTab.offsetWidth}px`;
                tabIndicator.style.transform = `translateX(${activeTab.offsetLeft}px)`;
            }
        };

        // Set initial indicator position
        const activeTab = document.querySelector('.nav-tabs .nav-link.active');
        updateIndicator(activeTab);

        // Handle window resize
        window.addEventListener('resize', () => {
            const currentActiveTab = document.querySelector('.nav-tabs .nav-link.active');
            updateIndicator(currentActiveTab);
        });

        tabLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();

                // Update active tab
                tabLinks.forEach(l => l.classList.remove('active'));
                link.classList.add('active');

                // Move indicator
                updateIndicator(link);

                // Show corresponding page with fade effect
                const targetPage = link.getAttribute('data-page');
                pages.forEach(page => {
                    if (page.classList.contains(`${targetPage}-page`)) {
                        // First remove active class from all pages
                        pages.forEach(p => p.classList.remove('active'));
                        // Then add active class to target page after a short delay
                        setTimeout(() => {
                            page.classList.add('active');
                        }, 50);
                    }
                });
            });
        });
    }

    setupSearch() {
        const searchIcon = document.querySelector('.search-icon');
        const searchInput = document.querySelector('.search-input');
        const closeSearch = document.querySelector('.close-search');
        const searchField = searchInput ? searchInput.querySelector('input.form-control') : null;
        const searchResults = document.querySelector('.search-results');
        const pages = document.querySelectorAll('.page');
        const homePage = document.querySelector('.home-page');
        const tabs = document.querySelector('.tabs');

        if (searchIcon && searchInput && closeSearch && searchField) {
            // Gestione apertura ricerca
            searchIcon.addEventListener('click', () => {
                searchInput.classList.add('active');
                searchField.focus();
                searchIcon.style.visibility = 'hidden';
            });

            // Gestione chiusura ricerca
            const hideSearch = () => {
                searchInput.classList.remove('active');
                searchField.value = '';
                searchIcon.style.visibility = 'visible';
                if (searchResults) {
                    searchResults.classList.remove('active');
                }
                pages.forEach(page => page.classList.remove('active'));
                homePage.classList.add('active');
                tabs.style.display = '';
            };

            closeSearch.addEventListener('click', hideSearch);

            // Gestione input di ricerca
            let searchTimeout;
            searchField.addEventListener('input', (e) => {
                clearTimeout(searchTimeout);
                const query = e.target.value.trim();

                if (query.length < 2) {
                    if (searchResults) {
                        searchResults.classList.remove('active');
                    }
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
                            searchResults.innerHTML = '<p class="text-center py-3">Error loading search results. Please try again.</p>';
                        }
                    }
                }, 300);
            });
        }
    }

}

export default UIManager;