require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const Competition = require('../models/Competition');
const Club = require('../models/Club');

const createMixedCompetition = async () => {
  try {
    console.log('🔄 Connexion à MongoDB...');
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/club-pro-commu');
    
    console.log('🏆 CRÉATION COMPÉTITION MIXTE : GROUPES + ÉLIMINATION\n');
    console.log('═══════════════════════════════════════════════════════════════════════════\n');
    
    // Récupérer un admin pour créer la compétition
    const admin = await User.findOne({ isAdmin: true });
    if (!admin) {
      console.log('❌ Aucun admin trouvé');
      return;
    }
    
    console.log(`👤 Créateur: ${admin.pseudo} (Admin)`);
    
    // Récupérer 8 clubs existants
    const clubs = await Club.find().limit(8);
    if (clubs.length < 8) {
      console.log(`❌ Pas assez de clubs (trouvés: ${clubs.length}, requis: 8)`);
      return;
    }
    
    console.log(`🏟️ Clubs sélectionnés: ${clubs.length}`);
    clubs.forEach((club, i) => {
      console.log(`   ${i + 1}. ${club.nom}`);
    });
    
    // Créer la compétition mixte
    const competition = new Competition({
      nom: 'Champions League Simulator',
      description: 'Compétition avec phases de groupes suivies d\'élimination directe - Test complet du système',
      type: 'poule_elimination', // Type mixte : poules puis élimination
      modeMatch: 'simple',
      jeu: 'FC 25',
      plateforme: 'Cross-Platform',
      nombreEquipesMax: 8,
      nombreEquipesMin: 8,
      dateDebut: new Date(),
      dateFin: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 jours
      dateFinInscriptions: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 jours
      statut: 'En cours',
      createurId: admin._id,
      
      // Configuration des règles
      regles: {
        victoire: 3,
        nul: 1,
        defaite: 0,
        dureeMatch: 90,
        prolongations: false,
        tirs_au_but: true
      },
      
      // Récompenses
      recompenses: {
        champion: '🏆 Champion de la Champions League',
        finaliste: '🥈 Finaliste Champions League',
        troisieme: '🥉 3ème place Champions League',
        meilleurJoueur: '🎖️ Meilleur joueur de la compétition',
        meilleurButeur: '🎯 Meilleur buteur de la compétition'
      },
      
      // Inscrire automatiquement les 8 clubs
      equipesInscrites: clubs.map(club => ({
        clubId: club._id,
        dateInscription: new Date(),
        statut: 'Confirmé'
      })),
      
      // Créer 2 poules de 4 équipes chacune
      poules: [
        {
          nom: 'Groupe A',
          equipes: [clubs[0]._id, clubs[1]._id, clubs[2]._id, clubs[3]._id],
          matchs: []
        },
        {
          nom: 'Groupe B', 
          equipes: [clubs[4]._id, clubs[5]._id, clubs[6]._id, clubs[7]._id],
          matchs: []
        }
      ],
      
      // Pas de matchs d'élimination pour l'instant (créés après phases de groupes)
      matchsElimination: [],
      
      // Statistiques vides
      statistiques: {
        meilleurButeur: null,
        meilleurPasseur: null,
        meilleurJoueur: null,
        totalMatchs: 0,
        totalButs: 0
      }
    });
    
    console.log('\n📋 STRUCTURE DE LA COMPÉTITION:');
    console.log(`   📛 Nom: ${competition.nom}`);
    console.log(`   🎮 Type: ${competition.type}`);
    console.log(`   👥 Équipes: ${competition.equipesInscrites.length}`);
    console.log(`   🏟️ Poules: ${competition.poules.length}`);
    
    // Générer les matchs de phases de groupes
    console.log('\n🔄 GÉNÉRATION DES MATCHS DE GROUPES...');
    
    competition.poules.forEach((poule, pouleIndex) => {
      console.log(`\n📊 ${poule.nom} (${poule.equipes.length} équipes):`);
      
      // Générer tous les matchs possibles dans la poule (round-robin)
      for (let i = 0; i < poule.equipes.length; i++) {
        for (let j = i + 1; j < poule.equipes.length; j++) {
          const match = {
            equipe1: poule.equipes[i],
            equipe2: poule.equipes[j],
            score1: null,
            score2: null,
            dateMatch: new Date(Date.now() + (pouleIndex * 6 + poule.matchs.length + 1) * 24 * 60 * 60 * 1000),
            statut: 'Programmé',
            valideParEquipe1: false,
            valideParEquipe2: false,
            captureEcran: null,
            stats: {
              buteurs: [],
              passeurs: [],
              cartonsJaunes: [],
              cartonsRouges: []
            },
            litige: false,
            arbitre: null
          };
          
          poule.matchs.push(match);
          console.log(`   Match ${poule.matchs.length}: ${clubs[clubs.findIndex(c => c._id.equals(poule.equipes[i]))].nom} vs ${clubs[clubs.findIndex(c => c._id.equals(poule.equipes[j]))].nom}`);
        }
      }
      
      console.log(`   ✅ ${poule.matchs.length} matchs générés pour ${poule.nom}`);
    });
    
    // Sauvegarder la compétition
    await competition.save();
    
    console.log('\n✅ COMPÉTITION CRÉÉE AVEC SUCCÈS !');
    console.log('\n📊 RÉSUMÉ:');
    console.log(`   🆔 ID: ${competition._id}`);
    console.log(`   📛 Nom: ${competition.nom}`);
    console.log(`   🎮 Type: Phases de groupes + Élimination directe`);
    console.log(`   👥 Équipes inscrites: ${competition.equipesInscrites.length}`);
    console.log(`   🏟️ Poules: ${competition.poules.length}`);
    
    let totalMatchsGroupes = 0;
    competition.poules.forEach(poule => {
      totalMatchsGroupes += poule.matchs.length;
    });
    console.log(`   ⚽ Matchs de groupes: ${totalMatchsGroupes}`);
    console.log(`   🏆 Matchs d'élimination: À générer après groupes`);
    
    console.log('\n🎯 PROCHAINES ÉTAPES:');
    console.log('   1. Simuler les matchs de phases de groupes');
    console.log('   2. Calculer les classements de chaque groupe');
    console.log('   3. Qualifier les équipes pour l\'élimination directe');
    console.log('   4. Générer et jouer les matchs d\'élimination');
    console.log('   5. Vérifier l\'affichage frontend complet');
    
    console.log('\n🚀 POUR VOIR LA COMPÉTITION:');
    console.log('   1. Allez sur http://localhost:3002');
    console.log('   2. Liste des compétitions');
    console.log('   3. Ouvrez "Champions League Simulator"');
    console.log('   4. Vérifiez les onglets Groupes + Calendrier');
    
    return competition._id;
    
  } catch (error) {
    console.error('❌ Erreur lors de la création:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Déconnexion MongoDB');
  }
};

if (require.main === module) {
  createMixedCompetition();
}

module.exports = createMixedCompetition; 