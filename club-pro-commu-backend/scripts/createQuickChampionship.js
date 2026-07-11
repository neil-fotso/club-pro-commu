require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const Player = require('../models/Player');
const Club = require('../models/Club');
const Competition = require('../models/Competition');

const createQuickChampionship = async () => {
  try {
    console.log('🔄 Connexion à MongoDB...');
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/club-pro-commu');
    
    console.log('⚡ CRÉATION RAPIDE D\'UN CHAMPIONNAT DE TEST\n');
    console.log('═══════════════════════════════════════════════════════════════════════════\n');

    // Nettoyer d'abord TOUT
    await Competition.deleteMany({});
    await Club.deleteMany({});
    await Player.deleteMany({});
    await User.deleteMany({ email: { $regex: /@test\.com/ } });
    
    console.log('🧹 Toutes les données de test nettoyées');

    // Créer un créateur simple
    const timestamp = Date.now();
    const creator = new User({
      nom: 'Test',
      prenom: 'Creator',
      pseudo: `Creator${timestamp}`.substring(0, 20),
      email: `creator${timestamp}@test.com`,
      password: 'Password123!',
      pays: 'France',
      ville: 'Paris',
      isAdmin: false
    });
    await creator.save();

    const clubs = [];
    const players = [];
    const clubNames = [`TeamA${timestamp}`, `TeamB${timestamp}`, `TeamC${timestamp}`, `TeamD${timestamp}`, `TeamE${timestamp}`, `TeamF${timestamp}`, `TeamG${timestamp}`, `TeamH${timestamp}`].map(name => name.substring(0, 20));
    const positions = ['Attaquant', 'Milieu', 'Défenseur', 'Gardien'];
    const postes = { 'Attaquant': 'BU', 'Milieu': 'MC', 'Défenseur': 'DC', 'Gardien': 'GB' };

    // Créer 8 clubs avec 4 joueurs chacun
    for (let i = 0; i < 8; i++) {
      const club = new Club({
        nom: clubNames[i],
        createurId: creator._id,
        plateformes: ['PS5', 'Xbox', 'PC'],
        description: `Club de test ${clubNames[i]}`,
        ville: 'Paris',
        pays: 'France',
        recrute: true,
        postesRecherches: positions,
        effectifMax: 11,
        effectifActuel: 0,
        membres: []
      });
      await club.save();
      clubs.push(club);

      for (let j = 0; j < 4; j++) {
        const user = new User({
          nom: `User${i}${j}`,
          prenom: 'Test',
          pseudo: `Player${i}${j}${timestamp}`.substring(0, 20),
          email: `player${i}${j}${timestamp}@test.com`,
          password: 'Password123!',
          pays: 'France',
          ville: 'Paris',
          isAdmin: false
        });
        await user.save();

        const player = new Player({
          userId: user._id,
          pseudo: `Player${i}${j}${timestamp}`.substring(0, 20),
          plateforme: 'PS5',
          pseudoPlateforme: `Player${i}${j}${timestamp}`.substring(0, 20),
          position: positions[j],
          postePrincipal: postes[positions[j]],
          niveau: 80,
          disponibilite: 'Disponible',
          clubs: [{
            clubId: club._id,
            role: j === 0 ? 'Admin' : 'Joueur',
            dateAdhesion: new Date(),
            statut: 'Actif'
          }],
          statistiques: {
            matchsJoues: 0, victoires: 0, defaites: 0, nuls: 0,
            butsMarques: 0, passesDecisives: 0, cartonJaunes: 0, cartonRouges: 0, tempsJeu: 0
          }
        });
        await player.save();
        players.push(player);

        club.membres.push({
          userId: user._id,
          playerId: player._id,
          role: j === 0 ? 'Admin' : 'Joueur',
          dateAdhesion: new Date()
        });
      }

      club.effectifActuel = 4;
      await club.save();
      console.log(`✅ ${club.nom} créé avec 4 joueurs`);
    }

    // Créer la compétition
    const competition = new Competition({
      nom: 'Championnat Test 2024',
      description: 'Compétition de test avec poules et élimination',
      type: 'poule_elimination',
      modeMatch: 'simple',
      nombreEquipes: 8,
      nombreEquipesParPoule: 4,
      nombreQualifiesParPoule: 2,
      statut: 'En cours',
      dateDebut: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      dateFin: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
      dateInscription: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      createurId: creator._id,
      equipesInscrites: clubs.map(club => ({ clubId: club._id, dateInscription: new Date(), statut: 'Confirmé' })),
      poules: [],
      matchsElimination: [],
      reglement: 'Poules puis élimination',
      dotation: 1000,
      fraisInscription: 0
    });

    // Créer les poules
    const pouleA = {
      nom: 'Poule A',
      equipes: [clubs[0]._id, clubs[1]._id, clubs[2]._id, clubs[3]._id],
      matchs: [],
      classement: []
    };

    const pouleB = {
      nom: 'Poule B',
      equipes: [clubs[4]._id, clubs[5]._id, clubs[6]._id, clubs[7]._id],
      matchs: [],
      classement: []
    };

    // Générer matchs de poules avec scores
    [pouleA, pouleB].forEach(poule => {
      for (let i = 0; i < 4; i++) {
        for (let j = i + 1; j < 4; j++) {
          const match = {
            equipe1: poule.equipes[i],
            equipe2: poule.equipes[j],
            date: new Date(Date.now() - Math.random() * 3 * 24 * 60 * 60 * 1000),
            statut: 'Terminé',
            score1: Math.floor(Math.random() * 4) + 1,
            score2: Math.floor(Math.random() * 4) + 1,
            stats: { buteurs: [], passeurs: [], cartons: [] }
          };

          // Ajouter des buteurs
          for (let b = 0; b < match.score1 + match.score2; b++) {
            const equipe = b < match.score1 ? match.equipe1 : match.equipe2;
            const teamPlayers = players.filter(p => p.clubs.some(c => c.clubId.toString() === equipe.toString()));
            if (teamPlayers.length > 0) {
              const buteur = teamPlayers[Math.floor(Math.random() * teamPlayers.length)];
              match.stats.buteurs.push({
                joueur: buteur.pseudo,
                equipe: equipe,
                minute: Math.floor(Math.random() * 90) + 1
              });
            }
          }

          poule.matchs.push(match);
        }
      }

      // Calculer classement
      const classement = poule.equipes.map(equipeId => ({
        equipe: equipeId,
        points: 0, matchsJoues: 0, victoires: 0, nuls: 0, defaites: 0,
        butsMarques: 0, butsEncaisses: 0, goalAverage: 0
      }));

      poule.matchs.forEach(match => {
        const eq1 = classement.find(c => c.equipe.toString() === match.equipe1.toString());
        const eq2 = classement.find(c => c.equipe.toString() === match.equipe2.toString());
        
        eq1.matchsJoues++; eq2.matchsJoues++;
        eq1.butsMarques += match.score1; eq1.butsEncaisses += match.score2;
        eq2.butsMarques += match.score2; eq2.butsEncaisses += match.score1;

        if (match.score1 > match.score2) {
          eq1.points += 3; eq1.victoires++; eq2.defaites++;
        } else if (match.score1 < match.score2) {
          eq2.points += 3; eq2.victoires++; eq1.defaites++;
        } else {
          eq1.points += 1; eq2.points += 1; eq1.nuls++; eq2.nuls++;
        }
      });

      classement.forEach(c => c.goalAverage = c.butsMarques - c.butsEncaisses);
      classement.sort((a, b) => b.points - a.points || b.goalAverage - a.goalAverage);
      poule.classement = classement;
    });

    competition.poules = [pouleA, pouleB];

    // Créer matchs élimination
    const q1 = pouleA.classement[0].equipe; // 1er A
    const q2 = pouleA.classement[1].equipe; // 2e A
    const q3 = pouleB.classement[0].equipe; // 1er B
    const q4 = pouleB.classement[1].equipe; // 2e B

    competition.matchsElimination = [
      { equipe1: q1, equipe2: q4, date: new Date(Date.now() + 24 * 60 * 60 * 1000), phase: 'Demi', statut: 'Programmé' },
      { equipe1: q3, equipe2: q2, date: new Date(Date.now() + 24 * 60 * 60 * 1000), phase: 'Demi', statut: 'Programmé' },
      { equipe1: null, equipe2: null, date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), phase: 'Petite finale', statut: 'Programmé' },
      { equipe1: null, equipe2: null, date: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000), phase: 'Finale', statut: 'Programmé' }
    ];

    // Calculer stats
    let totalButs = 0;
    const buteursStats = {};
    
    competition.poules.forEach(poule => {
      poule.matchs.forEach(match => {
        totalButs += match.score1 + match.score2;
        match.stats.buteurs.forEach(b => {
          buteursStats[b.joueur] = (buteursStats[b.joueur] || 0) + 1;
        });
      });
    });

    const topButeur = Object.entries(buteursStats).reduce((a, b) => buteursStats[a[0]] > buteursStats[b[0]] ? a : b, ['', 0]);

    competition.statistiques = {
      totalMatchs: 16, matchsTermines: 12, matchsEnCours: 0, matchsEnLitige: 0,
      tauxCompletion: 75, nombreEquipes: 8, totalButs: totalButs, totalPasses: 0,
      meilleurButeur: { joueur: topButeur[0], buts: topButeur[1], club: null },
      meilleurPasseur: null,
      meilleurJoueur: { joueur: topButeur[0], club: null }
    };

    await competition.save();

    console.log('\n🎉 CHAMPIONNAT CRÉÉ AVEC SUCCÈS !');
    console.log('─'.repeat(50));
    console.log(`🏆 ${competition.nom}`);
    console.log(`🏟️ ${clubs.length} clubs créés`);
    console.log(`👤 ${players.length} joueurs créés`);
    console.log(`⚽ ${totalButs} buts marqués`);
    console.log(`📊 ${competition.statistiques.matchsTermines}/${competition.statistiques.totalMatchs} matchs terminés`);

    console.log('\n🔑 COMPTES DE TEST :');
    for (let i = 0; i < clubs.length; i++) {
      console.log(`📧 player${i}0@test.com / Password123! (Admin ${clubs[i].nom})`);
    }

    console.log('\n🎮 POUR TESTER :');
    console.log('1. 🌐 http://localhost:3002');
    console.log('2. 🔑 Connectez-vous avec un compte ci-dessus');
    console.log(`3. 🏆 Allez dans "Compétitions" → "${competition.nom}"`);
    console.log('4. 📊 Explorez : Calendrier, Classements, Statistiques');

    console.log(`\n📝 ID : ${competition._id}`);

    return { competition, clubs, players };

  } catch (error) {
    console.error('❌ Erreur :', error);
  } finally {
    await mongoose.disconnect();
  }
};

if (require.main === module) {
  createQuickChampionship();
}

module.exports = createQuickChampionship; 