const Club = require('../models/Club');

/**
 * Calcule la disponibilité d'un joueur en fonction de ses appartenances aux clubs
 * @param {string} userId - ID de l'utilisateur
 * @param {Object} Player - Modèle Player
 * @returns {Promise<string>} - Statut de disponibilité
 */
const calculatePlayerAvailability = async (userId, Player = null) => {
  try {
    if (!Player) {
      Player = require('../models/Player');
    }
    
    // Récupérer le profil joueur
    const player = await Player.findOne({ userId });
    
    if (!player) {
      return 'Disponible'; // Pas de profil joueur
    }
    
    // Compter les clubs actifs
    const activeClubs = player.clubs.filter(club => club.statut === 'Actif');
    
    // Logique de disponibilité multi-clubs
    if (player.rechercheClub) {
      if (activeClubs.length < player.maxClubs) {
        return 'Disponible'; // Peut rejoindre d'autres clubs
      } else {
        return 'Complet'; // A atteint son maximum de clubs
      }
    } else {
      return 'Non disponible'; // Ne cherche pas de nouveau club
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