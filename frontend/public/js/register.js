document.addEventListener('DOMContentLoaded', function() {
    const registerForm = document.getElementById('registerForm');
    const errorMessage = document.getElementById('errorMessage');

    registerForm.addEventListener('submit', async function(e) {
        e.preventDefault();

        const username = document.getElementById('username').value.trim();
        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value.trim();

        // Validações básicas
        if (!username || !email || !password) {
            showError('Todos os campos são obrigatórios');
            return;
        }

        // Validar email
        if (!isValidEmail(email)) {
            showError('Email inválido');
            return;
        }

        try {
            const response = await fetch('http://localhost:3000/api/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    username,
                    email,
                    password
                })
            });

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
            console.error('Erro:', error);
            showError(error.message || 'Erro ao registrar usuário');
        }
    });

    function showError(message) {
        errorMessage.textContent = message;
        errorMessage.classList.remove('hidden', 'text-green-600');
        errorMessage.classList.add('text-red-600');
        errorMessage.style.display = 'block';
    }

    function showSuccess(message) {
        errorMessage.textContent = message;
        errorMessage.classList.remove('hidden', 'text-red-600');
        errorMessage.classList.add('text-green-600');
        errorMessage.style.display = 'block';
    }

    function isValidEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }
}); 