const fs = require('fs');
const path = require('path');

/**
 * Nettoie toutes les vidéos de litige locales pour une compétition donnée.
 * @param {Object} competition - Objet Compétition Mongoose
 */
function cleanCompetitionVideos(competition) {
  try {
    const localPrefix = '/uploads/disputes/';
    const filesToDelete = [];

    // Récupérer tous les matchs de la compétition (poules + élimination)
    const allMatches = [];

    if (competition.poules && Array.isArray(competition.poules)) {
      competition.poules.forEach(poule => {
        if (poule.matchs && Array.isArray(poule.matchs)) {
          poule.matchs.forEach(match => allMatches.push(match));
        }
      });
    }

    if (competition.matchsElimination && Array.isArray(competition.matchsElimination)) {
      competition.matchsElimination.forEach(match => allMatches.push(match));
    }

    // Récupérer le champ matchs s'il y a des matchs simples à plat
    if (competition.matchs && Array.isArray(competition.matchs)) {
      competition.matchs.forEach(match => allMatches.push(match));
    }

    allMatches.forEach(match => {
      if (match.litigeDetails && match.litigeDetails.preuveVideo) {
        const videoUrl = match.litigeDetails.preuveVideo;
        if (videoUrl.startsWith(localPrefix)) {
          const filename = videoUrl.substring(localPrefix.length);
          if (filename) {
            // Résoudre par rapport au dossier racine
            const filepath = path.resolve('uploads/disputes', filename);
            filesToDelete.push(filepath);
          }
        }
      }
    });

    if (filesToDelete.length > 0) {
      console.log(`🧹 [Nettoyage Vidéos] ${filesToDelete.length} vidéos à supprimer pour la compétition "${competition.nom}"`);
      filesToDelete.forEach(filepath => {
        if (fs.existsSync(filepath)) {
          try {
            fs.unlinkSync(filepath);
            console.log(`   🗑️ Fichier supprimé : ${filepath}`);
          } catch (err) {
            console.error(`   ❌ Impossible de supprimer le fichier ${filepath} :`, err.message);
          }
        } else {
          console.log(`   ⚠️ Fichier introuvable sur le disque : ${filepath}`);
        }
      });
    } else {
      console.log(`🧹 [Nettoyage Vidéos] Aucune vidéo locale à nettoyer pour la compétition "${competition.nom}"`);
    }
  } catch (error) {
    console.error('❌ Erreur lors du nettoyage des vidéos de la compétition:', error);
  }
}

module.exports = {
  cleanCompetitionVideos
};
