document.addEventListener('DOMContentLoaded', async function() {
    const postId = new URLSearchParams(window.location.search).get('id');
    if (!postId) {
        window.location.href = '/';
        return;
    }

    await loadPost(postId);
    await loadSuggestedPosts(postId);
    setupLogout();
});

async function loadPost(postId) {
    const container = document.getElementById('postContent');

    try {
        const response = await fetch(`http://localhost:3000/api/posts/${postId}`);
        const post = await response.json();

        if (!post) {
            throw new Error('Post não encontrado');
        }

        const data = new Date(post.createdAt);
        const dataFormatada = data.toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: 'long',
            year: 'numeric'
        });

        container.innerHTML = `
            <img src="http://localhost:3000${post.coverImage}"
                 class="w-full h-96 object-cover"
                 alt="${post.title}"
                 onerror="this.src='/assets/images/default-post.jpg'">

            <div class="p-8">
                <h1 class="text-3xl font-bold text-gray-900 mb-4">${post.title}</h1>

                <div class="flex items-center text-gray-600 mb-6">
                    <div class="flex items-center">
                        <i class="fas fa-user-circle mr-2"></i>
                        <span>${post.author ? post.author.username : 'Anônimo'}</span>
                    </div>
                    <span class="mx-3">•</span>
                    <div class="flex items-center">
                        <i class="far fa-calendar-alt mr-2"></i>
                        <span>${dataFormatada}</span>
                    </div>
                </div>

                <div class="prose max-w-none">
                    ${post.content}
                </div>
            </div>
        `;

    } catch (error) {
        console.error('Erro:', error);
        container.innerHTML = `
            <div class="p-8 text-center">
                <i class="fas fa-exclamation-circle text-4xl text-red-500 mb-4"></i>
                <h2 class="text-2xl font-bold text-red-600 mb-2">Erro ao carregar post</h2>
                <p class="text-gray-600">${error.message}</p>
            </div>
        `;
    }
}

async function loadSuggestedPosts(currentPostId) {
    const container = document.getElementById('suggestedPosts');

    try {
        const response = await fetch('http://localhost:3000/api/posts');
        const posts = await response.json();

        // Filtra o post atual e pega até 4 posts sugeridos
        const suggestedPosts = posts
            .filter(post => post._id !== currentPostId)
            .slice(0, 4);

        if (suggestedPosts.length === 0) {
            container.innerHTML = `
                <div class="col-span-2 text-center text-gray-600">
                    Nenhuma outra publicação disponível
                </div>
            `;
            return;
        }

        container.innerHTML = suggestedPosts.map(post => {
            const data = new Date(post.createdAt);
            const dataFormatada = data.toLocaleDateString('pt-BR', {
                day: '2-digit',
                month: 'long',
                year: 'numeric'
            });

            return `
                <a href="/post.html?id=${post._id}"
                   class="block bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-all duration-300">
                    <img src="http://localhost:3000${post.coverImage}"
                         class="w-full h-48 object-cover"
                         alt="${post.title}"
                         onerror="this.src='/assets/images/default-post.jpg'">
                    <div class="p-4">
                        <h3 class="font-bold text-gray-900 mb-2 line-clamp-2">${post.title}</h3>
                        <p class="text-sm text-gray-600 mb-2 line-clamp-2">${post.description}</p>
                        <div class="text-xs text-gray-500">
                            <i class="far fa-calendar-alt mr-1"></i> ${dataFormatada}
                        </div>
                    </div>
                </a>
            `;
        }).join('');

    } catch (error) {
        console.error('Erro ao carregar posts sugeridos:', error);
        container.innerHTML = `
            <div class="col-span-2 text-center text-red-600">
                Erro ao carregar posts sugeridos
            </div>
        `;
    }
}

function setupLogout() {
    const token = localStorage.getItem('token');
    const userControls = document.getElementById('userControls');
    const adminControls = document.getElementById('adminControls');

    if (token) {
        userControls.classList.remove('hidden');
        adminControls.classList.remove('hidden');

        document.getElementById('logoutBtn').addEventListener('click', function() {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/';
        });
    }
} 