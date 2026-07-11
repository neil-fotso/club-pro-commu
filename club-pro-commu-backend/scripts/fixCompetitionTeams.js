require('dotenv').config();
const mongoose = require('mongoose');
const Competition = require('../models/Competition');

// Configuration MongoDB
const MONGODB_URI = process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://localhost:27017/club-pro-commu';

async function fixCompetitionTeams() {
  try {
    console.log('🔄 Connexion à MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connecté à MongoDB');

    console.log('\n🔧 CORRECTION DES STATUTS DES ÉQUIPES');
    console.log('═══════════════════════════════════════════════════════════════════════\n');

    // Trouver toutes les compétitions avec des équipes inscrites
    const competitions = await Competition.find({
      'equipesInscrites.0': { $exists: true }
    });

    if (competitions.length === 0) {
      console.log('❌ Aucune compétition avec des équipes inscrites trouvée');
      return;
    }

    console.log(`📊 ${competitions.length} compétition(s) avec équipes inscrites trouvée(s)\n`);

    for (const competition of competitions) {
      console.log(`🏆 COMPÉTITION: ${competition.nom} (${competition.statut})`);
      console.log('─────────────────────────────────────────────────────────────────────');
      
      const equipesInscrites = competition.equipesInscrites || [];
      console.log(`👥 Équipes inscrites: ${equipesInscrites.length}`);
      
      let updated = false;
      
      for (let i = 0; i < equipesInscrites.length; i++) {
        const equipe = equipesInscrites[i];
        console.log(`   ${i + 1}. ${equipe.clubId} - Statut: ${equipe.statut}`);
        
        // Si le statut est "Inscrit", le changer en "Confirmé"
        if (equipe.statut === 'Inscrit') {
          competition.equipesInscrites[i].statut = 'Confirmé';
          updated = true;
          console.log(`      ✅ Changé en "Confirmé"`);
        }
      }
      
      if (updated) {
        try {
          await competition.save();
          console.log(`   💾 Compétition mise à jour avec succès`);
        } catch (error) {
          console.log(`   ❌ Erreur lors de la sauvegarde: ${error.message}`);
        }
      } else {
        console.log(`   ℹ️ Aucune modification nécessaire`);
      }
      
      console.log('');
    }

    console.log('🎉 CORRECTION TERMINÉE !');
    console.log('─────────────────────────────────────────────────────────────────────');
    console.log('✅ Toutes les équipes avec statut "Inscrit" ont été changées en "Confirmé"');
    console.log('🚀 Les compétitions peuvent maintenant être lancées');

  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Déconnecté de MongoDB');
  }
}

// Exécuter le script
fixCompetitionTeams(); 