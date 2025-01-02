document.addEventListener('DOMContentLoaded', function() {
    // Verifica se já está logado
    const token = localStorage.getItem('token');
    if (token) {
        window.location.href = '/admin.html';
        return;
    }

    const loginForm = document.getElementById('loginForm');
    const errorMessage = document.getElementById('errorMessage');

    loginForm.addEventListener('submit', async function(e) {
        e.preventDefault();

        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;

        // Desabilita o botão durante o login
        const submitButton = loginForm.querySelector('button[type="submit"]');
        submitButton.disabled = true;
        submitButton.innerHTML = `
            <i class="fas fa-circle-notch fa-spin mr-2"></i>
            Entrando...
        `;

        try {
            const response = await fetch('http://localhost:3000/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username, password })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Usuário ou senha inválidos');
            }

            // Salva os dados do usuário
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));

            // Feedback visual de sucesso
            errorMessage.classList.remove('hidden', 'text-red-600');
            errorMessage.classList.add('text-green-600');
            errorMessage.innerHTML = `
                <div class="flex items-center justify-center">
                    <i class="fas fa-check-circle mr-2"></i>
                    Login realizado com sucesso!
                </div>
            `;

            // Redireciona após um breve delay
            setTimeout(() => {
                window.location.replace('/admin.html');
            }, 1000);

        } catch (error) {
            console.error('Erro:', error);

            // Reativa o botão
            submitButton.disabled = false;
            submitButton.innerHTML = `
                <i class="fas fa-sign-in-alt mr-2"></i>
                Entrar
            `;

            // Mostra mensagem de erro
            errorMessage.classList.remove('hidden');
            errorMessage.classList.add('text-red-600');
            errorMessage.innerHTML = `
                <div class="flex items-center justify-center">
                    <i class="fas fa-exclamation-circle mr-2"></i>
                    ${error.message}
                </div>
            `;

            // Animação de shake no formulário
            loginForm.classList.add('animate-shake');
            setTimeout(() => {
                loginForm.classList.remove('animate-shake');
            }, 500);
        }
    });
}); 