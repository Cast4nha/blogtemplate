document.addEventListener('DOMContentLoaded', async function() {
    await loadPosts();
    setupLogout();
});

async function loadPosts() {
    const container = document.getElementById('postsContainer');

    try {
        const response = await fetch('http://localhost:3000/api/posts');
        const posts = await response.json();

        if (!posts || posts.length === 0) {
            container.innerHTML = `
                <div class="text-center py-10">
                    <p class="text-gray-500">Nenhum post encontrado</p>
                </div>
            `;
            return;
        }

        container.innerHTML = posts.map(post => `
            <div class="bg-white rounded-lg shadow-md overflow-hidden">
                <img src="http://localhost:3000${post.coverImage}" 
                     alt="${post.title}" 
                     class="w-full h-48 object-cover">
                <div class="p-6">
                    <h2 class="text-xl font-bold mb-2">
                        <a href="/post.html?id=${post._id}" class="hover:text-indigo-600 transition">
                            ${post.title}
                        </a>
                    </h2>
                    <p class="text-gray-600 mb-4">${post.description}</p>
                    <div class="flex items-center text-sm text-gray-500">
                        <i class="fas fa-user mr-2"></i>
                        <span>${post.author ? post.author.username : 'Autor desconhecido'}</span>
                        <span class="mx-2">•</span>
                        <i class="fas fa-calendar mr-2"></i>
                        <span>${new Date(post.createdAt).toLocaleDateString('pt-BR')}</span>
                    </div>
                </div>
            </div>
        `).join('');

    } catch (error) {
        console.error('Erro:', error);
        container.innerHTML = `
            <div class="text-center py-10">
                <p class="text-gray-600">${error.message}</p>
            </div>
        `;
    }
}

function setupLogout() {
    const token = localStorage.getItem('token');
    const userControls = document.getElementById('userControls');

    if (token) {
        userControls.classList.remove('hidden');

        document.getElementById('logoutBtn').addEventListener('click', function() {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/';
        });
    }
}