require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const Competition = require('../models/Competition');

const addStatsToExistingMatches = async () => {
  try {
    console.log('🔄 Connexion à MongoDB...');
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/club-pro-commu');
    
    console.log('📊 AJOUT STATISTIQUES AUX MATCHS EXISTANTS\n');
    console.log('═══════════════════════════════════════════════════\n');
    
    // Récupérer la compétition
    const competition = await Competition.findById('68a591b5eb0106ae145fed19');
    
    if (!competition) {
      console.log('❌ Compétition non trouvée');
      return;
    }
    
    console.log(`🏆 COMPÉTITION: "${competition.nom}"`);
    console.log(`🏟️ Matchs d'élimination: ${competition.matchsElimination?.length || 0}\n`);
    
    const joueursPossibles = [
      'julesmartin14', 'alexisvincent15', 'nicolasdurand6', 'testpseu',
      'mathismartin21', 'pierremartin22', 'gabrielbertrand28', 'nicolasmorel17',
      'romainthomas8', 'sophieandré47', 'tomleblond48', 'maximegarcia46'
    ];
    
    // Ajouter des statistiques aux matchs d'élimination
    let matchsModifies = 0;
    
    competition.matchsElimination.forEach((match, index) => {
      if (match.statut === 'Terminé' && match.score1 !== null && match.score2 !== null) {
        console.log(`🎮 Match ${index + 1}: ${match.score1}-${match.score2}`);
        
        // Ajouter des buteurs basés sur le score
        const totalButs = match.score1 + match.score2;
        const buteurs = [];
        
        for (let i = 0; i < totalButs; i++) {
          const joueur = joueursPossibles[Math.floor(Math.random() * joueursPossibles.length)];
          buteurs.push({
            joueur: joueur,
            buts: 1
          });
        }
        
        // Ajouter quelques passeurs
        const nbPasseurs = Math.floor(Math.random() * 3) + 1; // 1-3 passeurs
        const passeurs = [];
        
        for (let i = 0; i < nbPasseurs; i++) {
          const joueur = joueursPossibles[Math.floor(Math.random() * joueursPossibles.length)];
          passeurs.push({
            joueur: joueur,
            passes: 1
          });
        }
        
        // Mettre à jour les statistiques
        if (!match.stats) {
          match.stats = {
            cartonsJaunes: [],
            cartonsRouges: [],
            buteurs: [],
            passeurs: []
          };
        }
        
        match.stats.buteurs = buteurs;
        match.stats.passeurs = passeurs;
        
        // Quelques cartons aléatoires
        if (Math.random() > 0.6) {
          const joueur = joueursPossibles[Math.floor(Math.random() * joueursPossibles.length)];
          match.stats.cartonsJaunes.push(joueur);
        }
        
        console.log(`   ✅ Ajouté: ${buteurs.length} buteurs, ${passeurs.length} passeurs`);
        matchsModifies++;
      }
    });
    
    // Sauvegarder la compétition
    await competition.save();
    
    console.log(`\n🎉 ${matchsModifies} matchs modifiés avec succès !`);
    
    // Maintenant, tester le recalcul des statistiques
    console.log('\n🔄 Test de recalcul des statistiques...');
    
    const axios = require('axios');
    const API_URL = 'http://localhost:3001/api';
    
    try {
      // Forcer le recalcul
      const response = await axios.post(`${API_URL}/competitions/${competition._id}/recalculer-statistiques`);
      const stats = response.data.statistiques;
      
      console.log('✅ Statistiques recalculées:');
      console.log(`   🥅 Meilleur buteur: ${stats.meilleurButeur?.joueur || 'Aucun'} (${stats.meilleurButeur?.buts || 0} buts)`);
      console.log(`   🎯 Meilleur passeur: ${stats.meilleurPasseur?.joueur || 'Aucun'} (${stats.meilleurPasseur?.passes || 0} passes)`);
      console.log(`   🏆 Meilleur joueur: ${stats.meilleurJoueur?.joueur || 'Aucun'}`);
      console.log(`   ⚽ Total buts: ${stats.totalButs || 0}`);
      console.log(`   🎮 Total matchs: ${stats.totalMatchs || 0}`);
      
    } catch (apiError) {
      console.log('❌ Erreur API:', apiError.response?.data || apiError.message);
    }
    
    console.log('\n🚀 PRÊT POUR LE TEST !');
    console.log('   1. Allez sur http://localhost:3002');
    console.log('   2. Ouvrez la compétition "coupe top"');
    console.log('   3. Cliquez sur l\'onglet "Statistiques"');
    console.log('   4. Les statistiques doivent maintenant s\'afficher !');
    
  } catch (error) {
    console.error('❌ Erreur lors de l\'ajout des stats:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Déconnexion MongoDB');
  }
};

if (require.main === module) {
  addStatsToExistingMatches();
}

module.exports = addStatsToExistingMatches; 