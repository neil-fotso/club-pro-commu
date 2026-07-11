require('dotenv').config();
const mongoose = require('mongoose');
const Competition = require('../models/Competition');
const User = require('../models/User');
const Club = require('../models/Club');

// Configuration MongoDB
const MONGODB_URI = process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://localhost:27017/club-pro-commu';

async function testCompetitionLaunch() {
  try {
    console.log('🔄 Connexion à MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connecté à MongoDB');

    console.log('\n🔍 DIAGNOSTIC DES COMPÉTITIONS');
    console.log('═══════════════════════════════════════════════════════════════════════\n');

    // Lister toutes les compétitions
    const competitions = await Competition.find({}).populate('createurId').populate('equipesInscrites.clubId');
    
    if (competitions.length === 0) {
      console.log('❌ Aucune compétition trouvée dans la base de données');
      return;
    }

    console.log(`📊 ${competitions.length} compétition(s) trouvée(s)\n`);

    competitions.forEach((competition, index) => {
      console.log(`🏆 COMPÉTITION ${index + 1}: ${competition.nom}`);
      console.log('─────────────────────────────────────────────────────────────────────');
      console.log(`📝 ID: ${competition._id}`);
      console.log(`🏷️ Type: ${competition.type}`);
      console.log(`📊 Statut: ${competition.statut}`);
      console.log(`👤 Créateur: ${competition.createurId?.pseudo || 'N/A'}`);
      console.log(`👥 Équipes inscrites: ${competition.equipesInscrites?.length || 0}`);
      console.log(`🎯 Nombre d'équipes configuré: ${competition.nombreEquipes}`);
      
      if (competition.equipesInscrites && competition.equipesInscrites.length > 0) {
        console.log('\n🏟️ ÉQUIPES INSCRITES:');
        competition.equipesInscrites.forEach((equipe, idx) => {
          console.log(`   ${idx + 1}. ${equipe.clubId?.nom || 'Club inconnu'} (${equipe.statut})`);
        });
      }

      if (competition.poules && competition.poules.length > 0) {
        console.log('\n📋 POULES:');
        competition.poules.forEach((poule, idx) => {
          console.log(`   Poule ${idx + 1}: ${poule.nom} - ${poule.equipes?.length || 0} équipes, ${poule.matchs?.length || 0} matchs`);
        });
      }

      if (competition.matchsElimination && competition.matchsElimination.length > 0) {
        console.log('\n⚽ MATCHS ÉLIMINATION:');
        competition.matchsElimination.forEach((match, idx) => {
          console.log(`   Match ${idx + 1}: ${match.phase} - ${match.statut}`);
        });
      }

      console.log('\n🔍 ANALYSE DES PROBLÈMES POTENTIELS:');
      
      // Vérifier les problèmes courants
      if (!competition.createurId) {
        console.log('   ❌ Créateur manquant');
      }
      
      if (!competition.equipesInscrites || competition.equipesInscrites.length === 0) {
        console.log('   ❌ Aucune équipe inscrite');
      }
      
      if (competition.equipesInscrites && competition.equipesInscrites.length < 2) {
        console.log('   ❌ Pas assez d\'équipes (minimum 2 requis)');
      }
      
      if (competition.type === 'elimination_directe') {
        const isValidPowerOfTwo = (n) => n > 0 && (n & (n - 1)) === 0;
        if (!isValidPowerOfTwo(competition.equipesInscrites?.length || 0)) {
          console.log('   ❌ Nombre d\'équipes invalide pour élimination directe (doit être une puissance de 2)');
        }
      }
      
      if (competition.type === 'poule_elimination' && (!competition.nombreEquipesParPoule || competition.nombreEquipesParPoule < 2)) {
        console.log('   ❌ Nombre d\'équipes par poule invalide');
      }

      console.log('');
    });

    // Tester une compétition spécifique
    if (competitions.length > 0) {
      const testCompetition = competitions[0];
      console.log('🧪 TEST DE LANCEMENT POUR LA PREMIÈRE COMPÉTITION:');
      console.log('─────────────────────────────────────────────────────────────────────');
      
      try {
        // Simuler la logique de lancement
        if (testCompetition.statut !== 'Ouvert' && testCompetition.statut !== 'Brouillon') {
          console.log(`❌ Statut invalide: ${testCompetition.statut} (doit être 'Ouvert' ou 'Brouillon')`);
        }
        
        const equipesConfirmees = testCompetition.equipesInscrites?.filter(e => e.statut === 'Inscrit') || [];
        if (equipesConfirmees.length < 2) {
          console.log(`❌ Pas assez d'équipes confirmées: ${equipesConfirmees.length} (minimum 2 requis)`);
        }
        
        console.log(`✅ Équipes confirmées: ${equipesConfirmees.length}`);
        
        if (testCompetition.type === 'championnat') {
          const nbMatchs = equipesConfirmees.length * (equipesConfirmees.length - 1);
          console.log(`📅 Matchs à générer pour championnat: ${nbMatchs}`);
        } else if (testCompetition.type === 'elimination_directe') {
          const nbMatchs = Math.floor(equipesConfirmees.length / 2);
          console.log(`📅 Matchs à générer pour élimination: ${nbMatchs}`);
        }
        
      } catch (error) {
        console.log(`❌ Erreur lors du test: ${error.message}`);
      }
    }

  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Déconnecté de MongoDB');
  }
}

// Exécuter le script
testCompetitionLaunch(); 