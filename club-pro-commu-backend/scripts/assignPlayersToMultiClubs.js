require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const Player = require('../models/Player');
const Club = require('../models/Club');

const assignPlayersToMultiClubs = async () => {
  try {
    console.log('🔄 Connexion à MongoDB...');
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/club-pro-commu');
    
    console.log('🎯 Assignation des joueurs aux clubs (système multi-clubs)...\n');
    
    // Récupérer tous les clubs et joueurs
    const clubs = await Club.find();
    const players = await Player.find().populate('userId');
    
    console.log(`📊 Clubs disponibles: ${clubs.length}`);
    console.log(`👥 Joueurs disponibles: ${players.length}\n`);
    
    if (clubs.length === 0 || players.length === 0) {
      console.log('❌ Aucun club ou joueur trouvé !');
      return;
    }
    
    let totalAssignments = 0;
    let assignmentDetails = [];
    
    // Vider les membres existants des clubs (reset)
    console.log('🧹 Nettoyage des appartenances existantes...');
    await Club.updateMany({}, { 
      $set: { 
        membres: [],
        effectifActuel: 0
      }
    });
    
    // Réinitialiser les clubs des joueurs
    await Player.updateMany({}, {
      $set: { clubs: [] }
    });
    
    console.log('✅ Nettoyage terminé\n');
    
    // Assignation des joueurs aux clubs
    for (let i = 0; i < clubs.length; i++) {
      const club = clubs[i];
      const membresParClub = Math.floor(Math.random() * 6) + 3; // 3 à 8 membres par club
      
      console.log(`🏆 Club "${club.nom}" - Assignation de ${membresParClub} membres:`);
      
      let membresAssignes = 0;
      let hasAdmin = false;
      
      // Mélanger les joueurs pour une assignation aléatoire
      const availablePlayers = [...players].sort(() => Math.random() - 0.5);
      
      for (let j = 0; j < availablePlayers.length && membresAssignes < membresParClub; j++) {
        const player = availablePlayers[j];
        
        // Vérifier si le joueur peut rejoindre ce club
        const activeClubs = player.clubs.filter(c => c.statut === 'Actif');
        if (activeClubs.length >= player.maxClubs) {
          continue; // Joueur a atteint son maximum de clubs
        }
        
        // Vérifier si déjà membre de ce club
        const alreadyMember = player.clubs.some(c => 
          c.clubId.toString() === club._id.toString()
        );
        if (alreadyMember) {
          continue;
        }
        
        // Déterminer le rôle
        let role = 'Joueur';
        if (!hasAdmin && membresAssignes === 0) {
          // Le premier membre devient admin
          role = 'Admin';
          hasAdmin = true;
        } else if (Math.random() < 0.15 && membresAssignes > 0) {
          // 15% de chance d'être capitaine
          role = 'Capitaine';
        }
        
        try {
          // Ajouter le club au joueur
          player.clubs.push({
            clubId: club._id,
            role: role,
            dateAdhesion: new Date(),
            statut: 'Actif'
          });
          await player.save();
          
          // Ajouter le membre au club (compatibilité)
          club.membres.push({
            userId: player.userId._id,
            role: role,
            dateAdhesion: new Date()
          });
          
          membresAssignes++;
          totalAssignments++;
          
          console.log(`   ✅ ${player.pseudo} (${role})`);
          
          assignmentDetails.push({
            club: club.nom,
            player: player.pseudo,
            role: role
          });
          
        } catch (error) {
          console.log(`   ❌ Erreur pour ${player.pseudo}: ${error.message}`);
        }
      }
      
      // Mettre à jour l'effectif du club
      club.effectifActuel = membresAssignes;
      await club.save();
      
      console.log(`   📊 Total membres assignés: ${membresAssignes}\n`);
    }
    
    // Recalculer les disponibilités
    console.log('🔄 Recalcul des disponibilités...');
    let updatedPlayers = 0;
    for (const player of players) {
      try {
        await player.calculateDisponibilite();
        updatedPlayers++;
      } catch (error) {
        console.log(`   ❌ Erreur recalcul ${player.pseudo}: ${error.message}`);
      }
    }
    console.log(`✅ ${updatedPlayers} disponibilités recalculées\n`);
    
    // Statistiques finales
    console.log('📊 RÉSUMÉ DE L\'ASSIGNATION:');
    console.log('═══════════════════════════════════════');
    console.log(`🏆 Clubs traités: ${clubs.length}`);
    console.log(`👥 Total assignations: ${totalAssignments}`);
    
    // Vérifications
    const clubsWithAdmin = await Club.find({
      'membres.role': 'Admin'
    });
    console.log(`👑 Clubs avec admin: ${clubsWithAdmin.length}/${clubs.length}`);
    
    const playersWithMultipleClubs = await Player.find({
      $expr: { $gt: [{ $size: { $filter: { input: "$clubs", cond: { $eq: ["$$this.statut", "Actif"] } } } }, 1] }
    });
    console.log(`🔗 Joueurs multi-clubs: ${playersWithMultipleClubs.length}`);
    
    // Afficher quelques exemples de multi-clubs
    if (playersWithMultipleClubs.length > 0) {
      console.log('\n🎯 Exemples de joueurs multi-clubs:');
      for (let i = 0; i < Math.min(3, playersWithMultipleClubs.length); i++) {
        const player = playersWithMultipleClubs[i];
        const activeClubs = player.clubs.filter(c => c.statut === 'Actif');
        console.log(`   ${player.pseudo}: ${activeClubs.length} clubs actifs`);
        activeClubs.forEach(club => {
          console.log(`     - Club ${club.clubId} (${club.role})`);
        });
      }
    }
    
    console.log('\n🎉 Assignation terminée avec succès !');
    console.log('✨ Chaque club a maintenant un administrateur');
    console.log('🔄 Les joueurs peuvent appartenir à plusieurs clubs');
    
  } catch (error) {
    console.error('❌ Erreur lors de l\'assignation:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Déconnexion MongoDB');
  }
};

if (require.main === module) {
  assignPlayersToMultiClubs();
}

module.exports = assignPlayersToMultiClubs; 