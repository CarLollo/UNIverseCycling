// ui-manager.js
import APIService from './api-service.js';
import CartManager from './cart-manager.js';

class UIManager {
    constructor() {
        this.cartManager = new CartManager(this);
        this.searchTimeout = null;
        this.previousPage = null;
    }

    initialize() {
        this.setupNavigation();
        this.setupTabs();
        this.setupSearch();
        this.setupProductClick();
        this.cartManager.initializeCartCount();
    }

    setupNavigation() {
        const navLinks = document.querySelectorAll('.bottom-nav a');
        const pages = document.querySelectorAll('.page');

        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                
                navLinks.forEach(l => l.classList.remove('active'));
                link.classList.add('active');

                const targetPage = link.getAttribute('href').substring(1);
                pages.forEach(page => page.classList.remove('active'));
                
                const tabsContainer = document.querySelector('.tabs');
                if (targetPage === 'cart') {
                    tabsContainer.style.display = 'none';
                    this.cartManager.loadCartItems();
                } else {
                    tabsContainer.style.display = 'flex';
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
        const searchInput = document.querySelector('.search-input input');
        const closeSearch = document.querySelector('.close-search');
        const searchResults = document.querySelector('.search-results');
        const pages = document.querySelectorAll('.page');
        const homePage = document.querySelector('.home-page');
        const tabs = document.querySelector('.tabs');

        if (!searchIcon || !searchInput || !closeSearch || !searchResults) return;

        searchIcon.addEventListener('click', () => {
            searchInput.closest('.search-input').classList.add('active');
            searchInput.focus();
            searchIcon.style.visibility = 'hidden';
        });

        const hideSearch = () => {
            searchInput.closest('.search-input').classList.remove('active');
            searchInput.value = '';
            searchIcon.style.visibility = 'visible';
            searchResults.classList.remove('active');
            
            pages.forEach(page => page.classList.remove('active'));
            homePage.classList.add('active');
            tabs.style.display = '';
        };

        closeSearch.addEventListener('click', hideSearch);

        searchInput.addEventListener('input', async (e) => {
            clearTimeout(this.searchTimeout);
            const query = e.target.value.trim();
            
            if (query.length < 2) {
                searchResults.classList.remove('active');
                return;
            }

            this.searchTimeout = setTimeout(async () => {
                try {
                    const products = await APIService.searchProducts(query);

                    pages.forEach(page => page.classList.remove('active'));
                    tabs.style.display = 'none';

                    searchResults.classList.add('active');
                    searchResults.innerHTML = products.length > 0
                        ? products.map(this.createSearchResultItem).join('')
                        : '<p class="no-results">No products found</p>';

                    // Add click event to search result items
                    this.setupSearchResultClick();
                } catch (error) {
                    console.error('Search error:', error);
                    searchResults.classList.add('active');
                    searchResults.innerHTML = '<p class="no-results">Error performing search. Please try again.</p>';
                }
            }, 300);
        });

        // Handle search on enter key
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                searchInput.dispatchEvent(new Event('input'));
            }
        });
    }

    setupSearchResultClick() {
        const searchResultItems = document.querySelectorAll('.search-result-item');
        searchResultItems.forEach(item => {
            item.addEventListener('click', () => {
                const productId = item.dataset.productId;
                this.showProductDetails(productId);
            });
        });
    }

    createSearchResultItem(product) {
        return `
            <div class="search-result-item" data-product-id="${product.product_id}">
                <img src="/UNIverseCycling/${product.image_path}" 
                     alt="${product.name}"
                     onerror="this.src='/UNIverseCycling/img/placeholder.jpg'">
                <div class="search-result-info">
                    <h4>${product.name}</h4>
                    <p class="price">€${product.price}</p>
                </div>
            </div>
        `;
    }

    setupProductClick() {
        document.addEventListener('click', (e) => {
            const productCard = e.target.closest('.product-card');
            if (!productCard) return;

            const productId = productCard.dataset.productId;
            if (!productId) return;

            this.showProductDetails(productId);
        });
    }

    async showProductDetails(productId) {
        try {
            const product = await APIService.getProductDetails(productId);
            this.renderProductDetails(product);
        } catch (error) {
            console.error('Error loading product details:', error);
            alert('Unable to load product details');
        }
    }

    renderProductDetails(product) {
        // Store current active page before switching
        this.previousPage = document.querySelector('.page.active');

        const productPage = document.querySelector('.product-page');
        
        // Hide all pages
        document.querySelectorAll('.page').forEach(page => page.classList.remove('active'));
        document.querySelector('.tabs').style.display = 'none';

        // Populate product details
        productPage.querySelector('.product-title').textContent = product.name;
        productPage.querySelector('.product-image-large img').src = `/UNIverseCycling/${product.image_path}`;
        productPage.querySelector('.product-image-large img').alt = product.name;
        productPage.querySelector('.product-description p').textContent = product.description;
        productPage.querySelector('.product-price .amount').textContent = product.price;
        productPage.querySelector('.stock-amount').textContent = product.stock;

        // Show product page
        productPage.classList.add('active');

        // Setup add to cart and quantity controls
        this.setupProductPageControls(product);
    }

    setupProductPageControls(product) {
        const productPage = document.querySelector('.product-page');
        const quantityInput = productPage.querySelector('.quantity-input');
        const minusBtn = productPage.querySelector('.quantity-btn.minus');
        const plusBtn = productPage.querySelector('.quantity-btn.plus');
        const addToCartBtn = productPage.querySelector('.add-to-cart');
        const backButton = productPage.querySelector('.back-button');

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

        // Setup add to cart
        addToCartBtn.onclick = async () => {
            const quantity = parseInt(quantityInput.value);
            
            try {
                const result = await this.cartManager.addToCart(product.product_id, quantity);
                
                // Reset quantity input
                quantityInput.value = 1;
                updateQuantityButtons();
                
                // Show success message
                alert('Product added to cart successfully!');
            } catch (error) {
                alert(error.message);
            }
        };

        // Setup back button
        backButton.onclick = () => {
            productPage.classList.remove('active');
            document.querySelector('.tabs').style.display = 'flex';
            
            if (this.previousPage) {
                this.previousPage.classList.add('active');
            } else {
                document.querySelector('.home-page').classList.add('active');
            }
        };
    }
}

export default UIManager;