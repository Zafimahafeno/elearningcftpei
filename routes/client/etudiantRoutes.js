const express = require('express');
const router = express.Router();
const etudiantController = require('../../controllers/client/etudiantController');

const uploadImage = require('../../middleware/uploadImage');
const uploadCV = require('../../middleware/uploadCV');

module.exports = () => {
  router.post('/signup', uploadImage.single('photoProfil'), etudiantController.signUp);
  router.post('/login', etudiantController.login);
  router.get('/formations', etudiantController.getFormations);
  router.get('/:id/formations', etudiantController.getFormationsCours);
  router.get('/formation/:id', etudiantController.getFormationById);
  router.get('/compte/formations/:id', etudiantController.getCoursByFormationId);
  router.post('/compte/:id/mescours/:coursId', etudiantController.inscriptionCours);
  router.get('/compte/:etudiantId/supports', etudiantController.getSupportsParEtudiant);
  router.get('/:coursId/supports', etudiantController.getSupportsCours);
  router.post('/postulerOffre', uploadCV.single('cv'), etudiantController.postulerOffre);
  router.get('/offres_emploi', etudiantController.getAllOffresEmploi);
  router.get('/:etudiantId/inscriptions', etudiantController.getInscriptionsByEtudiant);
  router.post('/etudiantformations', etudiantController.getFormationsByIds);
  router.get('/:etudiantId/progression', etudiantController.progressionDocument);
  router.post('/progressionDocument', etudiantController.updateProgression);
  router.get('/compte/:etudiantId/progression-formations', etudiantController.getStatFormation);
  // router.post('/:etudiantId/supports/:supportId/markAsRead', etudiantController.markSupportAsRead);
  router.post('/verification', etudiantController.verifyEmail);
  return router;
};
