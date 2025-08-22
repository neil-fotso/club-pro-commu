require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const Competition = require('../models/Competition');

const generateMatchsAndStats = async () => {
  try {
    console.log('🔄 Connexion à MongoDB...');
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/club-pro-commu');
    
    console.log('🎮 GÉNÉRATION DE MATCHS ET STATISTIQUES\n');
    console.log('═══════════════════════════════════════════════════\n');
    
    // Récupérer la compétition avec le plus d'équipes
    const competition = await Competition.findOne({ 
      equipesInscrites: { $exists: true, $not: { $size: 0 } } 
    }).sort({ 'equipesInscrites': -1 });
    
    if (!competition || !competition.equipesInscrites || competition.equipesInscrites.length < 2) {
      console.log('❌ Pas assez d\'équipes inscrites pour générer des matchs');
      return;
    }
    
    console.log(`🏆 COMPÉTITION: "${competition.nom}"`);
    console.log(`👥 Équipes inscrites: ${competition.equipesInscrites.length}`);
    console.log(`🏟️ Matchs existants: ${competition.matchs?.length || 0}\n`);
    
    // Si pas de matchs, en créer quelques-uns
    if (!competition.matchs || competition.matchs.length === 0) {
      console.log('🔄 Génération de matchs de test...');
      
      const equipes = competition.equipesInscrites;
      const nouveauxMatchs = [];
      
      // Créer 4 matchs avec différentes équipes
      for (let i = 0; i < Math.min(4, Math.floor(equipes.length / 2)); i++) {
        const equipe1 = equipes[i * 2];
        const equipe2 = equipes[i * 2 + 1];
        
        const match = {
          equipe1: equipe1.clubId,
          equipe2: equipe2.clubId,
          dateMatch: new Date(Date.now() + i * 24 * 60 * 60 * 1000), // Étalé sur plusieurs jours
          statut: 'Programmé',
          score1: null,
          score2: null,
          buteurs: [],
          passeurs: [],
          cartonsJaunes: [],
          cartonsRouges: [],
          valideParEquipe1: false,
          valideParEquipe2: false
        };
        
        nouveauxMatchs.push(match);
      }
      
      competition.matchs = nouveauxMatchs;
      await competition.save();
      
      console.log(`✅ ${nouveauxMatchs.length} matchs créés\n`);
    }
    
    // Maintenant, simuler quelques résultats
    console.log('🎯 Simulation de résultats...');
    
    const joueursPossibles = [
      'julesmartin14', 'alexisvincent15', 'nicolasdurand6', 'testpseu',
      'mathismartin21', 'pierremartin22', 'gabrielbertrand28', 'nicolasmorel17',
      'romainthomas8', 'sophieandré47', 'tomleblond48', 'maximegarcia46'
    ];
    
    // Simuler les résultats de quelques matchs
    for (let i = 0; i < Math.min(3, competition.matchs.length); i++) {
      const match = competition.matchs[i];
      
      if (match.statut === 'Programmé') {
        // Générer un score aléatoire
        const score1 = Math.floor(Math.random() * 4); // 0-3 buts
        const score2 = Math.floor(Math.random() * 4);
        
        match.score1 = score1;
        match.score2 = score2;
        match.statut = 'Terminé';
        match.valideParEquipe1 = true;
        match.valideParEquipe2 = true;
        
        // Ajouter des buteurs
        const totalButs = score1 + score2;
        const buteurs = [];
        
        for (let b = 0; b < totalButs; b++) {
          const joueur = joueursPossibles[Math.floor(Math.random() * joueursPossibles.length)];
          buteurs.push({
            joueur: joueur,
            buts: 1
          });
        }
        match.buteurs = buteurs;
        
        // Ajouter quelques passeurs
        const passeurs = [];
        const nbPasseurs = Math.floor(Math.random() * 3) + 1; // 1-3 passeurs
        
        for (let p = 0; p < nbPasseurs; p++) {
          const joueur = joueursPossibles[Math.floor(Math.random() * joueursPossibles.length)];
          passeurs.push({
            joueur: joueur,
            passes: 1
          });
        }
        match.passeurs = passeurs;
        
        // Quelques cartons jaunes aléatoires
        if (Math.random() > 0.7) {
          const joueur = joueursPossibles[Math.floor(Math.random() * joueursPossibles.length)];
          match.cartonsJaunes.push(joueur);
        }
        
        console.log(`   ✅ Match ${i + 1}: Score ${score1}-${score2}, ${buteurs.length} buteurs, ${passeurs.length} passeurs`);
      }
    }
    
    await competition.save();
    
    console.log('\n🔄 Calcul des statistiques...');
    
    // Utiliser l'API pour recalculer les statistiques
    const axios = require('axios');
    const API_URL = 'http://localhost:3001/api';
    
    try {
      const response = await axios.post(`${API_URL}/competitions/${competition._id}/recalculer-statistiques`);
      const stats = response.data.statistiques;
      
      console.log('✅ Statistiques calculées via API:');
      console.log(`   🥅 Meilleur buteur: ${stats.meilleurButeur?.joueur || 'Aucun'} (${stats.meilleurButeur?.buts || 0} buts)`);
      console.log(`   🎯 Meilleur passeur: ${stats.meilleurPasseur?.joueur || 'Aucun'} (${stats.meilleurPasseur?.passes || 0} passes)`);
      console.log(`   🏆 Meilleur joueur: ${stats.meilleurJoueur?.joueur || 'Aucun'}`);
      console.log(`   ⚽ Total buts: ${stats.totalButs || 0}`);
      console.log(`   🎮 Total matchs: ${stats.totalMatchs || 0}`);
      
    } catch (apiError) {
      console.log('❌ Erreur API (serveur pas démarré), calcul local...');
      
      // Calcul local simple
      const matchsTermines = competition.matchs.filter(m => m.statut === 'Terminé');
      const totalButs = matchsTermines.reduce((acc, m) => acc + (m.score1 + m.score2), 0);
      
      // Compter les buteurs
      const buteursCount = {};
      matchsTermines.forEach(match => {
        match.buteurs.forEach(buteur => {
          buteursCount[buteur.joueur] = (buteursCount[buteur.joueur] || 0) + buteur.buts;
        });
      });
      
      const meilleurButeur = Object.entries(buteursCount).reduce((max, [joueur, buts]) => 
        buts > (max[1] || 0) ? [joueur, buts] : max, ['', 0]);
      
      // Compter les passeurs
      const passeursCount = {};
      matchsTermines.forEach(match => {
        match.passeurs.forEach(passeur => {
          passeursCount[passeur.joueur] = (passeursCount[passeur.joueur] || 0) + passeur.passes;
        });
      });
      
      const meilleurPasseur = Object.entries(passeursCount).reduce((max, [joueur, passes]) => 
        passes > (max[1] || 0) ? [joueur, passes] : max, ['', 0]);
      
      console.log('📊 Statistiques calculées localement:');
      console.log(`   🥅 Meilleur buteur: ${meilleurButeur[0] || 'Aucun'} (${meilleurButeur[1] || 0} buts)`);
      console.log(`   🎯 Meilleur passeur: ${meilleurPasseur[0] || 'Aucun'} (${meilleurPasseur[1] || 0} passes)`);
      console.log(`   ⚽ Total buts: ${totalButs}`);
      console.log(`   🎮 Total matchs: ${matchsTermines.length}`);
    }
    
    console.log('\n🎉 GÉNÉRATION TERMINÉE !');
    console.log('\n🚀 POUR TESTER:');
    console.log('   1. Allez sur http://localhost:3002');
    console.log(`   2. Ouvrez la compétition "${competition.nom}"`);
    console.log('   3. Cliquez sur l\'onglet "Statistiques"');
    console.log('   4. Vous devriez voir les statistiques !');
    console.log('\n💡 Vous pouvez aussi :');
    console.log('   - Aller sur "Calendrier" pour voir les matchs');
    console.log('   - Cliquer "Saisir score" pour ajouter plus de statistiques');
    
  } catch (error) {
    console.error('❌ Erreur lors de la génération:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Déconnexion MongoDB');
  }
};

if (require.main === module) {
  generateMatchsAndStats();
}

module.exports = generateMatchsAndStats; 