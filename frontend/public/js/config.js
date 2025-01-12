const API_BASE_URL = window.location.hostname === 'localhost' 
    ? 'http://localhost:8080/api'
    : `https://${window.location.host}/api`;

console.log('API_BASE_URL:', API_BASE_URL); // Para debug 