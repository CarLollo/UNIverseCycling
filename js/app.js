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
        
        console.log('Found pages:', pages.length);
        pages.forEach(page => console.log('Page:', page.className));
        
        // Set initial indicator position
        const activeTab = document.querySelector('.tabs a.active');
        if (activeTab) {
            tabIndicator.style.width = `${activeTab.offsetWidth}px`;
            tabIndicator.style.transform = `translateX(${activeTab.offsetLeft}px)`;
            
            // Set initial page visibility
            const initialPage = activeTab.getAttribute('data-page');
            pages.forEach(page => {
                if (page.classList.contains(`${initialPage}-page`)) {
                    page.classList.add('active');
                } else {
                    page.classList.remove('active');
                }
            });
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
                console.log('Switching to page:', targetPage);
                
                pages.forEach(page => {
                    console.log('Checking page:', page.className);
                    page.classList.remove('active');
                    if (page.classList.contains(`${targetPage}-page`)) {
                        console.log('Activating page:', page.className);
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
        const searchField = searchInput.querySelector('input');

        searchIcon.addEventListener('click', () => {
            searchInput.classList.add('active');
            searchField.focus();
            searchIcon.style.visibility = 'hidden'; // Hide search icon when search is active
        });

        closeSearch.addEventListener('click', () => {
            searchInput.classList.remove('active');
            searchField.value = ''; // Clear search input
            searchIcon.style.visibility = 'visible'; // Show search icon when search is closed
        });
    }
    
    // Initialize app
    setupNavigation();
    setupTabs();
    setupSearch();
});