const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/AuthController');
const auth = require('../middlewares/auth');

// Rotas de autenticação (sem prefixo /auth, pois será adicionado no app.js)
router.post('/register', AuthController.register);
router.post('/login', AuthController.login);
router.get('/profile', auth, AuthController.getProfile);
router.get('/check', auth, (req, res) => res.json({ valid: true }));

module.exports = router; 