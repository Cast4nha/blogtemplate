document.addEventListener('DOMContentLoaded', function() {
    const registerForm = document.getElementById('registerForm');
    const errorMessage = document.getElementById('errorMessage');

    registerForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        console.log('Iniciando registro...'); // Debug

        const username = document.getElementById('username').value.trim();
        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value.trim();

        try {
            console.log('Enviando requisição para:', `${API_BASE_URL}/auth/register`); // Debug
            
            const response = await fetch(`${API_BASE_URL}/auth/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({
                    username,
                    email,
                    password
                })
            });

            console.log('Resposta recebida:', response.status); // Debug

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Erro ao registrar usuário');
            }

            // Registro bem sucedido
            showSuccess('Registro realizado com sucesso! Redirecionando...');
            
            // Salvar token e dados do usuário
            if (data.token) {
                localStorage.setItem('token', data.token);
            }
            if (data.user) {
                localStorage.setItem('user', JSON.stringify(data.user));
            }

            // Redirecionar após 1.5 segundos
            setTimeout(() => {
                window.location.href = '/login.html';
            }, 1500);

        } catch (error) {
            console.error('Erro detalhado:', error); // Debug
            showError(error.message || 'Erro ao registrar usuário');
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