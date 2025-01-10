const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// Usar uma chave secreta padrão apenas para desenvolvimento
const JWT_SECRET = process.env.JWT_SECRET || 'chave_secreta_padrao_desenvolvimento';

// Remover o throw error e substituir por um aviso no console
if (!process.env.JWT_SECRET) {
    console.warn('AVISO: JWT_SECRET não definido. Usando chave padrão de desenvolvimento. NÃO USE EM PRODUÇÃO!');
}

class AuthController {
    static async login(req, res) {
        try {
            console.log('Requisição de login recebida:', req.body);

            const { username, password } = req.body;

            if (!username || !password) {
                console.log('Dados inválidos:', { username, password });
                return res.status(400).json({ error: 'Usuário e senha são obrigatórios' });
            }

            const user = await User.findOne({
                $or: [
                    { email: username },
                    { username: username }
                ]
            });

            if (!user) {
                console.log('Usuário não encontrado:', username);
                return res.status(401).json({ error: 'Usuário ou senha inválidos' });
            }

            const isValidPassword = await bcrypt.compare(password, user.password);
            if (!isValidPassword) {
                console.log('Senha inválida para usuário:', username);
                return res.status(401).json({ error: 'Usuário ou senha inválidos' });
            }

            const token = jwt.sign(
                { id: user._id },
                JWT_SECRET,
                { expiresIn: '24h' }
            );

            console.log('Login bem-sucedido para:', username);
            console.log('Token gerado:', token);

            const userWithoutPassword = {
                _id: user._id,
                username: user.username,
                email: user.email
            };

            res.json({
                token,
                user: userWithoutPassword
            });

        } catch (error) {
            console.error('Erro no login:', error);
            res.status(500).json({ error: 'Erro interno do servidor' });
        }
    }

    static async getProfile(req, res) {
        try {
            const user = await User.findById(req.userId).select('-password');
            if (!user) {
                return res.status(404).json({ error: 'Usuário não encontrado' });
            }
            res.json(user);
        } catch (error) {
            console.error('Erro ao buscar perfil:', error);
            res.status(500).json({ error: 'Erro ao buscar perfil' });
        }
    }

    static async register(req, res) {
        try {
            console.log('Requisição de registro recebida:', req.body);
            const { username, email, password } = req.body;

            // Validações
            if (!username || !email || !password) {
                console.log('Campos faltando:', { username, email, password });
                return res.status(400).json({ error: 'Todos os campos são obrigatórios' });
            }

            // Verificar se usuário já existe
            const existingUser = await User.findOne({
                $or: [
                    { email: email.toLowerCase() },
                    { username: username.toLowerCase() }
                ]
            });

            if (existingUser) {
                return res.status(400).json({ error: 'Usuário ou email já existe' });
            }

            // Criar hash da senha
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);

            // Criar novo usuário
            const user = await User.create({
                username: username.toLowerCase(),
                email: email.toLowerCase(),
                password: hashedPassword
            });

            // Gerar token
            const token = jwt.sign(
                { id: user._id },
                JWT_SECRET,
                { expiresIn: '24h' }
            );

            // Retornar resposta sem a senha
            const userWithoutPassword = {
                _id: user._id,
                username: user.username,
                email: user.email
            };

            res.status(201).json({
                token,
                user: userWithoutPassword
            });

        } catch (error) {
            console.error('Erro detalhado no registro:', error);
            res.status(500).json({ error: 'Erro ao registrar usuário' });
        }
    }
}

module.exports = AuthController; 