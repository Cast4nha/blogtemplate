const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config();
require('./config/setup');

const app = express();

// Configuração do CORS para aceitar tanto localhost quanto 127.0.0.1
app.use(cors({
    origin: ['http://localhost', 'http://127.0.0.1:5500', 'http://localhost:5500'],
    credentials: true
}));

// Middleware para processar JSON e form-data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir arquivos estáticos
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Importar rotas
const authRoutes = require('./routes/auth.routes');
const postRoutes = require('./routes/post.routes');

// Registrar rotas
app.use('/api', authRoutes);
app.use('/api', postRoutes);

// Conexão com MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/blog', {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log('Conectado ao MongoDB'))
.catch(err => console.error('Erro ao conectar ao MongoDB:', err));

// Tratamento de erros
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Erro interno do servidor' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});

module.exports = app;
