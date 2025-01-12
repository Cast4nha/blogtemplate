const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const path = require('path');

// Verificação inicial das variáveis de ambiente
console.log('=== Variáveis de Ambiente ===');
console.log('MONGODB_URI presente:', !!process.env.MONGODB_URI);
console.log('JWT_SECRET presente:', !!process.env.JWT_SECRET);
console.log('PORT:', process.env.PORT);
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('========================');

const app = express();

// Configurações básicas
app.use(cors({
    origin: '*',
    credentials: true
}));
app.use(express.json());

// Servir arquivos estáticos
app.use(express.static(path.join(__dirname, '..', 'public')));

// Endpoint de debug (remover em produção)
app.get('/api/debug/env', (req, res) => {
    res.json({
        mongodbUri: !!process.env.MONGODB_URI,
        jwtSecret: !!process.env.JWT_SECRET,
        port: process.env.PORT,
        nodeEnv: process.env.NODE_ENV,
        envVars: Object.keys(process.env)
    });
});

// Configurar rotas da API
app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/posts', require('./routes/post.routes'));
app.use('/api/users', require('./routes/user.routes'));

// Rota para uploads
app.use('/uploads', express.static(path.join(__dirname, '..', 'public', 'uploads')));

// Função para tentar conectar ao MongoDB com retry
const connectWithRetry = async () => {
    if (!process.env.MONGODB_URI) {
        console.error('MONGODB_URI não está definido!');
        return;
    }

    try {
        await mongoose.connect(process.env.MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000,
            connectTimeoutMS: 10000,
        });
        console.log('Conectado ao MongoDB com sucesso');
    } catch (err) {
        console.error('Erro ao conectar ao MongoDB:', err);
        setTimeout(connectWithRetry, 5000);
    }
};

// Iniciar servidor
const startServer = async () => {
    await connectWithRetry();
    
    const PORT = process.env.PORT || 8080;
    app.listen(PORT, '0.0.0.0', () => {
        console.log(`Servidor rodando na porta ${PORT}`);
    });
};

startServer();

module.exports = app;
