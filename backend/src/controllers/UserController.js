const User = require('../models/User');

class UserController {
  // Criar usuário
  async create(req, res) {
    try {
      const user = await User.create(req.body);
      // Não retornar a senha no response
      user.password = undefined;
      return res.status(201).json(user);
    } catch (error) {
      return res.status(400).json({ error: 'Erro ao criar usuário' });
    }
  }

  // Listar todos usuários
  async index(req, res) {
    try {
      const users = await User.find({}, '-password');
      return res.json(users);
    } catch (error) {
      return res.status(500).json({ error: 'Erro ao listar usuários' });
    }
  }

  // Buscar um usuário
  async show(req, res) {
    try {
      const user = await User.findById(req.params.id, '-password');
      if (!user) {
        return res.status(404).json({ error: 'Usuário não encontrado' });
      }
      return res.json(user);
    } catch (error) {
      return res.status(500).json({ error: 'Erro ao buscar usuário' });
    }
  }

  // Atualizar usuário
  async update(req, res) {
    try {
      const user = await User.findByIdAndUpdate(
        req.params.id,
        { ...req.body },
        { new: true, runValidators: true }
      ).select('-password');

      if (!user) {
        return res.status(404).json({ error: 'Usuário não encontrado' });
      }
      return res.json(user);
    } catch (error) {
      return res.status(400).json({ error: 'Erro ao atualizar usuário' });
    }
  }

  // Deletar usuário
  async delete(req, res) {
    try {
      const user = await User.findByIdAndDelete(req.params.id);
      if (!user) {
        return res.status(404).json({ error: 'Usuário não encontrado' });
      }
      return res.status(204).send();
    } catch (error) {
      return res.status(500).json({ error: 'Erro ao deletar usuário' });
    }
  }
}

module.exports = new UserController();