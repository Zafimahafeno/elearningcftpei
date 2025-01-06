// Importation
const express = require("express");
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');

// Importation des routes
// Etudiant
const etudiantRoutes = require('./routes/client/etudiantRoutes');

// Admin
const adminRoutes = require('./routes/admin/adminRoutes');
const adminEtudiantRoutes = require('./routes/admin/AdminEtudiantRoutes')
const adminFormationRoutes = require('./routes/admin/adminFormationRoutes')
const adminCoursRoutes = require('./routes/admin/coursRoutes');
const supportsCoursController = require('./routes/admin/supportsCoursRoutes')
const statsRoutes = require("./routes/admin/statsRoutes");


// Instantiation
const app = express();

// Middleware
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Routes pour les fichiers statiques (photos de profil)
app.use('/uploads', express.static(path.join(__dirname, 'uploads'), {
  setHeaders: function (res, filePath) {
    if (filePath.endsWith('.pdf')) {
      res.set('Content-Type', 'application/pdf');
    }
    console.log(`Accès au fichier: ${filePath}`);
  }
}));

// Gestion des erreurs globales
app.use((err, req, res, next) => {
  console.error('Erreur détectée:', err.message);
  res.status(500).json({ message: 'Erreur interne du serveur !' });
});

// Route d'accueil pour tester si le serveur tourne
app.get('/', (req, res) => {
  res.send('Serveur en cours d\'exécution');
});

// Routes étudiants
app.use('/api/users', etudiantRoutes()); 
// Routes admin
app.use('/admin', adminRoutes); 
app.use('/adminEtudiant', adminEtudiantRoutes)
app.use('/api/filiere', adminFormationRoutes)
app.use('/cours', adminCoursRoutes);
app.use('/supports-de-cours', supportsCoursController);
app.use("/stats", statsRoutes);

// Lancement du serveur
const port = process.env.PORT || 5000;
app.listen(port, () => {
  console.log(`Serveur en écoute :) \nSur le port ${port}`);
});
