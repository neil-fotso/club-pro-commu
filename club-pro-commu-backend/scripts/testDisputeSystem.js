require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const Club = require('../models/Club');
const Competition = require('../models/Competition');
const compRouter = require('../routes/competitions');

const testDisputeSystem = async () => {
  try {
    console.log('⚖️ Démarrage des tests du système de litige...');
    console.log('🔌 Connexion à MongoDB...');
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/club-pro-commu');
    console.log('✅ Connexion établie.');

    // 1. Trouver l'admin de test
    let admin = await User.findOne({ email: 'admin.dashboard@clubprocommu.fr' });
    if (!admin) {
      admin = await User.findOne({ isAdmin: true });
    }
    if (!admin) {
      throw new Error('Aucun administrateur trouvé dans la base de données. Exécutez createTestCompetition.js d\'abord !');
    }

    // 2. Trouver la compétition de test
    let competition = await Competition.findOne({ nom: 'la street club pro compétition' });
    if (!competition) {
      console.log('⚠️ Compétition de test introuvable. Exécution du script de création...');
      // Au lieu de l'importer pour l'exécuter, on va simplement lever l'erreur et demander d'exécuter createTestCompetition.js
      throw new Error('Compétition de test introuvable. Veuillez exécuter "node scripts/createTestCompetition.js" d\'abord !');
    }

    console.log(`🏆 Compétition trouvée : "${competition.nom}" (ID: ${competition._id})`);

    // 3. Trouver le Quart 1 (tour: 3)
    let match = competition.matchsElimination.find(m => m.tour === 3);
    if (!match) {
      throw new Error('Match Quart 1 (tour 3) introuvable dans la compétition.');
    }

    console.log(`🎮 Match ciblé : ${match.phase} (tour index: ${match.tour})`);
    console.log(`   Equipe 1 (ID: ${match.equipe1}) vs Equipe 2 (ID: ${match.equipe2})`);

    // 4. Simuler le signalement d'un litige
    console.log('⚖️ Signalement d\'un litige simulé...');
    match.litige = true;
    match.litigeDetails = {
      signalePar: admin._id,
      clubId: match.equipe1,
      description: 'Test litige : DC adverse taille non conforme (1.92m au lieu de 1.87m maximale).',
      preuveVideo: 'https://youtube.com/watch?v=mock_preuve_video_clip',
      dateSignalement: new Date(),
      statut: 'En attente'
    };

    await competition.save();
    console.log('✅ Litige sauvegardé dans la base de données.');

    // Recharger pour s'assurer que c'est bien écrit
    competition = await Competition.findById(competition._id);
    match = competition.matchsElimination.find(m => m.tour === 3);
    if (!match.litige || match.litigeDetails.statut !== 'En attente') {
      throw new Error('Erreur d\'écriture du litige dans la base de données.');
    }
    console.log('   Lecture DB : Litige actif =', match.litige, ', StatutDetails =', match.litigeDetails.statut);

    // 5. Simuler la résolution par l'admin : Trancher en faveur de Equipe 1 (Spartans FC ou 1er club) avec score 3 - 0
    console.log('⚖️ Résolution du litige par l\'admin (Action : Trancher en faveur d\'Equipe 1)...');
    const scoreVal1 = 3;
    const scoreVal2 = 0;
    
    // Déterminer le gagnant
    const winnerId = match.equipe1;
    console.log(`   Admin tranche avec le score : ${scoreVal1} - ${scoreVal2}`);
    console.log(`   Le vainqueur attendu est : ${winnerId}`);

    // Appliquer les modifications comme dans la route de résolution
    match.score1 = scoreVal1;
    match.score2 = scoreVal2;
    match.statut = 'Terminé';
    match.litige = false;
    
    match.litigeDetails.statut = 'Tranché';
    match.litigeDetails.decisionAdmin = 'Taille non conforme du défenseur confirmée par le clip. Victoire sur tapis vert 3-0.';
    match.litigeDetails.dateResolution = new Date();
    match.litigeDetails.resoluPar = admin._id;

    // Mettre à jour les stats d'équipe
    if (compRouter.updateTeamStats) {
      console.log('   ⚙️ Exécution de updateTeamStats...');
      await compRouter.updateTeamStats(competition, match);
    } else {
      console.log('   ⚠️ updateTeamStats absent de compRouter');
    }

    // Recalculer les stats de la compétition
    if (compRouter.calculateCompetitionStats) {
      console.log('   ⚙️ Exécution de calculateCompetitionStats...');
      const stats = await compRouter.calculateCompetitionStats(competition);
      competition.statistiques = stats;
    }

    // Gérer la progression
    if (competition.type === 'elimination_directe' && match.phase && match.phase !== 'Petite finale') {
      if (compRouter.handleEliminationProgression) {
        console.log('   ⚙️ Exécution de handleEliminationProgression...');
        await compRouter.handleEliminationProgression(competition, match);
      } else {
        console.log('   ⚠️ handleEliminationProgression absent de compRouter');
      }
    }

    await competition.save();
    console.log('✅ Décision enregistrée en base de données.');

    // 6. Validation finale de la progression
    // Le parent de tour: 3 est Math.floor((3 - 1) / 2) = 1 (Demi-finale index 1)
    // Comme 3 est impair, il doit être placé en equipe1 de la demi-finale index 1
    console.log('🔍 Vérification de la progression dans l\'arbre...');
    competition = await Competition.findById(competition._id);
    
    const demiMatch = competition.matchsElimination.find(m => m.tour === 1);
    if (!demiMatch) {
      throw new Error('Match demi-finale (tour: 1) introuvable après progression.');
    }

    console.log(`   Demi-finale (tour: 1) -> Equipe 1: ${demiMatch.equipe1}, Equipe 2: ${demiMatch.equipe2}`);
    
    if (demiMatch.equipe1 && demiMatch.equipe1.toString() === winnerId.toString()) {
      console.log('🎉 SUCCÈS : Le vainqueur a bien progressé vers le match parent (Demi-finale) en position Equipe 1 !');
    } else {
      throw new Error(`Échec de la progression. L'équipe attendue était ${winnerId}, mais l'équipe 1 de la demi-finale est ${demiMatch.equipe1}`);
    }

  } catch (error) {
    console.error('❌ ÉCHEC DES TESTS :', error.message);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Déconnexion.');
  }
};

testDisputeSystem();
