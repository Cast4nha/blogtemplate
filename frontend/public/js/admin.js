document.addEventListener('DOMContentLoaded', function() {
    checkAuth();
    loadPosts();
    setupLogout();
});

function checkAuth() {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.replace('/login.html');
    }
}

async function loadPosts() {
    const tableBody = document.getElementById('postsTableBody');
    const loadingState = document.getElementById('loadingState');

    try {
        const response = await fetch('http://localhost:3000/api/posts');
        const posts = await response.json();

        if (!posts || posts.length === 0) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="5" class="text-center py-4 text-gray-500">
                        Nenhum post encontrado
                    </td>
                </tr>
            `;
            return;
        }

        tableBody.innerHTML = posts.map(post => `
            <tr class="hover:bg-gray-50">
                <td class="px-6 py-4 whitespace-nowrap">
                    <div class="flex items-center">
                        <img class="h-10 w-10 rounded-full object-cover" 
                             src="http://localhost:3000${post.coverImage}" 
                             alt="${post.title}">
                        <div class="ml-4">
                            <div class="text-sm font-medium text-gray-900">
                                ${post.title}
                            </div>
                        </div>
                    </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm text-gray-900">
                        ${post.author ? post.author.username : 'Autor desconhecido'}
                    </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm text-gray-900">
                        ${new Date(post.createdAt).toLocaleDateString('pt-BR')}
                    </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <a href="/edit-post.html?id=${post._id}" 
                       class="text-indigo-600 hover:text-indigo-900 mr-4">
                        <i class="fas fa-edit"></i> Editar
                    </a>
                    <button onclick="deletePost('${post._id}')" 
                            class="text-red-600 hover:text-red-900">
                        <i class="fas fa-trash"></i> Excluir
                    </button>
                </td>
            </tr>
        `).join('');

    } catch (error) {
        console.error('Erro:', error);
        tableBody.innerHTML = `
            <tr>
                <td colspan="5" class="text-center py-4 text-red-500">
                    Erro ao carregar posts: ${error.message}
                </td>
            </tr>
        `;
    } finally {
        if (loadingState) {
            loadingState.style.display = 'none';
        }
    }
}

async function deletePost(postId) {
    if (!confirm('Tem certeza que deseja excluir esta publicação?')) {
        return;
    }

    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`http://localhost:3000/api/posts/${postId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error('Erro ao excluir post');
        }

        // Recarrega a lista de posts
        loadPosts();

    } catch (error) {
        console.error('Erro:', error);
        alert('Erro ao excluir post: ' + error.message);
    }
}

function setupLogout() {
    document.getElementById('logoutBtn').addEventListener('click', function() {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.replace('/login.html');
    });
}