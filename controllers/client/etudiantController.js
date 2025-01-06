const db = require('../../config/dbConfig');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');
const nodemailer = require('nodemailer');

exports.signUp = async (req, res) => {
    try {
        const { nom, prenom, email, phone, password, adresse, departement, niveau } = req.body;
        
        // Vérifie si tous les champs sont fournis
        if (!nom || !prenom || !email || !phone || !password || !adresse || !departement || !niveau) {
            return res.status(400).json({ message: "Tous les champs doivent être remplis" });
        }

        // Vérifie si un utilisateur avec cet email existe déjà
        const emailCheckQuery = 'SELECT * FROM etudiant WHERE email = ?';
        db.query(emailCheckQuery, [email], async (error, results) => {
            if (error) {
                console.error("Erreur lors de la vérification de l'email :", error);
                return res.status(500).json({ message: "Erreur interne lors de la vérification de l'email" });
            }
            
            if (results.length > 0) {
                // Si un utilisateur avec cet email existe déjà
                return res.status(409).json({ message: "Cet email est déjà associé à un compte. Si c'est bien le vôtre, pensez à vous connecter." });
            }

          // Vérifie si une image est présente et si c'est bien une image
          let photoProfil = null;
          if (req.file) {
              const fileType = path.extname(req.file.originalname).toLowerCase();
              if (fileType !== '.jpg' && fileType !== '.jpeg' && fileType !== '.png') {
                  return res.status(400).json({ message: "Le fichier doit être une image de type jpg, jpeg, ou png" });
              }
              photoProfil = `/uploads/images/${req.file.filename}`;
          }

          // Hachage du mot de passe
          const hashedPassword = await bcrypt.hash(password, 10);

          // Insertion dans la base de données
          const query = `INSERT INTO etudiant (nom, prenom, adresse, email, phone, password, departement, niveau, photoProfil, dateInscription) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`;
          const values = [nom, prenom, adresse, email, phone, hashedPassword, departement, niveau, photoProfil, new Date(Date.now() + 5 * 60 * 1000)];

          db.query(query, values, (err, result) => {
              if (err) {
                  console.error('Erreur lors de l\'exécution de la requête:', err);
                  return res.status(500).json({ message: "Erreur lors de l'inscription" });
              }
          });
        });
    } catch (error) {
        console.error('Erreur interne:', error);
        res.status(500).json({ message: "Erreur interne du serveur" });
    }
};

exports.login = async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ message: "Email ou mot de passe manquant" });
    }
    try {
      // Vérification si l'email appartient à un administrateur
      // const adminQuery = 'SELECT * FROM admin WHERE email = ?';
      // db.query(adminQuery, [email], async (err, adminResults) => {
      //     if (err) {
      //         return res.status(500).json({ message: "Erreur du serveur" });
      //     }

      //     if (adminResults.length > 0) {
      //         const admin = adminResults[0];
      //         console.log('Admin trouvé:', admin);
      //         const isMatch = await bcrypt.compare(motDePasse, admin.motDePasse);

      //         if (!isMatch) {
      //           console.log('Mot de passe incorrect pour admin');
      //           return res.status(401).json({ message: "Mot de passe incorrect" });
      //         }

      //         const token = jwt.sign(
      //             { adminId: admin.id, email: admin.email, role: "admin" },
      //             process.env.JWT_SECRET,
      //             { expiresIn: '2h' }
      //         );

      //         return res.status(200).json({
      //             message: "Connexion administrateur réussie",
      //             token: token,
      //             admin: { id: admin.id, nom: admin.nom, prenom: admin.prenom }
      //         });
      //     } else {
      //       console.log('Aucun admin trouvé, vérification de l\'utilisateur');
        const query = 'SELECT * FROM etudiant WHERE email = ?';
        db.query(query, [email], async (err, results) => {
            if (err) {
                return res.status(500).json({ message: "Erreur du serveur" });
            }
            if (results.length === 0) {
                return res.status(404).json({ message: "Utilisateur non trouvé. Créer un compte si vous n'avez pas encore de compte." });
            }
            const user = results[0];
            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) {
                return res.status(401).json({ message: "Mot de passe incorrect" });
            }
            const token = jwt.sign(
                { 
                    userId: user.id_etudiant,
                    email: user.email, 
                    nom: user.nom, 
                    prenom: user.prenom, 
                    profilePic: user.photoProfil ,
                    telephone: user.phone,
                    adresse: user.adresse,
                    role: "user"
                },
                process.env.JWT_SECRET,
                { expiresIn: '2h' }
            );
            return res.status(200).json({
                message: "Connexion réussie",
                token: token,
                user: { 
                    id: user.id_etudiant, 
                    email: user.email, 
                    nom: user.nom, 
                    prenom: user.prenom, 
                    profilePic: user.photoProfil ,
                    telephone: user.phone,
                    adresse: user.adresse,
                }
            });
      });
    } catch (error) {
        console.error('Erreur interne:', error);
        res.status(500).json({ message: "Erreur interne du serveur" });
    }
};

