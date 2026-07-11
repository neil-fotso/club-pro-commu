require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');
const playerRoutes = require('./routes/players');
const clubRoutes = require('./routes/clubs');
const competitionRoutes = require('./routes/competitions');
const invitationRoutes = require('./routes/invitations');
const notificationRoutes = require('./routes/notifications');
const discordRoutes = require('./routes/discord');
const adminRoutes = require('./routes/admin');
const updateActivity = require('./middleware/updateActivity');

const app = express();

// Middlewares
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Middleware personnalisé pour gérer les différents Content-Type
app.use((req, res, next) => {
  const contentType = req.headers['content-type'];
  
  // Si c'est une requête POST/PUT et que le Content-Type n'est pas application/json
  if ((req.method === 'POST' || req.method === 'PUT') && 
      contentType && 
      !contentType.includes('application/json') &&
      contentType.includes('text/plain')) {
    
    // Essayer de parser le body comme JSON
    try {
      if (req.body && typeof req.body === 'string') {
        req.body = JSON.parse(req.body);
      }
    } catch (error) {
      console.log('Erreur parsing JSON:', error);
      // Si le parsing échoue, essayer de récupérer les données brutes
      if (req.body && typeof req.body === 'string') {
        try {
          // Essayer de parser comme JSON même si le Content-Type est text/plain
          req.body = JSON.parse(req.body);
        } catch (parseError) {
          console.log('Impossible de parser le body comme JSON:', parseError);
        }
      }
    }
  }
  
  // Log minimal pour les erreurs seulement
  if (req.method === 'POST' || req.method === 'PUT') {
    console.log(`${req.method} ${req.path}`);
  }
  
  next();
});

// Middleware pour forcer le parsing JSON pour les requêtes PUT
app.use((req, res, next) => {
  if (req.method === 'PUT' && req.headers['content-type']?.includes('text/plain')) {
    // Si req.body est undefined ou une chaîne, essayer de le parser
    if (req.body && typeof req.body === 'string') {
      try {
        req.body = JSON.parse(req.body);
      } catch (error) {
        console.log('Erreur parsing JSON dans middleware PUT:', error);
      }
    }
  }
  next();
});





const path = require('path');
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/user', updateActivity, userRoutes);
app.use('/api/players', updateActivity, playerRoutes);
app.use('/api/clubs', updateActivity, clubRoutes);
app.use('/api/competitions', updateActivity, competitionRoutes);
app.use('/api/invitations', updateActivity, invitationRoutes);
app.use('/api/notifications', updateActivity, notificationRoutes);
app.use('/api/discord', discordRoutes);
app.use('/api/admin', updateActivity, adminRoutes);

// Connexion à MongoDB
const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/club-pro-commu';
console.log('🔧 Configuration MongoDB:');
console.log('   MONGO_URI:', process.env.MONGO_URI || 'mongodb://localhost:27017/club-pro-commu');
console.log('   Base de données utilisée:', mongoUri);

mongoose.connect(mongoUri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log('✅ MongoDB connecté avec succès !');
  console.log('   Base de données:', mongoose.connection.db.databaseName);
  console.log('   Host:', mongoose.connection.host);
  console.log('   Port:', mongoose.connection.port);
})
.catch((err) => {
  console.error('❌ Erreur MongoDB :', err);
  process.exit(1);
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Serveur lancé sur le port ${PORT}`)); 