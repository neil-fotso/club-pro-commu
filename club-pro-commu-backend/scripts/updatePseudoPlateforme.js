const mongoose = require('mongoose');
const Player = require('../models/Player');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/club-pro-commu');
    console.log('✅ Connexion à MongoDB réussie');
  } catch (error) {
    console.error('❌ Erreur connexion MongoDB:', error);
    process.exit(1);
  }
};

const main = async () => {
  try {
    await connectDB();

    console.log('🔄 Mise à jour des pseudo de plateforme...');

    // Mettre à jour tous les joueurs qui n'ont pas de pseudoPlateforme
    const updateResult = await Player.updateMany(
      { 
        $or: [
          { pseudoPlateforme: { $exists: false } },
          { pseudoPlateforme: null },
          { pseudoPlateforme: '' }
        ]
      },
      [
        {
          $set: {
            pseudoPlateforme: '$pseudo' // Utiliser le pseudo comme pseudo de plateforme par défaut
          }
        }
      ]
    );

    console.log(`✅ ${updateResult.modifiedCount} joueurs mis à jour`);

    // Afficher quelques exemples
    const players = await Player.find({}).limit(5);
    console.log('\n📊 Exemples de joueurs avec pseudoPlateforme :');
    players.forEach(player => {
      console.log(`  - ${player.pseudo} → Pseudo plateforme: ${player.pseudoPlateforme}`);
    });

    // Statistiques
    const stats = await Player.aggregate([
      {
        $group: {
          _id: {
            hasPseudoPlateforme: { $ne: ['$pseudoPlateforme', ''] }
          },
          count: { $sum: 1 }
        }
      }
    ]);

    console.log('\n📈 Statistiques :');
    stats.forEach(stat => {
      const status = stat._id.hasPseudoPlateforme ? 'Avec pseudo plateforme' : 'Sans pseudo plateforme';
      console.log(`  ${status}: ${stat.count} joueurs`);
    });

  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Déconnexion de MongoDB');
  }
};

main(); 