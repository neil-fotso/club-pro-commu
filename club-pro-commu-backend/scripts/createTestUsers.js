const mongoose = require('mongoose');
const User = require('../models/User');
const Player = require('../models/Player');

// Configuration MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/club-pro-commu', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ MongoDB connecté');
  } catch (err) {
    console.error('❌ Erreur connexion MongoDB:', err);
    process.exit(1);
  }
};

// Données des utilisateurs de test
const testUsers = [
  // Utilisateurs existants (1-8)
  {
    email: 'test1@clubpro.com',
    pseudo: 'test1',
    password: 'test123',
    playerData: {
      age: 25,
      pays: 'France',
      plateforme: 'PS5',
      position: 'Attaquant',
      postePrincipal: 'BU',
      postesSecondaires: ['AIL', 'AID'],
      langues: ['Français', 'Anglais'],
      description: 'Attaquant rapide et technique, spécialiste des buts décisifs',
      rechercheClub: true,
      disponibilite: 'Disponible'
    }
  },
  {
    email: 'test2@clubpro.com',
    pseudo: 'test2',
    password: 'test123',
    playerData: {
      age: 28,
      pays: 'France',
      plateforme: 'Xbox',
      position: 'Milieu',
      postePrincipal: 'MC',
      postesSecondaires: ['MOC', 'MDC'],
      langues: ['Français'],
      description: 'Milieu relayeur avec une bonne vision de jeu',
      rechercheClub: true,
      disponibilite: 'Disponible'
    }
  },
  {
    email: 'test3@clubpro.com',
    pseudo: 'test3',
    password: 'test123',
    playerData: {
      age: 22,
      pays: 'France',
      plateforme: 'PC',
      position: 'Défenseur',
      postePrincipal: 'DC',
      postesSecondaires: ['DL', 'DR'],
      langues: ['Français', 'Espagnol'],
      description: 'Défenseur central en progression, bon dans les duels',
      rechercheClub: true,
      disponibilite: 'Disponible'
    }
  },
  {
    email: 'test4@clubpro.com',
    pseudo: 'test4',
    password: 'test123',
    playerData: {
      age: 30,
      pays: 'France',
      plateforme: 'PS5',
      position: 'Gardien',
      postePrincipal: 'GB',
      postesSecondaires: [],
      langues: ['Français'],
      description: 'Gardien expérimenté, spécialiste des arrêts décisifs',
      rechercheClub: false,
      disponibilite: 'Disponible'
    }
  },
  {
    email: 'test5@clubpro.com',
    pseudo: 'test5',
    password: 'test123',
    playerData: {
      age: 24,
      pays: 'France',
      plateforme: 'Xbox',
      position: 'Attaquant',
      postePrincipal: 'AIL',
      postesSecondaires: ['BU', 'AID'],
      langues: ['Français', 'Anglais'],
      description: 'Ailier rapide avec une bonne technique de croisé',
      rechercheClub: true,
      disponibilite: 'Disponible'
    }
  },
  {
    email: 'test6@clubpro.com',
    pseudo: 'test6',
    password: 'test123',
    playerData: {
      age: 26,
      pays: 'France',
      plateforme: 'PC',
      position: 'Milieu',
      postePrincipal: 'MOC',
      postesSecondaires: ['MC', 'AIL'],
      langues: ['Français'],
      description: 'Meneur de jeu créatif, spécialiste des passes décisives',
      rechercheClub: true,
      disponibilite: 'Disponible'
    }
  },
  {
    email: 'test7@clubpro.com',
    pseudo: 'test7',
    password: 'test123',
    playerData: {
      age: 29,
      pays: 'France',
      plateforme: 'PS5',
      position: 'Défenseur',
      postePrincipal: 'DL',
      postesSecondaires: ['DC', 'DR'],
      langues: ['Français', 'Italien'],
      niveau: 'Intermédiaire',
      description: 'Latéral offensif avec une bonne qualité de centre',
      rechercheClub: false,
      disponibilite: 'Disponible'
    }
  },
  {
    email: 'test8@clubpro.com',
    pseudo: 'test8',
    password: 'test123',
    playerData: {
      age: 23,
      pays: 'France',
      plateforme: 'Xbox',
      position: 'Milieu',
      postePrincipal: 'MDC',
      postesSecondaires: ['MC', 'DC'],
      langues: ['Français'],
      niveau: 'Débutant',
      description: 'Milieu défensif en formation, bon dans la récupération',
      rechercheClub: true,
      disponibilite: 'Disponible'
    }
  },

  // Nouveaux utilisateurs (9-28)
  {
    email: 'test9@clubpro.com',
    pseudo: 'AlexTheStriker',
    password: 'test123',
    playerData: {
      age: 27,
      pays: 'France',
      plateforme: 'PS5',
      position: 'Attaquant',
      postePrincipal: 'BU',
      postesSecondaires: ['AG', 'AD'],
      langues: ['Français', 'Anglais'],
      niveau: 'Avancé',
      description: 'Buteur né avec un sens du but exceptionnel',
      rechercheClub: true,
      disponibilite: 'Disponible'
    }
  },
  {
    email: 'test10@clubpro.com',
    pseudo: 'MidfieldMaestro',
    password: 'test123',
    playerData: {
      age: 25,
      pays: 'France',
      plateforme: 'Xbox',
      position: 'Milieu',
      postePrincipal: 'MOC',
      postesSecondaires: ['MC', 'AG'],
      langues: ['Français', 'Espagnol'],
      niveau: 'Avancé',
      description: 'Meneur de jeu visionnaire, maître des passes décisives',
      rechercheClub: true,
      disponibilite: 'Disponible'
    }
  },
  {
    email: 'test11@clubpro.com',
    pseudo: 'DefensiveRock',
    password: 'test123',
    playerData: {
      age: 31,
      pays: 'France',
      plateforme: 'PC',
      position: 'Défenseur',
      postePrincipal: 'DC',
      postesSecondaires: ['MDC'],
      langues: ['Français'],
      niveau: 'Avancé',
      description: 'Défenseur central expérimenté, leader défensif',
      rechercheClub: false,
      disponibilite: 'Disponible'
    }
  },
  {
    email: 'test12@clubpro.com',
    pseudo: 'WingWizard',
    password: 'test123',
    playerData: {
      age: 24,
      pays: 'France',
      plateforme: 'PS5',
      position: 'Attaquant',
      postePrincipal: 'AG',
      postesSecondaires: ['AD', 'BU'],
      langues: ['Français', 'Anglais'],
      niveau: 'Intermédiaire',
      description: 'Ailier rapide avec une technique de croisé parfaite',
      rechercheClub: true,
      disponibilite: 'Disponible'
    }
  },
  {
    email: 'test13@clubpro.com',
    pseudo: 'GoalkeeperPro',
    password: 'test123',
    playerData: {
      age: 28,
      pays: 'France',
      plateforme: 'Xbox',
      position: 'Gardien',
      postePrincipal: 'GB',
      postesSecondaires: [],
      langues: ['Français'],
      niveau: 'Avancé',
      description: 'Gardien agile avec des réflexes exceptionnels',
      rechercheClub: true,
      disponibilite: 'Disponible'
    }
  },
  {
    email: 'test14@clubpro.com',
    pseudo: 'TackleMaster',
    password: 'test123',
    playerData: {
      age: 26,
      pays: 'France',
      plateforme: 'PC',
      position: 'Défenseur',
      postePrincipal: 'DD',
      postesSecondaires: ['DC', 'DG'],
      langues: ['Français', 'Italien'],
      niveau: 'Intermédiaire',
      description: 'Latéral défensif solide, bon dans les duels',
      rechercheClub: true,
      disponibilite: 'Disponible'
    }
  },
  {
    email: 'test15@clubpro.com',
    pseudo: 'PlaymakerX',
    password: 'test123',
    playerData: {
      age: 23,
      pays: 'France',
      plateforme: 'PS5',
      position: 'Milieu',
      postePrincipal: 'MC',
      postesSecondaires: ['MOC', 'MDC'],
      langues: ['Français', 'Anglais'],
      niveau: 'Intermédiaire',
      description: 'Milieu relayeur avec une bonne vision de jeu',
      rechercheClub: true,
      disponibilite: 'Disponible'
    }
  },
  {
    email: 'test16@clubpro.com',
    pseudo: 'SpeedDemon',
    password: 'test123',
    playerData: {
      age: 22,
      pays: 'France',
      plateforme: 'Xbox',
      position: 'Attaquant',
      postePrincipal: 'AD',
      postesSecondaires: ['AG', 'BU'],
      langues: ['Français'],
      niveau: 'Débutant',
      description: 'Ailier droit ultra-rapide, spécialiste des débordements',
      rechercheClub: true,
      disponibilite: 'Disponible'
    }
  },
  {
    email: 'test17@clubpro.com',
    pseudo: 'WallDefender',
    password: 'test123',
    playerData: {
      age: 29,
      pays: 'France',
      plateforme: 'PC',
      position: 'Défenseur',
      postePrincipal: 'DC',
      postesSecondaires: ['MDC'],
      langues: ['Français', 'Espagnol'],
      niveau: 'Avancé',
      description: 'Défenseur central physique, maître des duels aériens',
      rechercheClub: false,
      disponibilite: 'Disponible'
    }
  },
  {
    email: 'test18@clubpro.com',
    pseudo: 'MidfieldEngine',
    password: 'test123',
    playerData: {
      age: 27,
      pays: 'France',
      plateforme: 'PS5',
      position: 'Milieu',
      postePrincipal: 'MDC',
      postesSecondaires: ['MC', 'DC'],
      langues: ['Français'],
      niveau: 'Intermédiaire',
      description: 'Milieu défensif robuste, spécialiste de la récupération',
      rechercheClub: true,
      disponibilite: 'Disponible'
    }
  },
  {
    email: 'test19@clubpro.com',
    pseudo: 'GoldenBoot',
    password: 'test123',
    playerData: {
      age: 25,
      pays: 'France',
      plateforme: 'Xbox',
      position: 'Attaquant',
      postePrincipal: 'BU',
      postesSecondaires: ['AG'],
      langues: ['Français', 'Anglais'],
      niveau: 'Avancé',
      description: 'Buteur complet, aussi à l\'aise en pivot qu\'en pointe',
      rechercheClub: true,
      disponibilite: 'Disponible'
    }
  },
  {
    email: 'test20@clubpro.com',
    pseudo: 'LeftBackLegend',
    password: 'test123',
    playerData: {
      age: 24,
      pays: 'France',
      plateforme: 'PC',
      position: 'Défenseur',
      postePrincipal: 'DG',
      postesSecondaires: ['DC'],
      langues: ['Français'],
      niveau: 'Débutant',
      description: 'Latéral gauche en progression, bon dans les montées',
      rechercheClub: true,
      disponibilite: 'Disponible'
    }
  },
  {
    email: 'test21@clubpro.com',
    pseudo: 'PassMaster',
    password: 'test123',
    playerData: {
      age: 26,
      pays: 'France',
      plateforme: 'PS5',
      position: 'Milieu',
      postePrincipal: 'MOC',
      postesSecondaires: ['MC'],
      langues: ['Français', 'Italien'],
      niveau: 'Avancé',
      description: 'Meneur de jeu créatif, spécialiste des passes longues',
      rechercheClub: true,
      disponibilite: 'Disponible'
    }
  },
  {
    email: 'test22@clubpro.com',
    pseudo: 'ShotStopper',
    password: 'test123',
    playerData: {
      age: 30,
      pays: 'France',
      plateforme: 'Xbox',
      position: 'Gardien',
      postePrincipal: 'GB',
      postesSecondaires: [],
      langues: ['Français'],
      niveau: 'Avancé',
      description: 'Gardien expérimenté, spécialiste des arrêts réflexes',
      rechercheClub: false,
      disponibilite: 'Disponible'
    }
  },
  {
    email: 'test23@clubpro.com',
    pseudo: 'WingWarrior',
    password: 'test123',
    playerData: {
      age: 23,
      pays: 'France',
      plateforme: 'PC',
      position: 'Attaquant',
      postePrincipal: 'AG',
      postesSecondaires: ['BU'],
      langues: ['Français', 'Anglais'],
      niveau: 'Intermédiaire',
      description: 'Ailier gauche technique, spécialiste des dribbles',
      rechercheClub: true,
      disponibilite: 'Disponible'
    }
  },
  {
    email: 'test24@clubpro.com',
    pseudo: 'DefensiveMid',
    password: 'test123',
    playerData: {
      age: 28,
      pays: 'France',
      plateforme: 'PS5',
      position: 'Milieu',
      postePrincipal: 'MDC',
      postesSecondaires: ['DC'],
      langues: ['Français'],
      niveau: 'Intermédiaire',
      description: 'Milieu défensif tactique, bon dans l\'interception',
      rechercheClub: true,
      disponibilite: 'Disponible'
    }
  },
  {
    email: 'test25@clubpro.com',
    pseudo: 'RightBackRocket',
    password: 'test123',
    playerData: {
      age: 25,
      pays: 'France',
      plateforme: 'Xbox',
      position: 'Défenseur',
      postePrincipal: 'DD',
      postesSecondaires: ['DC'],
      langues: ['Français', 'Espagnol'],
      niveau: 'Débutant',
      description: 'Latéral droit rapide, bon dans les montées',
      rechercheClub: true,
      disponibilite: 'Disponible'
    }
  },
  {
    email: 'test26@clubpro.com',
    pseudo: 'StrikerSupreme',
    password: 'test123',
    playerData: {
      age: 27,
      pays: 'France',
      plateforme: 'PC',
      position: 'Attaquant',
      postePrincipal: 'BU',
      postesSecondaires: ['AG', 'AD'],
      langues: ['Français'],
      niveau: 'Avancé',
      description: 'Attaquant complet, aussi bon en finition qu\'en jeu de tête',
      rechercheClub: true,
      disponibilite: 'Disponible'
    }
  },
  {
    email: 'test27@clubpro.com',
    pseudo: 'CentralMid',
    password: 'test123',
    playerData: {
      age: 24,
      pays: 'France',
      plateforme: 'PS5',
      position: 'Milieu',
      postePrincipal: 'MC',
      postesSecondaires: ['MOC', 'MDC'],
      langues: ['Français', 'Anglais'],
      niveau: 'Intermédiaire',
      description: 'Milieu central polyvalent, bon dans tous les aspects',
      rechercheClub: true,
      disponibilite: 'Disponible'
    }
  },
  {
    email: 'test28@clubpro.com',
    pseudo: 'DefensiveGiant',
    password: 'test123',
    playerData: {
      age: 29,
      pays: 'France',
      plateforme: 'Xbox',
      position: 'Défenseur',
      postePrincipal: 'DC',
      postesSecondaires: ['MDC'],
      langues: ['Français'],
      niveau: 'Avancé',
      description: 'Défenseur central physique, maître des duels',
      rechercheClub: false,
      disponibilite: 'Disponible'
    }
  }
];

