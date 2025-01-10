const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config();
require('./config/setup');

const app = express();

// Middleware para processar JSON e form-data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configuração do CORS
app.use(cors({
    origin: ['http://localhost:5500', 'http://localhost:80', 'http://localhost'],
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
}));

// Servir arquivos estáticos
app.use('/uploads', express.static(path.resolve(__dirname, '..', 'public', 'uploads')));

// Importar rotas
const authRoutes = require('./routes/auth.routes');
const postRoutes = require('./routes/post.routes');
const userRoutes = require('./routes/user.routes');

// Registrar rotas com prefixos
app.use('/api/auth', authRoutes);    // Todas as rotas de auth terão prefixo /api/auth
app.use('/api', postRoutes);         // Rotas de posts terão prefixo /api
app.use('/api/users', userRoutes);   // Rotas de usuários terão prefixo /api/users

// Conexão com MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/blog', {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log('Conectado ao MongoDB'))
.catch(err => console.error('Erro ao conectar ao MongoDB:', err));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});

module.exports = app;
