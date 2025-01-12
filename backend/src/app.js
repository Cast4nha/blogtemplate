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
    const mongoURI = process.env.MONGODB_URI;
    
    if (!mongoURI) {
        console.error('MONGODB_URI não está definido!');
        process.exit(1);
    }

    // Log da URI sem as credenciais para debug
    const sanitizedUri = mongoURI.replace(
        /(mongodb\+srv:\/\/)([^:]+):([^@]+)@/,
        '$1[USERNAME]:[PASSWORD]@'
    );
    console.log('Tentando conectar ao MongoDB:', sanitizedUri);
    
    try {
        await mongoose.connect(mongoURI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000,
            connectTimeoutMS: 10000,
            dbName: 'blog' // Especifica o nome do banco de dados
        });
        console.log('Conectado ao MongoDB Atlas com sucesso');
        
        // Verificar a conexão
        const admin = new mongoose.mongo.Admin(mongoose.connection.db);
        const result = await admin.buildInfo();
        console.log('Versão do MongoDB:', result.version);
        
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

// Monitoramento de eventos do Mongoose
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

// Tratamento de erros não capturados
process.on('unhandledRejection', (err) => {
    console.error('Erro não tratado:', err);
});

module.exports = app;
