require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const Competition = require('../models/Competition');
const Club = require('../models/Club');

const simulateGroupStage = async () => {
  try {
    console.log('🔄 Connexion à MongoDB...');
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/club-pro-commu');
    
    console.log('⚽ SIMULATION DES PHASES DE GROUPES\n');
    console.log('═══════════════════════════════════════════════════════════════════════════\n');
    
    // Récupérer la compétition Champions League Simulator
    const competition = await Competition.findOne({ nom: 'Champions League Simulator' })
      .populate('equipesInscrites.clubId', 'nom');
    
    if (!competition) {
      console.log('❌ Compétition "Champions League Simulator" non trouvée');
      return;
    }
    
    console.log(`🏆 COMPÉTITION: "${competition.nom}"`);
    console.log(`👥 Équipes: ${competition.equipesInscrites.length}`);
    console.log(`🏟️ Poules: ${competition.poules.length}`);
    
    // Fonction pour générer un score réaliste
    const generateScore = () => {
      const scenarios = [
        [0, 0], [0, 1], [1, 0], [1, 1], [1, 2], [2, 1],
        [2, 0], [0, 2], [2, 2], [3, 1], [1, 3], [3, 0],
        [0, 3], [2, 3], [3, 2], [4, 1], [1, 4], [4, 0]
      ];
      return scenarios[Math.floor(Math.random() * scenarios.length)];
    };
    
    // Fonction pour calculer les points selon les règles
    const calculatePoints = (score1, score2) => {
      if (score1 > score2) return { equipe1: 3, equipe2: 0 }; // Victoire
      if (score1 < score2) return { equipe1: 0, equipe2: 3 }; // Défaite
      return { equipe1: 1, equipe2: 1 }; // Match nul
    };
    
    // Simuler tous les matchs de chaque poule
    for (let pouleIndex = 0; pouleIndex < competition.poules.length; pouleIndex++) {
      const poule = competition.poules[pouleIndex];
      console.log(`\n📊 SIMULATION ${poule.nom.toUpperCase()}:`);
      console.log('━'.repeat(50));
      
      // Simuler tous les matchs de la poule
      for (let matchIndex = 0; matchIndex < poule.matchs.length; matchIndex++) {
        const match = poule.matchs[matchIndex];
        
        // Générer le score
        const [score1, score2] = generateScore();
        match.score1 = score1;
        match.score2 = score2;
        match.statut = 'Terminé';
        match.valideParEquipe1 = true;
        match.valideParEquipe2 = true;
        
        // Ajouter quelques stats basiques
        match.stats = {
          buteurs: [],
          passeurs: [],
          cartonsJaunes: [],
          cartonsRouges: []
        };
        
        // Ajouter des buteurs selon le score
        const totalButs = score1 + score2;
        const joueurs = ['player1', 'player2', 'player3', 'player4', 'player5'];
        
        for (let i = 0; i < score1; i++) {
          match.stats.buteurs.push({
            joueur: joueurs[Math.floor(Math.random() * joueurs.length)],
            buts: 1
          });
        }
        for (let i = 0; i < score2; i++) {
          match.stats.buteurs.push({
            joueur: joueurs[Math.floor(Math.random() * joueurs.length)],
            buts: 1
          });
        }
        
        // Récupérer les noms des clubs
        const club1 = await Club.findById(match.equipe1);
        const club2 = await Club.findById(match.equipe2);
        
        console.log(`   Match ${matchIndex + 1}: ${club1.nom} ${score1}-${score2} ${club2.nom}`);
      }
    }
    
    // Calculer les classements de chaque poule
    console.log('\n📈 CALCUL DES CLASSEMENTS:');
    console.log('═'.repeat(60));
    
    for (let pouleIndex = 0; pouleIndex < competition.poules.length; pouleIndex++) {
      const poule = competition.poules[pouleIndex];
      console.log(`\n🏆 CLASSEMENT ${poule.nom.toUpperCase()}:`);
      
      // Initialiser les statistiques pour chaque équipe
      const classement = {};
      for (const equipeId of poule.equipes) {
        const club = await Club.findById(equipeId);
        classement[equipeId] = {
          nom: club.nom,
          points: 0,
          joues: 0,
          victoires: 0,
          nuls: 0,
          defaites: 0,
          butsPour: 0,
          butsContre: 0,
          diff: 0
        };
      }
      
      // Parcourir tous les matchs pour calculer les stats
      for (const match of poule.matchs) {
        if (match.statut === 'Terminé') {
          const points = calculatePoints(match.score1, match.score2);
          
          // Équipe 1
          const stats1 = classement[match.equipe1];
          stats1.points += points.equipe1;
          stats1.joues++;
          stats1.butsPour += match.score1;
          stats1.butsContre += match.score2;
          stats1.diff = stats1.butsPour - stats1.butsContre;
          
          if (match.score1 > match.score2) stats1.victoires++;
          else if (match.score1 === match.score2) stats1.nuls++;
          else stats1.defaites++;
          
          // Équipe 2
          const stats2 = classement[match.equipe2];
          stats2.points += points.equipe2;
          stats2.joues++;
          stats2.butsPour += match.score2;
          stats2.butsContre += match.score1;
          stats2.diff = stats2.butsPour - stats2.butsContre;
          
          if (match.score2 > match.score1) stats2.victoires++;
          else if (match.score1 === match.score2) stats2.nuls++;
          else stats2.defaites++;
        }
      }
      
      // Trier le classement (points, puis différence de buts, puis buts marqués)
      const classementTrie = Object.entries(classement)
        .sort((a, b) => {
          const [, statsA] = a;
          const [, statsB] = b;
          
          // D'abord par points
          if (statsB.points !== statsA.points) {
            return statsB.points - statsA.points;
          }
          // Puis par différence de buts
          if (statsB.diff !== statsA.diff) {
            return statsB.diff - statsA.diff;
          }
          // Puis par buts marqués
          return statsB.butsPour - statsA.butsPour;
        });
      
      // Afficher le classement
      console.log('┌─────┬─────────────────────┬─────┬─────┬─────┬─────┬─────┬─────┬─────┐');
      console.log('│ Pos │ Équipe              │ Pts │ J   │ V   │ N   │ D   │ BP  │ Diff│');
      console.log('├─────┼─────────────────────┼─────┼─────┼─────┼─────┼─────┼─────┼─────┤');
      
      classementTrie.forEach(([equipeId, stats], index) => {
        const pos = (index + 1).toString().padStart(3);
        const nom = stats.nom.padEnd(19);
        const pts = stats.points.toString().padStart(3);
        const joues = stats.joues.toString().padStart(3);
        const victoires = stats.victoires.toString().padStart(3);
        const nuls = stats.nuls.toString().padStart(3);
        const defaites = stats.defaites.toString().padStart(3);
        const butsPour = stats.butsPour.toString().padStart(3);
        const diff = (stats.diff >= 0 ? '+' + stats.diff : stats.diff.toString()).padStart(4);
        
        const qualifier = index < 2 ? '🟢' : '🔴'; // Top 2 qualifiés
        console.log(`│ ${pos} │ ${nom} │ ${pts} │ ${joues} │ ${victoires} │ ${nuls} │ ${defaites} │ ${butsPour} │ ${diff}│ ${qualifier}`);
      });
      
      console.log('└─────┴─────────────────────┴─────┴─────┴─────┴─────┴─────┴─────┴─────┘');
      
      // Marquer les équipes qualifiées (top 2)
      const qualifiees = classementTrie.slice(0, 2);
      console.log('\n🟢 QUALIFIÉS POUR LES QUARTS DE FINALE:');
      qualifiees.forEach(([equipeId, stats], index) => {
        console.log(`   ${index + 1}. ${stats.nom} (${stats.points} pts, ${stats.diff >= 0 ? '+' : ''}${stats.diff})`);
        
        // Mettre à jour le statut dans la compétition
        const equipe = competition.equipesInscrites.find(e => 
          e.clubId._id.toString() === equipeId.toString());
        if (equipe) {
          equipe.statut = 'Confirmé'; // Qualifié pour la phase suivante
          equipe.points = stats.points;
          equipe.butsPour = stats.butsPour;
          equipe.butsContre = stats.butsContre;
          equipe.differenceButs = stats.diff;
          equipe.matchsJoues = stats.joues;
        }
      });
      
      // Marquer les équipes éliminées
      const eliminees = classementTrie.slice(2);
      console.log('\n🔴 ÉLIMINÉS:');
      eliminees.forEach(([equipeId, stats], index) => {
        console.log(`   ${index + 3}. ${stats.nom} (${stats.points} pts, ${stats.diff >= 0 ? '+' : ''}${stats.diff})`);
        
        const equipe = competition.equipesInscrites.find(e => 
          e.clubId._id.toString() === equipeId.toString());
        if (equipe) {
          equipe.statut = 'Eliminé';
          equipe.points = stats.points;
          equipe.butsPour = stats.butsPour;
          equipe.butsContre = stats.butsContre;
          equipe.differenceButs = stats.diff;
          equipe.matchsJoues = stats.joues;
        }
      });
    }
    
    // Sauvegarder la compétition
    await competition.save();
    
    console.log('\n✅ PHASES DE GROUPES TERMINÉES !');
    console.log('\n📊 RÉSUMÉ:');
    console.log(`   ⚽ Total matchs joués: ${competition.poules.reduce((acc, p) => acc + p.matchs.length, 0)}`);
    console.log(`   🟢 Équipes qualifiées: 4`);
    console.log(`   🔴 Équipes éliminées: 4`);
    
    // Lister les équipes qualifiées
    const qualifiees = competition.equipesInscrites.filter(e => e.statut === 'Confirmé');
    console.log('\n🏆 ÉQUIPES QUALIFIÉES POUR LES QUARTS:');
    qualifiees.forEach((equipe, index) => {
      console.log(`   ${index + 1}. ${equipe.clubId.nom} (${equipe.points} pts)`);
    });
    
    console.log('\n🎯 PROCHAINE ÉTAPE:');
    console.log('   Générer les quarts de finale avec ces 4 équipes qualifiées');
    
    return competition._id;
    
  } catch (error) {
    console.error('❌ Erreur lors de la simulation:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Déconnexion MongoDB');
  }
};

if (require.main === module) {
  simulateGroupStage();
}

module.exports = simulateGroupStage; 