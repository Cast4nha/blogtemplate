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
        window.location.replace('/login.html');
        throw new Error('Token não encontrado');
    }

    // Adicionar try/catch
    try {
        const response = await fetch(url, {
            ...options,
            headers: {
                ...options.headers,
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        return response;
    } catch (error) {
        console.error('Erro na requisição:', error);
        throw error;
    }
}