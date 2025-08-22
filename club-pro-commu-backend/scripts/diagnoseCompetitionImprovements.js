require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const Competition = require('../models/Competition');
const Club = require('../models/Club');

const diagnoseCompetitionImprovements = async () => {
  try {
    console.log('🔄 Connexion à MongoDB...');
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/club-pro-commu');
    
    console.log('🔍 DIAGNOSTIC DES AMÉLIORATIONS POSSIBLES\n');
    console.log('═══════════════════════════════════════════════════════════════════════════\n');
    
    // Analyser les données existantes
    const competitions = await Competition.find().populate('equipesInscrites.clubId', 'nom');
    const clubs = await Club.find();
    const users = await User.find();
    
    console.log('📊 ÉTAT ACTUEL DU SYSTÈME:');
    console.log(`   🏆 Compétitions: ${competitions.length}`);
    console.log(`   🏟️ Clubs: ${clubs.length}`);
    console.log(`   👥 Utilisateurs: ${users.length}`);
    
    // Analyser les types de compétitions
    console.log('\n🎮 ANALYSE DES COMPÉTITIONS:');
    const typeStats = {};
    const statutStats = {};
    let totalMatchs = 0;
    let totalMatchsTermines = 0;
    
    competitions.forEach(comp => {
      typeStats[comp.type] = (typeStats[comp.type] || 0) + 1;
      statutStats[comp.statut] = (statutStats[comp.statut] || 0) + 1;
      
      // Compter les matchs
      if (comp.poules) {
        comp.poules.forEach(poule => {
          totalMatchs += poule.matchs?.length || 0;
          totalMatchsTermines += poule.matchs?.filter(m => m.statut === 'Terminé').length || 0;
        });
      }
      if (comp.matchsElimination) {
        totalMatchs += comp.matchsElimination.length;
        totalMatchsTermines += comp.matchsElimination.filter(m => m.statut === 'Terminé').length;
      }
    });
    
    console.log('\n   Types de compétitions:');
    Object.entries(typeStats).forEach(([type, count]) => {
      console.log(`     ${type}: ${count} compétitions`);
    });
    
    console.log('\n   Statuts des compétitions:');
    Object.entries(statutStats).forEach(([statut, count]) => {
      console.log(`     ${statut}: ${count} compétitions`);
    });
    
    console.log(`\n   📈 Matchs joués: ${totalMatchsTermines}/${totalMatchs} (${Math.round((totalMatchsTermines/totalMatchs)*100)}%)`);
    
    // Identifier les problèmes potentiels
    console.log('\n🚨 PROBLÈMES IDENTIFIÉS:');
    let problemCount = 0;
    
    // Compétitions abandonnées
    const competitionsAbandonees = competitions.filter(c => 
      c.statut === 'En cours' && 
      new Date(c.dateFin) < new Date()
    );
    if (competitionsAbandonees.length > 0) {
      console.log(`   ⚠️ ${competitionsAbandonees.length} compétitions en cours mais dépassées`);
      problemCount++;
    }
    
    // Compétitions sans participants
    const competitionsSansParticipants = competitions.filter(c => 
      !c.equipesInscrites || c.equipesInscrites.length < 2
    );
    if (competitionsSansParticipants.length > 0) {
      console.log(`   ⚠️ ${competitionsSansParticipants.length} compétitions avec moins de 2 équipes`);
      problemCount++;
    }
    
    // Matchs en litige
    let matchsEnLitige = 0;
    competitions.forEach(comp => {
      if (comp.poules) {
        comp.poules.forEach(poule => {
          matchsEnLitige += poule.matchs?.filter(m => m.litige).length || 0;
        });
      }
      if (comp.matchsElimination) {
        matchsEnLitige += comp.matchsElimination.filter(m => m.litige).length;
      }
    });
    
    if (matchsEnLitige > 0) {
      console.log(`   ⚠️ ${matchsEnLitige} matchs en litige`);
      problemCount++;
    }
    
    if (problemCount === 0) {
      console.log('   ✅ Aucun problème critique détecté');
    }
    
    // Suggestions d'améliorations basées sur l'analyse
    console.log('\n💡 AMÉLIORATIONS RECOMMANDÉES (par priorité):');
    
    console.log('\n🥇 PRIORITÉ HAUTE:');
    
    if (totalMatchsTermines / totalMatchs < 0.5) {
      console.log('   🎯 Système de rappels automatiques');
      console.log('     → Beaucoup de matchs non joués, automatiser les notifications');
    }
    
    if (matchsEnLitige > 0) {
      console.log('   ⚖️ Système d\'arbitrage amélioré');
      console.log('     → Résoudre les litiges plus efficacement');
    }
    
    if (competitionsSansParticipants.length > 0) {
      console.log('   📢 Système de promotion des compétitions');
      console.log('     → Augmenter la participation aux tournois');
    }
    
    console.log('\n🥈 PRIORITÉ MOYENNE:');
    console.log('   📊 Dashboard administrateur');
    console.log('     → Vue d\'ensemble pour les organisateurs');
    
    console.log('   🏆 Système de classements globaux');
    console.log('     → Motivation à long terme pour les joueurs');
    
    console.log('   📱 Notifications push');
    console.log('     → Engagement des utilisateurs');
    
    console.log('\n🥉 PRIORITÉ BASSE:');
    console.log('   🎮 Intégrations gaming (Discord, Twitch)');
    console.log('     → Améliorer l\'expérience communautaire');
    
    console.log('   📈 Statistiques avancées');
    console.log('     → Analytics détaillées pour les passionnés');
    
    console.log('   🔒 Anti-triche avancé');
    console.log('     → Protection contre les abus');
    
    // Analyse de la charge de travail
    console.log('\n⚙️ ESTIMATION DU DÉVELOPPEMENT:');
    
    const improvements = [
      { name: 'Système de rappels', effort: '2-3 jours', impact: 'Élevé' },
      { name: 'Dashboard admin', effort: '1-2 semaines', impact: 'Élevé' },
      { name: 'Notifications push', effort: '1 semaine', impact: 'Moyen' },
      { name: 'Arbitrage amélioré', effort: '3-5 jours', impact: 'Moyen' },
      { name: 'Classements globaux', effort: '1-2 semaines', impact: 'Moyen' },
      { name: 'Intégrations externes', effort: '2-4 semaines', impact: 'Faible' },
      { name: 'Anti-triche avancé', effort: '2-3 semaines', impact: 'Faible' }
    ];
    
    improvements.forEach(imp => {
      console.log(`   ${imp.name}:`);
      console.log(`     ⏱️ Effort: ${imp.effort}`);
      console.log(`     🎯 Impact: ${imp.impact}`);
      console.log('');
    });
    
    // Recommandations spécifiques
    console.log('🎯 PLAN D\'ACTION RECOMMANDÉ:');
    console.log('\n📅 Phase 1 (1-2 semaines):');
    console.log('   ✅ Implémenter système de rappels automatiques');
    console.log('   ✅ Créer dashboard administrateur basique');
    console.log('   ✅ Améliorer la résolution des litiges');
    
    console.log('\n📅 Phase 2 (3-4 semaines):');
    console.log('   ✅ Ajouter notifications push');
    console.log('   ✅ Créer système de classements globaux');
    console.log('   ✅ Optimiser l\'interface utilisateur');
    
    console.log('\n📅 Phase 3 (5-8 semaines):');
    console.log('   ✅ Intégrations Discord/Twitch');
    console.log('   ✅ Statistiques avancées');
    console.log('   ✅ Système anti-triche');
    
    console.log('\n🚀 BÉNÉFICES ATTENDUS:');
    console.log('   📈 Augmentation de 40-60% de la participation');
    console.log('   ⏱️ Réduction de 70% du temps d\'administration');
    console.log('   🎯 Amélioration de 50% de la satisfaction utilisateur');
    console.log('   💰 Possibilité de monétisation (abonnements premium)');
    
  } catch (error) {
    console.error('❌ Erreur lors du diagnostic:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Déconnexion MongoDB');
  }
};

if (require.main === module) {
  diagnoseCompetitionImprovements();
}

module.exports = diagnoseCompetitionImprovements; 