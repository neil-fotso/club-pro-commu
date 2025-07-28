const mongoose = require('mongoose');
require('dotenv').config();

const checkUsers = async () => {
  try {
    // Connexion à MongoDB
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connecté à MongoDB');

    // Importer les modèles
    const User = require('../models/User');
    const Player = require('../models/Player');

    // Récupérer tous les utilisateurs
    const users = await User.find({}).select('pseudo email');
    console.log('\n👥 Utilisateurs dans la base de données:');
    
    if (users.length === 0) {
      console.log('❌ Aucun utilisateur trouvé');
    } else {
      users.forEach((user, index) => {
        console.log(`${index + 1}. Pseudo: "${user.pseudo}" | Email: "${user.email}"`);
      });
    }

    // Récupérer tous les joueurs
    const players = await Player.find({}).select('pseudo plateforme position');
    console.log('\n🎮 Joueurs dans la base de données:');
    
    if (players.length === 0) {
      console.log('❌ Aucun joueur trouvé');
    } else {
      players.forEach((player, index) => {
        console.log(`${index + 1}. Pseudo: "${player.pseudo}" | Plateforme: "${player.plateforme}" | Position: "${player.position}"`);
      });
    }

    // Fermer la connexion
    await mongoose.connection.close();
    console.log('\n🔌 Connexion fermée');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur:', error);
    process.exit(1);
  }
};

// Exécuter le script
checkUsers(); 