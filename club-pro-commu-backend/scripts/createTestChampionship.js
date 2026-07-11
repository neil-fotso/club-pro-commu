require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Player = require('../models/Player');
const Club = require('../models/Club');
const Competition = require('../models/Competition');

const createTestChampionship = async () => {
  try {
    console.log('🔄 Connexion à MongoDB...');
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/club-pro-commu');
    
    console.log('🏆 CRÉATION D\'UN CHAMPIONNAT DE TEST COMPLET\n');
    console.log('═══════════════════════════════════════════════════════════════════════════\n');

    // 1. Créer des clubs de test avec leurs joueurs
    console.log('1️⃣ CRÉATION DES CLUBS ET JOUEURS');
    console.log('─'.repeat(50));

    const clubsData = [
      {
        nom: 'FC Virtual United',
        ville: 'Paris',
        couleurPrimaire: '#FF0000',
        couleurSecondaire: '#FFFFFF'
      },
      {
        nom: 'Gaming Stars FC',
        ville: 'Lyon',
        couleurPrimaire: '#0000FF',
        couleurSecondaire: '#FFFF00'
      },
      {
        nom: 'Esport Champions',
        ville: 'Marseille',
        couleurPrimaire: '#00FF00',
        couleurSecondaire: '#000000'
      },
      {
        nom: 'Digital Legends',
        ville: 'Toulouse',
        couleurPrimaire: '#FF00FF',
        couleurSecondaire: '#FFFFFF'
      },
      {
        nom: 'Cyber Warriors',
        ville: 'Nice',
        couleurPrimaire: '#FFA500',
        couleurSecondaire: '#000000'
      },
      {
        nom: 'Pro Gaming Club',
        ville: 'Nantes',
        couleurPrimaire: '#800080',
        couleurSecondaire: '#FFFF00'
      },
      {
        nom: 'Elite Sports',
        ville: 'Strasbourg',
        couleurPrimaire: '#008000',
        couleurSecondaire: '#FFFFFF'
      },
      {
        nom: 'Victory Team',
        ville: 'Bordeaux',
        couleurPrimaire: '#000080',
        couleurSecondaire: '#FF0000'
      }
    ];

    const playersData = [
      // FC Virtual United
      { nom: 'Dupont', prenom: 'Alexandre', pseudo: 'AlexGoal', position: 'Attaquant', postePrincipal: 'BU', plateforme: 'PS5', niveau: 85 },
      { nom: 'Martin', prenom: 'Julien', pseudo: 'JuJuSkill', position: 'Milieu', postePrincipal: 'MC', plateforme: 'Xbox', niveau: 82 },
      { nom: 'Bernard', prenom: 'Lucas', pseudo: 'LuckyLuc', position: 'Défenseur', postePrincipal: 'DC', plateforme: 'PC', niveau: 78 },
      { nom: 'Durand', prenom: 'Thomas', pseudo: 'TomKeeper', position: 'Gardien', postePrincipal: 'GB', plateforme: 'PS5', niveau: 80 },
      
      // Gaming Stars FC  
      { nom: 'Petit', prenom: 'Antoine', pseudo: 'AntoFire', position: 'Attaquant', postePrincipal: 'AG', plateforme: 'Xbox', niveau: 88 },
      { nom: 'Robert', prenom: 'Pierre', pseudo: 'PierrePro', position: 'Milieu', postePrincipal: 'MD', plateforme: 'PC', niveau: 84 },
      { nom: 'Richard', prenom: 'Paul', pseudo: 'PaulDefense', position: 'Défenseur', postePrincipal: 'DG', plateforme: 'PS5', niveau: 81 },
      { nom: 'Moreau', prenom: 'Jean', pseudo: 'JeanWall', position: 'Gardien', postePrincipal: 'GB', plateforme: 'Xbox', niveau: 83 },
      
      // Esport Champions
      { nom: 'Simon', prenom: 'Nicolas', pseudo: 'NicoStrike', position: 'Attaquant', postePrincipal: 'AD', plateforme: 'PC', niveau: 86 },
      { nom: 'Michel', prenom: 'David', pseudo: 'DaveMagic', position: 'Milieu', postePrincipal: 'MG', plateforme: 'PS5', niveau: 83 },
      { nom: 'Leroy', prenom: 'Christophe', pseudo: 'ChrisRock', position: 'Défenseur', postePrincipal: 'DD', plateforme: 'Xbox', niveau: 79 },
      { nom: 'Roux', prenom: 'Sébastien', pseudo: 'SebSafe', position: 'Gardien', postePrincipal: 'GB', plateforme: 'PC', niveau: 81 },
      
      // Digital Legends
      { nom: 'Fournier', prenom: 'Maxime', pseudo: 'MaxPower', position: 'Attaquant', postePrincipal: 'BU', plateforme: 'PS5', niveau: 87 },
      { nom: 'Girard', prenom: 'Florian', pseudo: 'FloFlow', position: 'Milieu', postePrincipal: 'MOC', plateforme: 'Xbox', niveau: 85 },
      { nom: 'Bonnet', prenom: 'Romain', pseudo: 'RomainShield', position: 'Défenseur', postePrincipal: 'DLD', plateforme: 'PC', niveau: 82 },
      { nom: 'Dupuis', prenom: 'Kévin', pseudo: 'KevinGuard', position: 'Gardien', postePrincipal: 'GB', plateforme: 'PS5', niveau: 84 },
      
      // Cyber Warriors
      { nom: 'Lambert', prenom: 'Benjamin', pseudo: 'BenSniper', position: 'Attaquant', postePrincipal: 'AG', plateforme: 'Xbox', niveau: 84 },
      { nom: 'Fontaine', prenom: 'Jérémy', pseudo: 'JerMaster', position: 'Milieu', postePrincipal: 'MC', plateforme: 'PC', niveau: 81 },
      { nom: 'Rousseau', prenom: 'Vincent', pseudo: 'VinDefender', position: 'Défenseur', postePrincipal: 'DLG', plateforme: 'PS5', niveau: 77 },
      { nom: 'Vincent', prenom: 'Fabrice', pseudo: 'FabKeeper', position: 'Gardien', postePrincipal: 'GB', plateforme: 'Xbox', niveau: 79 },
      
      // Pro Gaming Club
      { nom: 'Muller', prenom: 'Damien', pseudo: 'DamSpeedster', position: 'Attaquant', postePrincipal: 'AD', plateforme: 'PC', niveau: 83 },
      { nom: 'Lefevre', prenom: 'Raphaël', pseudo: 'RaphControl', position: 'Milieu', postePrincipal: 'MDC', plateforme: 'PS5', niveau: 80 },
      { nom: 'Faure', prenom: 'Mathieu', pseudo: 'MathWall', position: 'Défenseur', postePrincipal: 'DC', plateforme: 'Xbox', niveau: 76 },
      { nom: 'Andre', prenom: 'Ludovic', pseudo: 'LudoSave', position: 'Gardien', postePrincipal: 'GB', plateforme: 'PC', niveau: 78 },
      
      // Elite Sports  
      { nom: 'Mercier', prenom: 'Jonathan', pseudo: 'JonoGoal', position: 'Attaquant', postePrincipal: 'BU', plateforme: 'PS5', niveau: 85 },
      { nom: 'Blanc', prenom: 'Mickael', pseudo: 'MickPlay', position: 'Milieu', postePrincipal: 'MG', plateforme: 'Xbox', niveau: 82 },
      { nom: 'Guerin', prenom: 'Olivier', pseudo: 'OliDefense', position: 'Défenseur', postePrincipal: 'DG', plateforme: 'PC', niveau: 78 },
      { nom: 'Boyer', prenom: 'Laurent', pseudo: 'LaurentGuard', position: 'Gardien', postePrincipal: 'GB', plateforme: 'PS5', niveau: 80 },
      
      // Victory Team
      { nom: 'Garnier', prenom: 'Stéphane', pseudo: 'StephShooter', position: 'Attaquant', postePrincipal: 'AG', plateforme: 'Xbox', niveau: 86 },
      { nom: 'Chevalier', prenom: 'Bruno', pseudo: 'BrunoMid', position: 'Milieu', postePrincipal: 'MD', plateforme: 'PC', niveau: 83 },
      { nom: 'François', prenom: 'Philippe', pseudo: 'PhilDefense', position: 'Défenseur', postePrincipal: 'DD', plateforme: 'PS5', niveau: 80 },
      { nom: 'Legrand', prenom: 'Thierry', pseudo: 'ThierryWall', position: 'Gardien', postePrincipal: 'GB', plateforme: 'Xbox', niveau: 82 }
    ];

    const createdClubs = [];
    const createdPlayers = [];
    let playerIndex = 0;

    // Créer d'abord un créateur de test si nécessaire
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
      console.log('   👤 Créateur de test créé: creator@test.com');
    }

    // Créer les clubs avec leurs joueurs
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
        postesRecherches: ['Attaquant', 'Milieu', 'Défenseur', 'Gardien'],
        effectifMax: 11,
        effectifActuel: 0,
        membres: [],
        statsGlobales: {
          matchsJoues: 0,
          victoires: 0,
          defaites: 0,
          nuls: 0,
          butsMarques: 0,
          butsEncaisses: 0
        }
      });

      await club.save();
      createdClubs.push(club);
      console.log(`   ✅ Club créé: ${club.nom} (${club.ville})`);

      // Créer 4 joueurs pour ce club
      for (let j = 0; j < 4; j++) {
        const playerData = playersData[playerIndex];
        
        // Créer l'utilisateur
        const user = new User({
          nom: playerData.nom,
          prenom: playerData.prenom,
          pseudo: playerData.pseudo,
          email: `${playerData.pseudo.toLowerCase()}@test.com`,
          password: 'Password123!',
          pays: 'France',
          ville: clubData.ville,
          isAdmin: false
        });

        await user.save();

        // Définir des valeurs correctes selon le poste
        const plateformes = ['PS5', 'Xbox', 'PC'];
        const postesParPosition = {
          'Attaquant': ['BU', 'AG', 'AD'],
          'Milieu': ['MOC', 'MG', 'MD', 'MC', 'MDC'],
          'Défenseur': ['DD', 'DG', 'DC', 'DLD', 'DLG'],
          'Gardien': ['GB']
        };

        // Créer le joueur
        const player = new Player({
          userId: user._id,
          pseudo: playerData.pseudo,
          plateforme: plateformes[Math.floor(Math.random() * plateformes.length)],
          pseudoPlateforme: playerData.pseudo,
          position: playerData.position,
          postePrincipal: postesParPosition[playerData.position][0], // Premier poste de la position
          niveau: playerData.niveau,
          disponibilite: 'Disponible',
          clubs: [{
            clubId: club._id,
            role: j === 0 ? 'Admin' : 'Joueur', // Premier joueur = admin du club
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
          role: j === 0 ? 'Admin' : 'Membre',
          dateAdhesion: new Date(),
          statut: 'Actif'
        });

        console.log(`      👤 Joueur créé: ${playerData.pseudo} (${playerData.position}) - ${j === 0 ? 'Admin' : 'Membre'}`);
        playerIndex++;
      }

      // Mettre à jour l'effectif actuel
      club.effectifActuel = club.membres.length;
      await club.save();
    }

    // 2. Créer le championnat
    console.log('\n2️⃣ CRÉATION DU CHAMPIONNAT');
    console.log('─'.repeat(50));

    const competition = new Competition({
      nom: 'Championnat Test Pro League',
      description: 'Championnat de test avec 8 équipes pour démonstration de la plateforme',
      type: 'poule_elimination',
      modeMatch: 'simple',
      nombreEquipes: 8,
      nombreEquipesParPoule: 4,
      nombreQualifiesParPoule: 2,
      statut: 'En cours',
      dateDebut: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), // Il y a 10 jours
      dateFin: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000), // Dans 20 jours
      dateInscription: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000), // Il y a 15 jours
      createurId: createdPlayers[0].userId, // Premier admin comme créateur
      equipesInscrites: [],
      poules: [],
      matchsElimination: [],
      reglement: 'Championnat test avec phase de poules suivie d\'élimination directe',
      dotation: 5000,
      fraisInscription: 50
    });

    // Inscrire tous les clubs
    for (const club of createdClubs) {
      competition.equipesInscrites.push({
        clubId: club._id,
        dateInscription: new Date(Date.now() - Math.random() * 10 * 24 * 60 * 60 * 1000),
        statut: 'Confirmé'
      });
    }

    // Créer les poules
    const pouleA = {
      nom: 'Poule A',
      equipes: [
        createdClubs[0]._id, // FC Virtual United
        createdClubs[1]._id, // Gaming Stars FC
        createdClubs[2]._id, // Esport Champions
        createdClubs[3]._id  // Digital Legends
      ],
      matchs: [],
      classement: []
    };

    const pouleB = {
      nom: 'Poule B', 
      equipes: [
        createdClubs[4]._id, // Cyber Warriors
        createdClubs[5]._id, // Pro Gaming Club
        createdClubs[6]._id, // Elite Sports
        createdClubs[7]._id  // Victory Team
      ],
      matchs: [],
      classement: []
    };

    competition.poules = [pouleA, pouleB];

    // Générer les matchs de poules
    console.log('   🏟️ Génération des matchs de poules...');
    
    for (let pouleIndex = 0; pouleIndex < competition.poules.length; pouleIndex++) {
      const poule = competition.poules[pouleIndex];
      const equipes = poule.equipes;

      // Générer tous les matchs (chaque équipe joue contre chaque autre)
      for (let i = 0; i < equipes.length; i++) {
        for (let j = i + 1; j < equipes.length; j++) {
          const match = {
            equipe1: equipes[i],
            equipe2: equipes[j],
            date: new Date(Date.now() - Math.random() * 8 * 24 * 60 * 60 * 1000), // Matchs étalés sur 8 jours
            statut: 'Terminé', // Tous les matchs de poule terminés
            score1: Math.floor(Math.random() * 4) + 1, // Score entre 1 et 4
            score2: Math.floor(Math.random() * 4) + 1,
            stats: {
              buteurs: [],
              passeurs: [],
              cartons: []
            }
          };

          // Ajouter des buteurs réalistes
          const totalButs = match.score1 + match.score2;
          for (let b = 0; b < totalButs; b++) {
            const equipeButeuse = b < match.score1 ? equipes[i] : equipes[j];
            const playersOfTeam = createdPlayers.filter(p => 
              p.clubs.some(c => c.clubId.toString() === equipeButeuse.toString())
            );
            const buteur = playersOfTeam[Math.floor(Math.random() * playersOfTeam.length)];
            
            match.stats.buteurs.push({
              joueur: buteur.pseudo,
              equipe: equipeButeuse,
              minute: Math.floor(Math.random() * 90) + 1
            });
          }

          poule.matchs.push(match);
        }
      }
    }

    await competition.save();
    console.log(`   ✅ Championnat créé: ${competition.nom}`);
    console.log(`   📊 ${competition.poules[0].matchs.length} matchs par poule générés`);

    // 3. Calculer les classements des poules
    console.log('\n3️⃣ CALCUL DES CLASSEMENTS');
    console.log('─'.repeat(50));

    for (let pouleIndex = 0; pouleIndex < competition.poules.length; pouleIndex++) {
      const poule = competition.poules[pouleIndex];
      const classement = [];

      // Initialiser le classement
      for (const equipeId of poule.equipes) {
        const club = createdClubs.find(c => c._id.toString() === equipeId.toString());
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

      // Calculer les points
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
          // Victoire équipe 1
          equipe1Stats.points += 3;
          equipe1Stats.victoires++;
          equipe2Stats.defaites++;
        } else if (match.score1 < match.score2) {
          // Victoire équipe 2
          equipe2Stats.points += 3;
          equipe2Stats.victoires++;
          equipe1Stats.defaites++;
        } else {
          // Match nul
          equipe1Stats.points += 1;
          equipe2Stats.points += 1;
          equipe1Stats.nuls++;
          equipe2Stats.nuls++;
        }
      }

      // Calculer goal average et trier
      for (const stats of classement) {
        stats.goalAverage = stats.butsMarques - stats.butsEncaisses;
      }

      classement.sort((a, b) => {
        if (b.points !== a.points) return b.points - a.points;
        return b.goalAverage - a.goalAverage;
      });

      poule.classement = classement;
      
      console.log(`   📊 Classement ${poule.nom}:`);
      for (let i = 0; i < classement.length; i++) {
        const club = createdClubs.find(c => c._id.toString() === classement[i].equipe.toString());
        console.log(`      ${i + 1}. ${club.nom} - ${classement[i].points} pts (${classement[i].victoires}V ${classement[i].nuls}N ${classement[i].defaites}D)`);
      }
    }

    // 4. Générer les matchs d'élimination directe
    console.log('\n4️⃣ GÉNÉRATION DES MATCHS D\'ÉLIMINATION');
    console.log('─'.repeat(50));

    // Prendre les 2 premiers de chaque poule
    const qualifies = [];
    for (const poule of competition.poules) {
      qualifies.push(poule.classement[0].equipe); // 1er de poule
      qualifies.push(poule.classement[1].equipe); // 2e de poule
    }

    // Demi-finales
    const demiFinales = [
      {
        equipe1: qualifies[0], // 1er poule A
        equipe2: qualifies[3], // 2e poule B
        date: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000), // Demain
        phase: 'Demi',
        statut: 'Programmé'
      },
      {
        equipe1: qualifies[1], // 1er poule B  
        equipe2: qualifies[2], // 2e poule A
        date: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000), // Demain
        phase: 'Demi',
        statut: 'Programmé'
      }
    ];

    // Finale et petite finale (équipes à déterminer)
    const finale = {
      equipe1: null, // Gagnant demi 1
      equipe2: null, // Gagnant demi 2
      date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // Dans 3 jours
      phase: 'Finale',
      statut: 'Programmé'
    };

    const petiteFinale = {
      equipe1: null, // Perdant demi 1
      equipe2: null, // Perdant demi 2
      date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // Dans 2 jours
      phase: 'Petite finale',
      statut: 'Programmé'
    };

    competition.matchsElimination = [...demiFinales, petiteFinale, finale];

    console.log(`   ✅ ${demiFinales.length} demi-finales programmées`);
    console.log(`   ✅ Finale et petite finale créées`);

    for (const match of demiFinales) {
      const club1 = createdClubs.find(c => c._id.toString() === match.equipe1.toString());
      const club2 = createdClubs.find(c => c._id.toString() === match.equipe2.toString());
      console.log(`      🏟️ ${club1.nom} vs ${club2.nom}`);
    }

    // 5. Calculer les statistiques
    console.log('\n5️⃣ CALCUL DES STATISTIQUES');
    console.log('─'.repeat(50));

    let totalMatchs = 0;
    let matchsTermines = 0;
    let totalButs = 0;
    const buteursStats = {};

    // Compter matchs de poules
    for (const poule of competition.poules) {
      totalMatchs += poule.matchs.length;
      matchsTermines += poule.matchs.filter(m => m.statut === 'Terminé').length;
      
      for (const match of poule.matchs) {
        totalButs += match.score1 + match.score2;
        
        // Compter les buteurs
        for (const buteur of match.stats.buteurs) {
          buteursStats[buteur.joueur] = (buteursStats[buteur.joueur] || 0) + 1;
        }
      }
    }

    // Compter matchs d'élimination
    totalMatchs += competition.matchsElimination.length;
    matchsTermines += competition.matchsElimination.filter(m => m.statut === 'Terminé').length;

    // Trouver le meilleur buteur
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

    console.log(`   📊 ${matchsTermines}/${totalMatchs} matchs terminés (${competition.statistiques.tauxCompletion}%)`);
    console.log(`   ⚽ ${totalButs} buts marqués au total`);
    if (meilleurButeur) {
      console.log(`   🥇 Meilleur buteur: ${meilleurButeur.joueur} (${meilleurButeur.buts} buts)`);
    }

    // 6. Résumé final
    console.log('\n📋 RÉSUMÉ DU CHAMPIONNAT CRÉÉ');
    console.log('═'.repeat(50));

    console.log(`✅ DONNÉES GÉNÉRÉES:`);
    console.log(`   🏟️ ${createdClubs.length} clubs créés`);
    console.log(`   👤 ${createdPlayers.length} joueurs créés (${createdPlayers.filter(p => p.clubs[0].role === 'Admin').length} admins de club)`);
    console.log(`   🏆 1 championnat: "${competition.nom}"`);
    console.log(`   📊 ${competition.poules.length} poules avec ${totalMatchs} matchs`);
    console.log(`   🎯 ${qualifies.length} équipes qualifiées pour les phases finales`);

    console.log(`\n🎮 POUR TESTER SUR L'INTERFACE:`);
    console.log(`   1. 🌐 Allez sur http://localhost:3002`);
    console.log(`   2. 🔑 Connectez-vous avec un admin de club:`);
    
    // Afficher quelques comptes de test
    for (let i = 0; i < Math.min(4, createdPlayers.length); i += 4) {
      const player = createdPlayers[i];
      const club = createdClubs[Math.floor(i/4)];
      console.log(`      📧 ${player.pseudo.toLowerCase()}@test.com / Password123! (Admin ${club.nom})`);
    }
    
    console.log(`   3. 🏆 Naviguez vers "Compétitions" → "${competition.nom}"`);
    console.log(`   4. 📊 Explorez: Calendrier, Classements, Statistiques`);
    console.log(`   5. 🧪 Testez: http://localhost:3002/competition-test`);

    console.log(`\n📝 COMPÉTITION ID: ${competition._id}`);
    console.log(`📅 Phase actuelle: Poules terminées, Élimination en cours`);

    return {
      competition,
      clubs: createdClubs,
      players: createdPlayers,
      testAccounts: createdPlayers.filter(p => p.clubs[0].role === 'Admin').map(p => ({
        email: `${p.pseudo.toLowerCase()}@test.com`,
        password: 'Password123!',
        club: createdClubs.find(c => c._id.toString() === p.clubs[0].clubId.toString()).nom
      }))
    };

  } catch (error) {
    console.error('❌ Erreur lors de la création du championnat:', error);
    throw error;
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Déconnexion MongoDB');
  }
};

if (require.main === module) {
  createTestChampionship();
}

module.exports = createTestChampionship; 