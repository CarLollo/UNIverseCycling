// Sample product data
const products = [];

// Funzione per caricare i prodotti
async function loadProducts(category = '') {
    try {
        let url = 'api/products.php?action=';
        if (category === '') {
            url += 'getNew';
        } else {
            url += 'getByCategory&category=' + encodeURIComponent(category);
        }
        
        const response = await fetch(url);
        const productsData = await response.json();
        
        // Aggiorna l'interfaccia con i prodotti
        displayProducts(productsData);
    } catch (error) {
        console.error('Error loading products:', error);
    }
}

// Funzione per visualizzare i prodotti
function displayProducts(productsData) {
    const productsContainer = document.querySelector('.products-grid');
    if (!productsContainer) return;
    
    productsContainer.innerHTML = productsData.map(product => `
        <div class="product-card">
            <img src="${product.image_url}" alt="${product.name}">
            <h3>${product.name}</h3>
            <p>${product.description}</p>
            <span class="price">€${product.price}</span>
        </div>
    `).join('');
}

// Carica i prodotti quando si cambia categoria
document.querySelectorAll('.tab').forEach(tab => {
    tab.addEventListener('click', (e) => {
        const category = e.target.dataset.category || '';
        loadProducts(category);
    });
});

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
    loadProducts();
    setupNavigation();
    setupTabs();
    setupSearch();
});
