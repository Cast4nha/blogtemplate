const API_BASE_URL = (() => {
    const hostname = window.location.hostname;
    if (hostname === 'localhost') {
        return 'http://localhost:8080/api';
    }
    return `${window.location.protocol}//${window.location.host}/api`;
})();

// Para debug
console.log('Hostname:', window.location.hostname);
console.log('API_BASE_URL:', API_BASE_URL); 