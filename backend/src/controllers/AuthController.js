const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const JWT_SECRET = process.env.JWT_SECRET || 'sua_chave_secreta';

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
}

module.exports = AuthController; 