require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const Competition = require('../models/Competition');
const Club = require('../models/Club');
const Player = require('../models/Player');

const auditCompetitionsSystem = async () => {
  try {
    console.log('🔄 Connexion à MongoDB...');
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/club-pro-commu');
    
    console.log('🔍 AUDIT COMPLET DU SYSTÈME DE COMPÉTITIONS\n');
    console.log('═══════════════════════════════════════════════════════════════════════════\n');

    let issues = [];
    let warnings = [];

    // 1. VÉRIFICATION DES DONNÉES DE BASE
    console.log('📊 1. VÉRIFICATION DES DONNÉES DE BASE');
    console.log('─'.repeat(50));

    const usersCount = await User.countDocuments();
    const clubsCount = await Club.countDocuments();
    const playersCount = await Player.countDocuments();
    const competitionsCount = await Competition.countDocuments();

    console.log(`   👥 Utilisateurs: ${usersCount}`);
    console.log(`   🏟️ Clubs: ${clubsCount}`);
    console.log(`   🎮 Joueurs: ${playersCount}`);
    console.log(`   🏆 Compétitions: ${competitionsCount}`);

    if (competitionsCount === 0) {
      issues.push('❌ Aucune compétition trouvée dans la base de données');
    }

    if (clubsCount < 4) {
      warnings.push('⚠️ Nombre insuffisant de clubs pour tester les compétitions (minimum 4 recommandé)');
    }

    // 2. VÉRIFICATION DES COMPÉTITIONS EXISTANTES
    console.log('\n🏆 2. ANALYSE DES COMPÉTITIONS EXISTANTES');
    console.log('─'.repeat(50));

    const competitions = await Competition.find({})
      .populate('createurId', 'pseudo email')
      .populate('equipesInscrites.clubId', 'nom')
      .populate('gagnant', 'nom')
      .populate('finaliste', 'nom')
      .populate('troisieme', 'nom');

    for (const comp of competitions) {
      console.log(`\n   🏆 ${comp.nom} (${comp.type})`);
      console.log(`      📋 Statut: ${comp.statut}`);
      console.log(`      👥 Équipes: ${comp.equipesInscrites.length}/${comp.nombreEquipes}`);
      
      // Vérifier la cohérence des données
      if (!comp.createurId) {
        issues.push(`❌ ${comp.nom}: Créateur manquant`);
      }

      if (comp.equipesInscrites.length === 0) {
        warnings.push(`⚠️ ${comp.nom}: Aucune équipe inscrite`);
      }

      // Vérifier les matchs selon le type
      if (comp.type === 'elimination_directe') {
        console.log(`      ⚔️ Matchs élimination: ${comp.matchsElimination?.length || 0}`);
        
        if (comp.matchsElimination && comp.matchsElimination.length > 0) {
          const matchsTermines = comp.matchsElimination.filter(m => m.statut === 'Terminé').length;
          const matchsProgrammes = comp.matchsElimination.filter(m => m.statut === 'Programmé').length;
          console.log(`         ✅ Terminés: ${matchsTermines}`);
          console.log(`         📅 Programmés: ${matchsProgrammes}`);

          // Vérifier la cohérence des phases
          const phases = [...new Set(comp.matchsElimination.map(m => m.phase))];
          console.log(`         🎯 Phases: ${phases.join(', ')}`);

          // Vérifier les équipes nulles
          const matchsAvecEquipesNulles = comp.matchsElimination.filter(m => !m.equipe1 || !m.equipe2);
          if (matchsAvecEquipesNulles.length > 0) {
            issues.push(`❌ ${comp.nom}: ${matchsAvecEquipesNulles.length} matchs avec équipes manquantes`);
          }
        }
      } else if (comp.type === 'poule_elimination') {
        console.log(`      🔄 Poules: ${comp.poules?.length || 0}`);
        console.log(`      ⚔️ Matchs élimination: ${comp.matchsElimination?.length || 0}`);
        
        if (comp.poules && comp.poules.length > 0) {
          comp.poules.forEach((poule, index) => {
            console.log(`         📋 ${poule.nom}: ${poule.equipes.length} équipes, ${poule.matchs.length} matchs`);
          });
        }
      }

      // Vérifier les statistiques
      if (comp.statistiques) {
        console.log(`      📊 Stats: ${comp.statistiques.matchsTermines}/${comp.statistiques.totalMatchs} matchs (${comp.statistiques.tauxCompletion}%)`);
        
        if (comp.statistiques.meilleurButeur) {
          console.log(`      🥇 Meilleur buteur: ${comp.statistiques.meilleurButeur} (${comp.statistiques.totalButs} buts)`);
        }
      } else {
        warnings.push(`⚠️ ${comp.nom}: Statistiques manquantes`);
      }

      // Vérifier les résultats finaux
      if (comp.statut === 'Terminé') {
        if (!comp.gagnant) {
          issues.push(`❌ ${comp.nom}: Compétition terminée mais pas de gagnant défini`);
        } else {
          console.log(`      🏆 Gagnant: ${comp.gagnant.nom}`);
          if (comp.finaliste) console.log(`      🥈 Finaliste: ${comp.finaliste.nom}`);
          if (comp.troisieme) console.log(`      🥉 3ème: ${comp.troisieme.nom}`);
        }
      }
    }

    // 3. VÉRIFICATION DES CLUBS ET JOUEURS
    console.log('\n🏟️ 3. VÉRIFICATION DES CLUBS ET JOUEURS');
    console.log('─'.repeat(50));

    const clubs = await Club.find({}).populate('membres.userId', 'pseudo');
    const clubsAvecAdmins = clubs.filter(club => 
      club.membres.some(membre => membre.role === 'Admin')
    );

    console.log(`   🏟️ Clubs avec admin: ${clubsAvecAdmins.length}/${clubs.length}`);

    if (clubsAvecAdmins.length < clubs.length) {
      warnings.push(`⚠️ ${clubs.length - clubsAvecAdmins.length} clubs sans administrateur`);
    }

    // Vérifier les joueurs
    const players = await Player.find({}).populate('userId', 'pseudo email');
    const playersAvecClubs = players.filter(player => 
      player.clubs && player.clubs.length > 0
    );

    console.log(`   🎮 Joueurs avec clubs: ${playersAvecClubs.length}/${players.length}`);

    if (playersAvecClubs.length < players.length) {
      warnings.push(`⚠️ ${players.length - playersAvecClubs.length} joueurs sans club`);
    }

    // 4. VÉRIFICATION DE LA COHÉRENCE DES DONNÉES
    console.log('\n🔗 4. VÉRIFICATION DE LA COHÉRENCE');
    console.log('─'.repeat(50));

    // Vérifier les références entre compétitions et clubs
    for (const comp of competitions) {
      for (const equipe of comp.equipesInscrites) {
        if (!equipe.clubId) {
          issues.push(`❌ ${comp.nom}: Équipe inscrite sans référence club`);
        }
      }

      // Vérifier les références dans les matchs
      if (comp.matchsElimination) {
        for (const match of comp.matchsElimination) {
          if (match.equipe1 && !await Club.findById(match.equipe1)) {
            issues.push(`❌ ${comp.nom}: Match avec équipe1 introuvable (${match.equipe1})`);
          }
          if (match.equipe2 && !await Club.findById(match.equipe2)) {
            issues.push(`❌ ${comp.nom}: Match avec équipe2 introuvable (${match.equipe2})`);
          }
        }
      }
    }

    // 5. TEST DES FONCTIONNALITÉS CLÉS
    console.log('\n⚙️ 5. TEST DES FONCTIONNALITÉS CLÉS');
    console.log('─'.repeat(50));

    // Test calcul statistiques
    console.log('   📊 Test calcul statistiques...');
    for (const comp of competitions) {
      try {
        // Simuler le calcul des stats (sans sauvegarder)
        const matchsElimination = comp.matchsElimination || [];
        const poules = comp.poules || [];
        
        let totalMatchs = matchsElimination.length;
        let matchsTermines = matchsElimination.filter(m => m.statut === 'Terminé').length;
        
        poules.forEach(poule => {
          totalMatchs += poule.matchs.length;
          matchsTermines += poule.matchs.filter(m => m.statut === 'Terminé').length;
        });

        const tauxCompletion = totalMatchs > 0 ? Math.round((matchsTermines / totalMatchs) * 100) : 0;
        console.log(`      ${comp.nom}: ${matchsTermines}/${totalMatchs} (${tauxCompletion}%)`);
        
      } catch (error) {
        issues.push(`❌ Erreur calcul stats pour ${comp.nom}: ${error.message}`);
      }
    }

    // 6. VÉRIFICATION DES PERMISSIONS
    console.log('\n🔐 6. VÉRIFICATION DES PERMISSIONS');
    console.log('─'.repeat(50));

    const admins = await User.find({ isAdmin: true });
    console.log(`   👑 Admins système: ${admins.length}`);

    if (admins.length === 0) {
      issues.push('❌ Aucun administrateur système trouvé');
    }

    // 7. RÉSUMÉ ET RECOMMANDATIONS
    console.log('\n📋 7. RÉSUMÉ DE L\'AUDIT');
    console.log('═'.repeat(50));

    console.log(`\n✅ STATUT GLOBAL:`);
    console.log(`   📊 Données: ${usersCount} users, ${clubsCount} clubs, ${competitionsCount} compétitions`);
    console.log(`   ❌ Problèmes critiques: ${issues.length}`);
    console.log(`   ⚠️ Avertissements: ${warnings.length}`);

    if (issues.length > 0) {
      console.log(`\n❌ PROBLÈMES CRITIQUES À CORRIGER:`);
      issues.forEach(issue => console.log(`   ${issue}`));
    }

    if (warnings.length > 0) {
      console.log(`\n⚠️ AVERTISSEMENTS:`);
      warnings.forEach(warning => console.log(`   ${warning}`));
    }

    if (issues.length === 0 && warnings.length === 0) {
      console.log('\n🎉 SYSTÈME EN BON ÉTAT !');
      console.log('   ✅ Aucun problème critique détecté');
      console.log('   ✅ Toutes les vérifications passent');
    }

    // 8. RECOMMANDATIONS
    console.log('\n🚀 RECOMMANDATIONS:');
    
    if (competitionsCount > 0) {
      console.log('   1. Tester la création de nouvelle compétition');
      console.log('   2. Tester l\'inscription d\'équipes');
      console.log('   3. Tester la saisie de scores');
      console.log('   4. Vérifier l\'interface frontend');
    } else {
      console.log('   1. Créer des données de test');
      console.log('   2. Tester le flux complet de création');
    }

    console.log('   5. Tester avec différents types d\'utilisateurs');
    console.log('   6. Vérifier la responsivité mobile');
    console.log('   7. Tester les cas d\'erreur');

    return {
      issues,
      warnings,
      stats: {
        users: usersCount,
        clubs: clubsCount,
        players: playersCount,
        competitions: competitionsCount
      }
    };

  } catch (error) {
    console.error('❌ Erreur lors de l\'audit:', error);
    return { issues: [`Erreur critique: ${error.message}`], warnings: [], stats: {} };
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Déconnexion MongoDB');
  }
};

if (require.main === module) {
  auditCompetitionsSystem();
}

module.exports = auditCompetitionsSystem; 