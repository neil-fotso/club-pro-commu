require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const Competition = require('../models/Competition');
const Club = require('../models/Club');

const fixPhaseLabels = async () => {
  try {
    console.log('🔄 Connexion à MongoDB...');
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/club-pro-commu');
    
    console.log('🔧 CORRECTION DES LABELS DE PHASES\n');
    console.log('═══════════════════════════════════════════════════════════════════════════\n');
    
    // Récupérer la compétition
    const competition = await Competition.findById('68a591b5eb0106ae145fed19');
    
    if (!competition) {
      console.log('❌ Compétition non trouvée');
      return;
    }
    
    console.log(`🏆 COMPÉTITION: "${competition.nom}"`);
    console.log(`👥 Équipes inscrites: ${competition.equipesInscrites.length}`);
    
    // Analyser l'état actuel
    console.log('\n📊 ÉTAT ACTUEL:');
    const phases = ['Huitième', 'Quart', 'Demi', 'Finale', 'Petite finale'];
    phases.forEach(phase => {
      const matches = competition.matchsElimination.filter(m => m.phase === phase);
      if (matches.length > 0) {
        console.log(`   ${phase}: ${matches.length} match(s)`);
      }
    });
    
    console.log('\n🔍 LOGIQUE CORRECTE POUR 8 ÉQUIPES:');
    console.log('   ⚡ Quarts de finale: 4 matchs (8 équipes)');
    console.log('   🔥 Demi-finales: 2 matchs (4 équipes)'); 
    console.log('   🏆 Finale: 1 match (2 équipes)');
    console.log('   🥉 Petite finale: 1 match (2 équipes)');
    
    console.log('\n🔄 CORRECTION EN COURS...');
    
    // Corriger les phases
    let correctionCount = 0;
    
    competition.matchsElimination.forEach(match => {
      let newPhase = match.phase;
      
      // Correction: ce qui était appelé "Huitième" devrait être "Quart"
      if (match.phase === 'Huitième') {
        newPhase = 'Quart';
        console.log(`   ✅ Match corrigé: ${match.phase} → ${newPhase}`);
        match.phase = newPhase;
        correctionCount++;
      }
      
      // Correction: ce qui était appelé "Quart" devrait être "Demi"
      else if (match.phase === 'Quart') {
        newPhase = 'Demi';
        console.log(`   ✅ Match corrigé: ${match.phase} → ${newPhase}`);
        match.phase = newPhase;
        correctionCount++;
      }
    });
    
    // Sauvegarder les corrections
    if (correctionCount > 0) {
      await competition.save();
      console.log(`\n💾 ${correctionCount} corrections sauvegardées`);
    } else {
      console.log('\n✅ Aucune correction nécessaire');
    }
    
    // Afficher l'état après correction
    console.log('\n📊 ÉTAT APRÈS CORRECTION:');
    phases.forEach(phase => {
      const matches = competition.matchsElimination.filter(m => m.phase === phase);
      if (matches.length > 0) {
        console.log(`   ${phase}: ${matches.length} match(s)`);
      }
    });
    
    // Vérification de la cohérence
    const quartMatches = competition.matchsElimination.filter(m => m.phase === 'Quart');
    const demiMatches = competition.matchsElimination.filter(m => m.phase === 'Demi');
    
    console.log('\n🎯 VÉRIFICATION DE COHÉRENCE:');
    
    if (quartMatches.length === 4) {
      console.log('   ✅ Quarts de finale: 4 matchs (CORRECT)');
    } else {
      console.log(`   ❌ Quarts de finale: ${quartMatches.length} matchs (devrait être 4)`);
    }
    
    if (demiMatches.length === 2) {
      console.log('   ✅ Demi-finales: 2 matchs (CORRECT)');
    } else if (demiMatches.length === 0) {
      console.log('   ⏳ Demi-finales: 0 matchs (à créer après quarts)');
    } else {
      console.log(`   ❌ Demi-finales: ${demiMatches.length} matchs (devrait être 2 ou 0)`);
    }
    
    console.log('\n🎮 BRACKET CORRIGÉ:');
    console.log('┌─────────────────────────────┐');
    console.log('│    STRUCTURE CORRECTE       │');
    console.log('├─────────────────────────────┤');
    console.log('│ ⚡ QUARTS: 4 matchs (8→4)   │');
    console.log('│ 🔥 DEMIS: 2 matchs (4→2)    │'); 
    console.log('│ 🏆 FINALE: 1 match (2→1)   │');
    console.log('│ 🥉 PETITE: 1 match (2→1)   │');
    console.log('└─────────────────────────────┘');
    
    console.log('\n🚀 PROCHAINES ÉTAPES:');
    console.log('   1. Vérifier l\'affichage frontend');
    console.log('   2. Les "Quarts" s\'affichent maintenant correctement');
    console.log('   3. Après résultats des quarts → auto-création des demis');
    console.log('   4. Progression normale vers finale et petite finale');
    
  } catch (error) {
    console.error('❌ Erreur lors de la correction:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Déconnexion MongoDB');
  }
};

if (require.main === module) {
  fixPhaseLabels();
}

module.exports = fixPhaseLabels; 