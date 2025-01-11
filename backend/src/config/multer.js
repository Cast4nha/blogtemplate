const multer = require('multer');
const path = require('path');
const crypto = require('crypto');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.resolve(__dirname, '..', '..', 'public', 'uploads'));
    },
    filename: (req, file, cb) => {
        // Gera um nome único para o arquivo
        crypto.randomBytes(16, (err, hash) => {
            if (err) cb(err);

            const fileName = `${hash.toString('hex')}-${file.originalname}`;
            cb(null, fileName);
        });
    }
});


const fileFilter = (req, file, cb) => {
    const allowedMimes = [
        'image/jpeg',
        'image/pjpeg',
        'image/png',
        'image/gif'
    ];

    if (allowedMimes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Tipo de arquivo inválido.'));
    }
};

module.exports = multer({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB
    },
    fileFilter: fileFilter
}); 