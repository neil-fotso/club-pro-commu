require('dotenv').config();
const mongoose = require('mongoose');
const Competition = require('../models/Competition');
const User = require('../models/User');
const Club = require('../models/Club');

// Configuration MongoDB
const MONGODB_URI = process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://localhost:27017/club-pro-commu';

async function debugCompetitionLaunch() {
  try {
    console.log('🔄 Connexion à MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connecté à MongoDB');

    console.log('\n🔍 DEBUG DU LANCEMENT DE COMPÉTITION');
    console.log('═══════════════════════════════════════════════════════════════════════\n');

    // Trouver la compétition "cham" spécifiquement
    const competition = await Competition.findById('68a871d0bfb4b4290e5758df')
      .populate('createurId')
      .populate('equipesInscrites.clubId');

    if (!competition) {
      console.log('❌ Compétition "cham" non trouvée');
      return;
    }

    console.log(`🏆 COMPÉTITION: ${competition.nom}`);
    console.log('─────────────────────────────────────────────────────────────────────');
    console.log(`📝 ID: ${competition._id}`);
    console.log(`🏷️ Type: ${competition.type}`);
    console.log(`📊 Statut: ${competition.statut}`);
    console.log(`👤 Créateur: ${competition.createurId?.pseudo || 'N/A'}`);
    console.log(`🎯 Nombre d'équipes configuré: ${competition.nombreEquipes}`);
    
    console.log('\n🏟️ ÉQUIPES INSCRITES (DÉTAIL):');
    console.log('─────────────────────────────────────────────────────────────────────');
    
    if (competition.equipesInscrites && competition.equipesInscrites.length > 0) {
      competition.equipesInscrites.forEach((equipe, idx) => {
        console.log(`   ${idx + 1}. Club ID: ${equipe.clubId}`);
        console.log(`      Nom: ${equipe.clubId?.nom || 'N/A'}`);
        console.log(`      Statut: ${equipe.statut}`);
        console.log(`      Date inscription: ${equipe.dateInscription}`);
        console.log('');
      });
    } else {
      console.log('   ❌ Aucune équipe inscrite');
    }

    console.log('🔍 ANALYSE DE LA LOGIQUE DE LANCEMENT:');
    console.log('─────────────────────────────────────────────────────────────────────');
    
    // Simuler exactement la logique de lancement
    console.log('1️⃣ Vérification du statut de la compétition...');
    if (competition.statut !== 'Ouvert' && competition.statut !== 'Brouillon') {
      console.log(`   ❌ Statut invalide: ${competition.statut} (doit être 'Ouvert' ou 'Brouillon')`);
    } else {
      console.log(`   ✅ Statut valide: ${competition.statut}`);
    }

    console.log('\n2️⃣ Filtrage des équipes confirmées...');
    const equipesConfirmees = competition.equipesInscrites.filter(e => e.statut === 'Confirmé');
    console.log(`   📊 Équipes totales: ${competition.equipesInscrites?.length || 0}`);
    console.log(`   ✅ Équipes confirmées: ${equipesConfirmees.length}`);
    
    if (equipesConfirmees.length > 0) {
      console.log('   🏟️ Détail des équipes confirmées:');
      equipesConfirmees.forEach((equipe, idx) => {
        console.log(`      ${idx + 1}. ${equipe.clubId?.nom || 'Club inconnu'} (${equipe.statut})`);
      });
    }

    console.log('\n3️⃣ Vérification du minimum d\'équipes...');
    if (equipesConfirmees.length < 2) {
      console.log(`   ❌ Pas assez d'équipes: ${equipesConfirmees.length} (minimum 2 requis)`);
    } else {
      console.log(`   ✅ Suffisamment d'équipes: ${equipesConfirmees.length}`);
    }

    console.log('\n4️⃣ Test de génération des matchs...');
    if (competition.type === 'championnat') {
      const nbMatchs = equipesConfirmees.length * (equipesConfirmees.length - 1);
      console.log(`   📅 Matchs à générer pour championnat: ${nbMatchs}`);
      
      if (equipesConfirmees.length >= 2) {
        console.log('   🎯 Génération des matchs aller-retour:');
        for (let i = 0; i < equipesConfirmees.length; i++) {
          for (let j = i + 1; j < equipesConfirmees.length; j++) {
            console.log(`      Match ${i+1}-${j+1}: ${equipesConfirmees[i].clubId?.nom} vs ${equipesConfirmees[j].clubId?.nom}`);
          }
        }
      }
    }

    console.log('\n🔧 DIAGNOSTIC DU PROBLÈME:');
    console.log('─────────────────────────────────────────────────────────────────────');
    
    if (equipesConfirmees.length === 0) {
      console.log('❌ PROBLÈME IDENTIFIÉ: Aucune équipe avec statut "Confirmé"');
      console.log('   💡 Solutions possibles:');
      console.log('      1. Vérifier que les équipes ont bien le statut "Confirmé"');
      console.log('      2. Vérifier la logique de filtrage dans le code');
      console.log('      3. Vérifier que les données sont bien sauvegardées');
    } else if (equipesConfirmees.length < 2) {
      console.log('❌ PROBLÈME IDENTIFIÉ: Pas assez d\'équipes confirmées');
      console.log('   💡 Solutions possibles:');
      console.log('      1. Ajouter plus d\'équipes à la compétition');
      console.log('      2. Confirmer plus d\'équipes inscrites');
    } else {
      console.log('✅ Aucun problème détecté - La compétition devrait pouvoir être lancée');
    }

  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Déconnecté de MongoDB');
  }
}

// Exécuter le script
debugCompetitionLaunch(); 