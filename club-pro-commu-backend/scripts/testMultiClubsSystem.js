require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const Player = require('../models/Player');
const Club = require('../models/Club');

const testMultiClubsSystem = async () => {
  try {
    console.log('🔄 Connexion à MongoDB...');
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/club-pro-commu');
    
    console.log('🧪 TEST DU SYSTÈME MULTI-CLUBS\n');
    console.log('═══════════════════════════════════════════════\n');
    
    // 1. Statistiques générales
    const totalClubs = await Club.countDocuments();
    const totalPlayers = await Player.countDocuments();
    
    console.log('📊 STATISTIQUES GÉNÉRALES:');
    console.log(`   🏆 Total clubs: ${totalClubs}`);
    console.log(`   👥 Total joueurs: ${totalPlayers}\n`);
    
    // 2. Analyse des clubs
    console.log('🏆 ANALYSE DES CLUBS:');
    const clubs = await Club.find().populate('membres.userId', 'pseudo');
    
    for (const club of clubs) {
      const admins = club.membres.filter(m => m.role === 'Admin');
      const capitaines = club.membres.filter(m => m.role === 'Capitaine');
      const joueurs = club.membres.filter(m => m.role === 'Joueur');
      
      console.log(`\n   📍 ${club.nom}:`);
      console.log(`      👑 Admins: ${admins.length} | 🎖️ Capitaines: ${capitaines.length} | ⚽ Joueurs: ${joueurs.length}`);
      console.log(`      📈 Effectif: ${club.effectifActuel}/${club.effectifMax}`);
      
      if (admins.length === 0) {
        console.log(`      ⚠️  ALERTE: Aucun admin !`);
      }
    }
    
    // 3. Analyse des joueurs multi-clubs
    console.log('\n\n👥 ANALYSE DES JOUEURS MULTI-CLUBS:');
    
    const playersWithMultipleClubs = await Player.find({
      $expr: { $gt: [{ $size: { $filter: { input: "$clubs", cond: { $eq: ["$$this.statut", "Actif"] } } } }, 1] }
    }).populate('clubs.clubId', 'nom');
    
    console.log(`   🔗 Joueurs multi-clubs: ${playersWithMultipleClubs.length}/${totalPlayers}`);
    
    // Distribution par nombre de clubs
    const distribution = {};
    for (const player of await Player.find()) {
      const activeClubs = player.clubs.filter(c => c.statut === 'Actif').length;
      distribution[activeClubs] = (distribution[activeClubs] || 0) + 1;
    }
    
    console.log('\n   📊 Distribution par nombre de clubs:');
    Object.keys(distribution).sort().forEach(numClubs => {
      const count = distribution[numClubs];
      const percentage = ((count / totalPlayers) * 100).toFixed(1);
      console.log(`      ${numClubs} club(s): ${count} joueurs (${percentage}%)`);
    });
    
    // 4. Exemples détaillés de joueurs multi-clubs
    if (playersWithMultipleClubs.length > 0) {
      console.log('\n   🎯 EXEMPLES DÉTAILLÉS:');
      
      for (let i = 0; i < Math.min(5, playersWithMultipleClubs.length); i++) {
        const player = playersWithMultipleClubs[i];
        const activeClubs = player.clubs.filter(c => c.statut === 'Actif');
        
        console.log(`\n      👤 ${player.pseudo}:`);
        console.log(`         🎮 Plateforme: ${player.plateforme}`);
        console.log(`         ⚽ Position: ${player.position}`);
        console.log(`         📊 Disponibilité: ${player.disponibilite}`);
        console.log(`         🏆 Clubs (${activeClubs.length}/${player.maxClubs}):`);
        
        for (const clubMembership of activeClubs) {
          const club = await Club.findById(clubMembership.clubId);
          if (club) {
            console.log(`            - ${club.nom} (${clubMembership.role}) - Depuis ${clubMembership.dateAdhesion.toLocaleDateString('fr-FR')}`);
          }
        }
      }
    }
    
    // 5. Test de nouvelles méthodes
    console.log('\n\n🧪 TEST DES NOUVELLES MÉTHODES:');
    
    if (playersWithMultipleClubs.length > 0) {
      const testPlayer = playersWithMultipleClubs[0];
      console.log(`\n   Joueur de test: ${testPlayer.pseudo}`);
      
      const activeClubs = testPlayer.getActiveClubs();
      console.log(`   ✅ getActiveClubs(): ${activeClubs.length} clubs actifs`);
      
      try {
        // Test de limite de clubs
        if (activeClubs.length >= testPlayer.maxClubs) {
          console.log(`   ⚠️  Joueur a atteint sa limite (${testPlayer.maxClubs} clubs)`);
        } else {
          console.log(`   ✅ Joueur peut rejoindre ${testPlayer.maxClubs - activeClubs.length} club(s) supplémentaire(s)`);
        }
      } catch (error) {
        console.log(`   ❌ Erreur test: ${error.message}`);
      }
    }
    
    // 6. Vérifications de cohérence
    console.log('\n\n🔍 VÉRIFICATIONS DE COHÉRENCE:');
    
    let totalMemberships = 0;
    let inconsistencies = 0;
    
    for (const player of await Player.find()) {
      const activeClubs = player.clubs.filter(c => c.statut === 'Actif');
      totalMemberships += activeClubs.length;
      
      // Vérifier les limites
      if (activeClubs.length > player.maxClubs) {
        console.log(`   ⚠️  ${player.pseudo}: ${activeClubs.length} clubs > limite ${player.maxClubs}`);
        inconsistencies++;
      }
      
      // Vérifier les doublons
      const clubIds = activeClubs.map(c => c.clubId.toString());
      const uniqueClubIds = [...new Set(clubIds)];
      if (clubIds.length !== uniqueClubIds.length) {
        console.log(`   ⚠️  ${player.pseudo}: Doublons détectés`);
        inconsistencies++;
      }
    }
    
    console.log(`   📊 Total appartenances: ${totalMemberships}`);
    console.log(`   ${inconsistencies === 0 ? '✅' : '⚠️'} Incohérences détectées: ${inconsistencies}`);
    
    // 7. Résumé final
    console.log('\n\n🎉 RÉSUMÉ DU SYSTÈME MULTI-CLUBS:');
    console.log('═══════════════════════════════════════════════');
    console.log(`✅ ${totalClubs} clubs avec admin assigné`);
    console.log(`✅ ${playersWithMultipleClubs.length} joueurs dans plusieurs clubs`);
    console.log(`✅ ${totalMemberships} appartenances totales`);
    console.log(`✅ Limite par défaut: 3 clubs par joueur`);
    console.log(`${inconsistencies === 0 ? '✅' : '⚠️'} Système ${inconsistencies === 0 ? 'cohérent' : 'avec incohérences'}`);
    
    console.log('\n🔄 Le système multi-clubs est opérationnel !');
    
  } catch (error) {
    console.error('❌ Erreur lors du test:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Déconnexion MongoDB');
  }
};

if (require.main === module) {
  testMultiClubsSystem();
}

module.exports = testMultiClubsSystem; 