const express = require('express');
const router = express.Router();
const PostController = require('../controllers/PostController');
const auth = require('../middleware/auth');
const upload = require('../config/multer');

// Rotas públicas
router.get('/posts', PostController.index);
router.get('/posts/:id', PostController.show);

// Rotas protegidas
router.post('/posts', auth, upload.single('coverImage'), PostController.store);
router.put('/posts/:id', auth, upload.single('coverImage'), PostController.update);
router.delete('/posts/:id', auth, PostController.destroy);

// Rota de upload de imagens do editor
router.post('/upload', auth, upload.single('image'), PostController.uploadImage);

module.exports = router;