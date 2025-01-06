const express = require('express');
const router = express.Router();
const adminController = require('../../controllers/admin/adminController');

// Import des middlewares de téléchargement
const upload = require('../../middleware/adminUpload');

// Routes
router.post('/createAdminAccount', adminController.createAdmin);
// router.post('/addCourse', upload.single('imageCours'), adminController.addCourse);
// router.post('/addFormation', adminController.addFormation);
router.post('/offres_emploi', adminController.createOffreEmploi);

module.exports = router;