const createTestUsers = async () => {
  try {
    console.log('🚀 Début de la création des utilisateurs de test...');
    
    let createdCount = 0;
    let skippedCount = 0;

    for (const userData of testUsers) {
      try {
        // Vérifier si l'utilisateur existe déjà
        const existingUser = await User.findOne({ email: userData.email });
        if (existingUser) {
          console.log(`⏭️ Utilisateur ${userData.pseudo} existe déjà, ignoré`);
          skippedCount++;
          continue;
        }

        // Créer l'utilisateur
        const user = new User({
          email: userData.email,
          pseudo: userData.pseudo,
          password: userData.password,
          isAdmin: false
        });

        await user.save();
        console.log(`✅ Utilisateur créé: ${userData.pseudo}`);

        // Créer le profil joueur
        const player = new Player({
          userId: user._id,
          pseudo: userData.pseudo,
          age: userData.playerData.age,
          pays: userData.playerData.pays,
          plateforme: userData.playerData.plateforme,
          position: userData.playerData.position,
          postePrincipal: userData.playerData.postePrincipal,
          postesSecondaires: userData.playerData.postesSecondaires,
          langues: userData.playerData.langues,
          niveau: userData.playerData.niveau,
          description: userData.playerData.description,
          rechercheClub: userData.playerData.rechercheClub,
          disponibilite: userData.playerData.disponibilite,
          statistiques: {
            matchsJoues: Math.floor(Math.random() * 50) + 10,
            victoires: Math.floor(Math.random() * 30) + 5,
            defaites: Math.floor(Math.random() * 20) + 2,
            nuls: Math.floor(Math.random() * 10) + 1,
            butsMarques: Math.floor(Math.random() * 20) + 1,
            butsEncaisses: Math.floor(Math.random() * 30) + 5,
            passesDecisives: Math.floor(Math.random() * 15) + 1,
            cleanSheets: Math.floor(Math.random() * 10) + 1
          }
        });

        await player.save();
        console.log(`✅ Profil joueur créé pour: ${userData.pseudo}`);
        createdCount++;

      } catch (error) {
        console.error(`❌ Erreur création ${userData.pseudo}:`, error.message);
      }
    }

    console.log('\n📊 Résumé de la création:');
    console.log(`✅ Utilisateurs créés: ${createdCount}`);
    console.log(`⏭️ Utilisateurs ignorés (déjà existants): ${skippedCount}`);
    console.log(`📝 Total traité: ${testUsers.length}`);

    // Afficher les identifiants de connexion
    console.log('\n🔑 Identifiants de connexion:');
    testUsers.forEach((user, index) => {
      console.log(`${index + 1}. ${user.pseudo} - ${user.email} / ${user.password}`);
    });

  } catch (error) {
    console.error('❌ Erreur générale:', error);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Connexion MongoDB fermée');
  }
};

// Exécuter le script
connectDB().then(() => {
  createTestUsers();
}); 