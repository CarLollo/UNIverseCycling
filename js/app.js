// Sample product data
const products = [
    {
        id: 1,
        title: 'Item #1',
        price: 19.99,
        image: 'assets/product1.jpg'
    },
    {
        id: 2,
        title: 'Item #1',
        price: 19.99,
        image: 'assets/product2.jpg'
    },
    {
        id: 3,
        title: 'Item #1',
        price: 19.99,
        image: 'assets/product3.jpg'
    },
    {
        id: 4,
        title: 'Item #1',
        price: 19.99,
        image: 'assets/product4.jpg'
    }
];

// Populate products grid
function populateProducts() {
    const productsGrid = document.querySelector('.products-grid');
    
    products.forEach(product => {
        const productCard = document.createElement('div');
        productCard.className = 'product-card';
        productCard.innerHTML = `
            <img src="${product.image}" alt="${product.title}">
            <div class="product-info">
                <h3 class="product-title">${product.title}</h3>
                <div class="product-price">$${product.price.toFixed(2)}</div>
            </div>
        `;
        productsGrid.appendChild(productCard);
    });
}

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
    tabIndicator.style.width = `${activeTab.offsetWidth}px`;
    tabIndicator.style.transform = `translateX(${activeTab.offsetLeft}px)`;

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

// Handle search
function setupSearch() {
    const searchIcon = document.querySelector('.search-icon');
    const searchInput = document.querySelector('.search-input');
    const closeSearch = document.querySelector('.close-search');
    
    searchIcon.addEventListener('click', () => {
        searchInput.classList.add('active');
        searchInput.querySelector('input').focus();
    });
    
    closeSearch.addEventListener('click', () => {
        searchInput.classList.remove('active');
    });
}

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
    populateProducts();
    setupNavigation();
    setupTabs();
    setupSearch();
});