exports.getFormations = (req, res) => {
    const query = 'SELECT id, nom, description,lienFormation FROM formation'; // Assurez-vous que les colonnes correspondent à votre base
    db.query(query, (err, results) => {
        if (err) {
            console.error('Erreur lors de la récupération des formations:', err);
            return res.status(500).json({ message: 'Erreur lors de la récupération des formations' });
        }
        res.status(200).json(results);
    });
};

exports.getFormationById = (req, res) => {
    const formationId = req.params.id;
    const query = 'SELECT * FROM formation WHERE id = ?';
    db.query(query, [formationId], (err, results) => {
      if (err) {
        console.error('Erreur lors de la récupération de la formation:', err);
        return res.status(500).json({ message: 'Erreur lors de la récupération de la formation' });
      }
      if (results.length === 0) {
        return res.status(404).json({ message: 'Formation non trouvée' });
      }
      res.status(200).json(results[0]);
    });
  };
  
exports.getCoursByFormationId = async (req, res) => {
    const formationId = req.params.id; // Récupérer l'ID de la formation depuis l'URL
    console.log('ID formation reçu:', formationId);

    try {
        // Utiliser un JOIN pour récupérer directement les cours liés à la formation
        const query = `
            SELECT c.* 
            FROM cours c
            JOIN formation f ON c.formationAssociee = f.id 
            WHERE f.id = ?`;
        
        // Exécuter la requête SQL
        db.query(query, [formationId], (err, coursResults) => {
            if (err) {
                console.error('Erreur lors de la récupération des cours:', err);
                return res.status(500).json({ message: 'Erreur serveur lors de la récupération des cours.' });
            }

            // Vérifier si des cours ont été trouvés
            if (coursResults.length === 0) {
                return res.status(404).json({ message: 'Aucun cours trouvé pour cette formation.' });
            }

            // Retourner les résultats sous forme de JSON
            res.status(200).json(coursResults);
        });

    } catch (error) {
        console.error('Erreur interne du serveur:', error);
        return res.status(500).json({ message: 'Erreur interne du serveur.' });
    }
};

exports.inscriptionCours = (req, res) => {
    const { id: etudiant_id, coursId: cours_id } = req.params;

    const checkQuery = 'SELECT * FROM inscriptioncours WHERE etudiant_id = ? AND cours_id = ?';
    db.query(checkQuery, [etudiant_id, cours_id], (checkErr, results) => {
        if (checkErr) {
            console.error('Erreur SQL lors de la vérification:', checkErr.sqlMessage || checkErr);
            return res.status(500).json({ message: 'Erreur lors de la vérification de l\'inscription.' });
        }

        if (results.length > 0) {
            return res.status(409).json({ message: 'L\'étudiant est déjà inscrit à ce cours.' });
        }

        const insertQuery = 'INSERT INTO inscriptioncours (etudiant_id, cours_id, dateInscription, progression) VALUES (?, ?, NOW(), 0)';
        db.query(insertQuery, [etudiant_id, cours_id], (insertErr, insertResults) => {
            if (insertErr) {
                console.error('Erreur SQL:', insertErr.sqlMessage || insertErr);
                return res.status(500).json({ message: 'Erreur lors de l\'inscription au cours.' });
            }
            res.status(200).json({ message: 'Inscription réussie' });
        });
    });
};

