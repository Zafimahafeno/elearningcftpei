const db = require('../../config/dbConfig');

// Fonction pour récupérer les statistiques générales
exports.getGeneralStats = (req, res) => {
  const queries = {
    totalEtudiants: "SELECT COUNT(id) AS totalEtudiants FROM utilisateur",
    totalCours: "SELECT COUNT(id) AS totalCours FROM cours",
    totalFormations: "SELECT COUNT(id) AS totalFormations FROM formation",
    totalOffres: "SELECT COUNT(id) AS totalOffres FROM offreemploi",
  };

  const results = {};

  Promise.all(
    Object.entries(queries).map(([key, query]) =>
      new Promise((resolve, reject) => {
        db.query(query, (err, result) => {
          if (err) reject(err);
          else {
            results[key] = result[0];
            resolve();
          }
        });
      })
    )
  )
    .then(() => {
      res.json(results);
    })
    .catch((err) => {
      console.error("Erreur lors de la récupération des statistiques :", err);
      res.status(500).json({ message: "Erreur serveur" });
    });
};
