const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const path = require('path');
const app = express();

// Configurações básicas
app.use(cors({
    origin: '*',
    credentials: true
}));
app.use(express.json());

// Servir arquivos estáticos
app.use(express.static(path.join(__dirname, '..', 'public')));

// Configurar rotas da API
app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/posts', require('./routes/post.routes'));
app.use('/api/users', require('./routes/user.routes'));

// Rota para uploads
app.use('/uploads', express.static(path.join(__dirname, '..', 'public', 'uploads')));

// Rota catch-all para o frontend (SPA)
app.get('*', (req, res) => {
    if (!req.url.startsWith('/api/')) {
        res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
    }
});

// Função para tentar conectar ao MongoDB com retry
const connectWithRetry = async () => {
    const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://mongodb:27017/blog';
    console.log('Tentando conectar ao MongoDB em:', MONGODB_URI);
    
    try {
        await mongoose.connect(MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            serverSelectionTimeoutMS: 5000, // Timeout após 5 segundos
            socketTimeoutMS: 45000, // Tempo limite do socket
            connectTimeoutMS: 10000, // Tempo limite de conexão
        });
        console.log('Conectado ao MongoDB com sucesso');
    } catch (err) {
        console.error('Erro ao conectar ao MongoDB:', err);
        console.log('Tentando reconectar em 5 segundos...');
        setTimeout(connectWithRetry, 5000);
    }
};

// Iniciar servidor apenas após tentar conexão com MongoDB
const startServer = async () => {
    await connectWithRetry();
    
    const PORT = process.env.PORT || 8080;
    app.listen(PORT, '0.0.0.0', () => {
        console.log(`Servidor rodando na porta ${PORT}`);
    });
};

startServer();

// Tratamento de erros não capturados
process.on('unhandledRejection', (err) => {
    console.error('Erro não tratado:', err);
});

module.exports = app;
