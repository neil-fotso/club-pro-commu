const Player = require('../models/Player');

// Middleware pour mettre à jour lastActivity
const updateActivity = async (req, res, next) => {
  try {
    // Si l'utilisateur est authentifié, mettre à jour lastActivity
    if (req.user && req.user.id) {
      await Player.findOneAndUpdate(
        { userId: req.user.id },
        { lastActivity: new Date() },
        { new: false } // Ne pas retourner le document mis à jour
      );
    }
    next();
  } catch (error) {
    console.error('Erreur mise à jour activité:', error);
    next(); // Continuer même en cas d'erreur
  }
};

module.exports = updateActivity; 