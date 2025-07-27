require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');
const playerRoutes = require('./routes/players');
const clubRoutes = require('./routes/clubs');

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
    }
  }
  
  console.log(`${req.method} ${req.path}`, {
    body: req.body,
    headers: req.headers['content-type'],
    userAgent: req.headers['user-agent']
  });
  
  next();
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/players', playerRoutes);
app.use('/api/clubs', clubRoutes);

// Connexion à MongoDB
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/club-pro-commu', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB connecté'))
.catch((err) => console.error('Erreur MongoDB :', err));

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Serveur lancé sur le port ${PORT}`)); 