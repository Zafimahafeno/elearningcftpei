const express = require('express');
const router = express.Router();
const supportsCoursController = require('../../controllers/admin/supportsCoursController');

const uploadCours = require('../../middleware/uploadCours'); 

router.get('/:id', supportsCoursController.getSupports)
router.post('/addCourseContent', uploadCours.single('cheminAcces'), supportsCoursController.addCourseContent);

module.exports = router;
