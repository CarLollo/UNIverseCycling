document.querySelectorAll('.tab').forEach(tab => {
    tab.addEventListener('click', (e) => {
        const category = e.target.dataset.category || '';
        loadProducts(category);
    });
});

document.addEventListener('DOMContentLoaded', function() {
    // Handle navigation
    function setupNavigation() {
        const navLinks = document.querySelectorAll('.bottom-nav a');
        
        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
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
    setupNavigation();
    setupTabs();
    setupSearch();
});