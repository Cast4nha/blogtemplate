const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/AuthController');
const auth = require('../middleware/auth');

// Rotas públicas (não precisam de autenticação)
router.post('/auth/login', AuthController.login);

// Rotas protegidas (precisam de autenticação)
router.get('/auth/profile', auth, AuthController.getProfile);
router.get('/auth/check', auth, (req, res) => res.json({ valid: true }));

module.exports = router; 