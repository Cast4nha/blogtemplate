const Post = require('../models/Post');
const fs = require('fs').promises;
const path = require('path');

// Mudando para exportação direta dos métodos em vez de classe
module.exports = {
    // Lista todos os posts
    async index(req, res) {
        try {
            const posts = await Post.find().sort({ createdAt: -1 });
            res.json(posts);
        } catch (error) {
            res.status(500).json({ error: 'Erro ao listar posts' });
        }
    },

    // Mostra um post específico
    async show(req, res) {
        try {
            const post = await Post.findById(req.params.id);
            if (!post) {
                return res.status(404).json({ error: 'Post não encontrado' });
            }
            res.json(post);
        } catch (error) {
            res.status(500).json({ error: 'Erro ao buscar post' });
        }
    },

    // Cria um novo post
    async store(req, res) {
        try {
            const { title, description, content } = req.body;
            
            // Adicionar validações
            if (!title || !description || !content) {
                return res.status(400).json({ error: 'Todos os campos são obrigatórios' });
            }

            if (description.length > 300) {
                return res.status(400).json({ error: 'Descrição muito longa' });
            }

            const coverImage = req.file ? `/uploads/${req.file.filename}` : null;

            const post = await Post.create({
                title,
                description,
                content,
                coverImage,
                author: req.userId
            });

            res.status(201).json(post);
        } catch (error) {
            res.status(500).json({ error: 'Erro ao criar post' });
        }
    },

    // Atualiza um post
    async update(req, res) {
        try {
            console.log('Iniciando atualização do post:', req.params.id);

            // Extrair dados do corpo da requisição
            let { title, description, content } = req.body;

            // Garantir que content seja uma string
            if (Array.isArray(content)) {
                content = content.join('');
            }

            const updateData = {
                title,
                description,
                content
            };

            if (req.file) {
                const currentPost = await Post.findById(req.params.id);
                if (currentPost && currentPost.coverImage) {
                    try {
                        const oldImagePath = path.join(__dirname, '../../public', currentPost.coverImage);
                        await fs.unlink(oldImagePath).catch(err =>
                            console.warn('Aviso: Imagem antiga não encontrada:', err.message)
                        );
                    } catch (error) {
                        console.warn('Erro ao deletar imagem antiga:', error);
                    }
                }
                updateData.coverImage = `/uploads/${req.file.filename}`;
            }

            console.log('Dados para atualização:', {
                ...updateData,
                content: updateData.content.substring(0, 100) + '...' // Log parcial do conteúdo
            });

            const post = await Post.findByIdAndUpdate(
                req.params.id,
                updateData,
                { new: true, runValidators: true }
            );

            if (!post) {
                return res.status(404).json({ error: 'Post não encontrado' });
            }

            res.json(post);
        } catch (error) {
            console.error('Erro ao atualizar post:', error);
            res.status(500).json({
                error: 'Erro ao atualizar post',
                details: error.message
            });
        }
    },

    // Remove um post
    async destroy(req, res) {
        try {
            const post = await Post.findById(req.params.id);
            if (!post) {
                return res.status(404).json({ error: 'Post não encontrado' });
            }

            await Post.findByIdAndDelete(req.params.id);

            if (post.coverImage) {
                try {
                    const imagePath = path.join(__dirname, '../../public', post.coverImage);
                    await fs.unlink(imagePath);
                } catch (error) {
                    console.warn('Erro ao deletar imagem:', error);
                }
            }

            return res.status(204).send();
        } catch (error) {
            res.status(500).json({ error: 'Erro ao remover post' });
        }
    },

    // Upload de imagem
    async uploadImage(req, res) {
        try {
            if (!req.file) {
                return res.status(400).json({ error: 'Nenhuma imagem enviada' });
            }

            const imageUrl = `/uploads/${req.file.filename}`;
            res.json({ url: imageUrl });
        } catch (error) {
            res.status(500).json({ error: 'Erro no upload da imagem' });
        }
    }
};