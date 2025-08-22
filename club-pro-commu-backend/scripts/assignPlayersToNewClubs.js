require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Player = require('../models/Player');
const Club = require('../models/Club');

const assignPlayersToNewClubs = async () => {
  try {
    console.log('🔄 Connexion à MongoDB...');
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/club-pro-commu');
    
    console.log('🎯 ASSIGNATION AUX NOUVEAUX CLUBS ET CRÉATION DE JOUEURS\n');
    console.log('═══════════════════════════════════════════════════════\n');
    
    // ===== CRÉER QUELQUES NOUVEAUX JOUEURS =====
    const commonPassword = 'TestPassword123!';
    const hashedPassword = await bcrypt.hash(commonPassword, 10);
    
    console.log('👥 CRÉATION DE NOUVEAUX JOUEURS...\n');
    
    const newPlayersData = [
      { pseudo: 'maximegarcia46', nom: 'Garcia', prenom: 'Maxime', plateforme: 'PS5', position: 'Gardien' },
      { pseudo: 'sophieandré47', nom: 'André', prenom: 'Sophie', plateforme: 'Xbox', position: 'Défenseur' },
      { pseudo: 'tomleblond48', nom: 'Leblond', prenom: 'Tom', plateforme: 'PC', position: 'Milieu' },
      { pseudo: 'amelierousseau49', nom: 'Rousseau', prenom: 'Amélie', plateforme: 'PS5', position: 'Attaquant' },
      { pseudo: 'julienlegrand50', nom: 'Legrand', prenom: 'Julien', plateforme: 'Xbox', position: 'Défenseur' },
      { pseudo: 'marieblanc51', nom: 'Blanc', prenom: 'Marie', plateforme: 'PC', position: 'Milieu' },
      { pseudo: 'antoinenoir52', nom: 'Noir', prenom: 'Antoine', plateforme: 'PS5', position: 'Attaquant' },
      { pseudo: 'camillefabre53', nom: 'Fabre', prenom: 'Camille', plateforme: 'Xbox', position: 'Gardien' },
      { pseudo: 'lucbrun54', nom: 'Brun', prenom: 'Luc', plateforme: 'PC', position: 'Défenseur' },
      { pseudo: 'elodiebernard55', nom: 'Bernard', prenom: 'Élodie', plateforme: 'PS5', position: 'Milieu' }
    ];
    
    const createdPlayers = [];
    
    for (const playerData of newPlayersData) {
      const email = `${playerData.pseudo}@test.com`;
      
      let user = await User.findOne({ email });
      if (!user) {
        user = new User({
          email: email,
          pseudo: playerData.pseudo,
          password: hashedPassword,
          isAdmin: false,
          dateCreation: new Date(),
          derniereConnexion: new Date()
        });
        await user.save();
        
        const player = new Player({
          userId: user._id,
          pseudo: playerData.pseudo,
          nom: playerData.nom,
          prenom: playerData.prenom,
          position: playerData.position,
          plateforme: playerData.plateforme,
          age: Math.floor(Math.random() * 15) + 18,
          disponibilite: 'Disponible',
          rechercheClub: true,
          clubs: [],
          maxClubs: 3,
          dateCreation: new Date()
        });
        await player.save();
        createdPlayers.push(player);
        
        console.log(`   ✅ ${playerData.pseudo} (${playerData.position}, ${playerData.plateforme})`);
      } else {
        console.log(`   ⚠️  ${playerData.pseudo} existe déjà`);
      }
    }
    
    console.log(`\n📊 ${createdPlayers.length} nouveaux joueurs créés`);
    
    // ===== IDENTIFIER LES NOUVEAUX CLUBS =====
    const newClubNames = ['Cyber Knights', 'Digital Warriors', 'Neon Strikers', 'Quantum FC', 'Apex Legends FC'];
    const newClubs = await Club.find({ nom: { $in: newClubNames } });
    
    console.log(`\n🏆 CLUBS CIBLES: ${newClubs.length} nouveaux clubs trouvés\n`);
    
    // ===== RÉCUPÉRER LES JOUEURS DISPONIBLES =====
    const allPlayers = await Player.find().populate('userId', 'pseudo');
    
    // Filtrer les joueurs qui peuvent rejoindre plus de clubs
    const availablePlayers = allPlayers.filter(player => {
      const activeClubs = player.clubs.filter(c => c.statut === 'Actif');
      return activeClubs.length < player.maxClubs && player.rechercheClub;
    });
    
    console.log(`👥 Joueurs disponibles pour assignation: ${availablePlayers.length}/${allPlayers.length}\n`);
    
    // ===== ASSIGNATION INTELLIGENTE =====
    let totalAssignments = 0;
    
    for (const club of newClubs) {
      console.log(`🏆 Assignation pour ${club.nom}:`);
      
      // Mélanger les joueurs disponibles
      const shuffledPlayers = [...availablePlayers].sort(() => 0.5 - Math.random());
      
      // Assigner 3-6 joueurs par club
      const targetMembers = Math.floor(Math.random() * 4) + 3; // 3-6 membres
      let assigned = 0;
      
      for (const player of shuffledPlayers) {
        if (assigned >= targetMembers) break;
        
        // Vérifier si le club n'est pas plein
        if (club.effectifActuel >= club.effectifMax) {
          console.log(`   ⚠️  Club complet (${club.effectifActuel}/${club.effectifMax})`);
          break;
        }
        
        // Vérifier si le joueur peut encore rejoindre des clubs
        const activeClubs = player.clubs.filter(c => c.statut === 'Actif');
        if (activeClubs.length >= player.maxClubs) {
          continue;
        }
        
        // Vérifier si le joueur n'est pas déjà dans ce club
        const alreadyInClub = activeClubs.some(c => c.clubId.toString() === club._id.toString());
        if (alreadyInClub) {
          continue;
        }
        
        // Déterminer le rôle
        let role = 'Joueur';
        if (assigned === 0 && Math.random() < 0.4) { // 40% chance d'avoir un Capitaine
          role = 'Capitaine';
        }
        
        try {
          await player.joinClub(club._id, role);
          
          // Ajouter le membre au club
          club.membres.push({
            userId: player.userId,
            role: role,
            dateAdhesion: new Date()
          });
          club.effectifActuel += 1;
          
          assigned++;
          totalAssignments++;
          console.log(`   ✅ ${player.pseudo} (${role})`);
          
        } catch (error) {
          console.log(`   ❌ ${player.pseudo}: ${error.message}`);
        }
      }
      
      await club.save();
      console.log(`   📊 Total assigné: ${assigned}/${targetMembers} | Effectif: ${club.effectifActuel}/${club.effectifMax}\n`);
    }
    
    // ===== RECALCULER LES DISPONIBILITÉS =====
    console.log('🔄 Recalcul des disponibilités...');
    for (const player of availablePlayers) {
      await player.calculateDisponibilite();
    }
    console.log('✅ Disponibilités recalculées\n');
    
    // ===== STATISTIQUES FINALES =====
    console.log('📊 STATISTIQUES FINALES:');
    console.log('═══════════════════════════════════════════════');
    
    const finalStats = await Promise.all(newClubs.map(async (club) => {
      const updatedClub = await Club.findById(club._id).populate('membres.userId', 'pseudo');
      return {
        nom: updatedClub.nom,
        effectif: updatedClub.effectifActuel,
        max: updatedClub.effectifMax,
        admin: updatedClub.membres.find(m => m.role === 'Admin')?.userId?.pseudo,
        capitaines: updatedClub.membres.filter(m => m.role === 'Capitaine').length,
        joueurs: updatedClub.membres.filter(m => m.role === 'Joueur').length
      };
    }));
    
    console.log(`🔗 Total nouvelles assignations: ${totalAssignments}`);
    console.log(`👥 Nouveaux joueurs créés: ${createdPlayers.length}`);
    
    console.log('\n🏆 ÉTAT DES NOUVEAUX CLUBS:');
    for (const stat of finalStats) {
      console.log(`\n   📍 ${stat.nom}:`);
      console.log(`      👑 Admin: ${stat.admin}`);
      console.log(`      📈 Effectif: ${stat.effectif}/${stat.max}`);
      console.log(`      🎖️ Capitaines: ${stat.capitaines} | ⚽ Joueurs: ${stat.joueurs}`);
    }
    
    // ===== EXEMPLES DE NOUVEAUX JOUEURS =====
    if (createdPlayers.length > 0) {
      console.log('\n👥 NOUVEAUX JOUEURS CRÉÉS:');
      for (const player of createdPlayers.slice(0, 5)) {
        const updatedPlayer = await Player.findById(player._id);
        const activeClubs = updatedPlayer.clubs.filter(c => c.statut === 'Actif');
        
        console.log(`\n   👤 ${player.pseudo}:`);
        console.log(`      ⚽ ${player.position} | 🎮 ${player.plateforme}`);
        console.log(`      🏆 ${activeClubs.length}/${player.maxClubs} clubs | 📊 ${updatedPlayer.disponibilite}`);
        
        if (activeClubs.length > 0) {
          console.log(`      🏆 Clubs:`);
          for (const clubMembership of activeClubs) {
            const club = await Club.findById(clubMembership.clubId);
            if (club) {
              console.log(`         - ${club.nom} (${clubMembership.role})`);
            }
          }
        }
      }
    }
    
    console.log('\n🔐 MOT DE PASSE UNIVERSEL: TestPassword123!');
    console.log('\n🎉 Assignation terminée avec succès !');
    
  } catch (error) {
    console.error('❌ Erreur lors de l\'assignation:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Déconnexion MongoDB');
  }
};

if (require.main === module) {
  assignPlayersToNewClubs();
}

module.exports = assignPlayersToNewClubs; 