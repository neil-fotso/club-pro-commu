require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const Competition = require('../models/Competition');
const Club = require('../models/Club');

const fixFinalBracket = async () => {
  try {
    console.log('🔄 Connexion à MongoDB...');
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/club-pro-commu');
    
    console.log('🔧 CORRECTION DU BRACKET FINAL\n');
    console.log('═══════════════════════════════════════════════════════════════════════════\n');
    
    // Récupérer la compétition
    const competition = await Competition.findById('68a591b5eb0106ae145fed19');
    
    if (!competition) {
      console.log('❌ Compétition non trouvée');
      return;
    }
    
    console.log(`🏆 COMPÉTITION: "${competition.nom}"`);
    
    // Analyser les demi-finales terminées
    const demiMatches = competition.matchsElimination.filter(m => m.phase === 'Demi' && m.statut === 'Terminé');
    
    console.log('\n📊 ANALYSE DES DEMI-FINALES:');
    const gagnantsDemi = [];
    const perdantsDemi = [];
    
    demiMatches.forEach((match, index) => {
      const gagnant = match.score1 > match.score2 ? match.equipe1 : match.equipe2;
      const perdant = match.score1 > match.score2 ? match.equipe2 : match.equipe1;
      
      gagnantsDemi.push(gagnant);
      perdantsDemi.push(perdant);
      
      console.log(`   Demi ${index + 1}: ${match.equipe1} vs ${match.equipe2} (${match.score1}-${match.score2})`);
      console.log(`   → Gagnant: ${gagnant}, Perdant: ${perdant}`);
    });
    
    console.log(`\n🏆 Gagnants des demis: ${gagnantsDemi.join(', ')}`);
    console.log(`❌ Perdants des demis: ${perdantsDemi.join(', ')}`);
    
    // Supprimer les matchs finaux incorrects existants
    competition.matchsElimination = competition.matchsElimination.filter(m => 
      m.phase !== 'Finale' && m.phase !== 'Petite finale'
    );
    
    console.log('\n🔄 CRÉATION DES MATCHS FINAUX...');
    
    // Créer la finale avec les 2 gagnants des demis
    if (gagnantsDemi.length === 2) {
      const finale = {
        equipe1: gagnantsDemi[0],
        equipe2: gagnantsDemi[1],
        score1: null,
        score2: null,
        dateMatch: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        statut: 'Programmé',
        phase: 'Finale',
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
      
      competition.matchsElimination.push(finale);
      console.log(`   ✅ Finale créée: ${gagnantsDemi[0]} vs ${gagnantsDemi[1]}`);
    }
    
    // Créer la petite finale avec les 2 perdants des demis
    if (perdantsDemi.length === 2) {
      const petiteFinale = {
        equipe1: perdantsDemi[0],
        equipe2: perdantsDemi[1],
        score1: null,
        score2: null,
        dateMatch: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000),
        statut: 'Programmé',
        phase: 'Petite finale',
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
      
      competition.matchsElimination.push(petiteFinale);
      console.log(`   ✅ Petite finale créée: ${perdantsDemi[0]} vs ${perdantsDemi[1]}`);
    }
    
    // Sauvegarder
    await competition.save();
    
    // Afficher le résultat final
    console.log('\n🎯 BRACKET FINAL CORRIGÉ:');
    
    const phases = ['Quart', 'Demi', 'Finale', 'Petite finale'];
    phases.forEach(phase => {
      const matches = competition.matchsElimination.filter(m => m.phase === phase);
      if (matches.length > 0) {
        console.log(`\n📋 ${phase.toUpperCase()}: ${matches.length} match(s)`);
        matches.forEach((match, i) => {
          const team1 = match.equipe1 || 'TBD';
          const team2 = match.equipe2 || 'TBD';
          const score = match.statut === 'Terminé' ? ` (${match.score1}-${match.score2})` : '';
          console.log(`   ${i + 1}. ${team1} vs ${team2}${score} - ${match.statut}`);
        });
      }
    });
    
    console.log('\n✅ BRACKET FINAL CORRIGÉ !');
    console.log('\n🚀 PROCHAINES ÉTAPES:');
    console.log('   1. La finale oppose les 2 gagnants des demi-finales');
    console.log('   2. La petite finale oppose les 2 perdants des demi-finales');
    console.log('   3. Après ces matchs → champions déterminés !');
    console.log('   4. Vérifiez l\'affichage sur http://localhost:3002');
    
  } catch (error) {
    console.error('❌ Erreur lors de la correction:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Déconnexion MongoDB');
  }
};

if (require.main === module) {
  fixFinalBracket();
}

module.exports = fixFinalBracket; 