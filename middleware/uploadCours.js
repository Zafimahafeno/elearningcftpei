const multer = require('multer');
const path = require('path');

// Storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Check file type and store in the appropriate folder
    const ext = path.extname(file.originalname).toLowerCase();
    let folder = '';

    if (ext === '.mp4' || ext === '.mov' || ext === '.avi') {
      folder = 'uploads/cours/videos'; // Video files
    } else if (ext === '.pdf' || ext === '.doc' || ext === '.docx' || ext === '.xls' || ext === '.xlsx' || ext === '.pptx') {
      folder = 'uploads/cours/docs'; // Document files
    } else {
      return cb(new Error('Unsupported file type'), false);
    }

    cb(null, folder);
  },
  filename: (req, file, cb) => {
    // Use the original filename
    cb(null, file.originalname);
  }
});

// File filter to ensure only video and document types are allowed
const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  const allowedTypes = ['.mp4', '.mov', '.avi', '.pdf', '.doc', '.docx', '.xls', '.xlsx', '.pptx'];

  if (allowedTypes.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error('Unsupported file type'), false);
  }
};

const upload = multer({ storage, fileFilter });

module.exports = upload;
