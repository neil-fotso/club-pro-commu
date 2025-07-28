const mongoose = require('mongoose');
const Player = require('../models/Player');
const Club = require('../models/Club');

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

// Fonction pour recalculer la disponibilité d'un joueur
const calculateDisponibilite = async (player) => {
  // Vérifier si le joueur appartient à un club
  const clubMembership = await Club.findOne({ 
    'membres.joueurId': player._id 
  });
  
  const isInClub = !!clubMembership;
  
  // Logique de disponibilité automatique
  let newDisponibilite;
  if (player.rechercheClub && !isInClub) {
    newDisponibilite = 'Recherche équipe';
  } else if (isInClub) {
    newDisponibilite = 'Occupé';
  } else {
    newDisponibilite = 'Disponible';
  }
  
  // Mettre à jour seulement si la disponibilité a changé
  if (player.disponibilite !== newDisponibilite) {
    player.disponibilite = newDisponibilite;
    await player.save();
    return { updated: true, old: player.disponibilite, new: newDisponibilite };
  }
  
  return { updated: false };
};

// Script principal
const main = async () => {
  try {
    await connectDB();
    
    console.log('🔄 Recalcul de la disponibilité pour tous les joueurs...');
    
    const players = await Player.find({});
    console.log(`📊 ${players.length} joueurs trouvés`);
    
    let updatedCount = 0;
    
    for (const player of players) {
      const result = await calculateDisponibilite(player);
      
      if (result.updated) {
        updatedCount++;
        console.log(`📝 ${player.pseudo}: ${result.old} → ${result.new}`);
      }
    }
    
    console.log(`✅ ${updatedCount} joueurs mis à jour sur ${players.length} total`);
    
    // Afficher un résumé
    const stats = await Player.aggregate([
      {
        $group: {
          _id: '$disponibilite',
          count: { $sum: 1 }
        }
      }
    ]);
    
    console.log('\n📊 Statistiques de disponibilité:');
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