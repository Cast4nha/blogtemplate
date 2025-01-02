document.addEventListener('DOMContentLoaded', function() {
    // Verifica se o usuário está autenticado
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = '/login.html';
        return;
    }
});

// Inicialização do TinyMCE
tinymce.init({
    selector: '#content',
    plugins: 'anchor autolink charmap codesample emoticons image link lists media searchreplace table visualblocks wordcount',
    toolbar: 'undo redo | blocks fontfamily fontsize | bold italic underline strikethrough | link image media table | align lineheight | numlist bullist indent outdent | emoticons charmap | removeformat',
    height: 500
});

// Preview da imagem
document.getElementById('coverImage').addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const preview = document.getElementById('imagePreview');
            preview.innerHTML = `<img src="${e.target.result}" class="preview-image">`;
        }
        reader.readAsDataURL(file);
    }
});

// Contador de caracteres da descrição
document.getElementById('description').addEventListener('input', function(e) {
    const count = e.target.value.length;
    document.getElementById('descriptionCount').textContent = count;
});

// Envio do formulário
document.getElementById('postForm').addEventListener('submit', async function(e) {
    e.preventDefault();

    const formData = new FormData();

    // Campos obrigatórios
    const title = document.getElementById('title').value;
    const description = document.getElementById('description').value;
    const content = tinymce.get('content').getContent();
    const coverImage = document.getElementById('coverImage').files[0];

    // Validações
    if (!title || !description || !content || !coverImage) {
        alert('Por favor, preencha todos os campos obrigatórios');
        return;
    }

    formData.append('title', title);
    formData.append('description', description);
    formData.append('content', content);
    formData.append('coverImage', coverImage);

    // Campos opcionais
    const tags = document.getElementById('tags').value;
    if (tags) {
        formData.append('tags', tags);
    }

    try {
        const token = localStorage.getItem('token');
        if (!token) {
            throw new Error('Usuário não está autenticado');
        }

        const response = await fetch('http://localhost:3000/api/posts', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`
            },
            body: formData
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Erro ao criar post');
        }

        alert('Post criado com sucesso!');
        window.location.href = '/';
    } catch (error) {
        console.error('Erro:', error);
        alert(error.message || 'Erro ao criar post');
    }
});

// Adicione esta função para verificar se o usuário está autenticado
function checkAuth() {
    const token = localStorage.getItem('token');
    if (!token) {
        alert('Por favor, faça login primeiro');
        window.location.href = '/login.html';
    }
}

// Chame esta função quando a página carregar
document.addEventListener('DOMContentLoaded', checkAuth); 