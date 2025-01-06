const express = require('express');
const router = express.Router();
const coursController = require('../../controllers/admin/coursController');

// Récupérer tous les cours
router.get('/all', coursController.getAllCours);

// Récupérer les cours d'une formation spécifique
router.get('/formation/:id', coursController.getCoursByFormation);

// Plateforme CFTPEI
router.post('/ajout_matiere', coursController.addCours);
router.get('/', coursController.getFilteredCours);

module.exports = router;