exports.getSupportsParEtudiant = (req, res) => {
    const etudiantId = req.params.etudiantId;

    const query = `
      SELECT s.*, c.id AS coursId, c.titre AS coursTitre, f.nom AS nomFormation
      FROM supportdecours s
      JOIN cours c ON c.id = s.cours_id
      JOIN formation f ON f.id = c.formationAssociee
      JOIN inscriptioncours ic ON ic.cours_id = c.id
      WHERE ic.etudiant_id = ?
    `;

    db.query(query, [etudiantId], (err, results) => {
        if (err) {
            console.error('Erreur lors de la récupération des supports de cours:', err);
            return res.status(500).json({ message: 'Erreur lors de la récupération des supports de cours' });
        }

        if (results.length === 0) {
            return res.status(404).json({ message: 'Aucun support de cours trouvé.' });
        }

        res.status(200).json(results);
    });
};

exports.getSupportsCours = (req, res) => {
    const coursId = req.params.coursId;
    console.log(coursId);
  
    const query = `
      SELECT s.*, f.nom AS nomFormation
      FROM supportdecours s
      JOIN cours c ON c.id = s.cours_id
      JOIN formation f ON f.id = c.formationAssociee
      WHERE s.cours_id = ?
    `;
  
    db.query(query, [coursId], (err, results) => {
      if (err) {
        console.error('Erreur lors de la récupération des supports de cours:', err);
        return res.status(500).json({ message: 'Erreur lors de la récupération des supports de cours' });
      }
  
      if (results.length === 0) {
        // Retourner un message clair si aucun support n'est trouvé
        return res.status(404).json({ message: 'Ce cours ne contient aucun support de cours.' });
      }
  
      // Envoie les supports de cours ainsi que le nom de la formation
      res.status(200).json({
        supports: results,
        nomFormation: results[0].nomFormation // Le nom de la formation est le même pour tous les supports
      });
    });
  };
  
  exports.getFormationsCours = (req, res) => {
    const etudiantId = req.params.id;
    const query = `
        SELECT f.id AS formationId, f.nom AS formationNom, c.id AS coursId, c.titre AS coursTitre
        FROM formation f
        LEFT JOIN cours c ON f.id = c.formationAssociee
        LEFT JOIN inscriptioncours ic ON ic.cours_id = c.id
        WHERE ic.etudiant_id = ?`;

    db.query(query, [etudiantId], (err, results) => {
        if (err) {
            console.error('Erreur lors de la récupération des formations:', err);
            return res.status(500).json({ message: 'Erreur lors de la récupération des formations' });
        }
        // Vérifier si la formation n'a pas de cours
        if (results.length === 0) {
            return res.status(200).json({ message: 'Aucun cours disponible pour cette formation' });
        }
        res.status(200).json(results);
    });
};


exports.getFormationsInscrit = (req, res) => {
    const { etudiant_id } = req.params;

    const query = `
        SELECT DISTINCT f.nom, f.description, f.lienFormation 
        FROM formation f
        JOIN cours c ON f.id = c.formationAssociee
        JOIN inscriptioncours ic ON c.id = ic.cours_id
        WHERE ic.etudiant_id = ?;
    `;

    db.query(query, [etudiant_id], (err, results) => {
        if (err) {
            console.error('Erreur SQL:', err);
            return res.status(500).json({ message: 'Erreur lors de la récupération des formations', error: err });
        }
        res.status(200).json(results);
    });
};

