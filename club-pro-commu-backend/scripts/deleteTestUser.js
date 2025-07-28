const mongoose = require('mongoose');

// Connexion à MongoDB
mongoose.connect('mongodb://localhost:27017/clubprocommu', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const User = require('../models/User');
const Player = require('../models/Player');

const deleteTestUser = async () => {
  try {
    console.log('🗑️ Suppression de l\'utilisateur testuser123...');
    
    // Supprimer l'utilisateur
    const deletedUser = await User.findOneAndDelete({ pseudo: 'testuser123' });
    if (deletedUser) {
      console.log('✅ Utilisateur supprimé:', deletedUser.pseudo);
      
      // Supprimer le profil joueur associé
      const deletedPlayer = await Player.findOneAndDelete({ userId: deletedUser._id });
      if (deletedPlayer) {
        console.log('✅ Profil joueur supprimé:', deletedPlayer.pseudo);
      }
    } else {
      console.log('❌ Utilisateur testuser123 non trouvé');
    }
    
  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    mongoose.connection.close();
  }
};

deleteTestUser(); 