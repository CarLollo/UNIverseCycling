import { pageLoader } from './modules/page-loader.js';

// Inizializza l'applicazione quando il DOM è pronto
document.addEventListener('DOMContentLoaded', () => {
    console.log('Initializing application...');
    pageLoader.init();
});
