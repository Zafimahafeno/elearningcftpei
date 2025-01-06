const db = require('../../config/dbConfig');

// Récupérer tous les cours
exports.getAllCours = (req, res) => {
  const query = 'SELECT * FROM cours';

  db.query(query, (err, results) => {
    if (err) {
      console.error('Erreur lors de la récupération des cours:', err);
      return res.status(500).json({ error: 'Erreur serveur' });
    }
    res.status(200).json(results);
  });
};

exports.addCours = (req, res) => {
  // Récupération des données envoyées dans la requête
  const { nom, code_matiere, nbr_supports, filiere_id, niveau } = req.body;

  // Vérification que tous les champs nécessaires sont fournis
  if (!nom || !code_matiere || !nbr_supports || !filiere_id || !niveau) {
    return res.status(400).json({ error: 'Tous les champs sont requis' });
  }

  // Requête SQL pour insérer un nouveau cours dans la table 'cours'
  const sql = 'INSERT INTO cours (nom, code_matiere, nbr_supports, filiere_id, niveau) VALUES (?, ?, ?, ?, ?)';

  // Exécution de la requête avec les données reçues
  db.query(sql, [nom, code_matiere, nbr_supports, filiere_id, niveau], (err, result) => {
    if (err) {
      console.error('Erreur SQL :', err);
      return res.status(500).json({ error: 'Erreur lors de l\'ajout du cours', details: err });
    }
    // Envoie de la réponse avec le message de succès et l'ID du cours ajouté
    res.status(201).json({ message: 'Cours ajouté avec succès', courseId: result.insertId });
  });
};

exports.getFilteredCours = (req, res) => {
  const { niveau, filiere_id } = req.query;

  let query = 'SELECT * FROM cours WHERE 1=1';
  const params = [];

  if (niveau) {
    query += ' AND niveau = ?';
    params.push(niveau);
  }
  if (filiere_id) {
    query += ' AND filiere_id = ?';
    params.push(filiere_id);
  }

  db.query(query, params, (err, results) => {
    if (err) {
      console.error('Erreur lors de la récupération des cours:', err);
      return res.status(500).json({ error: 'Erreur serveur' });
    }
    res.status(200).json(results);
  });
};


// Récupérer les cours d'une formation spécifique
exports.getCoursByFormation = (req, res) => {
  const formationId = req.params.id;
  const query = 'SELECT * FROM cours WHERE formationAssociee = ?';

  db.query(query, [formationId], (err, results) => {
    if (err) {
      console.error(`Erreur lors de la récupération des cours pour la formation ${formationId}:`, err);
      return res.status(500).json({ error: 'Erreur serveur' });
    }
    res.status(200).json(results);
  });
};
