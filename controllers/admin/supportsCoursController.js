const db = require('../../config/dbConfig');

exports.getSupports = (req, res) => {
  const { id } = req.params; // Récupère l'ID du cours depuis les paramètres d'URL

  const query = `
    SELECT 
      supportdecours.id AS supportId,
      supportdecours.titreSupport,
      supportdecours.typeFichier,
      supportdecours.cheminAcces,
      supportdecours.datePublication,
      supportdecours.description,
      cours.titre AS titreCours
    FROM supportdecours
    JOIN cours ON supportdecours.cours_id = cours.id
    WHERE cours.id = ?
  `;

  db.query(query, [id], (err, results) => {
    if (err) {
      console.error('Erreur lors de la récupération des supports de cours :', err);
      return res.status(500).json({ message: 'Erreur lors de la récupération des supports de cours' });
    }

    if (results.length > 0) {
      // Le premier élément contient les infos du cours
      const titreCours = results[0].titreCours;
      return res.status(200).json({ titreCours, supports: results });
    } else {
      // Aucun support trouvé
      return res.status(404).json({ message: 'Aucun support trouvé pour ce cours.' });
    }
  });
};

// Ajout cours dans une formation
exports.addCourseContent = (req, res) => {
  console.log(req.body);
  console.log(req.file);

  const { titreSupport, typeFichier, description, cours_id } = req.body;
  const cheminAcces = req.file ? `/${req.file.destination}/${req.file.filename}` : null;

  // Requête SQL correctement formatée
  const sql = 'INSERT INTO supportdecours (titreSupport, typeFichier, cheminAcces, description, cours_id) VALUES (?, ?, ?, ?, ?)';

  db.query(sql, [titreSupport, typeFichier, cheminAcces, description, cours_id], (err, result) => {
    if (err) {
      console.error('Erreur SQL :', err);
      return res.status(500).json({ error: 'Erreur lors de l\'ajout du contenu de cours', details: err });
    }
    res.status(201).json({ message: 'Contenu de cours ajouté avec succès', contentId: result.insertId });
  });
};
