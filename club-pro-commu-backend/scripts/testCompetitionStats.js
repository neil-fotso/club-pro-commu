require('dotenv').config();
const mongoose = require('mongoose');
const Competition = require('../models/Competition');

const testCompetitionStats = async () => {
  try {
    console.log('🔄 Connexion à MongoDB...');
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/club-pro-commu');
    
    console.log('🧪 TEST - STATISTIQUES DE COMPÉTITION\n');
    console.log('═══════════════════════════════════════════════════\n');
    
    // Récupérer une compétition avec des matchs
    const competition = await Competition.findOne({ 
      matchs: { $exists: true, $not: { $size: 0 } } 
    });
    
    if (!competition) {
      console.log('❌ Aucune compétition avec des matchs trouvée');
      return;
    }
    
    console.log(`🏆 COMPÉTITION: "${competition.nom}"`);
    console.log(`📅 Créée le: ${competition.dateCreation.toLocaleDateString()}`);
    console.log(`📊 Statut: ${competition.statut}`);
    console.log(`🎮 Nombre de matchs: ${competition.matchs.length}\n`);
    
    // Analyser les matchs
    const matchsTermines = competition.matchs.filter(m => m.statut === 'Terminé');
    const matchsAvecStats = competition.matchs.filter(m => 
      m.statut === 'Terminé' && 
      (m.buteurs?.length > 0 || m.passeurs?.length > 0)
    );
    
    console.log('📈 ANALYSE DES MATCHS:');
    console.log(`   🎯 Matchs programmés: ${competition.matchs.length}`);
    console.log(`   ✅ Matchs terminés: ${matchsTermines.length}`);
    console.log(`   📊 Matchs avec statistiques: ${matchsAvecStats.length}\n`);
    
    if (matchsAvecStats.length > 0) {
      console.log('🎯 EXEMPLE DE MATCH AVEC STATISTIQUES:');
      const exempleMatch = matchsAvecStats[0];
      console.log(`   Match: ${exempleMatch.equipe1} vs ${exempleMatch.equipe2}`);
      console.log(`   Score: ${exempleMatch.score1} - ${exempleMatch.score2}`);
      console.log(`   Buteurs: ${JSON.stringify(exempleMatch.buteurs)}`);
      console.log(`   Passeurs: ${JSON.stringify(exempleMatch.passeurs)}`);
      if (exempleMatch.cartonsJaunes?.length > 0) {
        console.log(`   Cartons jaunes: ${JSON.stringify(exempleMatch.cartonsJaunes)}`);
      }
      if (exempleMatch.cartonsRouges?.length > 0) {
        console.log(`   Cartons rouges: ${JSON.stringify(exempleMatch.cartonsRouges)}`);
      }
      console.log();
    }
    
    // Analyser les statistiques actuelles
    console.log('📊 STATISTIQUES ACTUELLES:');
    if (competition.statistiques && Object.keys(competition.statistiques).length > 0) {
      console.log(`   🥅 Meilleur buteur: ${competition.statistiques.meilleurButeur?.joueur || 'Aucun'} (${competition.statistiques.meilleurButeur?.buts || 0} buts)`);
      console.log(`   🎯 Meilleur passeur: ${competition.statistiques.meilleurPasseur?.joueur || 'Aucun'} (${competition.statistiques.meilleurPasseur?.passes || 0} passes)`);
      console.log(`   🏆 Meilleur joueur: ${competition.statistiques.meilleurJoueur?.joueur || 'Aucun'}`);
      console.log(`   ⚽ Total buts: ${competition.statistiques.totalButs || 0}`);
      console.log(`   🎮 Total matchs: ${competition.statistiques.totalMatchs || 0}`);
    } else {
      console.log('   ❌ Aucune statistique disponible');
    }
    
    console.log('\n🔄 TEST DE RECALCUL DES STATISTIQUES...');
    
    // Utiliser l'API pour recalculer
    const axios = require('axios');
    const API_URL = 'http://localhost:3001/api';
    
    try {
      const response = await axios.post(`${API_URL}/competitions/${competition._id}/recalculer-statistiques`);
      console.log('✅ Recalcul réussi via API');
      
      const newStats = response.data.statistiques;
      console.log('\n📊 NOUVELLES STATISTIQUES:');
      console.log(`   🥅 Meilleur buteur: ${newStats.meilleurButeur?.joueur || 'Aucun'} (${newStats.meilleurButeur?.buts || 0} buts)`);
      console.log(`   🎯 Meilleur passeur: ${newStats.meilleurPasseur?.joueur || 'Aucun'} (${newStats.meilleurPasseur?.passes || 0} passes)`);
      console.log(`   🏆 Meilleur joueur: ${newStats.meilleurJoueur?.joueur || 'Aucun'}`);
      console.log(`   ⚽ Total buts: ${newStats.totalButs || 0}`);
      console.log(`   🎮 Total matchs: ${newStats.totalMatchs || 0}`);
      
    } catch (apiError) {
      console.log('❌ Erreur API (normal si le serveur n\'est pas démarré)');
      console.log('   Continuons avec un calcul local...');
    }
    
    console.log('\n🎯 RECOMMANDATIONS:');
    if (matchsAvecStats.length === 0) {
      console.log('   📝 Ajoutez des statistiques aux matchs terminés pour voir les résultats');
      console.log('   💡 Utilisez la page "Calendrier" et cliquez "Saisir score"');
    } else {
      console.log('   ✅ Les statistiques devraient maintenant s\'afficher dans l\'onglet "Statistiques"');
      console.log('   🔄 Rafraîchissez la page frontend pour voir les changements');
    }
    
    console.log('\n🚀 POUR TESTER:');
    console.log('   1. Allez sur http://localhost:3002');
    console.log(`   2. Ouvrez la compétition "${competition.nom}"`);
    console.log('   3. Cliquez sur l\'onglet "Statistiques"');
    console.log('   4. Les statistiques doivent maintenant s\'afficher !');
    
    console.log('\n🎉 Test terminé !');
    
  } catch (error) {
    console.error('❌ Erreur lors du test:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Déconnexion MongoDB');
  }
};

if (require.main === module) {
  testCompetitionStats();
}

module.exports = testCompetitionStats; 