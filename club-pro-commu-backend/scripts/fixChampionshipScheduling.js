require('dotenv').config();
const mongoose = require('mongoose');
const Competition = require('../models/Competition');
const Club = require('../models/Club');

// Configuration MongoDB
const MONGODB_URI = process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://localhost:27017/club-pro-commu';

// Fonction pour planifier intelligemment les journées du championnat
function planifierJourneesChampionnat(matchs, nombreEquipes) {
  const matchsPlanifies = [];
  const matchsParJournee = Math.floor(nombreEquipes / 2);
  const nombreJourneesAller = nombreEquipes - 1;
  
  // Créer une copie des matchs pour éviter les modifications accidentelles
  const matchsACopier = JSON.parse(JSON.stringify(matchs));
  
  // Réinitialiser tous les matchs
  matchsACopier.forEach(match => {
    match.journee = null;
    match.dateMatch = null;
  });
  
  // Planifier les matchs aller
  for (let journee = 1; journee <= nombreJourneesAller; journee++) {
    const matchsJournee = [];
    const equipesUtilisees = new Set();
    
    // Prendre les matchs non encore planifiés
    for (const match of matchsACopier) {
      if (matchsJournee.length >= matchsParJournee) break;
      
      // Vérifier qu'aucune des deux équipes n'a déjà joué cette journée
      if (!equipesUtilisees.has(match.equipe1.toString()) && 
          !equipesUtilisees.has(match.equipe2.toString()) &&
          !match.journee) {
        
        match.journee = journee;
        match.dateMatch = new Date(Date.now() + (journee - 1) * 7 * 24 * 60 * 60 * 1000); // 7 jours entre chaque journée
        matchsJournee.push(match);
        equipesUtilisees.add(match.equipe1.toString());
        equipesUtilisees.add(match.equipe2.toString());
      }
    }
    
    matchsPlanifies.push(...matchsJournee);
  }
  
  // Planifier les matchs retour (après les matchs aller)
  for (let journee = 1; journee <= nombreJourneesAller; journee++) {
    const matchsJournee = [];
    const equipesUtilisees = new Set();
    
    // Prendre les matchs retour non encore planifiés
    for (const match of matchsACopier) {
      if (matchsJournee.length >= matchsParJournee) break;
      
      // Vérifier qu'aucune des deux équipes n'a déjà joué cette journée
      if (!equipesUtilisees.has(match.equipe1.toString()) && 
          !equipesUtilisees.has(match.equipe2.toString()) &&
          !match.journee) {
        
        match.journee = nombreJourneesAller + journee;
        match.dateMatch = new Date(Date.now() + (nombreJourneesAller + journee - 1) * 7 * 24 * 60 * 60 * 1000);
        matchsJournee.push(match);
        equipesUtilisees.add(match.equipe1.toString());
        equipesUtilisees.add(match.equipe2.toString());
      }
    }
    
    matchsPlanifies.push(...matchsJournee);
  }
  
  return matchsPlanifies;
}

