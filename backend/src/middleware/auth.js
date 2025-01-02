const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'sua_chave_secreta';

module.exports = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        console.log('Auth Header:', authHeader); // Debug

        if (!authHeader) {
            return res.status(401).json({ error: 'Token não fornecido' });
        }

        const parts = authHeader.split(' ');

        if (parts.length !== 2) {
            return res.status(401).json({ error: 'Token mal formatado' });
        }

        const [scheme, token] = parts;

        if (!/^Bearer$/i.test(scheme)) {
            return res.status(401).json({ error: 'Token mal formatado' });
        }

        jwt.verify(token, JWT_SECRET, (err, decoded) => {
            if (err) {
                console.error('Erro na verificação do token:', err);
                return res.status(401).json({ error: 'Token inválido' });
            }

            // Importante: usar decoded.id em vez de decoded.userId
            req.userId = decoded.id;
            return next();
        });
    } catch (error) {
        console.error('Erro no middleware de autenticação:', error);
        return res.status(500).json({ error: 'Erro interno na autenticação' });
    }
};