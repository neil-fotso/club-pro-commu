require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Player = require('../models/Player');
const Club = require('../models/Club');
const Competition = require('../models/Competition');

const createSimpleTestChampionship = async () => {
  try {
    console.log('🔄 Connexion à MongoDB...');
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/club-pro-commu');
    
    console.log('🏆 CRÉATION D\'UN CHAMPIONNAT DE TEST SIMPLIFIÉ\n');
    console.log('═══════════════════════════════════════════════════════════════════════════\n');

    // 1. Créer un créateur de test
    console.log('1️⃣ CRÉATION DU CRÉATEUR');
    console.log('─'.repeat(50));

    let testCreator = await User.findOne({ email: 'creator@test.com' });
    if (!testCreator) {
      testCreator = new User({
        nom: 'Creator',
        prenom: 'Test',
        pseudo: 'TestCreator',
        email: 'creator@test.com',
        password: 'Password123!',
        pays: 'France',
        ville: 'Paris',
        isAdmin: false
      });
      await testCreator.save();
    }
    console.log('   ✅ Créateur: creator@test.com');

    // 2. Créer 8 clubs avec leurs joueurs
    console.log('\n2️⃣ CRÉATION DES CLUBS ET JOUEURS');
    console.log('─'.repeat(50));

    const clubsData = [
      { nom: 'FC Virtual United', ville: 'Paris' },
      { nom: 'Gaming Stars FC', ville: 'Lyon' },
      { nom: 'Esport Champions', ville: 'Marseille' },
      { nom: 'Digital Legends', ville: 'Toulouse' },
      { nom: 'Cyber Warriors', ville: 'Nice' },
      { nom: 'Pro Gaming Club', ville: 'Nantes' },
      { nom: 'Elite Sports', ville: 'Strasbourg' },
      { nom: 'Victory Team', ville: 'Bordeaux' }
    ];

    const positions = ['Attaquant', 'Milieu', 'Défenseur', 'Gardien'];
    const postesParPosition = {
      'Attaquant': 'BU',
      'Milieu': 'MC', 
      'Défenseur': 'DC',
      'Gardien': 'GB'
    };
    const plateformes = ['PS5', 'Xbox', 'PC'];

    const createdClubs = [];
    const createdPlayers = [];

    for (let i = 0; i < clubsData.length; i++) {
      const clubData = clubsData[i];
      
      // Créer le club
      const club = new Club({
        nom: clubData.nom,
        createurId: testCreator._id,
        plateformes: ['PS5', 'Xbox', 'PC'],
        description: `Club d'esport professionnel basé à ${clubData.ville}`,
        ville: clubData.ville,
        pays: 'France',
        recrute: true,
        postesRecherches: positions,
        effectifMax: 11,
        effectifActuel: 0,
        membres: []
      });

      await club.save();
      createdClubs.push(club);

      // Créer 4 joueurs pour ce club
      for (let j = 0; j < 4; j++) {
        const position = positions[j];
        const isAdmin = j === 0;
        
        const userData = {
          nom: `Player${i}${j}`,
          prenom: `Test`,
          pseudo: `${clubData.nom.replace(/\s+/g, '')}${position}${i}${j}`.substring(0, 20),
          email: `player${i}${j}@test.com`,
          password: 'Password123!',
          pays: 'France',
          ville: clubData.ville,
          isAdmin: false
        };

        const user = new User(userData);
        await user.save();

        const player = new Player({
          userId: user._id,
          pseudo: userData.pseudo,
          plateforme: plateformes[Math.floor(Math.random() * plateformes.length)],
          pseudoPlateforme: userData.pseudo,
          position: position,
          postePrincipal: postesParPosition[position],
          niveau: Math.floor(Math.random() * 20) + 70, // Niveau entre 70 et 90
          disponibilite: 'Disponible',
          clubs: [{
            clubId: club._id,
            role: isAdmin ? 'Admin' : 'Joueur',
            dateAdhesion: new Date(),
            statut: 'Actif'
          }],
          statistiques: {
            matchsJoues: 0,
            victoires: 0,
            defaites: 0,
            nuls: 0,
            butsMarques: 0,
            passesDecisives: 0,
            cartonJaunes: 0,
            cartonRouges: 0,
            tempsJeu: 0
          }
        });

        await player.save();
        createdPlayers.push(player);

        // Ajouter le joueur au club
        club.membres.push({
          userId: user._id,
          playerId: player._id,
          role: isAdmin ? 'Admin' : 'Membre',
          dateAdhesion: new Date(),
          statut: 'Actif'
        });

        console.log(`      👤 ${userData.pseudo} (${position}) - ${isAdmin ? 'Admin' : 'Membre'}`);
      }

      club.effectifActuel = club.membres.length;
      await club.save();
      console.log(`   ✅ Club créé: ${club.nom} (${club.membres.length} joueurs)`);
    }

    // 3. Créer le championnat
    console.log('\n3️⃣ CRÉATION DU CHAMPIONNAT');
    console.log('─'.repeat(50));

    const competition = new Competition({
      nom: 'Championnat Test League 2024',
      description: 'Championnat de test avec phases de poules et élimination directe',
      type: 'poule_elimination',
      modeMatch: 'simple',
      nombreEquipes: 8,
      nombreEquipesParPoule: 4,
      nombreQualifiesParPoule: 2,
      statut: 'En cours',
      dateDebut: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Il y a 7 jours
      dateFin: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // Dans 14 jours
      dateInscription: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
      createurId: testCreator._id,
      equipesInscrites: [],
      poules: [],
      matchsElimination: [],
      reglement: 'Phase de poules puis élimination directe',
      dotation: 5000,
      fraisInscription: 50
    });

    // Inscrire tous les clubs
    for (const club of createdClubs) {
      competition.equipesInscrites.push({
        clubId: club._id,
        dateInscription: new Date(Date.now() - Math.random() * 5 * 24 * 60 * 60 * 1000),
        statut: 'Confirmé'
      });
    }

    // Créer les poules
    const pouleA = {
      nom: 'Poule A',
      equipes: [createdClubs[0]._id, createdClubs[1]._id, createdClubs[2]._id, createdClubs[3]._id],
      matchs: [],
      classement: []
    };

    const pouleB = {
      nom: 'Poule B',
      equipes: [createdClubs[4]._id, createdClubs[5]._id, createdClubs[6]._id, createdClubs[7]._id],
      matchs: [],
      classement: []
    };

    competition.poules = [pouleA, pouleB];

    // Générer les matchs de poules (tous terminés)
    for (let pouleIndex = 0; pouleIndex < competition.poules.length; pouleIndex++) {
      const poule = competition.poules[pouleIndex];
      
      for (let i = 0; i < poule.equipes.length; i++) {
        for (let j = i + 1; j < poule.equipes.length; j++) {
          const score1 = Math.floor(Math.random() * 4) + 1;
          const score2 = Math.floor(Math.random() * 4) + 1;
          
          const match = {
            equipe1: poule.equipes[i],
            equipe2: poule.equipes[j],
            date: new Date(Date.now() - Math.random() * 5 * 24 * 60 * 60 * 1000),
            statut: 'Terminé',
            score1: score1,
            score2: score2,
            stats: {
              buteurs: [],
              passeurs: [],
              cartons: []
            }
          };

          // Ajouter quelques buteurs
          for (let b = 0; b < score1 + score2; b++) {
            const equipeButeuse = b < score1 ? poule.equipes[i] : poule.equipes[j];
            const playersOfTeam = createdPlayers.filter(p => 
              p.clubs.some(c => c.clubId.toString() === equipeButeuse.toString())
            );
            if (playersOfTeam.length > 0) {
              const buteur = playersOfTeam[Math.floor(Math.random() * playersOfTeam.length)];
              match.stats.buteurs.push({
                joueur: buteur.pseudo,
                equipe: equipeButeuse,
                minute: Math.floor(Math.random() * 90) + 1
              });
            }
          }

          poule.matchs.push(match);
        }
      }

      console.log(`   📊 ${poule.nom}: ${poule.matchs.length} matchs générés`);
    }

    // Calculer les classements
    for (const poule of competition.poules) {
      const classement = [];
      
      for (const equipeId of poule.equipes) {
        classement.push({
          equipe: equipeId,
          points: 0,
          matchsJoues: 0,
          victoires: 0,
          nuls: 0,
          defaites: 0,
          butsMarques: 0,
          butsEncaisses: 0,
          goalAverage: 0
        });
      }

      for (const match of poule.matchs) {
        const equipe1Stats = classement.find(c => c.equipe.toString() === match.equipe1.toString());
        const equipe2Stats = classement.find(c => c.equipe.toString() === match.equipe2.toString());

        equipe1Stats.matchsJoues++;
        equipe2Stats.matchsJoues++;
        equipe1Stats.butsMarques += match.score1;
        equipe1Stats.butsEncaisses += match.score2;
        equipe2Stats.butsMarques += match.score2;
        equipe2Stats.butsEncaisses += match.score1;

        if (match.score1 > match.score2) {
          equipe1Stats.points += 3;
          equipe1Stats.victoires++;
          equipe2Stats.defaites++;
        } else if (match.score1 < match.score2) {
          equipe2Stats.points += 3;
          equipe2Stats.victoires++;
          equipe1Stats.defaites++;
        } else {
          equipe1Stats.points += 1;
          equipe2Stats.points += 1;
          equipe1Stats.nuls++;
          equipe2Stats.nuls++;
        }
      }

      for (const stats of classement) {
        stats.goalAverage = stats.butsMarques - stats.butsEncaisses;
      }

      classement.sort((a, b) => {
        if (b.points !== a.points) return b.points - a.points;
        return b.goalAverage - a.goalAverage;
      });

      poule.classement = classement;
    }

    // Générer les demi-finales
    const qualifies = [];
    for (const poule of competition.poules) {
      qualifies.push(poule.classement[0].equipe); // 1er
      qualifies.push(poule.classement[1].equipe); // 2e
    }

    competition.matchsElimination = [
      {
        equipe1: qualifies[0], // 1er poule A
        equipe2: qualifies[3], // 2e poule B
        date: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
        phase: 'Demi',
        statut: 'Programmé'
      },
      {
        equipe1: qualifies[1], // 1er poule B
        equipe2: qualifies[2], // 2e poule A
        date: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
        phase: 'Demi',
        statut: 'Programmé'
      },
      {
        equipe1: null, // Perdant demi 1
        equipe2: null, // Perdant demi 2
        date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        phase: 'Petite finale',
        statut: 'Programmé'
      },
      {
        equipe1: null, // Gagnant demi 1
        equipe2: null, // Gagnant demi 2
        date: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000),
        phase: 'Finale',
        statut: 'Programmé'
      }
    ];

    // Calculer les statistiques
    let totalMatchs = 0;
    let matchsTermines = 0;
    let totalButs = 0;
    const buteursStats = {};

    for (const poule of competition.poules) {
      totalMatchs += poule.matchs.length;
      matchsTermines += poule.matchs.filter(m => m.statut === 'Terminé').length;
      
      for (const match of poule.matchs) {
        totalButs += match.score1 + match.score2;
        for (const buteur of match.stats.buteurs) {
          buteursStats[buteur.joueur] = (buteursStats[buteur.joueur] || 0) + 1;
        }
      }
    }

    totalMatchs += competition.matchsElimination.length;

    let meilleurButeur = null;
    if (Object.keys(buteursStats).length > 0) {
      const topButeur = Object.entries(buteursStats).reduce((a, b) => 
        buteursStats[a[0]] > buteursStats[b[0]] ? a : b
      );
      meilleurButeur = {
        joueur: topButeur[0],
        buts: topButeur[1],
        club: null
      };
    }

    competition.statistiques = {
      totalMatchs,
      matchsTermines,
      matchsEnCours: 0,
      matchsEnLitige: 0,
      tauxCompletion: Math.round((matchsTermines / totalMatchs) * 100),
      nombreEquipes: competition.equipesInscrites.length,
      totalButs,
      totalPasses: 0,
      meilleurButeur,
      meilleurPasseur: null,
      meilleurJoueur: meilleurButeur
    };

    await competition.save();

    console.log(`   ✅ Championnat créé: ${competition.nom}`);
    console.log(`   📊 ${matchsTermines}/${totalMatchs} matchs (${competition.statistiques.tauxCompletion}%)`);

    // 4. Résumé et comptes de test
    console.log('\n📋 CHAMPIONNAT CRÉÉ AVEC SUCCÈS !');
    console.log('═'.repeat(50));

    console.log(`✅ DONNÉES GÉNÉRÉES:`);
    console.log(`   🏟️ ${createdClubs.length} clubs créés`);
    console.log(`   👤 ${createdPlayers.length} joueurs créés`);
    console.log(`   🏆 1 championnat: "${competition.nom}"`);
    console.log(`   ⚽ ${totalButs} buts marqués au total`);

    console.log(`\n🔑 COMPTES DE TEST (Admin de club):`);
    for (let i = 0; i < createdClubs.length; i++) {
      const adminPlayer = createdPlayers.find(p => 
        p.clubs[0] && p.clubs[0].clubId.toString() === createdClubs[i]._id.toString() &&
        p.clubs[0].role === 'Admin'
      );
      if (adminPlayer) {
        console.log(`   📧 player${i}0@test.com / Password123! (Admin ${createdClubs[i].nom})`);
      }
    }

    console.log(`\n🎮 POUR TESTER:`);
    console.log(`   1. 🌐 http://localhost:3002`);
    console.log(`   2. 🔑 Connectez-vous avec un compte ci-dessus`);
    console.log(`   3. 🏆 Allez dans "Compétitions" → "${competition.nom}"`);
    console.log(`   4. 📊 Explorez: Calendrier, Classements, Stats`);
    console.log(`   5. 🧪 Page test: http://localhost:3002/competition-test`);

    console.log(`\n📝 ID Compétition: ${competition._id}`);

    return {
      competition,
      clubs: createdClubs,
      players: createdPlayers,
      testAccounts: createdClubs.map((club, i) => ({
        email: `player${i}0@test.com`,
        password: 'Password123!',
        club: club.nom
      }))
    };

  } catch (error) {
    console.error('❌ Erreur lors de la création:', error);
    throw error;
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Déconnexion MongoDB');
  }
};

if (require.main === module) {
  createSimpleTestChampionship();
}

module.exports = createSimpleTestChampionship; 