async function fixChampionshipScheduling() {
  try {
    console.log('🔄 Connexion à MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connecté à MongoDB');

    console.log('\n🔧 CORRECTION DE LA PLANIFICATION DU CHAMPIONNAT');
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
    console.log(`👥 Équipes: ${competition.equipesInscrites.length}`);

    if (competition.type !== 'championnat') {
      console.log('❌ Cette compétition n\'est pas un championnat');
      return;
    }

    // Vérifier l'état actuel des matchs
    console.log('\n📊 ÉTAT ACTUEL DES MATCHS:');
    console.log('─────────────────────────────────────────────────────────────────────');
    
    if (competition.poules && competition.poules.length > 0) {
      const poule = competition.poules[0];
      console.log(`📋 ${poule.nom}: ${poule.matchs?.length || 0} matchs`);
      
      if (poule.matchs && poule.matchs.length > 0) {
        // Analyser les conflits de planification
        const equipesParJournee = {};
        const conflits = [];
        
        poule.matchs.forEach((match, index) => {
          const journee = match.journee || 'Non planifié';
          if (!equipesParJournee[journee]) equipesParJournee[journee] = [];
          
          equipesParJournee[journee].push({
            match: index + 1,
            equipe1: match.equipe1?.nom || 'TBD',
            equipe2: match.equipe2?.nom || 'TBD',
            statut: match.statut
          });
          
          // Vérifier les conflits
          if (journee !== 'Non planifié') {
            const equipesJournee = equipesParJournee[journee];
            const equipesUtilisees = new Set();
            
            equipesJournee.forEach(m => {
              if (m.equipe1 !== 'TBD') equipesUtilisees.add(m.equipe1);
              if (m.equipe2 !== 'TBD') equipesUtilisees.add(m.equipe2);
            });
            
            if (equipesUtilisees.size !== equipesJournee.length * 2) {
              conflits.push({
                journee,
                matchs: equipesJournee,
                probleme: 'Équipe qui joue plusieurs fois dans la même journée'
              });
            }
          }
        });
        
        // Afficher les conflits
        if (conflits.length > 0) {
          console.log('⚠️ CONFLITS DÉTECTÉS:');
          conflits.forEach(conflit => {
            console.log(`   Journée ${conflit.journee}:`);
            conflit.matchs.forEach(m => {
              console.log(`     Match ${m.match}: ${m.equipe1} vs ${m.equipe2}`);
            });
            console.log(`     Problème: ${conflit.probleme}`);
            console.log('');
          });
        } else {
          console.log('✅ Aucun conflit détecté dans la planification actuelle');
        }
      }
    }

    // Corriger la planification
    console.log('\n🔄 CORRECTION DE LA PLANIFICATION:');
    console.log('─────────────────────────────────────────────────────────────────────');
    
    if (competition.poules && competition.poules.length > 0) {
      const poule = competition.poules[0];
      const nombreEquipes = competition.equipesInscrites.length;
      
      console.log(`📅 Réorganisation de ${poule.matchs.length} matchs pour ${nombreEquipes} équipes`);
      console.log(`🎯 ${Math.floor(nombreEquipes / 2)} matchs par journée`);
      console.log(`📆 ${(nombreEquipes - 1) * 2} journées totales (aller + retour)`);
      
      // Réorganiser les matchs
      const matchsReorganises = planifierJourneesChampionnat(poule.matchs, nombreEquipes);
      
      // Mettre à jour la poule
      poule.matchs = matchsReorganises;
      
      console.log('✅ Planification corrigée !');
    }

    // Afficher la nouvelle planification
    console.log('\n📅 NOUVELLE PLANIFICATION:');
    console.log('─────────────────────────────────────────────────────────────────────');
    
    if (competition.poules && competition.poules.length > 0) {
      const poule = competition.poules[0];
      
      // Grouper par journée
      const matchsParJournee = {};
      poule.matchs.forEach(match => {
        const journee = match.journee || 'Non planifié';
        if (!matchsParJournee[journee]) matchsParJournee[journee] = [];
        matchsParJournee[journee].push(match);
      });
      
      // Afficher par journée
      Object.keys(matchsParJournee).sort((a, b) => {
        if (a === 'Non planifié') return 1;
        if (b === 'Non planifié') return -1;
        return parseInt(a) - parseInt(b);
      }).forEach(journee => {
        const matchs = matchsParJournee[journee];
        if (journee === 'Non planifié') {
          console.log(`❓ ${journee}: ${matchs.length} matchs`);
        } else {
          const isRetour = parseInt(journee) > (competition.equipesInscrites.length - 1);
          const label = isRetour ? `Journée ${parseInt(journee) - (competition.equipesInscrites.length - 1)} (Retour)` : `Journée ${journee} (Aller)`;
          console.log(`📅 ${label}: ${matchs.length} matchs`);
          
          matchs.forEach((match, index) => {
            const date = match.dateMatch ? new Date(match.dateMatch).toLocaleDateString('fr-FR') : 'Non définie';
            console.log(`   ${index + 1}. ${match.equipe1?.nom || 'TBD'} vs ${match.equipe2?.nom || 'TBD'} - ${date}`);
          });
        }
        console.log('');
      });
    }

    // Sauvegarder
    console.log('💾 Sauvegarde des modifications...');
    await competition.save();
    console.log('✅ Compétition sauvegardée avec succès');

    console.log('\n🎉 CORRECTION TERMINÉE !');
    console.log('─────────────────────────────────────────────────────────────────────');
    console.log('✅ Planification des journées corrigée');
    console.log('✅ Aucune équipe ne joue 2 fois dans la même journée');
    console.log('✅ Dates des matchs planifiées intelligemment');
    console.log('🚀 Le calendrier est maintenant cohérent et réaliste');

  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Déconnecté de MongoDB');
  }
}

// Exécuter le script
fixChampionshipScheduling(); 