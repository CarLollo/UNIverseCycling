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
        
        if (tabLinks.length && tabIndicator) {
            // Set initial position
            const activeTab = document.querySelector('.tabs a.active');
            if (activeTab) {
                tabIndicator.style.left = activeTab.offsetLeft + 'px';
                tabIndicator.style.width = activeTab.offsetWidth + 'px';
            }

            tabLinks.forEach(link => {
                link.addEventListener('click', (e) => {
                    e.preventDefault();

                    // Hide cart page if visible
                    const cartPage = document.getElementById('cart-page');
                    if (cartPage) {
                        cartPage.style.display = 'none';
                    }

                    // Remove active class from all links
                    tabLinks.forEach(l => l.classList.remove('active'));
                    
                    // Add active class to clicked link
                    link.classList.add('active');

                    // Move indicator
                    tabIndicator.style.left = link.offsetLeft + 'px';
                    tabIndicator.style.width = link.offsetWidth + 'px';

                    // Show corresponding page
                    const targetPage = link.getAttribute('data-page');
                    document.querySelectorAll('.page').forEach(page => {
                        if (page.classList.contains(targetPage + '-page')) {
                            page.style.display = 'block';
                            page.classList.add('active');
                            if (targetPage === 'categories') {
                                loadCategories();
                            }
                        } else {
                            page.style.display = 'none';
                            page.classList.remove('active');
                        }
                    });
                });
            });
        }
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
                        const response = await fetch('/UNIverseCycling/api/cart.php?action=add', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify({
                                productId: product.product_id,
                                quantity: quantity
                            })
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

    // Handle cart page
    function setupCart() {
        const cartLink = document.querySelector('.bottom-nav a[href="#cart"]');
        if (cartLink) {
            cartLink.addEventListener('click', (e) => {
                e.preventDefault();
                // Remove active class from all bottom nav links
                document.querySelectorAll('.bottom-nav a').forEach(link => {
                    link.classList.remove('active');
                });
                // Add active class to cart link
                cartLink.classList.add('active');
                showCartPage();
            });
        }

        // Add click handler for home link to return to home page
        const homeLink = document.querySelector('.bottom-nav a[href="#"]');
        if (homeLink) {
            homeLink.addEventListener('click', (e) => {
                e.preventDefault();
                // Hide cart page
                const cartPage = document.getElementById('cart-page');
                if (cartPage) {
                    cartPage.style.display = 'none';
                }

                // Show and reset tabs
                const tabsNav = document.querySelector('.tabs');
                if (tabsNav) {
                    tabsNav.style.display = 'flex';
                    const homeTab = tabsNav.querySelector('a[data-page="home"]');
                    if (homeTab) {
                        document.querySelectorAll('.tabs a').forEach(tab => {
                            tab.classList.remove('active');
                        });
                        homeTab.classList.add('active');
                    }
                }

                // Show home page
                document.querySelectorAll('.page').forEach(page => {
                    if (page.classList.contains('home-page')) {
                        page.style.display = 'block';
                        page.classList.add('active');
                    } else {
                        page.style.display = 'none';
                        page.classList.remove('active');
                    }
                });

                // Update active states in bottom nav
                document.querySelectorAll('.bottom-nav a').forEach(link => {
                    link.classList.remove('active');
                });
                homeLink.classList.add('active');

                // Reset tab indicator
                const tabIndicator = document.querySelector('.tab-indicator');
                if (tabIndicator) {
                    const activeTab = document.querySelector('.tabs a.active');
                    if (activeTab) {
                        tabIndicator.style.left = activeTab.offsetLeft + 'px';
                        tabIndicator.style.width = activeTab.offsetWidth + 'px';
                    }
                }
            });
        }
    }

    async function showCartPage() {
        // Hide all other content pages
        document.querySelectorAll('.page:not(#cart-page)').forEach(page => {
            page.classList.remove('active');
            if (page.id !== 'cart-page') {
                page.style.display = 'none';
            }
        });

        // Show cart page
        const cartPage = document.getElementById('cart-page');
        if (cartPage) {
            cartPage.style.display = 'block';
            await loadCartItems();
        }

        // Hide tabs
        const tabsNav = document.querySelector('.tabs');
        if (tabsNav) {
            tabsNav.style.display = 'none';
        }
    }

    async function loadCartItems() {
        const cartItemsContainer = document.querySelector('.cart-items');
        if (!cartItemsContainer) return;

        try {
            const response = await fetch('/UNIverseCycling/api/cart.php?action=get');
            const items = await response.json();

            if (items.length === 0) {
                cartItemsContainer.innerHTML = `
                    <div class="empty-cart">
                        <i class="fas fa-shopping-cart"></i>
                        <p>Your cart is empty</p>
                    </div>
                `;
                updateCartSummary(0);
                return;
            }

            let cartHTML = '';
            let subtotal = 0;

            items.forEach(item => {
                const total = item.price * item.quantity;
                subtotal += total;

                cartHTML += `
                    <div class="cart-item" data-product-id="${item.product_id}">
                        <img src="/UNIverseCycling/${item.image_path}" alt="${item.name}" class="cart-item-image">
                        <div class="cart-item-details">
                            <div class="cart-item-name">${item.name}</div>
                            <div class="cart-item-price">€${item.price}</div>
                            <div class="cart-item-quantity">
                                <div class="quantity-controls">
                                    <button class="quantity-btn minus" ${item.quantity <= 1 ? 'disabled' : ''}>-</button>
                                    <span class="quantity">${item.quantity}</span>
                                    <button class="quantity-btn plus">+</button>
                                </div>
                                <span class="cart-item-total">€${total.toFixed(2)}</span>
                            </div>
                        </div>
                        <button class="remove-item">×</button>
                    </div>
                `;
            });

            cartItemsContainer.innerHTML = cartHTML;
            updateCartSummary(subtotal);

            // Setup quantity controls
            setupQuantityControls();

        } catch (error) {
            console.error('Error loading cart items:', error);
            cartItemsContainer.innerHTML = `
                <div class="empty-cart">
                    <p>Error loading cart items. Please try again later.</p>
                </div>
            `;
        }
    }

    function setupQuantityControls() {
        document.querySelectorAll('.cart-item').forEach(item => {
            const minusBtn = item.querySelector('.minus');
            const plusBtn = item.querySelector('.plus');
            const quantitySpan = item.querySelector('.quantity');
            const removeBtn = item.querySelector('.remove-item');
            const productId = item.dataset.productId;

            minusBtn?.addEventListener('click', async () => {
                const currentQty = parseInt(quantitySpan.textContent);
                if (currentQty > 1) {
                    await updateCartItemQuantity(productId, currentQty - 1);
                }
            });

            plusBtn?.addEventListener('click', async () => {
                const currentQty = parseInt(quantitySpan.textContent);
                await updateCartItemQuantity(productId, currentQty + 1);
            });

            removeBtn?.addEventListener('click', async () => {
                await removeCartItem(productId);
            });
        });
    }

    async function updateCartItemQuantity(productId, quantity) {
        try {
            const response = await fetch('/UNIverseCycling/api/cart.php?action=update', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    productId: productId,
                    quantity: quantity
                })
            });

            if (!response.ok) {
                throw new Error('Failed to update quantity');
            }

            // Reload cart items to reflect changes
            await loadCartItems();
            
            // Update cart count
            const countResponse = await fetch('/UNIverseCycling/api/cart.php?action=count');
            const countData = await countResponse.json();
            updateCartCount(countData.count);

        } catch (error) {
            alert('Error updating quantity: ' + error.message);
        }
    }

    async function removeCartItem(productId) {
        try {
            const response = await fetch('/UNIverseCycling/api/cart.php?action=remove', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    productId: productId
                })
            });

            if (!response.ok) {
                throw new Error('Failed to remove item');
            }

            // Reload cart items to reflect changes
            await loadCartItems();
            
            // Update cart count
            const countResponse = await fetch('/UNIverseCycling/api/cart.php?action=count');
            const countData = await countResponse.json();
            updateCartCount(countData.count);

        } catch (error) {
            alert('Error removing item: ' + error.message);
        }
    }

    function updateCartSummary(subtotal) {
        const summaryAmount = document.querySelector('.cart-summary .amount');
        if (summaryAmount) {
            summaryAmount.textContent = `€${subtotal.toFixed(2)}`;
        }
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
    setupCart();
    initializeCartCount();
});