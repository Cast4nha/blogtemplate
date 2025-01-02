// Função para verificar se o usuário está autenticado
function checkAuth() {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.replace('/login.html');
        return false;
    }
    return true;
}

// Função para obter o token
function getToken() {
    return localStorage.getItem('token');
}

// Função para verificar se a resposta indica token inválido
function checkTokenResponse(response) {
    if (response.status === 401) {
        console.log('Token inválido ou expirado. Redirecionando para login...');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.replace('/login.html');
        return false;
    }
    return true;
}

// Configuração global para requisições autenticadas
async function authenticatedFetch(url, options = {}) {
    const token = getToken();
    if (!token) {
        throw new Error('Token não fornecido');
    }

    // Garantir que options.headers existe
    options.headers = options.headers || {};

    // Se for FormData, não definir Content-Type
    if (!(options.body instanceof FormData)) {
        options.headers['Content-Type'] = 'application/json';
    }

    // Adicionar token de autorização
    options.headers['Authorization'] = `Bearer ${token}`;

    console.log('Request Headers:', options.headers); // Debug
    console.log('Request URL:', url); // Debug
    console.log('Request Method:', options.method || 'GET'); // Debug

    const response = await fetch(url, options);

    if (!checkTokenResponse(response)) {
        throw new Error('Token inválido');
    }

    return response;
}