const Club = require('../models/Club');

/**
 * Calcule la disponibilité d'un joueur en fonction de son appartenance à un club
 * @param {string} userId - ID de l'utilisateur
 * @returns {Promise<string>} - Statut de disponibilité
 */
const calculatePlayerAvailability = async (userId) => {
  try {
    // Chercher si le joueur est membre d'un club
    const club = await Club.findOne({
      'membres.userId': userId
    });

    if (club) {
      return 'Occupé'; // Le joueur est dans un club
    } else {
      return 'Disponible'; // Le joueur n'est dans aucun club
    }
  } catch (error) {
    console.error('Erreur calcul disponibilité joueur:', error);
    return 'Disponible'; // Par défaut, considérer comme disponible en cas d'erreur
  }
};

/**
 * Met à jour la disponibilité d'un joueur
 * @param {string} userId - ID de l'utilisateur
 * @param {Object} Player - Modèle Player
 * @returns {Promise<void>}
 */
const updatePlayerAvailability = async (userId, Player) => {
  try {
    const newAvailability = await calculatePlayerAvailability(userId);
    
    await Player.findOneAndUpdate(
      { userId: userId },
      { disponibilite: newAvailability },
      { new: false }
    );
  } catch (error) {
    console.error('Erreur mise à jour disponibilité joueur:', error);
  }
};

module.exports = {
  calculatePlayerAvailability,
  updatePlayerAvailability
}; 