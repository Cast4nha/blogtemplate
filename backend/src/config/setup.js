const fs = require('fs');
const path = require('path');

// Cria o diretório de uploads se não existir
const uploadsDir = path.resolve(__dirname, '..', '..', 'public', 'uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

module.exports = {
    uploadsDir
}; 