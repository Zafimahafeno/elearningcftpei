const db = require('../../config/dbConfig');
const bcrypt = require('bcrypt');

const createAdmin = async (req, res) => {
  try {
      const { nom, prenom, email, motDePasse } = req.body;

      // Vérifie si tous les champs sont fournis
      if (!nom || !prenom || !email || !motDePasse) {
          return res.status(400).json({ message: "Tous les champs doivent être remplis" });
      }

      // Hachage du mot de passe
      const hashedPassword = await bcrypt.hash(motDePasse, 10);

      // Insertion dans la base de données
      const query = `INSERT INTO admin (nom, prenom, email, motDePasse) VALUES (?, ?, ?, ?)`;
      const values = [nom, prenom, email, hashedPassword];

      db.query(query, values, (err, result) => {
          if (err) {
              console.error('Erreur lors de l\'exécution de la requête:', err);
              return res.status(500).json({ message: "Erreur lors de la création du compte admin" });
          }

          // Réponse succès
          res.status(201).json({ message: "Compte admin créé avec succès." });
      });

  } catch (error) {
      console.error('Erreur interne:', error);
      res.status(500).json({ message: "Erreur interne du serveur" });
  }
};

const createOffreEmploi = (req, res) => {
  const { titre, description, datePublication, entreprise, localisation } = req.body;

  if (!titre || !description || !datePublication || !entreprise || !localisation) {
    return res.status(400).json({ message: "Tous les champs sont requis." });
  }

  const query = `INSERT INTO offreemploi (titre, description, datePublication, entreprise, localisation) 
                 VALUES (?, ?, ?, ?, ?)`;

  db.query(query, [titre, description, datePublication, entreprise, localisation], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: "Erreur lors de la création de l'offre d'emploi." });
    }
    res.status(201).json({ message: "Offre d'emploi créée avec succès", id: result.insertId });
  });
};

module.exports = { createOffreEmploi, createAdmin };
