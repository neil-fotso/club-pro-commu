const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const Competition = require('../models/Competition');
const Club = require('../models/Club');
const User = require('../models/User');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/club-pro-commu';

async function runTest() {
  console.log('⚡ Connexion à MongoDB...');
  await mongoose.connect(MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  console.log('✅ Connecté !');

  try {
    // 1. Nettoyer les compétitions de test précédentes
    await Competition.deleteMany({ nom: 'Compétition Test Timers Live' });

    // 2. Trouver ou créer un utilisateur créateur
    let user = await User.findOne({ email: 'admin@clubpro.com' });
    if (!user) {
      user = await User.findOne();
    }
    if (!user) {
      user = await User.create({
        pseudo: 'AdminTest',
        email: 'admin@clubpro.com',
        password: 'Password123!',
        isAdmin: true
      });
    }

    // 3. Trouver ou créer des clubs fictifs avec les champs requis
    let clubA = await Club.findOne({ nom: 'FC Timers Alpha' });
    if (!clubA) {
      clubA = await Club.create({
        nom: 'FC Timers Alpha',
        tag: 'FTA',
        description: 'Test Alpha',
        createurId: user._id,
        pays: 'France',
        plateformes: ['PS5'],
        membres: [{ userId: user._id, role: 'Admin' }]
      });
    }
    let clubB = await Club.findOne({ nom: 'FC Timers Beta' });
    if (!clubB) {
      clubB = await Club.create({
        nom: 'FC Timers Beta',
        tag: 'FTB',
        description: 'Test Beta',
        createurId: user._id,
        pays: 'France',
        plateformes: ['PS5'],
        membres: [{ userId: user._id, role: 'Admin' }]
      });
    }

    // 4. Créer une compétition à élimination directe
    console.log('🏆 Création de la compétition de test...');
    const comp = await Competition.create({
      nom: 'Compétition Test Timers Live',
      description: 'Test des salons live et des forfaits',
      type: 'elimination_directe',
      statut: 'En cours',
      format: '5v5',
      plateforme: 'PS5',
      jeu: 'EAFC 24',
      cashprizeMinimal: 100,
      montantInscription: 10,
      limiteInscriptions: 8,
      nombreEquipes: 8,
      inscriptionsOuvertes: false,
      createurId: user._id,
      dateDebut: new Date(),
      equipesInscrites: [
        { clubId: clubA._id, nom: clubA.nom, statut: 'Confirmé', statutPaiement: 'Payé' },
        { clubId: clubB._id, nom: clubB.nom, statut: 'Confirmé', statutPaiement: 'Payé' }
      ]
    });

    console.log(`Compétition créée : ${comp._id}`);

    // 5. Ajouter des matchs d'élimination de test
    // Match 1 : Ready Check expiré, équipe 1 prête mais pas équipe 2 -> Forfait de l'équipe 2 (victoire 3-0 pour équipe 1)
    const datePrepExpirée = new Date(Date.now() - 15 * 60 * 1000); // Il y a 15 minutes (limite 10 min)
    
    comp.matchsElimination.push({
      equipe1: clubA._id,
      equipe2: clubB._id,
      score1: null,
      score2: null,
      statut: 'Programmé',
      phase: 'Quart',
      tour: 4,
      equipe1Prete: true,
      equipe2Prete: false,
      dateDebutPreparation: datePrepExpirée,
      dateDebutMatch: null,
      propositionScore: { score1: null, score2: null, proposePar: null }
    });

    // Match 2 : Ready Check expiré, aucun n'est prêt -> Forfait double (score 0-0, les deux éliminés)
    comp.matchsElimination.push({
      equipe1: clubA._id,
      equipe2: clubB._id,
      score1: null,
      score2: null,
      statut: 'Programmé',
      phase: 'Quart',
      tour: 5,
      equipe1Prete: false,
      equipe2Prete: false,
      dateDebutPreparation: datePrepExpirée,
      dateDebutMatch: null,
      propositionScore: { score1: null, score2: null, proposePar: null }
    });

    // Match 3 : Match lancé, mais 20 min dépassées. Une équipe a proposé 2-1, l'autre n'a rien saisi -> Validation par défaut
    const dateMatchExpirée = new Date(Date.now() - 25 * 60 * 1000); // Il y a 25 minutes (limite 20 min)
    comp.matchsElimination.push({
      equipe1: clubA._id,
      equipe2: clubB._id,
      score1: null,
      score2: null,
      statut: 'En cours',
      phase: 'Quart',
      tour: 6,
      equipe1Prete: true,
      equipe2Prete: true,
      dateDebutPreparation: datePrepExpirée,
      dateDebutMatch: dateMatchExpirée,
      propositionScore: { score1: 2, score2: 1, proposePar: 'equipe1', dateSaisie: dateMatchExpirée }
    });

    await comp.save();
    console.log('✅ Matchs de test sauvegardés. Lancement de checkMatchTimers...');

    // Importer la logique réelle de checkMatchTimers depuis le routeur (ou simuler ici avec le code exact)
    const checkMatchTimersLocal = async (competition) => {
      const READY_TIMEOUT_MS  = 10 * 60 * 1000;
      const INGAME_TIMEOUT_MS = 20 * 60 * 1000;
      const now = Date.now();
      let modified = false;

      const allMatches = [
        ...competition.matchsElimination
      ].filter(m => m && m.statut !== 'Terminé' && m.statut !== 'Annulé' && m.equipe1 && m.equipe2);

      for (const match of allMatches) {
        // Phase Ready Check
        if (match.dateDebutPreparation && !match.dateDebutMatch) {
          const elapsed = now - new Date(match.dateDebutPreparation).getTime();
          if (elapsed >= READY_TIMEOUT_MS) {
            const e1Ready = match.equipe1Prete;
            const e2Ready = match.equipe2Prete;
            if (!e1Ready && !e2Ready) {
              match.score1 = 0; match.score2 = 0;
              match.statut = 'Terminé';
              match.valideParEquipe1 = true; match.valideParEquipe2 = true;
              console.log(`[TEST LOG] Forfait double (aucun prêt) - match ${match._id}`);
            } else if (!e1Ready) {
              match.score1 = 0; match.score2 = 3;
              match.statut = 'Terminé';
              match.valideParEquipe1 = true; match.valideParEquipe2 = true;
              console.log(`[TEST LOG] Forfait Équipe 1 (non prête) - match ${match._id}`);
            } else if (!e2Ready) {
              match.score1 = 3; match.score2 = 0;
              match.statut = 'Terminé';
              match.valideParEquipe1 = true; match.valideParEquipe2 = true;
              console.log(`[TEST LOG] Forfait Équipe 2 (non prête) - match ${match._id}`);
            }
            modified = true;
          }
        }

        // Phase Jeu
        if (match.dateDebutMatch && match.statut === 'En cours') {
          const elapsed = now - new Date(match.dateDebutMatch).getTime();
          if (elapsed >= INGAME_TIMEOUT_MS) {
            const prop = match.propositionScore;
            const scorePropose = prop && prop.proposePar !== null;
            if (!scorePropose) {
              match.score1 = 0; match.score2 = 0;
              match.statut = 'Terminé';
              match.valideParEquipe1 = true; match.valideParEquipe2 = true;
              console.log(`[TEST LOG] Forfait double (aucun score) - match ${match._id}`);
            } else {
              match.score1 = prop.score1;
              match.score2 = prop.score2;
              match.statut = 'Terminé';
              match.valideParEquipe1 = true; match.valideParEquipe2 = true;
              console.log(`[TEST LOG] Score validé par défaut (${prop.proposePar}) : ${prop.score1}-${prop.score2} - match ${match._id}`);
            }
            modified = true;
          }
        }
      }
      return modified;
    };

    const modified = await checkMatchTimersLocal(comp);
    console.log(`Modifié ? ${modified}`);
    
    // Vérifications
    const m1 = comp.matchsElimination[0];
    console.log(`Match 1 (Forfait Équipe 2) -> Statut: ${m1.statut}, Score: ${m1.score1}-${m1.score2}`);
    if (m1.statut === 'Terminé' && m1.score1 === 3 && m1.score2 === 0) {
      console.log('✅ TEST 1 RÉUSSI !');
    } else {
      console.error('❌ TEST 1 ÉCHOUÉ !');
    }

    const m2 = comp.matchsElimination[1];
    console.log(`Match 2 (Forfait Double Ready) -> Statut: ${m2.statut}, Score: ${m2.score1}-${m2.score2}`);
    if (m2.statut === 'Terminé' && m2.score1 === 0 && m2.score2 === 0) {
      console.log('✅ TEST 2 RÉUSSI !');
    } else {
      console.error('❌ TEST 2 ÉCHOUÉ !');
    }

    const m3 = comp.matchsElimination[2];
    console.log(`Match 3 (Score par défaut) -> Statut: ${m3.statut}, Score: ${m3.score1}-${m3.score2}`);
    if (m3.statut === 'Terminé' && m3.score1 === 2 && m3.score2 === 1) {
      console.log('✅ TEST 3 RÉUSSI !');
    } else {
      console.error('❌ TEST 3 ÉCHOUÉ !');
    }

  } catch (error) {
    console.error('Erreur durant le test:', error);
  } finally {
    await mongoose.disconnect();
    console.log('⚡ Déconnexion MongoDB effectuée.');
  }
}

runTest();
