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
    const emptyState = document.getElementById('emptyState');

    try {
        // Mostra loading
        loadingState.classList.remove('hidden');
        tableBody.classList.add('hidden');
        emptyState.classList.add('hidden');

        const token = localStorage.getItem('token');
        const response = await fetch('http://localhost:3000/api/posts', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error('Erro ao carregar posts');
        }

        const posts = await response.json();

        if (!posts || posts.length === 0) {
            loadingState.classList.add('hidden');
            emptyState.classList.remove('hidden');
            return;
        }

        tableBody.innerHTML = posts.map(post => {
            const data = new Date(post.createdAt);
            const dataFormatada = data.toLocaleDateString('pt-BR', {
                day: '2-digit',
                month: 'long',
                year: 'numeric'
            });

            return `
                <tr class="hover:bg-gray-50">
                    <td class="px-6 py-4 whitespace-nowrap">
                        <div class="flex items-center">
                            <img class="h-10 w-10 rounded-lg object-cover"
                                 src="http://localhost:3000${post.coverImage}"
                                 alt="${post.title}"
                                 onerror="this.src='/assets/images/default-post.jpg'">
                            <div class="ml-4">
                                <div class="text-sm font-medium text-gray-900">${post.title}</div>
                                <div class="text-sm text-gray-500 line-clamp-1">${post.description}</div>
                            </div>
                        </div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                        <div class="text-sm text-gray-900">${dataFormatada}</div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                        <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full
                                   ${post.status === 'publicado'
                                     ? 'bg-green-100 text-green-800'
                                     : 'bg-yellow-100 text-yellow-800'}">
                            ${post.status === 'publicado' ? 'Publicado' : 'Rascunho'}
                        </span>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        ${post.views || 0} visualizações
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div class="flex justify-end space-x-2">
                            <a href="/edit-post.html?id=${post._id}"
                               class="text-indigo-600 hover:text-indigo-900">
                                <i class="fas fa-edit"></i>
                            </a>
                            <button onclick="deletePost('${post._id}')"
                                    class="text-red-600 hover:text-red-900">
                                <i class="fas fa-trash-alt"></i>
                            </button>
                        </div>
                    </td>
                </tr>
            `;
        }).join('');

        // Esconde loading e mostra tabela
        loadingState.classList.add('hidden');
        tableBody.classList.remove('hidden');

    } catch (error) {
        console.error('Erro:', error);
        tableBody.innerHTML = `
            <tr>
                <td colspan="5" class="px-6 py-4 text-center text-red-600">
                    <i class="fas fa-exclamation-circle mr-2"></i>
                    Erro ao carregar posts: ${error.message}
                </td>
            </tr>
        `;
        loadingState.classList.add('hidden');
        tableBody.classList.remove('hidden');
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