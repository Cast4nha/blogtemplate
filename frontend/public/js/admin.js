document.addEventListener('DOMContentLoaded', function() {
    // Verificar autenticação
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = '/login.html';
        return;
    }

    loadPosts();
});

async function loadPosts() {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch('http://localhost:3000/api/admin/posts', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) throw new Error('Erro ao carregar posts');

        const posts = await response.json();
        const container = document.querySelector('.admin-posts-list');

        if (!posts || posts.length === 0) {
            container.innerHTML = `
                <div class="text-center">
                    <p>Nenhuma publicação encontrada</p>
                    <a href="/create-post.html" class="btn btn-primary">Criar Primeira Publicação</a>
                </div>
            `;
            return;
        }

        container.innerHTML = posts.map(post => {
            const data = new Date(post.createdAt);
            const dataFormatada = data.toLocaleDateString('pt-BR', {
                day: '2-digit',
                month: 'long',
                year: 'numeric'
            });

            return `
                <div class="admin-post-item" data-post-id="${post._id}">
                    <img src="http://localhost:3000${post.coverImage}"
                         class="admin-post-image"
                         alt="${post.title}"
                         onerror="this.src='/img/default-post.jpg'">

                    <div class="admin-post-content">
                        <h3 class="admin-post-title">${post.title}</h3>
                        <div class="admin-post-meta">
                            Publicado em ${dataFormatada}
                            <div class="post-stats">
                                <span class="views-count" title="Visualizações">
                                    <i class="fas fa-eye"></i> ${post.views || 0}
                                </span>
                                <span class="post-status ${post.status === 'publicado' ? 'text-success' : 'text-warning'}">
                                    <i class="fas fa-circle"></i> ${post.status}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div class="admin-post-actions">
                        <a href="/edit-post.html?id=${post._id}"
                           class="btn btn-icon btn-edit"
                           title="Editar">
                            <i class="fas fa-edit"></i>
                        </a>
                        <button class="btn btn-icon btn-delete"
                                onclick="confirmDelete('${post._id}')"
                                title="Excluir">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            `;
        }).join('');

    } catch (error) {
        console.error('Erro:', error);
        document.querySelector('.admin-posts-list').innerHTML = `
            <div class="alert alert-danger">
                Erro ao carregar publicações: ${error.message}
            </div>
        `;
    }
}

// Função para confirmar e deletar post
function confirmDelete(postId) {
    const modal = new bootstrap.Modal(document.getElementById('deleteModal'));
    const confirmBtn = document.getElementById('confirmDelete');

    confirmBtn.onclick = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`http://localhost:3000/api/posts/${postId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) throw new Error('Erro ao deletar post');

            modal.hide();
            loadPosts(); // Recarrega a lista
        } catch (error) {
            console.error('Erro:', error);
            alert('Erro ao deletar publicação');
        }
    };

    modal.show();
}

// Função de logout
document.getElementById('logoutBtn').addEventListener('click', function() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/';
});