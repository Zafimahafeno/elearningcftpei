const db = require('../../config/dbConfig');

exports.getFilieresAdmin = (req, res) => {
  const query = 'SELECT id, nom FROM filiere'; // Assurez-vous que les colonnes correspondent à votre base
  db.query(query, (err, results) => {
      if (err) {
          console.error('Erreur lors de la récupération des filières:', err);
          return res.status(500).json({ message: 'Erreur lors de la récupération des filières' });
      }
      res.status(200).json(results);
  });
};

exports.addFiliere = (req, res) => {
  console.log(req.body);

  const { nom } = req.body;

  if (!nom) {
    return res.status(400).json({ error: 'Le champ nom est requis.' });
  }

  const sql = 'INSERT INTO filiere (nom) VALUES (?)';

  db.query(sql, [nom], (err, result) => {
    if (err) {
      console.error('Erreur SQL :', err);
      return res.status(500).json({ error: 'Erreur lors de l\'ajout de la filière', details: err });
    }
    res.status(201).json({ message: 'Filière ajoutée avec succès', filiereId: result.insertId });
  });
};

exports.getFormationDetailsAdmin = (req, res) => {
  const formationId = req.params.id;

  const queryNomFormation = 'SELECT id, nom FROM formation WHERE id = ?';
  const queryCoursInfos = `
    SELECT 
      COUNT(c.id) AS nombreCours, 
      GROUP_CONCAT(c.titre SEPARATOR ', ') AS listeCours 
    FROM cours c 
    WHERE c.formationAssociee = ?;
  `;
  const querySupports = `
    SELECT COUNT(*) AS nombreSupports 
    FROM supportdecours s 
    WHERE s.cours_id IN (
      SELECT c.id FROM cours c WHERE c.formationAssociee = ?
    );
  `;
  const queryStats = `
    SELECT 
      COUNT(DISTINCT i.etudiant_id) AS totalEtudiants, 
      AVG(i.progression) AS tauxReussiteMoyen 
    FROM inscriptioncours i 
    WHERE i.cours_id IN (
      SELECT c.id FROM cours c WHERE c.formationAssociee = ?
    );
  `;

  const formationDetails = {};

  db.query(queryNomFormation, [formationId], (err, results) => {
    if (err) {
      return res.status(500).json({ message: 'Erreur lors de la récupération des informations générales' });
    }
    if (results.length === 0) {
      return res.status(404).json({ message: 'Formation introuvable' });
    }

    formationDetails.nom = results[0].nom;

    db.query(queryCoursInfos, [formationId], (err, results) => {
      if (err) {
        return res.status(500).json({ message: 'Erreur lors de la récupération des informations sur les cours' });
      }

      formationDetails.nombreCours = results[0].nombreCours;
      formationDetails.listeCours = results[0].listeCours;

      db.query(querySupports, [formationId], (err, results) => {
        if (err) {
          return res.status(500).json({ message: 'Erreur lors de la récupération des supports disponibles' });
        }

        formationDetails.nombreSupports = results[0].nombreSupports;

        db.query(queryStats, [formationId], (err, results) => {
          if (err) {
            return res.status(500).json({ message: 'Erreur lors de la récupération des statistiques' });
          }

          formationDetails.totalEtudiants = results[0].totalEtudiants;
          formationDetails.tauxReussiteMoyen = results[0].tauxReussiteMoyen;

          return res.status(200).json(formationDetails);
        });
      });
    });
  });
};