exports.postulerOffre = (req, res) => {
    const { etudiant_id, offreEmploi_id } = req.body;
    const cv = req.file ? `/uploads/cv/${req.file.filename}` : null; // Construit le chemin complet

    if (!etudiant_id || !offreEmploi_id || !cv) {
        return res.status(400).json({ message: "Tous les champs sont requis." });
    }

    const query = `INSERT INTO postulation (etudiant_id, offreEmploi_id, datePostulation, etatPostulation, cv) 
                   VALUES (?, ?, NOW(), "En attente", ?)`;

    db.query(query, [etudiant_id, offreEmploi_id, cv], (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ message: "Erreur lors de la postulation." });
        }
        res.status(201).json({ message: "Postulation envoyée avec succès", id: result.insertId });
    });
};

exports.getAllOffresEmploi = (req, res) => {
    const query = `SELECT * FROM offreemploi ORDER BY datePublication DESC`;
  
    db.query(query, (err, results) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ message: "Erreur lors de la récupération des offres d'emploi." });
      }
      res.status(200).json(results); // Retourne toutes les offres d'emploi
    });
};

// Récupère les cours auxquels l'étudiant est inscrit
exports.getInscriptionsByEtudiant = async (req, res) => {
    const etudiantId = req.params.etudiantId;
    
    const query = `
        SELECT i.dateInscription, i.progression, c.id AS coursId, c.titre, f.nom, c.imageCours
        FROM inscriptioncours i
        JOIN cours c ON i.cours_id = c.id
        JOIN formation f ON c.formationAssociee = f.id
        WHERE i.etudiant_id = ?
    `;

    db.query(query, [etudiantId], (error, results) => {
        if (error) {
            console.error('Erreur lors de la récupération des inscriptions:', error);
            return res.status(500).json({ message: 'Erreur lors de la récupération des inscriptions' });
        }
        
        // Transformation des résultats pour éviter des problèmes de sérialisation
        const cleanResults = JSON.parse(JSON.stringify(results));

        res.json(cleanResults);
    });
};

// Récupère les informations des formations par leurs IDs
exports.getFormationsByIds = async (req, res) => {
    const { formationIds } = req.body; // Un tableau d'IDs de formations
  
    try {
      const formations = await db.query('SELECT * FROM formation WHERE id IN (?)', [formationIds]);
  
      if (formations.length === 0) {
        return res.status(404).json({ message: 'Aucune formation trouvée.' });
      }
  
      res.json(formations);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Erreur lors de la récupération des formations.' });
    }
};

exports.markSupportAsRead = async (req, res) => {
    const { etudiantId, supportId, coursId } = req.params;
  
    try {
      console.log('Params:', req.params);

      // Exécute la requête pour trouver l'entrée existante
      const [existingRecords] = await db.query(
        'SELECT * FROM lectureSupport WHERE etudiant_id = ? AND support_id = ?',
        [etudiantId, supportId]
      );

      // Vérifiez si existingRecords est un tableau
      if (!existingRecords || existingRecords.length === 0) {
        // Si aucune entrée n'existe, insérer une nouvelle ligne
        await db.query(
          'INSERT INTO lectureSupport (etudiant_id, support_id, cours_id, etatLecture) VALUES (?, ?, ?, 1)',
          [etudiantId, supportId, coursId]
        );
      } else {
        // Mettre à jour l'entrée existante
        await db.query(
          'UPDATE lectureSupport SET dateLecture = NOW() WHERE etudiant_id = ? AND support_id = ?',
          [etudiantId, supportId]
        );
      }

      res.status(200).json({ message: 'Support de cours marqué comme lu.' });
    } catch (error) {
      console.error('Erreur lors de la mise à jour de l\'état de lecture:', error);
      res.status(500).json({ error: 'Erreur lors de la mise à jour de l\'état de lecture.' });
    }
};


exports.progressionDocument = async (req, res) => {
    const { etudiantId } = req.params;

  try {
    const query = `
      SELECT support_id
      FROM lecturesupport
      WHERE etudiant_id = ?
    `;

    db.query(query, [etudiantId], (error, results) => {
      if (error) {
        return res.status(500).json({ message: 'Erreur serveur lors de la récupération de la progression.', error });
      }
      res.json(results);
    });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur.', error });
  }
}

