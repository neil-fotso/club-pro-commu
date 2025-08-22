require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const Competition = require('../models/Competition');
const Club = require('../models/Club');

const testCompetitionPlayersData = async () => {
  try {
    console.log('🔄 Connexion à MongoDB...');
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/club-pro-commu');
    
    console.log('🧪 TEST DES DONNÉES DE JOUEURS DANS LES COMPÉTITIONS\n');
    console.log('═══════════════════════════════════════════════════\n');
    
    // Récupérer une compétition avec des équipes inscrites
    const competition = await Competition.findOne({ equipesInscrites: { $exists: true, $not: { $size: 0 } } })
      .populate('createurId', 'pseudo _id')
      .populate({
        path: 'equipesInscrites.clubId',
        select: 'nom logo description membres',
        populate: {
          path: 'membres.userId',
          select: 'pseudo _id'
        }
      });
    
    if (!competition) {
      console.log('❌ Aucune compétition avec équipes inscrites trouvée');
      return;
    }
    
    console.log(`🏆 COMPÉTITION TESTÉE: "${competition.nom}"`);
    console.log(`   👑 Créateur: ${competition.createurId?.pseudo || 'N/A'}`);
    console.log(`   👥 Équipes inscrites: ${competition.equipesInscrites.length}`);
    
    // Analyser chaque équipe inscrite
    console.log('\n📋 ANALYSE DES ÉQUIPES INSCRITES:');
    
    let totalPlayers = 0;
    
    for (let i = 0; i < competition.equipesInscrites.length; i++) {
      const equipe = competition.equipesInscrites[i];
      
      console.log(`\n   📍 Équipe ${i + 1}:`);
      
      if (!equipe.clubId) {
        console.log('      ❌ Pas de club associé');
        continue;
      }
      
      console.log(`      🏆 Club: ${equipe.clubId.nom}`);
      console.log(`      🆔 ID Club: ${equipe.clubId._id}`);
      
      if (!equipe.clubId.membres || equipe.clubId.membres.length === 0) {
        console.log('      ❌ Aucun membre trouvé');
        continue;
      }
      
      console.log(`      👥 Membres: ${equipe.clubId.membres.length}`);
      
      // Lister les premiers membres
      const maxToShow = 5;
      for (let j = 0; j < Math.min(maxToShow, equipe.clubId.membres.length); j++) {
        const membre = equipe.clubId.membres[j];
        
        if (membre.userId && membre.userId.pseudo) {
          console.log(`         👤 ${membre.userId.pseudo} (${membre.role})`);
          totalPlayers++;
        } else {
          console.log(`         ❌ Membre ${j + 1}: Données utilisateur manquantes`);
        }
      }
      
      if (equipe.clubId.membres.length > maxToShow) {
        console.log(`         ... et ${equipe.clubId.membres.length - maxToShow} autres`);
        totalPlayers += (equipe.clubId.membres.length - maxToShow);
      }
    }
    
    console.log(`\n📊 RÉSUMÉ:`);
    console.log(`   🏆 Équipes inscrites: ${competition.equipesInscrites.length}`);
    console.log(`   👥 Total joueurs trouvés: ${totalPlayers}`);
    
    // Test de simulation d'un match
    if (competition.equipesInscrites.length >= 2) {
      console.log('\n🎮 SIMULATION D\'UN MATCH:');
      
      const equipe1 = competition.equipesInscrites[0];
      const equipe2 = competition.equipesInscrites[1];
      
      console.log(`   📍 ${equipe1.clubId?.nom || 'Équipe 1'} vs ${equipe2.clubId?.nom || 'Équipe 2'}`);
      
      // Simuler la fonction getJoueursEquipes
      const mockMatch = {
        equipe1: equipe1.clubId,
        equipe2: equipe2.clubId
      };
      
      const joueursEquipe1 = equipe1.clubId?.membres?.filter(m => m.userId && m.userId.pseudo) || [];
      const joueursEquipe2 = equipe2.clubId?.membres?.filter(m => m.userId && m.userId.pseudo) || [];
      
      console.log(`\n   👥 Joueurs disponibles pour les stats:`);
      console.log(`      🏆 ${equipe1.clubId?.nom || 'Équipe 1'}: ${joueursEquipe1.length} joueurs`);
      console.log(`      🏆 ${equipe2.clubId?.nom || 'Équipe 2'}: ${joueursEquipe2.length} joueurs`);
      
      if (joueursEquipe1.length > 0) {
        console.log(`         Exemples: ${joueursEquipe1.slice(0, 3).map(j => j.userId.pseudo).join(', ')}`);
      }
      
      if (joueursEquipe2.length > 0) {
        console.log(`         Exemples: ${joueursEquipe2.slice(0, 3).map(j => j.userId.pseudo).join(', ')}`);
      }
      
      const totalJoueursMatch = joueursEquipe1.length + joueursEquipe2.length;
      
      if (totalJoueursMatch > 0) {
        console.log(`\n   ✅ Les joueurs seraient disponibles pour la saisie de statistiques !`);
      } else {
        console.log(`\n   ❌ Aucun joueur disponible pour la saisie de statistiques`);
      }
    }
    
    // Vérifier la structure des données
    console.log('\n🔍 VÉRIFICATION DE LA STRUCTURE DES DONNÉES:');
    
    if (competition.equipesInscrites.length > 0) {
      const firstTeam = competition.equipesInscrites[0];
      
      console.log('   📋 Structure attendue:');
      console.log(`      competition.equipesInscrites[0].clubId.nom: ${firstTeam.clubId?.nom ? '✅' : '❌'}`);
      console.log(`      competition.equipesInscrites[0].clubId.membres: ${firstTeam.clubId?.membres ? '✅' : '❌'}`);
      
      if (firstTeam.clubId?.membres && firstTeam.clubId.membres.length > 0) {
        const firstMember = firstTeam.clubId.membres[0];
        console.log(`      membres[0].userId.pseudo: ${firstMember.userId?.pseudo ? '✅' : '❌'}`);
        console.log(`      membres[0].role: ${firstMember.role ? '✅' : '❌'}`);
      }
    }
    
    console.log('\n🎉 Test terminé !');
    
  } catch (error) {
    console.error('❌ Erreur lors du test:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Déconnexion MongoDB');
  }
};

if (require.main === module) {
  testCompetitionPlayersData();
}

module.exports = testCompetitionPlayersData; 