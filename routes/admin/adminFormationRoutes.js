// routes/admin/adminFormationRoutes.js
const express = require('express');
const router = express.Router();
const adminControllerFormation = require('../../controllers/admin/adminControllerFormation');

// Route pour récupérer tous les étudiants
// router.get('/', adminControllerFormation.getFormationsAdmin);
// router.get('/:id', adminControllerFormation.getFormationDetailsAdmin);

// Plateforme CFTPEI

router.get('/', adminControllerFormation.getFilieresAdmin)
router.post('/ajout_filiere', adminControllerFormation.addFiliere)

module.exports = router;
