require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const Competition = require('../models/Competition');
const Club = require('../models/Club');

const fixBracket = async () => {
  try {
    console.log('🔄 Connexion à MongoDB...');
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/club-pro-commu');
    
    console.log('🔧 CORRECTION DU BRACKET D\'ÉLIMINATION DIRECTE\n');
    console.log('═══════════════════════════════════════════════════════════════════════════\n');
    
    // Récupérer la compétition
    const competition = await Competition.findById('68a591b5eb0106ae145fed19');
    
    if (!competition) {
      console.log('❌ Compétition non trouvée');
      return;
    }
    
    console.log(`🏆 COMPÉTITION: "${competition.nom}"`);
    console.log(`📊 Avant correction:`);
    console.log(`   🏟️ Matchs d'élimination: ${competition.matchsElimination.length}`);
    
    // Analyser l'état actuel
    const huitiemeMatches = competition.matchsElimination.filter(m => m.phase === 'Huitième');
    const quartMatches = competition.matchsElimination.filter(m => m.phase === 'Quart');
    
    console.log(`   🎯 Huitièmes: ${huitiemeMatches.length} matchs`);
    console.log(`   ⚡ Quarts: ${quartMatches.length} matchs`);
    
    // Identifier les gagnants des huitièmes
    const gagnants = [];
    huitiemeMatches.forEach(match => {
      if (match.statut === 'Terminé') {
        const winner = match.score1 > match.score2 ? match.equipe1 : match.equipe2;
        gagnants.push(winner);
        console.log(`   ✅ Gagnant huitième: ${winner}`);
      }
    });
    
    console.log(`\n🔄 CORRECTION EN COURS...`);
    
    // Vider les quarts existants et recréer correctement
    competition.matchsElimination = competition.matchsElimination.filter(m => m.phase !== 'Quart');
    
    // Créer les 2 matchs de quart avec les 4 gagnants
    if (gagnants.length >= 4) {
      // Match 1 de quart
      const quartMatch1 = {
        equipe1: gagnants[0], // Fire Legends
        equipe2: gagnants[1], // Titans Gaming
        score1: null,
        score2: null,
        dateMatch: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        statut: 'Programmé',
        phase: 'Quart',
        tour: 1,
        valideParEquipe1: false,
        valideParEquipe2: false,
        captureEcran: null,
        stats: {
          buteurs: [],
          passeurs: [],
          cartonsJaunes: [],
          cartonsRouges: []
        },
        litige: false,
        arbitre: null
      };
      
      // Match 2 de quart
      const quartMatch2 = {
        equipe1: gagnants[2], // Shadow Hunters
        equipe2: gagnants[3], // Digital Warriors
        score1: null,
        score2: null,
        dateMatch: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000),
        statut: 'Programmé',
        phase: 'Quart',
        tour: 1,
        valideParEquipe1: false,
        valideParEquipe2: false,
        captureEcran: null,
        stats: {
          buteurs: [],
          passeurs: [],
          cartonsJaunes: [],
          cartonsRouges: []
        },
        litige: false,
        arbitre: null
      };
      
      competition.matchsElimination.push(quartMatch1);
      competition.matchsElimination.push(quartMatch2);
      
      console.log(`   ✅ Match 1 quart: ${gagnants[0]} vs ${gagnants[1]}`);
      console.log(`   ✅ Match 2 quart: ${gagnants[2]} vs ${gagnants[3]}`);
    }
    
    // Sauvegarder
    await competition.save();
    
    console.log(`\n📊 Après correction:`);
    const newHuitiemeMatches = competition.matchsElimination.filter(m => m.phase === 'Huitième');
    const newQuartMatches = competition.matchsElimination.filter(m => m.phase === 'Quart');
    
    console.log(`   🏟️ Matchs d'élimination total: ${competition.matchsElimination.length}`);
    console.log(`   🎯 Huitièmes: ${newHuitiemeMatches.length} matchs`);
    console.log(`   ⚡ Quarts: ${newQuartMatches.length} matchs`);
    
    console.log(`\n✅ BRACKET CORRIGÉ !`);
    console.log(`\n🎮 STRUCTURE FINALE:`);
    console.log(`   🎯 Huitièmes de finale: 4 matchs (TERMINÉS)`);
    console.log(`   ⚡ Quarts de finale: 2 matchs (EN ATTENTE)`);
    console.log(`   🔥 Demi-finales: 0 matchs (À CRÉER après quarts)`);
    console.log(`   🏆 Finale: 0 matchs (À CRÉER après demis)`);
    console.log(`   🥉 Petite finale: 0 matchs (À CRÉER après demis)`);
    
    console.log('\n🚀 PROCHAINES ÉTAPES:');
    console.log('   1. Saisissez les résultats des 2 matchs de quart');
    console.log('   2. Le système créera automatiquement les demi-finales');
    console.log('   3. Puis la finale et la petite finale');
    console.log('   4. Couronnement du champion ! 🏆');
    
  } catch (error) {
    console.error('❌ Erreur lors de la correction:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Déconnexion MongoDB');
  }
};

if (require.main === module) {
  fixBracket();
}

module.exports = fixBracket; 