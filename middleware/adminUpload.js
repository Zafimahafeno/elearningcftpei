const multer = require('multer');
const path = require('path');

// Configuration du stockage pour Multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../uploads/imagesCours'));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

// Initialisation de Multer avec la configuration
const upload = multer({
  storage: storage,
  limits: { fileSize: 1024 * 1024 * 5 }
});

module.exports = upload;

