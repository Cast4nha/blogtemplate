document.addEventListener('DOMContentLoaded', async function() {
    await loadPosts();
    setupLogout();
});

async function loadPosts() {
    const container = document.getElementById('postsContainer');

    try {
        const token = localStorage.getItem('token');
        const adminControls = document.getElementById('adminControls');

        if (token) {
            adminControls.classList.remove('hidden');
        }

        const response = await fetch('http://localhost:3000/api/posts');
        const posts = await response.json();

        if (!posts || posts.length === 0) {
            container.innerHTML = `
                <div class="col-span-full flex flex-col items-center justify-center py-12">
                    <i class="fas fa-newspaper text-4xl text-gray-400 mb-4"></i>
                    <h3 class="text-2xl font-semibold text-gray-600">Nenhum post publicado ainda</h3>
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

            const imageUrl = post.coverImage
                ? `http://localhost:3000${post.coverImage}`
                : '/assets/images/default-post.jpg';

            return `
                <article class="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                    <div class="relative">
                        <img src="${imageUrl}"
                             class="w-full h-56 object-cover transition-transform duration-300 hover:scale-105"
                             alt="${post.title}"
                             onerror="this.src='/assets/images/default-post.jpg'">
                        <div class="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                            <div class="text-sm text-gray-200 flex items-center">
                                <i class="fas fa-user-circle mr-2"></i>
                                ${post.author ? post.author.username : 'Anônimo'}
                            </div>
                        </div>
                    </div>

                    <div class="p-6">
                        <div class="flex items-center text-sm text-gray-500 mb-3">
                            <i class="far fa-calendar-alt mr-2"></i>
                            ${dataFormatada}
                        </div>

                        <h2 class="text-xl font-bold text-gray-900 mb-3 line-clamp-2 hover:text-gray-700">
                            ${post.title}
                        </h2>

                        <p class="text-gray-600 mb-4 line-clamp-3">
                            ${post.description}
                        </p>

                        <div class="flex items-center justify-between">
                            <a href="/post.html?id=${post._id}"
                               class="group inline-flex items-center text-gray-900 font-semibold hover:text-gray-700 transition-colors">
                                Ler mais
                                <i class="fas fa-arrow-right ml-2 transform group-hover:translate-x-1 transition-transform"></i>
                            </a>

                            <div class="flex items-center text-sm text-gray-500">
                                <i class="far fa-clock mr-1"></i>
                                5 min leitura
                            </div>
                        </div>
                    </div>
                </article>
            `;
        }).join('');

    } catch (error) {
        console.error('Erro ao carregar posts:', error);
        container.innerHTML = `
            <div class="col-span-full flex flex-col items-center justify-center py-12">
                <i class="fas fa-exclamation-circle text-4xl text-red-500 mb-4"></i>
                <h3 class="text-2xl font-semibold text-red-600 mb-2">Erro ao carregar posts</h3>
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