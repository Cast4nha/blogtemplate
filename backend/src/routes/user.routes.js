const express = require('express');
const router = express.Router();
const UserController = require('../controllers/UserController');
const authMiddleware = require('../middlewares/auth');

// Rotas públicas
router.post('/users', UserController.create);

// Middleware de autenticação
router.use(authMiddleware);

// Rotas protegidas
router.get('/users', UserController.index);
router.get('/users/:id', UserController.show);
router.put('/users/:id', UserController.update);
router.delete('/users/:id', UserController.delete);

module.exports = router; 