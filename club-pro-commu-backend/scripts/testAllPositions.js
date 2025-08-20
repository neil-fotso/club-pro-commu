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
    
    console.log('🧪 Test de tous les postes disponibles...\n');
    
    // Tous les postes disponibles
    const allPositions = [
      'BU', 'AG', 'AD',  // Attaquants
      'MOC', 'MG', 'MD', 'MC', 'MDC',  // Milieux
      'DD', 'DG', 'DC', 'DLD', 'DLG',  // Défenseurs
      'GB'  // Gardien
    ];
    
    console.log('📋 Tous les postes disponibles :');
    console.log('='.repeat(60));
    
    allPositions.forEach(post => {
      const position = mapPositionToBackend(post);
      console.log(`${post.padEnd(4)} → ${position.padEnd(12)} (${getPositionName(post)})`);
    });
    
    console.log('\n' + '='.repeat(60));
    
    // Vérifier spécifiquement les problèmes mentionnés
    console.log('\n🔍 Vérifications spécifiques :');
    
    // Test MDC
    const mdcPosition = mapPositionToBackend('MDC');
    console.log(`MDC → ${mdcPosition} : ${mdcPosition === 'Milieu' ? '✅ Correct' : '❌ ERREUR'}`);
    
    // Test GB
    const gbPosition = mapPositionToBackend('GB');
    console.log(`GB  → ${gbPosition} : ${gbPosition === 'Gardien' ? '✅ Correct' : '❌ ERREUR'}`);
    
    // Vérifier que GB est dans les enums du modèle
    console.log('\n📊 Vérification des enums du modèle Player :');
    const playerSchema = Player.schema;
    const postePrincipalEnum = playerSchema.path('postePrincipal').enumValues;
    const postesSecondairesEnum = playerSchema.path('postesSecondaires.0').enumValues;
    
    console.log('Poste principal enum:', postePrincipalEnum);
    console.log('Postes secondaires enum:', postesSecondairesEnum);
    
    const gbInPrincipal = postePrincipalEnum.includes('GB');
    const gbInSecondaires = postesSecondairesEnum.includes('GB');
    const mdcInPrincipal = postePrincipalEnum.includes('MDC');
    const mdcInSecondaires = postesSecondairesEnum.includes('MDC');
    
    console.log(`\nGB dans postePrincipal: ${gbInPrincipal ? '✅' : '❌'}`);
    console.log(`GB dans postesSecondaires: ${gbInSecondaires ? '✅' : '❌'}`);
    console.log(`MDC dans postePrincipal: ${mdcInPrincipal ? '✅' : '❌'}`);
    console.log(`MDC dans postesSecondaires: ${mdcInSecondaires ? '✅' : '❌'}`);
    
    // Afficher les statistiques actuelles
    console.log('\n📊 Statistiques actuelles des joueurs par position :');
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
    
  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Déconnexion de MongoDB');
  }
};

// Fonction helper pour obtenir le nom du poste (simulation de positionUtils.js)
const getPositionName = (code) => {
  const positions = {
    'BU': 'Buteur',
    'AG': 'Ailier Gauche',
    'AD': 'Ailier Droit',
    'MOC': 'Milieu Offensif Central',
    'MG': 'Milieu Gauche',
    'MD': 'Milieu Droit',
    'MC': 'Milieu Central',
    'MDC': 'Milieu Défensif Central',
    'DD': 'Défenseur Droit',
    'DG': 'Défenseur Gauche',
    'DC': 'Défenseur Central',
    'DLD': 'Défenseur Latéral Droit',
    'DLG': 'Défenseur Latéral Gauche',
    'GB': 'Gardien de But'
  };
  return positions[code] || code;
};

// Exécuter le script
main(); 