// controllers/admin/AdminEtudiantController.js
const db = require('../../config/dbConfig');

exports.getAllEtudiant = (req, res) => {
  const query = "SELECT * FROM utilisateur";

  db.query(query, (error, results) => {
    if (error) {
      console.error("Erreur lors de la récupération des étudiants :", error);
      return res.status(500).json({ message: "Erreur du serveur." });
    }

    res.status(200).json(results);
  });
};
// Activer le compte d'un utilisateur
exports.toggleActivation = (req, res) => {
  const { id } = req.params;

  const getStatusQuery = "SELECT prenom, statutValidation FROM utilisateur WHERE id = ?";
  const updateStatusQuery = "UPDATE utilisateur SET statutValidation = ? WHERE id = ?";

  db.query(getStatusQuery, [id], (err, results) => {
    if (err) {
      console.error("Erreur lors de la récupération du statut :", err);
      return res.status(500).json({ message: "Erreur du serveur." });
    }

    if (results.length === 0) {
      return res.status(404).json({ message: "Utilisateur non trouvé." });
    }

    const user = results[0];
    const currentStatus = user.statutValidation;
    const newStatus = currentStatus === 1 ? 0 : 1;

    db.query(updateStatusQuery, [newStatus, id], (err) => {
      if (err) {
        console.error("Erreur lors de la mise à jour du statut :", err);
        return res.status(500).json({ message: "Erreur du serveur." });
      }

      // Assurez-vous d'utiliser la donnée 'prenom' pour former le message
      const userName = user.prenom || 'Utilisateur inconnu'; // Si 'prenom' est vide ou null, utilisez 'Utilisateur inconnu'
      
      res.status(200).json({ 
        message: `Le compte de ${userName} a été ${newStatus === 1 ? 'activé' : 'désactivé'} avec succès`, 
        statutValidation: newStatus 
      });
    });
  });
};
