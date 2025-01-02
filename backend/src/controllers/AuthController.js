const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'sua_chave_secreta';

class AuthController {
  // Registro de usuário
  async register(req, res) {
    try {
      const { email, username, password } = req.body;

      if (await User.findOne({ email })) {
        return res.status(400).json({ error: 'Email já cadastrado' });
      }

      if (await User.findOne({ username })) {
        return res.status(400).json({ error: 'Username já existe' });
      }

      // Hash da senha
      const hashedPassword = await bcrypt.hash(password, 10);

      const user = await User.create({
        ...req.body,
        password: hashedPassword
      });

      user.password = undefined;

      const token = jwt.sign({ id: user.id }, JWT_SECRET, {
        expiresIn: '1d'
      });

      return res.status(201).json({ user, token });
    } catch (error) {
      return res.status(400).json({ error: 'Falha no registro' });
    }
  }

  // Login
  async login(req, res) {
    try {
      const { email, password } = req.body;

      const user = await User.findOne({ email }).select('+password');

      if (!user) {
        return res.status(400).json({ error: 'Usuário não encontrado' });
      }

      if (!await bcrypt.compare(password, user.password)) {
        return res.status(400).json({ error: 'Senha inválida' });
      }

      user.password = undefined;

      const token = jwt.sign({ id: user.id }, JWT_SECRET, {
        expiresIn: '1d'
      });

      return res.json({ user, token });
    } catch (error) {
      return res.status(400).json({ error: 'Falha no login' });
    }
  }
}

module.exports = new AuthController(); 