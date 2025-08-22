require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const Competition = require('../models/Competition');

const debugStats = async () => {
  try {
    console.log('🔄 Connexion à MongoDB...');
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/club-pro-commu');
    
    console.log('🐛 DEBUG CALCUL STATISTIQUES\n');
    console.log('═══════════════════════════════════════════════════\n');
    
    // Récupérer la compétition
    const competition = await Competition.findById('68a591b5eb0106ae145fed19');
    
    if (!competition) {
      console.log('❌ Compétition non trouvée');
      return;
    }
    
    console.log(`🏆 COMPÉTITION: "${competition.nom}"`);
    console.log(`🏟️ Matchs normaux: ${competition.matchs?.length || 0}`);
    console.log(`🏟️ Matchs d'élimination: ${competition.matchsElimination?.length || 0}\n`);
    
    // Simuler le calcul des statistiques
    const stats = {
      meilleurButeur: null,
      meilleurPasseur: null,
      meilleurJoueur: null,
      totalMatchs: 0,
      totalButs: 0
    };

    const buteursStats = {};
    const passeursStats = {};
    let totalButs = 0;
    let totalMatchs = 0;

    // Parcourir tous les matchs (normaux + élimination)
    const allMatches = [
      ...(competition.matchs || []),
      ...(competition.matchsElimination || [])
    ];
    
    console.log(`📊 ANALYSE DE ${allMatches.length} MATCHS:\n`);
    
    allMatches.forEach((match, index) => {
      console.log(`🎮 MATCH ${index + 1}:`);
      console.log(`   Statut: ${match.statut}`);
      console.log(`   Score: ${match.score1} - ${match.score2}`);
      
      if (match.statut === 'Terminé' && match.score1 !== null && match.score2 !== null) {
        totalMatchs++;
        totalButs += (match.score1 + match.score2);
        
        console.log(`   ✅ Match terminé compté`);
        
        // Vérifier les buteurs
        const buteurs = match.buteurs || match.stats?.buteurs || [];
        console.log(`   🥅 Buteurs trouvés: ${buteurs.length}`);
        console.log(`   🥅 Données buteurs: ${JSON.stringify(buteurs)}`);
        
        if (Array.isArray(buteurs) && buteurs.length > 0) {
          buteurs.forEach(buteur => {
            const joueur = buteur.joueur;
            const buts = buteur.buts || 1;
            
            if (!buteursStats[joueur]) {
              buteursStats[joueur] = {
                joueur: joueur,
                buts: 0,
                club: null
              };
            }
            buteursStats[joueur].buts += buts;
            
            console.log(`      → ${joueur}: +${buts} buts (total: ${buteursStats[joueur].buts})`);
          });
        }
        
        // Vérifier les passeurs
        const passeurs = match.passeurs || match.stats?.passeurs || [];
        console.log(`   🎯 Passeurs trouvés: ${passeurs.length}`);
        console.log(`   🎯 Données passeurs: ${JSON.stringify(passeurs)}`);
        
        if (Array.isArray(passeurs) && passeurs.length > 0) {
          passeurs.forEach(passeur => {
            const joueur = passeur.joueur;
            const passes = passeur.passes || 1;
            
            if (!passeursStats[joueur]) {
              passeursStats[joueur] = {
                joueur: joueur,
                passes: 0,
                club: null
              };
            }
            passeursStats[joueur].passes += passes;
            
            console.log(`      → ${joueur}: +${passes} passes (total: ${passeursStats[joueur].passes})`);
          });
        }
      } else {
        console.log(`   ❌ Match ignoré (statut: ${match.statut}, score: ${match.score1}-${match.score2})`);
      }
      
      console.log('   ─────────────────────────────────────────');
    });
    
    // Calculer les meilleurs
    console.log('\n📈 RÉSULTATS DU CALCUL:');
    console.log(`   📊 Total matchs terminés: ${totalMatchs}`);
    console.log(`   ⚽ Total buts: ${totalButs}`);
    console.log(`   👥 Joueurs avec des buts: ${Object.keys(buteursStats).length}`);
    console.log(`   👥 Joueurs avec des passes: ${Object.keys(passeursStats).length}`);
    
    // Trouver le meilleur buteur
    let maxButs = 0;
    for (const [joueur, data] of Object.entries(buteursStats)) {
      console.log(`   🥅 ${joueur}: ${data.buts} buts`);
      if (data.buts > maxButs) {
        maxButs = data.buts;
        stats.meilleurButeur = {
          joueur: joueur,
          buts: data.buts,
          club: data.club
        };
      }
    }
    
    // Trouver le meilleur passeur
    let maxPasses = 0;
    for (const [joueur, data] of Object.entries(passeursStats)) {
      console.log(`   🎯 ${joueur}: ${data.passes} passes`);
      if (data.passes > maxPasses) {
        maxPasses = data.passes;
        stats.meilleurPasseur = {
          joueur: joueur,
          passes: data.passes,
          club: data.club
        };
      }
    }
    
    stats.totalMatchs = totalMatchs;
    stats.totalButs = totalButs;
    
    console.log('\n🎉 STATISTIQUES FINALES:');
    console.log(`   🥅 Meilleur buteur: ${stats.meilleurButeur?.joueur || 'Aucun'} (${stats.meilleurButeur?.buts || 0} buts)`);
    console.log(`   🎯 Meilleur passeur: ${stats.meilleurPasseur?.joueur || 'Aucun'} (${stats.meilleurPasseur?.passes || 0} passes)`);
    console.log(`   ⚽ Total buts: ${stats.totalButs}`);
    console.log(`   🎮 Total matchs: ${stats.totalMatchs}`);
    
  } catch (error) {
    console.error('❌ Erreur lors du debug:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Déconnexion MongoDB');
  }
};

if (require.main === module) {
  debugStats();
}

module.exports = debugStats; 