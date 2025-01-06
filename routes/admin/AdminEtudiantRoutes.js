// routes/admin/adminEtudiantRoutes.js
const express = require('express');
const router = express.Router();
const AdminEtudiantController = require('../../controllers/admin/AdminEtudiantController');

// Route pour récupérer tous les étudiants
router.get('/etudiants', AdminEtudiantController.getAllEtudiant);
router.put('/etudiants/:id/toggle-activation', AdminEtudiantController.toggleActivation);

module.exports = router;
