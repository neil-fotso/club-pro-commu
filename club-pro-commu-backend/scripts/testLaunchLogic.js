require('dotenv').config();
const mongoose = require('mongoose');
const Competition = require('../models/Competition');
const User = require('../models/User');
const Club = require('../models/Club');

// Configuration MongoDB
const MONGODB_URI = process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://localhost:27017/club-pro-commu';

async function testLaunchLogic() {
  try {
    console.log('🔄 Connexion à MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connecté à MongoDB');

    console.log('\n🧪 TEST DE LA LOGIQUE DE LANCEMENT');
    console.log('═══════════════════════════════════════════════════════════════════════\n');

    // Trouver la compétition "cham"
    const competition = await Competition.findById('68a871d0bfb4b4290e5758df')
      .populate('createurId')
      .populate('equipesInscrites.clubId');

    if (!competition) {
      console.log('❌ Compétition "cham" non trouvée');
      return;
    }

    console.log(`🏆 COMPÉTITION: ${competition.nom}`);
    console.log(`🏷️ Type: ${competition.type}`);
    console.log(`📊 Statut: ${competition.statut}`);

    // Test 1: Vérification du statut
    console.log('\n1️⃣ TEST VÉRIFICATION STATUT:');
    if (competition.statut !== 'Ouvert' && competition.statut !== 'Brouillon') {
      console.log(`   ❌ Statut invalide: ${competition.statut}`);
      return;
    }
    console.log(`   ✅ Statut valide: ${competition.statut}`);

    // Test 2: Filtrage des équipes confirmées
    console.log('\n2️⃣ TEST FILTRAGE ÉQUIPES:');
    const equipesConfirmees = competition.equipesInscrites.filter(e => e.statut === 'Confirmé');
    console.log(`   📊 Équipes totales: ${competition.equipesInscrites?.length || 0}`);
    console.log(`   ✅ Équipes confirmées: ${equipesConfirmees.length}`);
    
    if (equipesConfirmees.length < 2) {
      console.log(`   ❌ Pas assez d'équipes: ${equipesConfirmees.length} (minimum 2 requis)`);
      return;
    }
    console.log(`   ✅ Suffisamment d'équipes: ${equipesConfirmees.length}`);

    // Test 3: Génération des matchs pour championnat
    console.log('\n3️⃣ TEST GÉNÉRATION MATCHS:');
    if (competition.type === 'championnat') {
      console.log('   🏅 Type championnat détecté');
      
      // Vérifier que poules[0] existe
      if (!competition.poules || competition.poules.length === 0) {
        console.log('   📋 Création de la première poule...');
        competition.poules = [{
          nom: 'Poule principale',
          equipes: [],
          matchs: []
        }];
      }
      
      if (!competition.poules[0].matchs) {
        console.log('   ⚽ Initialisation du tableau des matchs...');
        competition.poules[0].matchs = [];
      }

      console.log(`   📊 Génération de ${equipesConfirmees.length * (equipesConfirmees.length - 1)} matchs...`);
      
      try {
        // Générer tous les matchs aller-retour
        for (let i = 0; i < equipesConfirmees.length; i++) {
          for (let j = i + 1; j < equipesConfirmees.length; j++) {
            // Match aller
            const matchAller = {
              equipe1: equipesConfirmees[i].clubId,
              equipe2: equipesConfirmees[j].clubId,
              statut: 'Programmé'
            };
            competition.poules[0].matchs.push(matchAller);
            console.log(`      ✅ Match aller: ${equipesConfirmees[i].clubId.nom} vs ${equipesConfirmees[j].clubId.nom}`);
            
            // Match retour
            const matchRetour = {
              equipe1: equipesConfirmees[j].clubId,
              equipe2: equipesConfirmees[i].clubId,
              statut: 'Programmé'
            };
            competition.poules[0].matchs.push(matchRetour);
            console.log(`      ✅ Match retour: ${equipesConfirmees[j].clubId.nom} vs ${equipesConfirmees[i].clubId.nom}`);
          }
        }
        console.log(`   🎯 ${competition.poules[0].matchs.length} matchs générés avec succès`);
      } catch (error) {
        console.log(`   ❌ Erreur lors de la génération des matchs: ${error.message}`);
        return;
      }
    }

    // Test 4: Changement de statut
    console.log('\n4️⃣ TEST CHANGEMENT STATUT:');
    const ancienStatut = competition.statut;
    competition.statut = 'En cours';
    console.log(`   📊 Statut changé: ${ancienStatut} → ${competition.statut}`);

    // Test 5: Sauvegarde
    console.log('\n5️⃣ TEST SAUVEGARDE:');
    try {
      await competition.save();
      console.log('   💾 Compétition sauvegardée avec succès');
      console.log('   🎉 LANCEMENT RÉUSSI !');
    } catch (error) {
      console.log(`   ❌ Erreur lors de la sauvegarde: ${error.message}`);
      console.log(`   🔍 Détails de l'erreur:`, error);
      return;
    }

    console.log('\n✅ TOUS LES TESTS ONT RÉUSSI !');
    console.log('🚀 La compétition peut être lancée sans problème');

  } catch (error) {
    console.error('❌ Erreur générale:', error);
    console.error('🔍 Stack trace:', error.stack);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Déconnecté de MongoDB');
  }
}

// Exécuter le script
testLaunchLogic(); 