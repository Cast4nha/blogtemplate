document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('loginForm');
    const errorMessage = document.getElementById('errorMessage');

    loginForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        console.log('Iniciando login...'); // Debug

        const username = document.getElementById('username').value.trim();
        const password = document.getElementById('password').value.trim();

        try {
            console.log('Enviando requisição para:', `${API_BASE_URL}/auth/login`); // Debug
            
            const response = await fetch(`${API_BASE_URL}/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({ username, password })
            });

            console.log('Resposta recebida:', response.status); // Debug

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Erro ao fazer login');
            }

            // Login bem sucedido
            localStorage.setItem('token', data.token);
            if (data.user) {
                localStorage.setItem('user', JSON.stringify(data.user));
            }

            showSuccess('Login realizado com sucesso! Redirecionando...');

            setTimeout(() => {
                window.location.href = '/admin.html';
            }, 1500);

        } catch (error) {
            console.error('Erro detalhado:', error); // Debug
            showError(error.message || 'Erro ao fazer login');
        }
    });

    function showError(message) {
        errorMessage.classList.remove('hidden', 'text-green-600');
        errorMessage.classList.add('text-red-600');
        errorMessage.textContent = message;
    }

    function showSuccess(message) {
        errorMessage.classList.remove('hidden', 'text-red-600');
        errorMessage.classList.add('text-green-600');
        errorMessage.textContent = message;
    }
}); 