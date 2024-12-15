document.addEventListener('DOMContentLoaded', function() {
    // Load initial data
    loadNewArrivals();
    loadCategories();

    // Handle navigation
    function setupNavigation() {
        const navLinks = document.querySelectorAll('.bottom-nav a');
        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                navLinks.forEach(l => l.classList.remove('active'));
                link.classList.add('active');
            });
        });
    }

    // Handle tabs
    function setupTabs() {
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

    // Load new arrivals via AJAX
    async function loadNewArrivals() {
        try {
            const response = await fetch('/UNIverseCycling/api/products.php?action=getNew');
            if (!response.ok) throw new Error('Failed to fetch new arrivals');
            const products = await response.json();

            const productsGrid = document.querySelector('.home-page .products-grid');
            productsGrid.innerHTML = products.length > 0 
                ? products.map(product => `
                    <div class="product-card">
                        <div class="product-image">
                            <img src="/UNIverseCycling/${product.image_path}" 
                                 alt="${product.name}"
                                 onerror="this.src='/UNIverseCycling/img/placeholder.jpg'">
                        </div>
                        <div class="product-info">
                            <h3>${product.name}</h3>
                            <p class="price">€${product.price}</p>
                        </div>
                    </div>
                `).join('')
                : '<p>No new arrivals available</p>';
        } catch (error) {
            console.error('Error loading new arrivals:', error);
            document.querySelector('.home-page .products-grid').innerHTML = 
                '<p>Error loading new arrivals. Please try again later.</p>';
        }
    }

    // Load categories via AJAX
    async function loadCategories() {
        try {
            const response = await fetch('/UNIverseCycling/api/categories.php?action=getAll');
            if (!response.ok) {
                throw new Error('Failed to fetch categories');
            }
            const categories = await response.json();

            const categoriesList = document.querySelector('.categories-page .categories-list');
            if (!categoriesList) {
                return;
            }

            categoriesList.innerHTML = categories.length > 0 
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

            // Add click handlers to category items
            setupCategoryNavigation();
        } catch (error) {
            const categoriesList = document.querySelector('.categories-page .categories-list');
            if (categoriesList) {
                categoriesList.innerHTML = '<p>Error loading categories. Please try again later.</p>';
            }
        }
    }

    // Handle category navigation
    function setupCategoryNavigation() {
        const categoryItems = document.querySelectorAll('.category-item');
        const backButton = document.querySelector('.back-button');
        const categoriesPage = document.querySelector('.categorie-page');
        const categoryProductsPage = document.querySelector('.category-products-page');

        categoryItems.forEach(item => {
            item.addEventListener('click', async () => {
                const categoryId = item.dataset.categoryId;
                const categoryName = item.querySelector('h3').textContent;

                try {
                    const response = await fetch(`/UNIverseCycling/api/products.php?action=getByCategory&category_id=${categoryId}`);
                    if (!response.ok) throw new Error('Failed to fetch products');
                    const products = await response.json();

                    // Update category title
                    document.querySelector('.category-title').textContent = categoryName;

                    // Update products grid
                    const productsGrid = categoryProductsPage.querySelector('.products-grid');
                    productsGrid.innerHTML = products.length > 0 
                        ? products.map(product => `
                            <div class="product-card">
                                <div class="product-image">
                                    <img src="/UNIverseCycling/${product.image_path}" 
                                         alt="${product.name}"
                                         onerror="this.src='/UNIverseCycling/img/placeholder.jpg'">
                                </div>
                                <div class="product-info">
                                    <h3>${product.name}</h3>
                                    <p class="price">€${product.price}</p>
                                </div>
                            </div>
                        `).join('')
                        : '<p>No products found in this category</p>';

                    // Show category products page
                    categoriesPage.classList.remove('active');
                    categoryProductsPage.classList.add('active');

                } catch (error) {
                    console.error('Error:', error);
                    categoryProductsPage.querySelector('.products-grid').innerHTML = 
                        '<p>Error loading products. Please try again.</p>';
                }
            });
        });

        // Add click event to back button
        backButton.addEventListener('click', () => {
            categoryProductsPage.classList.remove('active');
            categoriesPage.classList.add('active');
        });
    }

    // Handle search
    function setupSearch() {
        const searchIcon = document.querySelector('.search-icon');
        const searchInput = document.querySelector('.search-input');
        const closeSearch = document.querySelector('.close-search');
        const searchField = searchInput ? searchInput.querySelector('input') : null;

        if (searchIcon && searchInput && closeSearch && searchField) {
            searchIcon.addEventListener('click', () => {
                searchInput.classList.add('active');
                searchField.focus();
                searchIcon.style.visibility = 'hidden';
            });

            closeSearch.addEventListener('click', () => {
                searchInput.classList.remove('active');
                searchField.value = '';
                searchIcon.style.visibility = 'visible';
            });

            // Add search functionality
            let searchTimeout;
            searchField.addEventListener('input', (e) => {
                clearTimeout(searchTimeout);
                searchTimeout = setTimeout(async () => {
                    const query = e.target.value.trim();
                    if (query.length < 2) return;

                    try {
                        const response = await fetch(`/UNIverseCycling/api/products.php?action=search&query=${encodeURIComponent(query)}`);
                        if (!response.ok) throw new Error('Search failed');
                        const products = await response.json();

                        // Update search results
                        const searchResults = document.querySelector('.search-results');
                        if (searchResults) {
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
                                : '<p>No products found</p>';
                        }
                    } catch (error) {
                        console.error('Search error:', error);
                        if (document.querySelector('.search-results')) {
                            document.querySelector('.search-results').innerHTML = 
                                '<p>Error performing search. Please try again.</p>';
                        }
                    }
                }, 300); // Debounce search requests
            });
        }
    }
    
    // Initialize everything
    setupNavigation();
    setupTabs();
    setupSearch();
});