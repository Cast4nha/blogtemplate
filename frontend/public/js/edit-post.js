// Inicialização do TinyMCE
tinymce.init({
    selector: '#content',
    plugins: 'anchor autolink charmap codesample emoticons image link lists media searchreplace table visualblocks wordcount',
    toolbar: 'undo redo | blocks fontfamily fontsize | bold italic underline strikethrough | link image media table | align lineheight | numlist bullist indent outdent | emoticons charmap | removeformat',
    height: 500
});

// Variáveis globais
let postId;
let currentImage;

// Verificar autenticação e carregar dados do post
document.addEventListener('DOMContentLoaded', async function() {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = '/login.html';
        return;
    }

    // Obter ID do post da URL
    const urlParams = new URLSearchParams(window.location.search);
    postId = urlParams.get('id');

    if (!postId) {
        alert('ID do post não encontrado');
        window.location.href = '/admin.html';
        return;
    }

    await loadPost();
    setupEventListeners();
});

// Carregar dados do post
async function loadPost() {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`http://localhost:3000/api/posts/${postId}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) throw new Error('Erro ao carregar post');

        const post = await response.json();

        // Preencher formulário
        document.getElementById('title').value = post.title;
        document.getElementById('description').value = post.description;
        document.getElementById('tags').value = post.tags.join(', ');
        document.getElementById('status').value = post.status;

        // Atualizar contador de caracteres da descrição
        const descriptionCount = document.getElementById('descriptionCount');
        descriptionCount.textContent = post.description.length;

        // Mostrar imagem atual
        currentImage = post.coverImage;
        const currentImageDiv = document.getElementById('currentImage');
        currentImageDiv.innerHTML = `
            <img src="http://localhost:3000${post.coverImage}"
                 alt="Imagem atual"
                 class="img-fluid rounded"
                 style="max-height: 200px;">
        `;

        // Inicializar TinyMCE com o conteúdo
        tinymce.get('content').setContent(post.content);

    } catch (error) {
        console.error('Erro:', error);
        alert('Erro ao carregar dados do post');
    }
}

// Configurar event listeners
function setupEventListeners() {
    // Preview da nova imagem
    document.getElementById('coverImage').addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                const preview = document.getElementById('imagePreview');
                preview.innerHTML = `
                    <img src="${e.target.result}"
                         class="img-fluid rounded mt-2"
                         style="max-height: 200px;">
                `;
            }
            reader.readAsDataURL(file);
        }
    });

    // Contador de caracteres da descrição
    document.getElementById('description').addEventListener('input', function(e) {
        const count = e.target.value.length;
        document.getElementById('descriptionCount').textContent = count;
    });

    // Submissão do formulário
    document.getElementById('editPostForm').addEventListener('submit', handleSubmit);
}

// Manipular submissão do formulário
async function handleSubmit(e) {
    e.preventDefault();

    try {
        const token = localStorage.getItem('token');
        const formData = new FormData();

        // Adicionar campos ao formData
        formData.append('title', document.getElementById('title').value);
        formData.append('description', document.getElementById('description').value);
        formData.append('content', tinymce.get('content').getContent());
        formData.append('status', document.getElementById('status').value);

        const tags = document.getElementById('tags').value;
        if (tags) {
            formData.append('tags', tags);
        }

        // Adicionar nova imagem apenas se foi selecionada
        const newImage = document.getElementById('coverImage').files[0];
        if (newImage) {
            formData.append('coverImage', newImage);
        }

        const response = await fetch(`http://localhost:3000/api/posts/${postId}`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`
            },
            body: formData
        });

        if (!response.ok) throw new Error('Erro ao atualizar post');

        alert('Post atualizado com sucesso!');
        window.location.href = '/admin.html';

    } catch (error) {
        console.error('Erro:', error);
        alert('Erro ao atualizar post');
    }
} 