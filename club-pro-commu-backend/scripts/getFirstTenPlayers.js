require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const Player = require('../models/Player');

const getFirstTenPlayers = async () => {
  try {
    console.log('🔄 Connexion à MongoDB...');
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/club-pro-commu');
    
    console.log('📋 Récupération des 10 premiers joueurs...\n');
    
    // Récupérer les 10 premiers joueurs avec leurs informations utilisateur
    const players = await Player.find()
      .populate('userId', 'email pseudo')
      .limit(10)
      .sort({ dateCreation: 1 });

    console.log('🎯 LISTE DES 10 PREMIERS JOUEURS INSCRITS :');
    console.log('═══════════════════════════════════════════════');
    
    players.forEach((player, index) => {
      console.log(`\n${index + 1}. 👤 Pseudo: ${player.userId.pseudo}`);
      console.log(`   📧 Email: ${player.userId.email}`);
      console.log(`   🔑 Mot de passe: TestPassword123!`);
      console.log(`   ⚽ Position: ${player.position} (${player.postePrincipal})`);
      console.log(`   🎮 Plateforme: ${player.plateforme}`);
      console.log(`   🌍 Pays: ${player.pays}`);
    });

    console.log('\n═══════════════════════════════════════════════');
    console.log('🔐 MOT DE PASSE UNIVERSEL POUR TOUS : TestPassword123!');
    console.log('💡 Format de connexion : Email + Mot de passe');
    console.log(`📊 Total trouvé : ${players.length} joueurs`);

  } catch (error) {
    console.error('❌ Erreur :', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Déconnexion de MongoDB');
  }
};

if (require.main === module) {
  getFirstTenPlayers();
}

module.exports = getFirstTenPlayers; 