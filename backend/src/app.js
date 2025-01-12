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

// Verificação de variáveis de ambiente
const requiredEnvVars = ['DB_USERNAME', 'DB_PASSWORD', 'JWT_SECRET'];
const missingEnvVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingEnvVars.length > 0) {
    console.error('Variáveis de ambiente necessárias não definidas:', missingEnvVars);
    console.log('Variáveis disponíveis:', Object.keys(process.env));
    process.exit(1);
}

// Construir URI do MongoDB
const MONGODB_URI = `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@blogtemplate.51z0m.mongodb.net/blog?retryWrites=true&w=majority`;

// Configurar rotas e middleware
app.use(express.static(path.join(__dirname, '..', 'public')));
app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/posts', require('./routes/post.routes'));
app.use('/api/users', require('./routes/user.routes'));
app.use('/uploads', express.static(path.join(__dirname, '..', 'public', 'uploads')));

// Rota catch-all para o frontend (SPA)
app.get('*', (req, res) => {
    if (!req.url.startsWith('/api/')) {
        res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
    }
});

// Função para tentar conectar ao MongoDB com retry
const connectWithRetry = async () => {
    console.log('Tentando conectar ao MongoDB...');
    console.log('Username definido:', !!process.env.DB_USERNAME);
    console.log('Password definido:', !!process.env.DB_PASSWORD);
    
    try {
        await mongoose.connect(MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000,
            connectTimeoutMS: 10000,
            dbName: 'blog'
        });
        console.log('Conectado ao MongoDB Atlas com sucesso');
    } catch (err) {
        console.error('Erro ao conectar ao MongoDB:', err);
        console.log('Tentando reconectar em 5 segundos...');
        setTimeout(connectWithRetry, 5000);
    }
};

// Iniciar servidor
const startServer = async () => {
    await connectWithRetry();
    
    const PORT = process.env.PORT || 8080;
    app.listen(PORT, '0.0.0.0', () => {
        console.log(`Servidor rodando na porta ${PORT}`);
        console.log('Ambiente:', process.env.NODE_ENV);
    });
};

// Eventos de conexão do Mongoose
mongoose.connection.on('connected', () => {
    console.log('Mongoose conectado ao MongoDB Atlas');
});

mongoose.connection.on('error', (err) => {
    console.error('Erro na conexão do Mongoose:', err);
});

mongoose.connection.on('disconnected', () => {
    console.log('Mongoose desconectado do MongoDB Atlas');
});

startServer();

module.exports = app;
