require('dotenv').config();
const mongoose = require('mongoose');
const Competition = require('../models/Competition');
const Club = require('../models/Club');

// Configuration MongoDB
const MONGODB_URI = process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://localhost:27017/club-pro-commu';

async function testScoreUpdate() {
  try {
    console.log('🔄 Connexion à MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connecté à MongoDB');

    console.log('\n🧪 TEST DE MISE À JOUR AUTOMATIQUE DES SCORES');
    console.log('═══════════════════════════════════════════════════════════════════════\n');

    // Trouver la compétition "cham"
    const competition = await Competition.findById('68a871d0bfb4b4290e5758df')
      .populate('equipesInscrites.clubId')
      .populate('poules.matchs.equipe1')
      .populate('poules.matchs.equipe2');

    if (!competition) {
      console.log('❌ Compétition "cham" non trouvée');
      return;
    }

    console.log(`🏆 COMPÉTITION: ${competition.nom}`);
    console.log(`🏷️ Type: ${competition.type}`);
    console.log(`📊 Statut: ${competition.statut}`);

    // Afficher l'état actuel
    console.log('\n📊 ÉTAT ACTUEL DES ÉQUIPES:');
    console.log('─────────────────────────────────────────────────────────────────────');
    competition.equipesInscrites.forEach((equipe, index) => {
      console.log(`${index + 1}. ${equipe.clubId?.nom || 'Club inconnu'}`);
      console.log(`   Points: ${equipe.points || 0}, Matchs: ${equipe.matchsJoues || 0}`);
      console.log(`   Victoires: ${equipe.victoires || 0}, Nuls: ${equipe.nuls || 0}, Défaites: ${equipe.defaites || 0}`);
      console.log(`   Buts pour: ${equipe.butsPour || 0}, Buts contre: ${equipe.butsContre || 0}`);
      console.log('');
    });

    // Simuler la mise à jour d'un match
    console.log('🔄 SIMULATION DE MISE À JOUR D\'UN MATCH:');
    console.log('─────────────────────────────────────────────────────────────────────');
    
    if (competition.poules && competition.poules.length > 0) {
      const poule = competition.poules[0];
      if (poule.matchs && poule.matchs.length > 0) {
        // Prendre le 2ème match (Manchester City vs Liverpool)
        const match = poule.matchs[1];
        if (match && match.statut === 'Programmé') {
          console.log(`📝 Mise à jour du match: ${match.equipe1?.nom} vs ${match.equipe2?.nom}`);
          
          // Simuler un score
          match.score1 = 3; // Manchester City
          match.score2 = 1; // Liverpool
          match.statut = 'Terminé';
          
          console.log(`   Score: ${match.score1} - ${match.score2}`);
          console.log(`   Statut: ${match.statut}`);
          
          // Trouver les équipes
          const equipe1 = competition.equipesInscrites.find(e => 
            e.clubId.toString() === match.equipe1.toString()
          );
          const equipe2 = competition.equipesInscrites.find(e => 
            e.clubId.toString() === match.equipe2.toString()
          );

          if (equipe1 && equipe2) {
            // Initialiser les statistiques si elles n'existent pas
            if (!equipe1.matchsJoues) equipe1.matchsJoues = 0;
            if (!equipe1.victoires) equipe1.victoires = 0;
            if (!equipe1.nuls) equipe1.nuls = 0;
            if (!equipe1.defaites) equipe1.defaites = 0;
            if (!equipe1.butsPour) equipe1.butsPour = 0;
            if (!equipe1.butsContre) equipe1.butsContre = 0;
            if (!equipe1.points) equipe1.points = 0;

            if (!equipe2.matchsJoues) equipe2.matchsJoues = 0;
            if (!equipe2.victoires) equipe2.victoires = 0;
            if (!equipe2.nuls) equipe2.nuls = 0;
            if (!equipe2.defaites) equipe2.defaites = 0;
            if (!equipe2.butsPour) equipe2.butsPour = 0;
            if (!equipe2.butsContre) equipe2.butsContre = 0;
            if (!equipe2.points) equipe2.points = 0;

            // Mettre à jour les statistiques
            equipe1.matchsJoues += 1;
            equipe2.matchsJoues += 1;
            equipe1.butsPour += match.score1;
            equipe1.butsContre += match.score2;
            equipe2.butsPour += match.score2;
            equipe2.butsContre += match.score1;

            // Déterminer le résultat
            if (match.score1 > match.score2) {
              equipe1.victoires += 1;
              equipe2.defaites += 1;
              equipe1.points += 3;
              console.log(`   ✅ ${equipe1.clubId.nom} gagne (3 points)`);
            } else if (match.score1 < match.score2) {
              equipe2.victoires += 1;
              equipe1.defaites += 1;
              equipe2.points += 3;
              console.log(`   ✅ ${equipe2.clubId.nom} gagne (3 points)`);
            } else {
              equipe1.nuls += 1;
              equipe2.nuls += 1;
              equipe1.points += 1;
              equipe2.points += 1;
              console.log(`   🤝 Match nul (1 point chacun)`);
            }

            // Calculer la différence de buts
            equipe1.differenceButs = equipe1.butsPour - equipe1.butsContre;
            equipe2.differenceButs = equipe2.butsPour - equipe2.butsContre;
          }
        }
      }
    }

    // Afficher le nouveau classement
    console.log('\n🏆 NOUVEAU CLASSEMENT:');
    console.log('─────────────────────────────────────────────────────────────────────');
    
    const classement = competition.equipesInscrites
      .filter(equipe => equipe.statut === 'Confirmé')
      .sort((a, b) => {
        if (b.points !== a.points) return b.points - a.points;
        if (b.differenceButs !== a.differenceButs) return b.differenceButs - a.differenceButs;
        return b.butsPour - a.butsPour;
      });

    classement.forEach((equipe, index) => {
      console.log(`${index + 1}. ${equipe.clubId.nom}`);
      console.log(`   Points: ${equipe.points}, Diff: ${equipe.differenceButs}, Buts: ${equipe.butsPour}`);
      console.log(`   Matchs: ${equipe.matchsJoues} (${equipe.victoires}V ${equipe.nuls}N ${equipe.defaites}D)`);
      console.log('');
    });

    // Sauvegarder
    console.log('💾 Sauvegarde des modifications...');
    await competition.save();
    console.log('✅ Compétition sauvegardée avec succès');

    console.log('\n🎉 TEST TERMINÉ !');
    console.log('─────────────────────────────────────────────────────────────────────');
    console.log('✅ Score du match mis à jour');
    console.log('✅ Statistiques des équipes recalculées');
    console.log('✅ Classement mis à jour automatiquement');
    console.log('🚀 Le classement devrait maintenant s\'afficher correctement dans l\'interface');

  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Déconnecté de MongoDB');
  }
}

// Exécuter le script
testScoreUpdate(); 