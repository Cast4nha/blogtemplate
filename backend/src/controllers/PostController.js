const Post = require('../models/Post');

class PostController {
  // Listar todos os posts (público)
  async index(req, res) {
    try {
      const posts = await Post.find()
        .populate('author', 'username')
        .sort('-createdAt');

      return res.json(posts);
    } catch (error) {
      console.error('Erro ao listar posts:', error);
      return res.status(500).json({ error: 'Erro ao listar posts' });
    }
  }

  // Mostrar um post específico
  async show(req, res) {
    try {
      const post = await Post.findByIdAndUpdate(
        req.params.id,
        { $inc: { views: 1 } },
        { new: true }
      ).populate('author', 'username');

      if (!post) {
        return res.status(404).json({ error: 'Post não encontrado' });
      }

      return res.json(post);
    } catch (error) {
      console.error('Erro ao buscar post:', error);
      return res.status(500).json({ error: 'Erro ao buscar post' });
    }
  }

  // Listar posts para o admin
  async adminList(req, res) {
    try {
      const posts = await Post.find()
        .populate('author', 'username')
        .select('title coverImage createdAt views status')
        .sort('-createdAt');

      return res.json(posts);
    } catch (error) {
      console.error('Erro ao listar posts:', error);
      return res.status(500).json({ error: 'Erro ao listar posts' });
    }
  }

  // Criar novo post
  async create(req, res) {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'Imagem de capa é obrigatória' });
      }

      const post = new Post({
        ...req.body,
        author: req.userId,
        coverImage: `/uploads/${req.file.filename}`
      });

      await post.save();
      return res.status(201).json(post);
    } catch (error) {
      console.error('Erro ao criar post:', error);
      return res.status(500).json({ error: 'Erro ao criar post' });
    }
  }

  // Atualizar post
  async update(req, res) {
    try {
      const updateData = { ...req.body };

      if (req.file) {
        updateData.coverImage = `/uploads/${req.file.filename}`;
      }

      const post = await Post.findByIdAndUpdate(
        req.params.id,
        updateData,
        { new: true }
      );

      if (!post) {
        return res.status(404).json({ error: 'Post não encontrado' });
      }

      return res.json(post);
    } catch (error) {
      console.error('Erro ao atualizar post:', error);
      return res.status(500).json({ error: 'Erro ao atualizar post' });
    }
  }

  // Deletar post
  async delete(req, res) {
    try {
      const post = await Post.findByIdAndDelete(req.params.id);

      if (!post) {
        return res.status(404).json({ error: 'Post não encontrado' });
      }

      return res.json({ message: 'Post deletado com sucesso' });
    } catch (error) {
      console.error('Erro ao deletar post:', error);
      return res.status(500).json({ error: 'Erro ao deletar post' });
    }
  }
}

module.exports = new PostController();