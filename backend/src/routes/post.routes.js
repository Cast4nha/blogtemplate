const express = require('express');
const router = express.Router();
const PostController = require('../controllers/PostController');
const authMiddleware = require('../middlewares/auth');
const upload = require('../middlewares/upload');

// Rotas públicas
router.get('/posts', PostController.index);
router.get('/posts/:id', PostController.show);

// Rotas protegidas
router.use(authMiddleware);
router.get('/admin/posts', PostController.adminList);
router.post('/posts', upload.single('coverImage'), PostController.create);
router.put('/posts/:id', upload.single('coverImage'), PostController.update);
router.delete('/posts/:id', PostController.delete);

module.exports = router;