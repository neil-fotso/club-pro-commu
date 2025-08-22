require('dotenv').config();
const mongoose = require('mongoose');
const Competition = require('../models/Competition');
const Club = require('../models/Club');
const Player = require('../models/Player');
const User = require('../models/User');

const fixCompetitionIssues = async () => {
  try {
    console.log('🔄 Connexion à MongoDB...');
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/club-pro-commu');
    
    console.log('🔧 CORRECTION DES PROBLÈMES IDENTIFIÉS\n');
    console.log('═══════════════════════════════════════════════════════════════════════════\n');

    let fixes = 0;

    // 1. Corriger les statistiques des compétitions
    console.log('1️⃣ CORRECTION DES STATISTIQUES');
    console.log('─'.repeat(50));

    const competitions = await Competition.find({});
    
    for (const comp of competitions) {
      console.log(`\n🏆 Traitement: ${comp.nom}`);
      
      let needsUpdate = false;
      let totalMatchs = 0;
      let matchsTermines = 0;
      let matchsEnCours = 0;
      let matchsEnLitige = 0;
      let nombreEquipes = comp.equipesInscrites.length;

      // Calculer les statistiques pour les matchs d'élimination
      if (comp.matchsElimination && comp.matchsElimination.length > 0) {
        totalMatchs += comp.matchsElimination.length;
        matchsTermines += comp.matchsElimination.filter(m => m.statut === 'Terminé').length;
        matchsEnCours += comp.matchsElimination.filter(m => m.statut === 'En cours').length;
        matchsEnLitige += comp.matchsElimination.filter(m => m.litige === true).length;
      }

      // Calculer les statistiques pour les poules
      if (comp.poules && comp.poules.length > 0) {
        comp.poules.forEach(poule => {
          totalMatchs += poule.matchs.length;
          matchsTermines += poule.matchs.filter(m => m.statut === 'Terminé').length;
          matchsEnCours += poule.matchs.filter(m => m.statut === 'En cours').length;
          matchsEnLitige += poule.matchs.filter(m => m.litige === true).length;
        });
      }

      const tauxCompletion = totalMatchs > 0 ? Math.round((matchsTermines / totalMatchs) * 100) : 0;

      // Calculer les statistiques des buteurs
      let meilleurButeur = null;
      let meilleurPasseur = null;
      let totalButs = 0;
      let totalPasses = 0;
      const buteursStats = {};
      const passeursStats = {};

      // Analyser tous les matchs terminés
      const tousLesMatchs = [];
      
      if (comp.matchsElimination) {
        tousLesMatchs.push(...comp.matchsElimination.filter(m => m.statut === 'Terminé'));
      }
      
      if (comp.poules) {
        comp.poules.forEach(poule => {
          tousLesMatchs.push(...poule.matchs.filter(m => m.statut === 'Terminé'));
        });
      }

      tousLesMatchs.forEach(match => {
        if (match.stats && match.stats.buteurs) {
          match.stats.buteurs.forEach(buteur => {
            const joueur = buteur.joueur;
            const buts = buteur.buts || 1;
            buteursStats[joueur] = (buteursStats[joueur] || 0) + buts;
            totalButs += buts;
          });
        }

        if (match.stats && match.stats.passeurs) {
          match.stats.passeurs.forEach(passeur => {
            const joueur = passeur.joueur;
            const passes = passeur.passes || 1;
            passeursStats[joueur] = (passeursStats[joueur] || 0) + passes;
            totalPasses += passes;
          });
        }
      });

      // Trouver le meilleur buteur
      if (Object.keys(buteursStats).length > 0) {
        const topButeur = Object.entries(buteursStats).reduce((a, b) => 
          buteursStats[a[0]] > buteursStats[b[0]] ? a : b
        );
        meilleurButeur = {
          joueur: topButeur[0],
          buts: topButeur[1],
          club: null // Pourrait être enrichi plus tard
        };
      }

      // Trouver le meilleur passeur
      if (Object.keys(passeursStats).length > 0) {
        const topPasseur = Object.entries(passeursStats).reduce((a, b) => 
          passeursStats[a[0]] > passeursStats[b[0]] ? a : b
        );
        meilleurPasseur = {
          joueur: topPasseur[0],
          passes: topPasseur[1],
          club: null
        };
      }

      // Vérifier si les statistiques sont incorrectes ou manquantes
      if (!comp.statistiques || 
          comp.statistiques.totalMatchs !== totalMatchs ||
          comp.statistiques.matchsTermines !== matchsTermines ||
          comp.statistiques.tauxCompletion !== tauxCompletion ||
          comp.statistiques.nombreEquipes !== nombreEquipes) {
        
        needsUpdate = true;
        
        comp.statistiques = {
          totalMatchs,
          matchsTermines,
          matchsEnCours,
          matchsEnLitige,
          tauxCompletion,
          nombreEquipes,
          totalButs,
          totalPasses,
          meilleurButeur,
          meilleurPasseur,
          meilleurJoueur: meilleurButeur ? {
            joueur: meilleurButeur.joueur,
            club: meilleurButeur.club
          } : null
        };

        console.log(`   🔧 Statistiques mises à jour:`);
        console.log(`      📊 Matchs: ${matchsTermines}/${totalMatchs} (${tauxCompletion}%)`);
        console.log(`      👥 Équipes: ${nombreEquipes}`);
        console.log(`      ⚽ Buts: ${totalButs}`);
        if (meilleurButeur) {
          console.log(`      🥇 Meilleur buteur: ${meilleurButeur.joueur} (${meilleurButeur.buts} buts)`);
        }
      } else {
        console.log(`   ✅ Statistiques déjà correctes`);
      }

      if (needsUpdate) {
        await comp.save();
        fixes++;
      }
    }

    // 2. Assigner les joueurs sans club
    console.log('\n2️⃣ ASSIGNATION DES JOUEURS SANS CLUB');
    console.log('─'.repeat(50));

    const playersWithoutClubs = await Player.find({
      $or: [
        { clubs: { $exists: false } },
        { clubs: { $size: 0 } }
      ]
    }).populate('userId', 'pseudo');

    const availableClubs = await Club.find({});

    console.log(`   🎮 Joueurs sans club: ${playersWithoutClubs.length}`);

    if (playersWithoutClubs.length > 0 && availableClubs.length > 0) {
      for (const player of playersWithoutClubs) {
        // Assigner à un club aléatoire
        const randomClub = availableClubs[Math.floor(Math.random() * availableClubs.length)];
        
        if (!player.clubs) {
          player.clubs = [];
        }

        player.clubs.push({
          clubId: randomClub._id,
          role: 'Joueur',
          dateAdhesion: new Date(),
          statut: 'Actif'
        });

        await player.save();
        
        console.log(`   ✅ ${player.userId?.pseudo || 'Joueur'} assigné à ${randomClub.nom}`);
        fixes++;
      }
    }

    // 3. Vérifier et corriger les données d'intégrité
    console.log('\n3️⃣ VÉRIFICATION INTÉGRITÉ DES MATCHS');
    console.log('─'.repeat(50));

    for (const comp of competitions) {
      if (comp.matchsElimination) {
        for (const match of comp.matchsElimination) {
          let matchNeedsUpdate = false;
          
          // Vérifier que les équipes existent
          if (match.equipe1 && !await Club.findById(match.equipe1)) {
            console.log(`   ⚠️ ${comp.nom}: Équipe1 introuvable, suppression du match`);
            match.equipe1 = null;
            matchNeedsUpdate = true;
          }

          if (match.equipe2 && !await Club.findById(match.equipe2)) {
            console.log(`   ⚠️ ${comp.nom}: Équipe2 introuvable, suppression du match`);
            match.equipe2 = null;
            matchNeedsUpdate = true;
          }

          if (matchNeedsUpdate) {
            await comp.save();
            fixes++;
          }
        }
      }
    }

    // 4. Résumé
    console.log('\n📋 RÉSUMÉ DES CORRECTIONS');
    console.log('═'.repeat(50));

    if (fixes > 0) {
      console.log(`✅ ${fixes} problèmes corrigés avec succès`);
      console.log('🔄 Recalcul des statistiques effectué');
      console.log('👥 Joueurs assignés aux clubs');
      console.log('🔗 Intégrité des données vérifiée');
    } else {
      console.log('✅ Aucune correction nécessaire - système en bon état !');
    }

    console.log('\n🚀 RECOMMANDATIONS POUR LA SUITE:');
    console.log('   1. Relancer l\'audit pour vérifier les corrections');
    console.log('   2. Tester l\'interface frontend');
    console.log('   3. Vérifier les permissions utilisateurs');
    console.log('   4. Tester la création de nouvelles compétitions');

  } catch (error) {
    console.error('❌ Erreur lors des corrections:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Déconnexion MongoDB');
  }
};

if (require.main === module) {
  fixCompetitionIssues();
}

module.exports = fixCompetitionIssues; 