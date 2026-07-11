require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const Player = require('../models/Player');
const Club = require('../models/Club');
const Competition = require('../models/Competition');

const cleanAndCreateChampionship = async () => {
  try {
    console.log('🔄 Connexion à MongoDB...');
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/club-pro-commu');
    
    console.log('🧹 NETTOYAGE ET CRÉATION D\'UN NOUVEAU CHAMPIONNAT\n');
    console.log('═══════════════════════════════════════════════════════════════════════════\n');

    // 1. Nettoyer les données de test existantes
    console.log('1️⃣ NETTOYAGE DES DONNÉES DE TEST');
    console.log('─'.repeat(50));

    // Supprimer les compétitions de test
    const deletedCompetitions = await Competition.deleteMany({
      nom: { $regex: /test|Test|TEST/ }
    });
    console.log(`   🗑️ ${deletedCompetitions.deletedCount} compétitions de test supprimées`);

    // Supprimer les clubs de test
    const testClubNames = [
      'FC Virtual United', 'Gaming Stars FC', 'Esport Champions', 'Digital Legends',
      'Cyber Warriors', 'Pro Gaming Club', 'Elite Sports', 'Victory Team'
    ];
    
    const deletedClubs = await Club.deleteMany({
      nom: { $in: testClubNames }
    });
    console.log(`   🗑️ ${deletedClubs.deletedCount} clubs de test supprimés`);

    // Supprimer les joueurs de test (emails avec pattern test)
    const testPlayers = await Player.find({}).populate('userId', 'email');
    const testPlayerIds = testPlayers
      .filter(p => p.userId && p.userId.email.includes('@test.com'))
      .map(p => p._id);
    
    const deletedPlayers = await Player.deleteMany({
      _id: { $in: testPlayerIds }
    });
    console.log(`   🗑️ ${deletedPlayers.deletedCount} joueurs de test supprimés`);

    // Supprimer les utilisateurs de test
    const deletedUsers = await User.deleteMany({
      email: { $regex: /@test\.com$/ }
    });
    console.log(`   🗑️ ${deletedUsers.deletedCount} utilisateurs de test supprimés`);

    // 2. Créer les nouvelles données
    console.log('\n2️⃣ CRÉATION DES NOUVELLES DONNÉES');
    console.log('─'.repeat(50));

    // Créer un créateur de test
    const timestamp = Date.now().toString().slice(-8); // 8 derniers chiffres
    const testCreator = new User({
      nom: 'Creator',
      prenom: 'Test',
      pseudo: `Creator${timestamp}`,
      email: `creator${timestamp}@test.com`,
      password: 'Password123!',
      pays: 'France',
      ville: 'Paris',
      isAdmin: false
    });
    await testCreator.save();
    console.log('   ✅ Créateur créé');

    // Données des clubs
    const clubsData = [
      { nom: 'Lyon Esport Club', ville: 'Lyon' },
      { nom: 'Paris Gaming Team', ville: 'Paris' },
      { nom: 'Marseille FC Digital', ville: 'Marseille' },
      { nom: 'Toulouse Cyber Squad', ville: 'Toulouse' },
      { nom: 'Nice Virtual Sports', ville: 'Nice' },
      { nom: 'Nantes Pro Gaming', ville: 'Nantes' },
      { nom: 'Strasbourg Elite', ville: 'Strasbourg' },
      { nom: 'Bordeaux Champions', ville: 'Bordeaux' }
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

    // Créer les clubs avec leurs joueurs
    for (let i = 0; i < clubsData.length; i++) {
      const clubData = clubsData[i];
      
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
        const playerTimestamp = Date.now().toString().slice(-4); // 4 derniers chiffres
        
        const userData = {
          nom: `Joueur${i}${j}`,
          prenom: `Test`,
          pseudo: `${clubData.nom.replace(/\s+/g, '').substring(0, 8)}${i}${j}${playerTimestamp}`.substring(0, 20),
          email: `joueur${i}${j}${playerTimestamp}@test.com`,
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
          niveau: Math.floor(Math.random() * 20) + 70,
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

    // 3. Créer le championnat complet
    console.log('\n3️⃣ CRÉATION DU CHAMPIONNAT');
    console.log('─'.repeat(50));

    const competition = new Competition({
      nom: `Championnat Test ${new Date().getFullYear()}`,
      description: 'Championnat de test complet avec phases de poules et élimination directe',
      type: 'poule_elimination',
      modeMatch: 'simple',
      nombreEquipes: 8,
      nombreEquipesParPoule: 4,
      nombreQualifiesParPoule: 2,
      statut: 'En cours',
      dateDebut: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      dateFin: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      dateInscription: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
      createurId: testCreator._id,
      equipesInscrites: [],
      poules: [],
      matchsElimination: [],
      reglement: 'Phase de poules (2 qualifiés par poule) puis demi-finales, finale et petite finale',
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

    // Générer les matchs de poules
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

          // Ajouter des buteurs réalistes
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

    // Calculer les classements de poules
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

    // Créer les matchs d'élimination directe
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
        equipe1: null,
        equipe2: null,
        date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        phase: 'Petite finale',
        statut: 'Programmé'
      },
      {
        equipe1: null,
        equipe2: null,
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

    // 4. Résumé final
    console.log('\n📋 CHAMPIONNAT CRÉÉ AVEC SUCCÈS !');
    console.log('═'.repeat(50));

    console.log(`✅ DONNÉES GÉNÉRÉES:`);
    console.log(`   🏟️ ${createdClubs.length} clubs créés`);
    console.log(`   👤 ${createdPlayers.length} joueurs créés`);
    console.log(`   🏆 1 championnat: "${competition.nom}"`);
    console.log(`   📊 ${matchsTermines}/${totalMatchs} matchs (${competition.statistiques.tauxCompletion}%)`);
    console.log(`   ⚽ ${totalButs} buts marqués au total`);

    console.log(`\n🔑 COMPTES DE TEST (Admin de club):`);
    for (let i = 0; i < createdClubs.length; i++) {
      const adminPlayer = createdPlayers.find(p => 
        p.clubs[0] && p.clubs[0].clubId.toString() === createdClubs[i]._id.toString() &&
        p.clubs[0].role === 'Admin'
      );
      if (adminPlayer) {
        const adminUser = await User.findById(adminPlayer.userId);
        console.log(`   📧 ${adminUser.email} / Password123! (Admin ${createdClubs[i].nom})`);
      }
    }

    console.log(`\n🎮 POUR TESTER SUR L'INTERFACE:`);
    console.log(`   1. 🌐 Allez sur http://localhost:3002`);
    console.log(`   2. 🔑 Connectez-vous avec un compte admin ci-dessus`);
    console.log(`   3. 🏆 Naviguez vers "Compétitions" → "${competition.nom}"`);
    console.log(`   4. 📊 Explorez les onglets: Calendrier, Classements, Statistiques`);
    console.log(`   5. 🧪 Testez aussi: http://localhost:3002/competition-test`);

    console.log(`\n📝 INFORMATIONS TECHNIQUES:`);
    console.log(`   🆔 ID Compétition: ${competition._id}`);
    console.log(`   📅 Phase: Poules terminées, Élimination à venir`);
    console.log(`   ⚡ Prêt pour les phases finales !`);

    return {
      competition,
      clubs: createdClubs,
      players: createdPlayers,
      testAccounts: createdClubs.map((club, i) => {
        const adminPlayer = createdPlayers.find(p => 
          p.clubs[0] && p.clubs[0].clubId.toString() === club._id.toString() &&
          p.clubs[0].role === 'Admin'
        );
        return adminPlayer ? {
          email: `joueur${i}0${Date.now()}@test.com`,
          password: 'Password123!',
          club: club.nom,
          pseudo: adminPlayer.pseudo
        } : null;
      }).filter(Boolean)
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
  cleanAndCreateChampionship();
}

module.exports = cleanAndCreateChampionship; 