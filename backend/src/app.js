const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const path = require('path');
const app = express();

// Configurações básicas
app.use(cors());
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
    // Não redirecionar requisições da API
    if (!req.url.startsWith('/api/')) {
        res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
    }
});

// Conexão com o MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://mongodb:27017/blog', {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log('Conectado ao MongoDB'))
.catch(err => console.error('Erro ao conectar ao MongoDB:', err));

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});

module.exports = app;
