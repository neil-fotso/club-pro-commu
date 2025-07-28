const mongoose = require('mongoose');
const User = require('../models/User');
const Player = require('../models/Player');
require('dotenv').config();

async function cleanupDeletedUsers() {
  try {
    // Connexion à MongoDB
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('✅ Connecté à MongoDB');

    // Calculer la date limite (30 jours)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // Trouver les utilisateurs marqués pour suppression depuis plus de 30 jours
    const usersToDelete = await User.find({
      markedForDeletion: true,
      deletionRequestDate: { $lte: thirtyDaysAgo }
    });

    console.log(`📋 ${usersToDelete.length} utilisateurs à supprimer`);

    for (const user of usersToDelete) {
      try {
        // Supprimer le profil joueur associé
        await Player.findOneAndDelete({ userId: user._id });
        console.log(`🗑️ Profil joueur supprimé pour ${user.email}`);

        // Supprimer l'utilisateur
        await User.findByIdAndDelete(user._id);
        console.log(`🗑️ Utilisateur supprimé: ${user.email}`);

        // Log de l'action pour audit
        console.log(`📝 Audit: Suppression utilisateur ${user.email} (ID: ${user._id}) - ${new Date().toISOString()}`);
      } catch (error) {
        console.error(`❌ Erreur lors de la suppression de ${user.email}:`, error);
      }
    }

    console.log('✅ Nettoyage terminé');
  } catch (error) {
    console.error('❌ Erreur lors du nettoyage:', error);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Déconnecté de MongoDB');
  }
}

// Exécuter le script
if (require.main === module) {
  cleanupDeletedUsers();
}

module.exports = cleanupDeletedUsers; 