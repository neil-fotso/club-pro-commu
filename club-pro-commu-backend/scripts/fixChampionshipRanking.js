require('dotenv').config();
const mongoose = require('mongoose');
const Competition = require('../models/Competition');
const Club = require('../models/Club');

// Configuration MongoDB
const MONGODB_URI = process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://localhost:27017/club-pro-commu';

async function fixChampionshipRanking() {
  try {
    console.log('🔄 Connexion à MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connecté à MongoDB');

    console.log('\n🔧 DIAGNOSTIC ET CORRECTION DU CLASSEMENT');
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
    console.log(`👥 Équipes inscrites: ${competition.equipesInscrites?.length || 0}`);

    // Vérifier les équipes inscrites
    console.log('\n🏟️ ÉQUIPES INSCRITES:');
    console.log('─────────────────────────────────────────────────────────────────────');
    if (competition.equipesInscrites && competition.equipesInscrites.length > 0) {
      competition.equipesInscrites.forEach((equipe, index) => {
        console.log(`${index + 1}. ${equipe.clubId?.nom || 'Club inconnu'} - Statut: ${equipe.statut}`);
        console.log(`   Points: ${equipe.points || 0}, Matchs: ${equipe.matchsJoues || 0}`);
        console.log(`   Victoires: ${equipe.victoires || 0}, Nuls: ${equipe.nuls || 0}, Défaites: ${equipe.defaites || 0}`);
        console.log(`   Buts pour: ${equipe.butsPour || 0}, Buts contre: ${equipe.butsContre || 0}`);
        console.log('');
      });
    }

    // Vérifier les matchs
    console.log('⚽ MATCHS:');
    console.log('─────────────────────────────────────────────────────────────────────');
    if (competition.poules && competition.poules.length > 0) {
      competition.poules.forEach((poule, pouleIndex) => {
        console.log(`📋 ${poule.nom}: ${poule.matchs?.length || 0} matchs`);
        if (poule.matchs && poule.matchs.length > 0) {
          poule.matchs.forEach((match, matchIndex) => {
            console.log(`   Match ${matchIndex + 1}: ${match.equipe1?.nom || 'TBD'} vs ${match.equipe2?.nom || 'TBD'}`);
            console.log(`   Statut: ${match.statut}, Score: ${match.score1 || '-'} - ${match.score2 || '-'}`);
            console.log(`   Date: ${match.dateMatch ? new Date(match.dateMatch).toLocaleDateString('fr-FR') : 'Non programmé'}`);
            console.log('');
          });
        }
      });
    }

    // Calculer et mettre à jour les statistiques des équipes
    console.log('🔄 CALCUL DES STATISTIQUES:');
    console.log('─────────────────────────────────────────────────────────────────────');
    
    if (competition.poules && competition.poules.length > 0) {
      for (const poule of competition.poules) {
        if (poule.matchs && poule.matchs.length > 0) {
          for (const match of poule.matchs) {
            if (match.statut === 'Terminé' && match.score1 !== null && match.score2 !== null) {
              console.log(`📊 Mise à jour des stats pour: ${match.equipe1?.nom} vs ${match.equipe2?.nom}`);
              
              // Trouver les équipes dans equipesInscrites
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

                // Incrémenter les matchs joués
                equipe1.matchsJoues++;
                equipe2.matchsJoues++;

                // Ajouter les buts
                equipe1.butsPour += match.score1;
                equipe1.butsContre += match.score2;
                equipe2.butsPour += match.score2;
                equipe2.butsContre += match.score1;

                // Calculer les points et résultats
                if (match.score1 > match.score2) {
                  // Équipe 1 gagne
                  equipe1.victoires++;
                  equipe1.points += 3;
                  equipe2.defaites++;
                  console.log(`   ✅ ${equipe1.clubId.nom} gagne (3 points)`);
                } else if (match.score1 < match.score2) {
                  // Équipe 2 gagne
                  equipe2.victoires++;
                  equipe2.points += 3;
                  equipe1.defaites++;
                  console.log(`   ✅ ${equipe2.clubId.nom} gagne (3 points)`);
                } else {
                  // Match nul
                  equipe1.nuls++;
                  equipe1.points += 1;
                  equipe2.nuls++;
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
      }
    }

    // Afficher le classement calculé
    console.log('\n🏆 CLASSEMENT CALCULÉ:');
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

    // Sauvegarder les modifications
    console.log('💾 Sauvegarde des modifications...');
    await competition.save();
    console.log('✅ Compétition sauvegardée avec succès');

    console.log('\n🎉 CORRECTION TERMINÉE !');
    console.log('─────────────────────────────────────────────────────────────────────');
    console.log('✅ Statistiques des équipes mises à jour');
    console.log('✅ Classement recalculé');
    console.log('🚀 Le classement devrait maintenant s\'afficher correctement');

  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Déconnecté de MongoDB');
  }
}

// Exécuter le script
fixChampionshipRanking(); 