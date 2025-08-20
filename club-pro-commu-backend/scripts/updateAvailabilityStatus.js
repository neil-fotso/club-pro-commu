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

// Script principal
const main = async () => {
  try {
    await connectDB();
    
    console.log('🔄 Mise à jour des statuts de disponibilité...');
    
    // Mettre à jour les anciens statuts vers les nouveaux
    const updateResult = await Player.updateMany(
      { disponibilite: { $in: ['Recherche équipe', 'Occupé', 'Absent'] } },
      [
        {
          $set: {
            disponibilite: {
              $switch: {
                branches: [
                  { case: { $eq: ['$disponibilite', 'Recherche équipe'] }, then: 'Disponible' },
                  { case: { $eq: ['$disponibilite', 'Occupé'] }, then: 'Indisponible' },
                  { case: { $eq: ['$disponibilite', 'Absent'] }, then: 'Indisponible' }
                ],
                default: 'Disponible'
              }
            }
          }
        }
      ]
    );
    
    console.log(`✅ ${updateResult.modifiedCount} joueurs mis à jour`);
    
    // Afficher un résumé des statuts actuels
    const stats = await Player.aggregate([
      {
        $group: {
          _id: '$disponibilite',
          count: { $sum: 1 }
        }
      }
    ]);
    
    console.log('\n📊 Statistiques de disponibilité actuelles:');
    stats.forEach(stat => {
      console.log(`  ${stat._id}: ${stat.count} joueurs`);
    });
    
  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Déconnexion de MongoDB');
  }
};

// Exécuter le script
main(); 