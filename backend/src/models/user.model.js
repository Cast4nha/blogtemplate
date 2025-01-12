const mongoose = require('mongoose');

// Verifica se o modelo já existe antes de criar
const User = mongoose.models.User || mongoose.model('User', new mongoose.Schema({
    username: {
        type: String,
        required: [true, 'Username é obrigatório'],
        unique: true,
        trim: true,
        minlength: [3, 'Username deve ter no mínimo 3 caracteres']
    },
    email: {
        type: String,
        required: [true, 'Email é obrigatório'],
        unique: true,
        trim: true,
        lowercase: true,
        match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Email inválido']
    },
    password: {
        type: String,
        required: [true, 'Senha é obrigatória'],
        minlength: [6, 'Senha deve ter no mínimo 6 caracteres']
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
}));

// Middleware para log de erros
User.schema.post('save', function(error, doc, next) {
    if (error.name === 'MongoError' || error.name === 'ValidationError') {
        console.error('Erro ao salvar usuário:', error);
    }
    next(error);
});

module.exports = User; 