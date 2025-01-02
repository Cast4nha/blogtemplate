document.addEventListener('DOMContentLoaded', async function() {
    await checkAuth();
    await setupEditor();
    await loadPost();
    setupImagePreview();
    setupForm();
    setupLogout();
});

async function setupEditor() {
    return new Promise((resolve) => {
        tinymce.init({
            selector: '#content',
            setup: function(editor) {
                editor.on('init', function() {
                    resolve();
                });
            },
            plugins: [
                'advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 'preview',
                'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen',
                'insertdatetime', 'media', 'table', 'help', 'wordcount', 'emoticons'
            ],
            toolbar: 'undo redo | formatselect | ' +
                    'bold italic backcolor | alignleft aligncenter ' +
                    'alignright alignjustify | bullist numlist outdent indent | ' +
                    'removeformat | image media emoticons | help',
            menubar: true,
            content_style: `
                body {
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                    font-size: 16px;
                    line-height: 1.5;
                    padding: 1rem;
                }
            `,
            height: 500,
            language: 'pt_BR',
            skin: 'oxide',
            branding: false,
            promotion: false,
            automatic_uploads: true,
            images_upload_url: 'http://localhost:3000/api/upload',
            images_upload_handler: async function (blobInfo, success, failure) {
                try {
                    const formData = new FormData();
                    formData.append('image', blobInfo.blob(), blobInfo.filename());

                    const response = await authenticatedFetch('http://localhost:3000/api/upload', {
                        method: 'POST',
                        body: formData
                    });

                    if (!response.ok) throw new Error('Upload failed');

                    const data = await response.json();
                    success(data.url);
                } catch (err) {
                    failure('Erro no upload da imagem: ' + err.message);
                }
            }
        });
    });
}

async function loadPost() {
    const postId = new URLSearchParams(window.location.search).get('id');
    if (!postId) {
        window.location.href = '/admin.html';
        return;
    }

    try {
        const response = await authenticatedFetch(`http://localhost:3000/api/posts/${postId}`);
        if (!response.ok) {
            throw new Error('Erro ao carregar post');
        }

        const post = await response.json();
        console.log('Post carregado:', post);

        document.getElementById('title').value = post.title || '';
        document.getElementById('description').value = post.description || '';

        const editor = tinymce.get('content');
        if (editor) {
            console.log('Definindo conteúdo do editor:', post.content);
            editor.setContent(post.content || '');
        } else {
            console.error('Editor não encontrado!');
        }

        // Preview da imagem
        if (post.coverImage) {
            const preview = document.getElementById('imagePreview');
            preview.classList.remove('hidden');
            preview.querySelector('img').src = post.coverImage.startsWith('http')
                ? post.coverImage
                : `http://localhost:3000${post.coverImage}`;
        }

    } catch (error) {
        console.error('Erro ao carregar post:', error);
        alert('Erro ao carregar post: ' + error.message);
    }
}

function setupImagePreview() {
    const input = document.getElementById('coverImage');
    const preview = document.getElementById('imagePreview');
    const previewImg = preview.querySelector('img');

    input.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                previewImg.src = e.target.result;
                preview.classList.remove('hidden');
            }
            reader.readAsDataURL(file);
        }
    });
}

async function setupForm() {
    const form = document.getElementById('postForm');
    const saveButton = document.getElementById('saveButton');
    const postId = new URLSearchParams(window.location.search).get('id');

    saveButton.addEventListener('click', async function(e) {
        e.preventDefault();

        try {
            saveButton.disabled = true;
            saveButton.innerHTML = `
                <i class="fas fa-circle-notch fa-spin mr-2"></i>
                Salvando...
            `;

            // Obter o conteúdo do editor
            const content = tinymce.get('content').getContent();
            console.log('Conteúdo do editor:', content); // Debug

            // Criar FormData com os dados do formulário
            const formData = new FormData(form);
            formData.set('content', content); // Usar set em vez de append

            // Debug dos dados sendo enviados
            console.log('Dados sendo enviados:', {
                title: formData.get('title'),
                description: formData.get('description'),
                content: formData.get('content').substring(0, 100) + '...',
                file: formData.get('coverImage')
            });

            const response = await authenticatedFetch(`http://localhost:3000/api/posts/${postId}`, {
                method: 'PUT',
                body: formData
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Erro ao atualizar post');
            }

            console.log('Post atualizado com sucesso:', data);

            saveButton.innerHTML = `
                <i class="fas fa-check mr-2"></i>
                Salvo!
            `;
            saveButton.classList.remove('bg-green-600', 'hover:bg-green-700');
            saveButton.classList.add('bg-green-500');

            setTimeout(() => {
                window.location.href = '/admin.html';
            }, 1000);

        } catch (error) {
            console.error('Erro detalhado:', error);

            saveButton.disabled = false;
            saveButton.innerHTML = `
                <i class="fas fa-save mr-2"></i>
                Salvar Alterações
            `;

            alert('Erro ao salvar post: ' + error.message);
        }
    });
}

function setupLogout() {
    document.getElementById('logoutBtn').addEventListener('click', function() {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.replace('/login.html');
    });
}