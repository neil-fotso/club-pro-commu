require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const Competition = require('../models/Competition');

const triggerProgression = async () => {
  try {
    console.log('🔄 Connexion à MongoDB...');
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/club-pro-commu');
    
    console.log('🏆 DÉCLENCHER PROGRESSION ÉLIMINATION\n');
    console.log('═══════════════════════════════════════════════════\n');
    
    // Récupérer la compétition
    const competition = await Competition.findById('68a591b5eb0106ae145fed19');
    
    if (!competition) {
      console.log('❌ Compétition non trouvée');
      return;
    }
    
    console.log(`🏆 COMPÉTITION: "${competition.nom}"`);
    
    // Fonction de progression (copiée du backend)
    const handleEliminationProgression = (competition, completedMatch) => {
      console.log(`🏆 Traitement match ${completedMatch.phase}...`);
      
      // Déterminer l'équipe gagnante
      const winner = completedMatch.score1 > completedMatch.score2 ? 
        completedMatch.equipe1 : completedMatch.equipe2;
      const loser = completedMatch.score1 > completedMatch.score2 ? 
        completedMatch.equipe2 : completedMatch.equipe1;
      
      console.log(`   Gagnant: ${winner}, Perdant: ${loser}`);
      
      // Définir la progression des phases
      const phaseProgression = {
        'Huitième': 'Quart',
        'Quart': 'Demi', 
        'Demi': 'Finale'
      };
      
      const nextPhase = phaseProgression[completedMatch.phase];
      
      if (!nextPhase) {
        console.log(`   Pas de phase suivante pour ${completedMatch.phase}`);
        return;
      }
      
      console.log(`   → Progression vers: ${nextPhase}`);
      
      // Chercher ou créer le match de la phase suivante
      let nextMatch = competition.matchsElimination.find(match => 
        match.phase === nextPhase && 
        (!match.equipe1 || !match.equipe2)
      );
      
      if (!nextMatch) {
        // Créer un nouveau match pour la phase suivante
        nextMatch = {
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
          stats: {
            buteurs: [],
            passeurs: [],
            cartonsJaunes: [],
            cartonsRouges: []
          },
          litige: false,
          arbitre: null
        };
        
        competition.matchsElimination.push(nextMatch);
        console.log(`   ✅ Nouveau match créé pour ${nextPhase}`);
      }
      
      // Placer l'équipe gagnante dans le match suivant
      if (!nextMatch.equipe1) {
        nextMatch.equipe1 = winner;
        console.log(`   ✅ ${winner} placé en équipe1 du ${nextPhase}`);
      } else if (!nextMatch.equipe2) {
        nextMatch.equipe2 = winner;
        console.log(`   ✅ ${winner} placé en équipe2 du ${nextPhase}`);
      } else {
        console.log(`   ⚠️ Match ${nextPhase} déjà complet`);
      }
      
      // Gérer la petite finale (3ème place)
      if (completedMatch.phase === 'Demi') {
        let petiteFinale = competition.matchsElimination.find(match => 
          match.phase === 'Petite finale');
        
        if (!petiteFinale) {
          petiteFinale = {
            equipe1: null,
            equipe2: null,
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
          console.log(`   ✅ Petite finale créée`);
        }
        
        // Placer l'équipe perdante dans la petite finale
        if (!petiteFinale.equipe1) {
          petiteFinale.equipe1 = loser;
          console.log(`   ✅ ${loser} placé en petite finale (équipe1)`);
        } else if (!petiteFinale.equipe2) {
          petiteFinale.equipe2 = loser;
          console.log(`   ✅ ${loser} placé en petite finale (équipe2)`);
        }
      }
    };
    
    // Traiter tous les matchs terminés de la phase huitième
    const huitiemeMatches = competition.matchsElimination.filter(m => 
      m.phase === 'Huitième' && m.statut === 'Terminé'
    );
    
    console.log(`📊 Matchs de huitième terminés: ${huitiemeMatches.length}`);
    
    huitiemeMatches.forEach((match, index) => {
      console.log(`\n🎮 TRAITEMENT MATCH ${index + 1}:`);
      console.log(`   ${match.equipe1} vs ${match.equipe2}: ${match.score1}-${match.score2}`);
      handleEliminationProgression(competition, match);
    });
    
    // Sauvegarder
    await competition.save();
    
    // Afficher le résultat
    console.log('\n🎯 RÉSULTAT FINAL:');
    
    const matchsByPhase = {};
    competition.matchsElimination.forEach(match => {
      if (!matchsByPhase[match.phase]) matchsByPhase[match.phase] = [];
      matchsByPhase[match.phase].push(match);
    });
    
    Object.entries(matchsByPhase).forEach(([phase, matches]) => {
      console.log(`\n📋 ${phase.toUpperCase()}: ${matches.length} match(s)`);
      matches.forEach((match, i) => {
        const team1 = match.equipe1 || 'TBD';
        const team2 = match.equipe2 || 'TBD';
        const score = match.statut === 'Terminé' ? ` (${match.score1}-${match.score2})` : '';
        console.log(`   ${i + 1}. ${team1} vs ${team2}${score} - ${match.statut}`);
      });
    });
    
    console.log('\n🎉 PROGRESSION DÉCLENCHÉE !');
    console.log('\n🚀 MAINTENANT:');
    console.log('   1. Allez sur http://localhost:3002');
    console.log('   2. Ouvrez la compétition "coupe top"');
    console.log('   3. Cliquez sur "Calendrier"');
    console.log('   4. Vous devriez voir les matchs de quart de finale !');
    
  } catch (error) {
    console.error('❌ Erreur lors de la progression:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Déconnexion MongoDB');
  }
};

if (require.main === module) {
  triggerProgression();
}

module.exports = triggerProgression; 