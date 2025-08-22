require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const Competition = require('../models/Competition');

const forceUpdateStats = async () => {
  try {
    console.log('🔄 Connexion à MongoDB...');
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/club-pro-commu');
    
    console.log('💪 FORCE MISE À JOUR STATISTIQUES\n');
    console.log('═══════════════════════════════════════════════════\n');
    
    // Récupérer la compétition
    const competition = await Competition.findById('68a591b5eb0106ae145fed19');
    
    if (!competition) {
      console.log('❌ Compétition non trouvée');
      return;
    }
    
    console.log(`🏆 COMPÉTITION: "${competition.nom}"`);
    
    // Calculer manuellement les statistiques
    const buteursStats = {};
    const passeursStats = {};
    let totalButs = 0;
    let totalMatchs = 0;

    // Parcourir tous les matchs
    const allMatches = [
      ...(competition.matchs || []),
      ...(competition.matchsElimination || [])
    ];
    
    allMatches.forEach(match => {
      if (match.statut === 'Terminé' && match.score1 !== null && match.score2 !== null) {
        totalMatchs++;
        totalButs += (match.score1 + match.score2);

        // Compter les buteurs
        const buteurs = match.buteurs || match.stats?.buteurs || [];
        if (Array.isArray(buteurs)) {
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
          });
        }

        // Compter les passeurs
        const passeurs = match.passeurs || match.stats?.passeurs || [];
        if (Array.isArray(passeurs)) {
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
          });
        }
      }
    });

    // Trouver les meilleurs
    let meilleurButeur = null;
    let maxButs = 0;
    for (const [joueur, data] of Object.entries(buteursStats)) {
      if (data.buts > maxButs) {
        maxButs = data.buts;
        meilleurButeur = {
          joueur: joueur,
          buts: data.buts,
          club: data.club
        };
      }
    }

    let meilleurPasseur = null;
    let maxPasses = 0;
    for (const [joueur, data] of Object.entries(passeursStats)) {
      if (data.passes > maxPasses) {
        maxPasses = data.passes;
        meilleurPasseur = {
          joueur: joueur,
          passes: data.passes,
          club: data.club
        };
      }
    }

    // Créer l'objet statistiques
    const nouveauxStats = {
      meilleurButeur: meilleurButeur,
      meilleurPasseur: meilleurPasseur,
      meilleurJoueur: meilleurButeur, // Pour simplifier, on met le meilleur buteur
      totalMatchs: totalMatchs,
      totalButs: totalButs
    };

    // Mettre à jour directement en base
    competition.statistiques = nouveauxStats;
    await competition.save();

    console.log('✅ Statistiques mises à jour directement en base:');
    console.log(`   🥅 Meilleur buteur: ${nouveauxStats.meilleurButeur?.joueur || 'Aucun'} (${nouveauxStats.meilleurButeur?.buts || 0} buts)`);
    console.log(`   🎯 Meilleur passeur: ${nouveauxStats.meilleurPasseur?.joueur || 'Aucun'} (${nouveauxStats.meilleurPasseur?.passes || 0} passes)`);
    console.log(`   🏆 Meilleur joueur: ${nouveauxStats.meilleurJoueur?.joueur || 'Aucun'}`);
    console.log(`   ⚽ Total buts: ${nouveauxStats.totalButs}`);
    console.log(`   🎮 Total matchs: ${nouveauxStats.totalMatchs}`);
    
    // Vérifier que ça marche via l'API
    console.log('\n🧪 Test via API...');
    
    const axios = require('axios');
    const API_URL = 'http://localhost:3001/api';
    
    try {
      const response = await axios.get(`${API_URL}/competitions/${competition._id}/statistiques`);
      const statsAPI = response.data;
      
      console.log('✅ Statistiques récupérées via API:');
      console.log(`   🥅 Meilleur buteur: ${statsAPI.meilleurButeur?.joueur || 'Aucun'} (${statsAPI.meilleurButeur?.buts || 0} buts)`);
      console.log(`   🎯 Meilleur passeur: ${statsAPI.meilleurPasseur?.joueur || 'Aucun'} (${statsAPI.meilleurPasseur?.passes || 0} passes)`);
      console.log(`   🏆 Meilleur joueur: ${statsAPI.meilleurJoueur?.joueur || 'Aucun'}`);
      console.log(`   ⚽ Total buts: ${statsAPI.totalButs || 0}`);
      console.log(`   🎮 Total matchs: ${statsAPI.totalMatchs || 0}`);
      
    } catch (apiError) {
      console.log('❌ Erreur API:', apiError.response?.data || apiError.message);
    }
    
    console.log('\n🎉 TERMINÉ !');
    console.log('\n🚀 MAINTENANT TESTEZ:');
    console.log('   1. Allez sur http://localhost:3002');
    console.log('   2. Ouvrez la compétition "coupe top"');
    console.log('   3. Cliquez sur l\'onglet "Statistiques"');
    console.log('   4. Vous devriez voir les statistiques s\'afficher !');
    
  } catch (error) {
    console.error('❌ Erreur lors de la mise à jour forcée:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Déconnexion MongoDB');
  }
};

if (require.main === module) {
  forceUpdateStats();
}

module.exports = forceUpdateStats; 