exports.updateProgression = async (req, res) => {
  const { etudiant_id, support_id, cours_id, etatLecture } = req.body;

  try {
    // Mettre à jour l'état de lecture du support
    const query = `
      INSERT INTO lecturesupport (etudiant_id, support_id, cours_id, etatLecture)
      VALUES (?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE etatLecture = VALUES(etatLecture)
    `;

    db.query(query, [etudiant_id, support_id, cours_id, etatLecture], async (error, results) => {
      if (error) {
        return res.status(500).json({ message: 'Erreur serveur lors de la mise à jour de la progression.', error });
      }

      // Calculer la progression
      const totalSupportsQuery = `SELECT COUNT(*) AS totalSupports FROM supportdecours WHERE cours_id = ?`;
      const readSupportsQuery = `SELECT COUNT(*) AS readSupports FROM lecturesupport WHERE etudiant_id = ? AND cours_id = ? AND etatLecture = 1`;

      const totalSupports = await new Promise((resolve, reject) => {
        db.query(totalSupportsQuery, [cours_id], (err, result) => {
          if (err) reject(err);
          resolve(result[0].totalSupports);
        });
      });

      const readSupports = await new Promise((resolve, reject) => {
        db.query(readSupportsQuery, [etudiant_id, cours_id], (err, result) => {
          if (err) reject(err);
          resolve(result[0].readSupports);
        });
      });

      const progression = Math.round((readSupports / totalSupports) * 100); // Calcul de la progression en pourcentage

      // Mettre à jour la progression dans la table inscriptioncours
      const updateProgressionQuery = `
        UPDATE inscriptioncours
        SET progression = ?
        WHERE etudiant_id = ? AND cours_id = ?
      `;

      db.query(updateProgressionQuery, [progression, etudiant_id, cours_id], (error, results) => {
        if (error) {
          return res.status(500).json({ message: 'Erreur lors de la mise à jour de la progression du cours.', error });
        }

        res.status(200).json({ message: 'Progression mise à jour avec succès.', progression });
      });
    });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur.', error });
  }
};

exports.getStatFormation = async (req, res) => {
  const { etudiantId } = req.params;

  try {
    // Récupérer toutes les formations auxquelles l'étudiant est inscrit via les cours
    const formationsProgressQuery = `
      SELECT f.id AS formationId, f.nom AS formationNom, 
             AVG(ic.progression) AS progressionGlobale
      FROM formation f
      JOIN cours c ON f.id = c.formationAssociee
      JOIN inscriptioncours ic ON c.id = ic.cours_id
      WHERE ic.etudiant_id = ?
      GROUP BY f.id
    `;

    db.query(formationsProgressQuery, [etudiantId], (err, result) => {
      if (err) {
        return res.status(500).json({ error: 'Erreur lors du calcul de la progression' });
      }
      res.json(result);
    });
  } catch (error) {
    res.status(500).json({ error: 'Erreur serveur' });
  }

}
    
exports.verifyEmail = async (req, res) => {
  try {
      const { email, verificationCode  } = req.body;

      // Récupérer l'utilisateur basé sur l'email
      const query = `SELECT verificationCode, codeExpiresAt FROM utilisateur WHERE email = ?`;
      db.query(query, [email], (err, results) => {
          if (err) {
              return res.status(500).json({ message: "Erreur interne du serveur" });
          }
          if (results.length === 0) {
              return res.status(404).json({ message: "Utilisateur non trouvé" });
          }

          const { verificationCode: storedCode, codeExpiresAt } = results[0];

          // Vérifiez le code et s'il n'a pas expiré
          if (verificationCode !== storedCode) {
              return res.status(400).json({ message: "Code de vérification invalide" });
          }

          if (new Date() > new Date(codeExpiresAt)) {
              return res.status(400).json({ message: "Le code de vérification a expiré" });
          }

          res.status(200).json({ message: "Email vérifié avec succès. Votre compte est crée" });
      });
  } catch (error) {
      console.error('Erreur interne:', error);
      res.status(500).json({ message: "Erreur interne du serveur" });
  }
};
