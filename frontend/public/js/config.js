const API_BASE_URL = (() => {
    const hostname = window.location.hostname;
    const protocol = window.location.protocol;
    
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
        return 'http://localhost:8080/api';
    }
    
    return `${protocol}//${hostname}/api`;
})();

// Para debug
console.log('Hostname:', window.location.hostname);
console.log('Protocol:', window.location.protocol);
console.log('API_BASE_URL:', API_BASE_URL); 