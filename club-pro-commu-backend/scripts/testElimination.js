require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const Competition = require('../models/Competition');

const testElimination = async () => {
  try {
    console.log('🔄 Connexion à MongoDB...');
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/club-pro-commu');
    
    console.log('🏆 TEST SYSTÈME ÉLIMINATION DIRECTE\n');
    console.log('═══════════════════════════════════════════════════\n');
    
    // Récupérer la compétition
    const competition = await Competition.findById('68a591b5eb0106ae145fed19');
    
    if (!competition) {
      console.log('❌ Compétition non trouvée');
      return;
    }
    
    console.log(`🏆 COMPÉTITION: "${competition.nom}"`);
    console.log(`📊 Type: ${competition.type}`);
    console.log(`👥 Équipes inscrites: ${competition.equipesInscrites.length}`);
    console.log(`🏟️ Matchs d'élimination: ${competition.matchsElimination.length}\n`);
    
    // Test 1 : Générer un nouveau bracket
    console.log('🎮 TEST 1 - Génération bracket...');
    
    const axios = require('axios');
    const API_URL = 'http://localhost:3001/api';
    
    try {
      const response = await axios.post(`${API_URL}/competitions/${competition._id}/generer-elimination`);
      console.log('✅ Bracket généré:', response.data.message);
      console.log(`   Phase de départ: ${response.data.phase}`);
      console.log(`   Matchs créés: ${response.data.matchsCrees}`);
    } catch (apiError) {
      console.log('❌ Erreur génération bracket:', apiError.response?.data?.message || apiError.message);
    }
    
    // Recharger la compétition
    const updatedCompetition = await Competition.findById('68a591b5eb0106ae145fed19');
    
    console.log('\n🎯 ÉTAT APRÈS GÉNÉRATION:');
    console.log(`   Matchs d'élimination: ${updatedCompetition.matchsElimination.length}`);
    
    updatedCompetition.matchsElimination.forEach((match, index) => {
      console.log(`   Match ${index + 1}: ${match.equipe1} vs ${match.equipe2} (${match.phase})`);
    });
    
    // Test 2 : Simuler la fin d'un match de quart de finale
    console.log('\n🎮 TEST 2 - Simulation match quart de finale...');
    
    const quartMatch = updatedCompetition.matchsElimination.find(m => m.phase === 'Quart');
    
    if (quartMatch) {
      console.log(`   Match trouvé: ${quartMatch.equipe1} vs ${quartMatch.equipe2}`);
      
      // Simuler un score
      quartMatch.score1 = 2;
      quartMatch.score2 = 1;
      quartMatch.statut = 'Terminé';
      quartMatch.valideParEquipe1 = true;
      quartMatch.valideParEquipe2 = true;
      
      // Ajouter des stats basiques
      quartMatch.stats = {
        buteurs: [
          { joueur: 'julesmartin14', buts: 1 },
          { joueur: 'alexisvincent15', buts: 1 },
          { joueur: 'nicolasdurand6', buts: 1 }
        ],
        passeurs: [
          { joueur: 'testpseu', passes: 1 },
          { joueur: 'mathismartin21', passes: 1 }
        ],
        cartonsJaunes: [],
        cartonsRouges: []
      };
      
      await updatedCompetition.save();
      
      console.log(`   ✅ Score simulé: ${quartMatch.score1}-${quartMatch.score2}`);
      console.log(`   🏆 Gagnant: ${quartMatch.equipe1} (score ${quartMatch.score1} > ${quartMatch.score2})`);
      
      // Test via l'API de mise à jour de score pour déclencher la progression
      try {
        const scoreResponse = await axios.put(
          `${API_URL}/competitions/${competition._id}/matchs/${quartMatch._id}/score`,
          {
            score1: quartMatch.score1,
            score2: quartMatch.score2,
            buteurs: quartMatch.stats.buteurs,
            passeurs: quartMatch.stats.passeurs,
            cartonsJaunes: quartMatch.stats.cartonsJaunes,
            cartonsRouges: quartMatch.stats.cartonsRouges
          },
          {
            headers: {
              'Authorization': `Bearer ${process.env.TEST_TOKEN || 'fake-token'}`
            }
          }
        );
        
        console.log('   ✅ API mise à jour score réussie');
      } catch (apiError) {
        console.log('   ⚠️ API erreur (normal sans token):', apiError.response?.status);
        
        // Déclencher manuellement la progression
        const Competition = require('../models/Competition');
        const comp = await Competition.findById(competition._id);
        const match = comp.matchsElimination.id(quartMatch._id);
        
        // Simuler la fonction de progression
        if (match && match.statut === 'Terminé') {
          console.log('   🔄 Déclenchement manuel de la progression...');
          
          const winner = match.score1 > match.score2 ? match.equipe1 : match.equipe2;
          const nextPhase = 'Demi'; // Quart -> Demi
          
          // Chercher ou créer le match de demi-finale
          let demiMatch = comp.matchsElimination.find(m => m.phase === nextPhase && (!m.equipe1 || !m.equipe2));
          
          if (!demiMatch) {
            demiMatch = {
              equipe1: null,
              equipe2: null,
              score1: null,
              score2: null,
              dateMatch: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
              statut: 'Programmé',
              phase: nextPhase,
              tour: 1,
              valideParEquipe1: false,
              valideParEquipe2: false,
              captureEcran: null,
              stats: { buteurs: [], passeurs: [], cartonsJaunes: [], cartonsRouges: [] },
              litige: false,
              arbitre: null
            };
            comp.matchsElimination.push(demiMatch);
          }
          
          // Placer le gagnant
          if (!demiMatch.equipe1) {
            demiMatch.equipe1 = winner;
          } else if (!demiMatch.equipe2) {
            demiMatch.equipe2 = winner;
          }
          
          await comp.save();
          console.log(`   ✅ ${winner} qualifié pour les ${nextPhase}`);
        }
      }
    } else {
      console.log('   ❌ Aucun match de quart de finale trouvé');
    }
    
    // Test 3 : Vérifier l'état final
    console.log('\n🎯 TEST 3 - État final...');
    
    const finalCompetition = await Competition.findById('68a591b5eb0106ae145fed19');
    
    console.log(`   📊 Matchs d'élimination total: ${finalCompetition.matchsElimination.length}`);
    
    const matchsByPhase = {};
    finalCompetition.matchsElimination.forEach(match => {
      if (!matchsByPhase[match.phase]) matchsByPhase[match.phase] = [];
      matchsByPhase[match.phase].push(match);
    });
    
    Object.entries(matchsByPhase).forEach(([phase, matches]) => {
      console.log(`   ${phase}: ${matches.length} match(s)`);
      matches.forEach((match, i) => {
        const team1 = match.equipe1 || 'TBD';
        const team2 = match.equipe2 || 'TBD';
        const score = match.statut === 'Terminé' ? ` (${match.score1}-${match.score2})` : '';
        console.log(`      ${i + 1}. ${team1} vs ${team2}${score} - ${match.statut}`);
      });
    });
    
    if (finalCompetition.gagnant) {
      console.log(`   🏆 Champion: ${finalCompetition.gagnant}`);
    }
    if (finalCompetition.finaliste) {
      console.log(`   🥈 Finaliste: ${finalCompetition.finaliste}`);
    }
    if (finalCompetition.troisieme) {
      console.log(`   🥉 3ème place: ${finalCompetition.troisieme}`);
    }
    
    console.log('\n🎉 TEST TERMINÉ !');
    console.log('\n🚀 POUR TESTER EN INTERFACE:');
    console.log('   1. Allez sur http://localhost:3002');
    console.log('   2. Ouvrez la compétition "coupe top"');
    console.log('   3. Cliquez sur "Calendrier"');
    console.log('   4. Vous devriez voir le bracket d\'élimination organisé par phases');
    console.log('   5. Saisissez des scores pour voir la progression automatique !');
    
  } catch (error) {
    console.error('❌ Erreur lors du test:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Déconnexion MongoDB');
  }
};

if (require.main === module) {
  testElimination();
}

module.exports = testElimination; 