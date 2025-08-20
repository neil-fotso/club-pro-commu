const mongoose = require('mongoose');
const Player = require('../models/Player');

// Configuration de la base de données
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/club-pro-commu');
    console.log('✅ Connexion à MongoDB réussie');
  } catch (error) {
    console.error('❌ Erreur connexion MongoDB:', error);
    process.exit(1);
  }
};

// Mapping des postes vers les positions générales (comme dans auth.js)
const mapPositionToBackend = (frontendPosition) => {
  const positionMap = {
    // Positions d'attaque
    'BU': 'Attaquant',
    'AG': 'Attaquant',
    'AD': 'Attaquant',

    // Positions de milieu
    'MOC': 'Milieu',
    'MG': 'Milieu',
    'MD': 'Milieu',
    'MC': 'Milieu',
    'MDC': 'Milieu',

    // Positions de défense
    'DD': 'Défenseur',
    'DG': 'Défenseur',
    'DC': 'Défenseur',
    'DLD': 'Défenseur',
    'DLG': 'Défenseur',

    // Position de gardien
    'GB': 'Gardien'
  };

  return positionMap[frontendPosition] || 'Polyvalent';
};

// Script principal
const main = async () => {
  try {
    await connectDB();
    
    console.log('🧪 Test de classification des postes...\n');
    
    // Tester tous les postes
    const testPositions = [
      'BU', 'AG', 'AD',  // Attaquants
      'MOC', 'MG', 'MD', 'MC', 'MDC',  // Milieux
      'DD', 'DG', 'DC', 'DLD', 'DLG',  // Défenseurs
      'GB'  // Gardien
    ];
    
    console.log('📋 Classification des postes :');
    console.log('='.repeat(50));
    
    testPositions.forEach(post => {
      const position = mapPositionToBackend(post);
      console.log(`${post.padEnd(4)} → ${position}`);
    });
    
    console.log('\n' + '='.repeat(50));
    
    // Vérifier spécifiquement MDC
    const mdcPosition = mapPositionToBackend('MDC');
    console.log(`\n🔍 Test spécifique MDC :`);
    console.log(`MDC → ${mdcPosition}`);
    
    if (mdcPosition === 'Milieu') {
      console.log('✅ MDC est correctement classé comme Milieu');
    } else {
      console.log('❌ ERREUR : MDC devrait être classé comme Milieu');
    }
    
    // Vérifier MOC aussi
    const mocPosition = mapPositionToBackend('MOC');
    console.log(`\n🔍 Test spécifique MOC :`);
    console.log(`MOC → ${mocPosition}`);
    
    if (mocPosition === 'Milieu') {
      console.log('✅ MOC est correctement classé comme Milieu');
    } else {
      console.log('❌ ERREUR : MOC devrait être classé comme Milieu');
    }
    
    // Afficher les statistiques des joueurs par position
    console.log('\n📊 Statistiques des joueurs par position :');
    console.log('='.repeat(50));
    
    const stats = await Player.aggregate([
      {
        $group: {
          _id: '$position',
          count: { $sum: 1 }
        }
      },
      {
        $sort: { count: -1 }
      }
    ]);
    
    stats.forEach(stat => {
      console.log(`${stat._id.padEnd(12)} : ${stat.count} joueurs`);
    });
    
    // Afficher quelques exemples de joueurs avec leurs postes
    console.log('\n👥 Exemples de joueurs avec leurs postes :');
    console.log('='.repeat(50));
    
    const players = await Player.find({})
      .populate('userId', 'pseudo')
      .limit(5);
    
    players.forEach(player => {
      const position = mapPositionToBackend(player.postePrincipal);
      console.log(`${player.pseudo.padEnd(15)} : ${player.postePrincipal} → ${position}`);
    });
    
  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Déconnexion de MongoDB');
  }
};

// Exécuter le script
main(); 