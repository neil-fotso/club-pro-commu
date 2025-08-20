const mongoose = require('mongoose');
const Player = require('../models/Player');
const User = require('../models/User');

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

// Script principal
const main = async () => {
  try {
    await connectDB();
    
    console.log('🧪 Test du postePrincipal...\n');
    
    // Afficher les derniers joueurs créés avec leurs postes
    console.log('📊 Derniers joueurs créés avec leurs postes :');
    console.log('='.repeat(80));
    
    const players = await Player.find({})
      .populate('userId', 'pseudo')
      .sort({ createdAt: -1 })
      .limit(10);
    
    players.forEach(player => {
      console.log(`${player.pseudo.padEnd(15)} | Position: ${(player.position || 'Non renseigné').padEnd(12)} | Poste Principal: ${(player.postePrincipal || 'Non renseigné').padEnd(8)}`);
    });
    
    console.log('\n' + '='.repeat(80));
    
    // Statistiques des postes
    console.log('\n📈 Statistiques des postes :');
    console.log('='.repeat(50));
    
    const positionStats = await Player.aggregate([
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
    
    console.log('Positions générales :');
    positionStats.forEach(stat => {
      console.log(`  ${stat._id.padEnd(12)} : ${stat.count} joueurs`);
    });
    
    const postePrincipalStats = await Player.aggregate([
      {
        $group: {
          _id: '$postePrincipal',
          count: { $sum: 1 }
        }
      },
      {
        $sort: { count: -1 }
      }
    ]);
    
    console.log('\nPostes principaux :');
    postePrincipalStats.forEach(stat => {
      console.log(`  ${(stat._id || 'Non renseigné').padEnd(8)} : ${stat.count} joueurs`);
    });
    
    // Vérifier les joueurs sans postePrincipal
    console.log('\n🔍 Joueurs sans postePrincipal :');
    console.log('='.repeat(50));
    
    const playersWithoutPostePrincipal = await Player.find({ 
      $or: [
        { postePrincipal: { $exists: false } },
        { postePrincipal: null },
        { postePrincipal: '' }
      ]
    }).populate('userId', 'pseudo');
    
    if (playersWithoutPostePrincipal.length === 0) {
      console.log('✅ Tous les joueurs ont un postePrincipal');
    } else {
      console.log(`❌ ${playersWithoutPostePrincipal.length} joueurs sans postePrincipal :`);
      playersWithoutPostePrincipal.forEach(player => {
        console.log(`  - ${player.pseudo} (ID: ${player._id})`);
      });
    }
    
    // Test de création d'un joueur avec postePrincipal
    console.log('\n🧪 Test de création d\'un joueur avec postePrincipal...');
    
    // Créer un utilisateur de test
    const testUser = new User({
      pseudo: 'test-poste-' + Date.now(),
      email: 'test-poste-' + Date.now() + '@test.com',
      password: 'test123'
    });
    await testUser.save();
    
    // Créer un joueur avec postePrincipal
    const testPlayer = new Player({
      userId: testUser._id,
      pseudo: testUser.pseudo,
      plateforme: 'PS5',
      position: 'Milieu',
      postePrincipal: 'MDC',
      disponibilite: 'Disponible'
    });
    await testPlayer.save();
    
    console.log('✅ Joueur de test créé avec postePrincipal MDC');
    console.log(`  - Pseudo: ${testPlayer.pseudo}`);
    console.log(`  - Position: ${testPlayer.position}`);
    console.log(`  - Poste Principal: ${testPlayer.postePrincipal}`);
    
    // Nettoyer le test
    await Player.findByIdAndDelete(testPlayer._id);
    await User.findByIdAndDelete(testUser._id);
    console.log('🧹 Test nettoyé');
    
  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Déconnexion de MongoDB');
  }
};

// Exécuter le script
main(); 