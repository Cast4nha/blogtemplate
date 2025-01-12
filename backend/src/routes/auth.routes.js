const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/AuthController');
const auth = require('../middlewares/auth');
const User = require('../models/user.model');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Rotas de autenticação (sem prefixo /auth, pois será adicionado no app.js)
router.post('/register', async (req, res) => {
    try {
        console.log('Recebida requisição de registro:', {
            username: req.body.username,
            email: req.body.email,
            passwordLength: req.body.password ? req.body.password.length : 0
        });

        const { username, email, password } = req.body;

        // Validações
        if (!username || !email || !password) {
            console.log('Dados inválidos:', { username: !!username, email: !!email, password: !!password });
            return res.status(400).json({ error: 'Todos os campos são obrigatórios' });
        }

        // Verificar se usuário já existe
        const existingUser = await User.findOne({ $or: [{ username }, { email }] });
        if (existingUser) {
            console.log('Usuário já existe:', { username, email });
            return res.status(400).json({ error: 'Usuário ou email já cadastrado' });
        }

        // Criar hash da senha
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Criar novo usuário
        const user = new User({
            username,
            email,
            password: hashedPassword
        });

        console.log('Tentando salvar usuário no banco...');
        await user.save();
        console.log('Usuário salvo com sucesso');

        // Gerar token
        const token = jwt.sign(
            { userId: user._id },
            process.env.JWT_SECRET || 'your-default-secret-key',
            { expiresIn: '24h' }
        );

        // Responder com sucesso
        res.status(201).json({
            message: 'Usuário registrado com sucesso',
            token,
            user: {
                id: user._id,
                username: user.username,
                email: user.email
            }
        });

    } catch (error) {
        console.error('Erro no registro:', error);
        res.status(500).json({ 
            error: 'Erro interno do servidor',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});
router.post('/login', AuthController.login);
router.get('/profile', auth, AuthController.getProfile);
router.get('/check', auth, (req, res) => res.json({ valid: true }));

module.exports = router; 