const multer = require('multer');
const path = require('path');

// Configuration de multer pour gérer le téléchargement du CV
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, './uploads/cv'); // Dossier où les fichiers seront enregistrés
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + file.originalname; // Nom unique pour chaque fichier
    cb(null, uniqueSuffix); 
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = /pdf|doc|docx/;
  const extName = path.extname(file.originalname).toLowerCase();
  const mimeType = file.mimetype;

  if (allowedTypes.test(extName) && allowedTypes.test(mimeType)) {
    cb(null, true);
  } else {
    cb(new Error('Type de fichier non supporté. Veuillez télécharger un fichier PDF, DOC ou DOCX.'));
  }
};

const uploadCV = multer({
  storage: storage,
  fileFilter: fileFilter
});

module.exports = uploadCV;
