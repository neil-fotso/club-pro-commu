require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const Player = require('../models/Player');
const Club = require('../models/Club');

const migrateToMultiClubs = async () => {
  try {
    console.log('🔄 Connexion à MongoDB...');
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/club-pro-commu');
    
    console.log('🚀 Migration vers le système multi-clubs...\n');
    
    // 1. Ajouter les champs manquants aux joueurs existants
    console.log('1️⃣ Mise à jour des schémas Player...');
    await Player.updateMany(
      { clubs: { $exists: false } },
      { 
        $set: { 
          clubs: [],
          maxClubs: 3
        }
      }
    );
    console.log('✅ Champs clubs et maxClubs ajoutés aux joueurs');
    
    // 2. Migrer les appartenances actuelles depuis les clubs
    console.log('\n2️⃣ Migration des appartenances existantes...');
    const clubs = await Club.find();
    let totalMigrated = 0;
    
    for (const club of clubs) {
      console.log(`\n🏆 Migration du club "${club.nom}" (${club.membres.length} membres)`);
      
      for (const membre of club.membres) {
        try {
          // Trouver le joueur correspondant
          const player = await Player.findOne({ userId: membre.userId });
          
          if (!player) {
            console.log(`   ⚠️  Joueur non trouvé pour userId: ${membre.userId}`);
            continue;
          }
          
          // Vérifier si déjà ajouté
          const alreadyHasClub = player.clubs.some(c => 
            c.clubId.toString() === club._id.toString()
          );
          
          if (!alreadyHasClub) {
            // Ajouter le club au joueur
            player.clubs.push({
              clubId: club._id,
              role: membre.role,
              dateAdhesion: membre.dateAdhesion || new Date(),
              statut: 'Actif'
            });
            
            await player.save();
            totalMigrated++;
            console.log(`   ✅ ${player.pseudo} ajouté avec rôle ${membre.role}`);
          } else {
            console.log(`   ℹ️  ${player.pseudo} déjà membre`);
          }
        } catch (error) {
          console.log(`   ❌ Erreur pour membre ${membre.userId}: ${error.message}`);
        }
      }
    }
    
    // 3. Recalculer les disponibilités
    console.log('\n3️⃣ Recalcul des disponibilités...');
    const players = await Player.find();
    let updatedAvailability = 0;
    
    for (const player of players) {
      try {
        await player.calculateDisponibilite();
        updatedAvailability++;
      } catch (error) {
        console.log(`   ❌ Erreur recalcul disponibilité ${player.pseudo}: ${error.message}`);
      }
    }
    
    console.log(`✅ ${updatedAvailability} disponibilités recalculées`);
    
    // 4. Statistiques finales
    console.log('\n📊 Statistiques de migration:');
    console.log(`   🏆 Clubs analysés: ${clubs.length}`);
    console.log(`   👥 Appartenances migrées: ${totalMigrated}`);
    console.log(`   ⚽ Joueurs mis à jour: ${players.length}`);
    
    // 5. Vérifications
    console.log('\n🔍 Vérifications...');
    const playersWithClubs = await Player.find({ 
      'clubs.0': { $exists: true } 
    });
    
    console.log(`   👤 Joueurs avec au moins 1 club: ${playersWithClubs.length}`);
    
    const playersWithMultipleClubs = await Player.find({
      $expr: { $gt: [{ $size: "$clubs" }, 1] }
    });
    
    console.log(`   🔗 Joueurs avec plusieurs clubs: ${playersWithMultipleClubs.length}`);
    
    // Afficher quelques exemples
    if (playersWithClubs.length > 0) {
      console.log('\n🎯 Exemples de joueurs migrés:');
      for (let i = 0; i < Math.min(3, playersWithClubs.length); i++) {
        const player = playersWithClubs[i];
        const activeClubs = player.clubs.filter(c => c.statut === 'Actif');
        console.log(`   ${player.pseudo}: ${activeClubs.length} club(s) actif(s), disponibilité: ${player.disponibilite}`);
      }
    }
    
    console.log('\n🎉 Migration terminée avec succès !');
    console.log('📝 Les joueurs peuvent maintenant appartenir à plusieurs clubs');
    console.log(`📈 Limite par défaut: ${3} clubs par joueur`);
    
  } catch (error) {
    console.error('❌ Erreur during migration:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Déconnexion MongoDB');
  }
};

if (require.main === module) {
  migrateToMultiClubs();
}

module.exports = migrateToMultiClubs; 