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
        const categoriesPage = document.querySelector('.categories-page');
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
                    categoryProductsPage.querySelector('.products-grid').innerHTML = 
                        '<p>Error loading products. Please try again.</p>';
                }
            });
        });

        // Handle back button
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
                        const response = await fetch(`/UNIverseCycling/api/products.php?action=search&query=${encodeURIComponent(query)}`);
                        if (!response.ok) throw new Error('Search failed');
                        const products = await response.json();

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

    // Handle product click
    function setupProductClick() {
        let previousPage = null;

        document.addEventListener('click', async (e) => {
            const productCard = e.target.closest('.product-card');
            if (!productCard) return;

            const productId = productCard.dataset.productId;
            if (!productId) return;

            try {
                const response = await fetch(`/UNIverseCycling/api/products.php?action=getProduct&id=${productId}`);
                if (!response.ok) throw new Error('Failed to fetch product details');
                const product = await response.json();

                // Store current active page before switching
                previousPage = document.querySelector('.page.active');

                // Hide all pages and show product page
                document.querySelectorAll('.page').forEach(page => page.classList.remove('active'));
                const productPage = document.querySelector('.product-page');
                productPage.classList.add('active');
                document.querySelector('.tabs').style.display = 'none';

                // Update product page content
                productPage.querySelector('.product-title').textContent = product.name;
                productPage.querySelector('.product-image-large img').src = `/UNIverseCycling/${product.image_path}`;
                productPage.querySelector('.product-image-large img').alt = product.name;
                productPage.querySelector('.product-description p').textContent = product.description;
                productPage.querySelector('.product-price .amount').textContent = product.price;
                productPage.querySelector('.stock-amount').textContent = product.stock;

                // Reset and setup quantity controls
                const quantityInput = productPage.querySelector('.quantity-input');
                const minusBtn = productPage.querySelector('.quantity-btn.minus');
                const plusBtn = productPage.querySelector('.quantity-btn.plus');
                
                // Reset quantity to 1 for new product
                quantityInput.value = 1;
                
                const updateQuantityButtons = () => {
                    const currentValue = parseInt(quantityInput.value);
                    minusBtn.disabled = currentValue <= 1;
                    plusBtn.disabled = currentValue >= product.stock;
                };

                minusBtn.onclick = () => {
                    const currentValue = parseInt(quantityInput.value);
                    if (currentValue > 1) {
                        quantityInput.value = currentValue - 1;
                        updateQuantityButtons();
                    }
                };

                plusBtn.onclick = () => {
                    const currentValue = parseInt(quantityInput.value);
                    if (currentValue < product.stock) {
                        quantityInput.value = currentValue + 1;
                        updateQuantityButtons();
                    }
                };

                quantityInput.onchange = () => {
                    let value = parseInt(quantityInput.value);
                    if (isNaN(value) || value < 1) {
                        value = 1;
                    } else if (value > product.stock) {
                        value = product.stock;
                    }
                    quantityInput.value = value;
                    updateQuantityButtons();
                };

                updateQuantityButtons();

                // Setup add to cart
                const addToCartBtn = productPage.querySelector('.add-to-cart');
                addToCartBtn.onclick = async () => {
                    const quantity = parseInt(quantityInput.value);
                    
                    try {
                        const formData = new FormData();
                        formData.append('productId', product.product_id);
                        formData.append('quantity', quantity);

                        const response = await fetch('/UNIverseCycling/api/cart.php?action=add', {
                            method: 'POST',
                            body: formData
                        });

                        const result = await response.json();
                        
                        if (!response.ok) {
                            throw new Error(result.error || 'Failed to add to cart');
                        }
                        
                        // Reset quantity input
                        quantityInput.value = 1;
                        updateQuantityButtons();
                        
                        // Show success message
                        alert('Product added to cart successfully!');
                        
                        // Update cart count
                        updateCartCount(result.cartCount);
                    } catch (error) {
                        alert(error.message);
                    }
                };

                // Setup color circles
                const colors = ['#CD5C5C', '#6A5ACD', '#2F4F4F', '#66CDAA'];
                const colorCircles = colors.map(color => `
                    <div class="color-circle" style="background-color: ${color}"></div>
                `).join('');
                productPage.querySelector('.color-circles').innerHTML = colorCircles;

                // Setup color selection
                const circles = productPage.querySelectorAll('.color-circle');
                circles.forEach(circle => {
                    circle.addEventListener('click', () => {
                        circles.forEach(c => c.classList.remove('active'));
                        circle.classList.add('active');
                    });
                });

                // Setup back button
                const backButton = productPage.querySelector('.back-button');
                backButton.onclick = () => {
                    productPage.classList.remove('active');
                    document.querySelector('.tabs').style.display = 'flex';
                    if (previousPage) {
                        previousPage.classList.add('active');
                    } else {
                        document.querySelector('.home-page').classList.add('active');
                    }
                };

            } catch (error) {
                console.error('Error loading product details:', error);
            }
        });
    }

    // Initialize cart count
    async function initializeCartCount() {
        try {
            const response = await fetch('/UNIverseCycling/api/cart.php?action=count');
            const result = await response.json();
            updateCartCount(result.count);
        } catch (error) {
            console.error('Error getting cart count:', error);
        }
    }

    function updateCartCount(count) {
        const cartIcon = document.querySelector('.bottom-nav a[href="#cart"] i');
        if (cartIcon) {
            const badge = cartIcon.querySelector('.cart-badge') || document.createElement('span');
            badge.className = 'cart-badge';
            badge.textContent = count;
            if (!badge.parentNode) {
                cartIcon.appendChild(badge);
            }
            badge.style.display = count > 0 ? 'block' : 'none';
        }
    }

    // Initialize everything
    setupNavigation();
    setupTabs();
    loadNewArrivals();
    setupProductClick();
    initializeCartCount();
});