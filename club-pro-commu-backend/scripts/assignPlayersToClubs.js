require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const Player = require('../models/Player');
const Club = require('../models/Club');

const MONGODB_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/club-pro-commu';

const assignPlayersToClubs = async () => {
  try {
    console.log('🔄 Connexion à MongoDB...');
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connexion MongoDB établie');

    // Récupérer tous les clubs et joueurs
    console.log('\n🔄 Récupération des clubs et joueurs...');
    const clubs = await Club.find({});
    const players = await Player.find({}).populate('userId');
    
    console.log(`📊 ${clubs.length} clubs trouvés`);
    console.log(`📊 ${players.length} joueurs trouvés`);

    if (clubs.length === 0 || players.length === 0) {
      console.log('❌ Aucun club ou joueur trouvé. Veuillez d\'abord créer les données de test.');
      return;
    }

    // Mélanger les joueurs pour une répartition aléatoire
    const shuffledPlayers = [...players].sort(() => Math.random() - 0.5);
    
    console.log('\n🔄 Assignation des joueurs aux clubs...');
    
    let playerIndex = 0;
    let totalAssignments = 0;
    
    for (let i = 0; i < clubs.length; i++) {
      const club = clubs[i];
      
      // Nombre de joueurs à assigner à ce club (entre 3 et 8)
      const numPlayersToAssign = Math.floor(Math.random() * 6) + 3;
      const playersForThisClub = [];
      
      console.log(`\n🏆 Club: ${club.nom}`);
      console.log(`👥 Assignation de ${numPlayersToAssign} joueurs...`);
      
      // Assigner les joueurs au club
      for (let j = 0; j < numPlayersToAssign && playerIndex < shuffledPlayers.length; j++) {
        const player = shuffledPlayers[playerIndex];
        
        // Vérifier que le joueur n'est pas déjà dans un autre club
        const playerAlreadyInClub = await Club.findOne({
          $or: [
            { 'membres.userId': player.userId._id },
            { createurId: player.userId._id }
          ]
        });
        
        if (!playerAlreadyInClub) {
          // Définir le rôle du joueur dans le club
          let role = 'Joueur';
          if (j === 0 && club.createurId.toString() !== player.userId._id.toString()) {
            // Le premier joueur devient capitaine (sauf si c'est déjà le créateur)
            role = 'Capitaine';
          } else if (Math.random() < 0.1) {
            // 10% de chance d'être admin
            role = 'Admin';
          }
          
          const memberData = {
            userId: player.userId._id,
            role: role,
            dateAdhesion: new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000), // Adhésion dans les 30 derniers jours
            statut: 'Actif'
          };
          
          playersForThisClub.push(memberData);
          console.log(`  ✅ ${player.pseudo} (${player.position}) - ${role}`);
          totalAssignments++;
        }
        
        playerIndex++;
      }
      
      // Mettre à jour le club avec les nouveaux membres
      if (playersForThisClub.length > 0) {
        await Club.findByIdAndUpdate(club._id, {
          $push: { membres: { $each: playersForThisClub } },
          effectifActuel: club.effectifActuel + playersForThisClub.length
        });
        
        // Mettre à jour le statut des joueurs
        for (const member of playersForThisClub) {
          await Player.findOneAndUpdate(
            { userId: member.userId },
            { 
              rechercheClub: false, // Le joueur ne cherche plus de club
              derniereActivite: new Date()
            }
          );
        }
      }
    }
    
    console.log('\n🎉 Assignation terminée !');
    console.log(`📊 Total d'assignations : ${totalAssignments}`);
    
    // Afficher un résumé
    console.log('\n📋 Résumé des clubs :');
    const updatedClubs = await Club.find({}).populate('membres.userId', 'pseudo');
    
    for (const club of updatedClubs) {
      console.log(`\n🏆 ${club.nom}`);
      console.log(`   👥 Effectif : ${club.membres.length}/${club.effectifMax}`);
      
      if (club.membres.length > 0) {
        const capitaines = club.membres.filter(m => m.role === 'Capitaine');
        const viceCapitaines = club.membres.filter(m => m.role === 'Vice-capitaine');
        const membres = club.membres.filter(m => m.role === 'Membre');
        
        if (capitaines.length > 0) {
          console.log(`   👑 Capitaine(s) : ${capitaines.map(m => m.userId.pseudo).join(', ')}`);
        }
        if (viceCapitaines.length > 0) {
          console.log(`   🎖️  Vice-capitaine(s) : ${viceCapitaines.map(m => m.userId.pseudo).join(', ')}`);
        }
        if (membres.length > 0) {
          console.log(`   👤 Membres : ${membres.map(m => m.userId.pseudo).join(', ')}`);
        }
      }
    }
    
    // Afficher les joueurs non assignés
    const unassignedPlayers = await Player.find({ rechercheClub: true }).populate('userId', 'pseudo');
    if (unassignedPlayers.length > 0) {
      console.log('\n🔍 Joueurs encore en recherche de club :');
      for (const player of unassignedPlayers) {
        console.log(`   • ${player.pseudo} (${player.position})`);
      }
    }
    
    console.log('\n✅ Script terminé avec succès !');

  } catch (error) {
    console.error('❌ Erreur lors de l\'assignation :', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Déconnexion de MongoDB');
  }
};

assignPlayersToClubs(); 