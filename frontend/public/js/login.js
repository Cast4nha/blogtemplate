document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('loginForm');
    const errorMessage = document.getElementById('errorMessage');

    loginForm.addEventListener('submit', async function(e) {
        e.preventDefault();

        const username = document.getElementById('username').value.trim();
        const password = document.getElementById('password').value.trim();

        const submitButton = loginForm.querySelector('button[type="submit"]');
        submitButton.disabled = true;
        submitButton.innerHTML = `
            <i class="fas fa-circle-notch fa-spin mr-2"></i>
            Entrando...
        `;

        try {
            console.log('Tentando login com:', { username });

            const response = await fetch('http://localhost:3000/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username, password })
            });

            const data = await response.json();
            console.log('Resposta do servidor:', data);

            if (!response.ok) {
                throw new Error(data.error || 'Erro ao fazer login');
            }

            // Salva o token e dados do usuário
            localStorage.setItem('token', data.token);
            if (data.user) {
                localStorage.setItem('user', JSON.stringify(data.user));
            }

            // Feedback de sucesso
            errorMessage.classList.remove('hidden', 'text-red-600');
            errorMessage.classList.add('text-green-600');
            errorMessage.innerHTML = `
                <div class="flex items-center justify-center">
                    <i class="fas fa-check-circle mr-2"></i>
                    Login realizado com sucesso!
                </div>
            `;

            // Redireciona
            setTimeout(() => {
                window.location.href = '/admin.html';
            }, 1000);

        } catch (error) {
            console.error('Erro detalhado:', error);

            submitButton.disabled = false;
            submitButton.innerHTML = `
                <i class="fas fa-sign-in-alt mr-2"></i>
                Entrar
            `;

            errorMessage.classList.remove('hidden');
            errorMessage.classList.add('text-red-600');
            errorMessage.innerHTML = `
                <div class="flex items-center justify-center">
                    <i class="fas fa-exclamation-circle mr-2"></i>
                    ${error.message}
                </div>
            `;
        }
    });
}); 