const mongoose = require('mongoose');
const User = require('./models/User');
const Player = require('./models/Player');
require('dotenv').config();

// Configuration de la base de données
const MONGODB_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/clubprocommu';

// Données des joueurs de test
const playerData = [
  {
    pseudo: 'AlexDupont',
    age: 25,
    nationalite: 'Française',
    ville: 'Paris',
    plateforme: 'PS5',
    position: 'Attaquant',
    postePrincipal: 'BU',
    postesSecondaires: ['AG', 'AD'],
    langues: ['Français', 'Anglais'],
    niveau: 'Avancé',
    experience: 3,
    bio: 'Attaquant rapide et technique, spécialisé dans les buts décisifs.',
    description: 'Joueur expérimenté avec un excellent sens du but. Recherche un club compétitif pour évoluer au plus haut niveau.',
    rechercheClub: true,
    disponibilite: 'Disponible',
    statistiques: {
      matchsJoues: 150,
      butsMarques: 45,
      passesDecisives: 32,
      ratioVictoire: 0.68
    }
  },
  {
    pseudo: 'MarieMartin',
    age: 23,
    nationalite: 'Française',
    ville: 'Lyon',
    plateforme: 'PC',
    position: 'Milieu',
    postePrincipal: 'MOC',
    postesSecondaires: ['MG', 'MD'],
    langues: ['Français', 'Espagnol'],
    niveau: 'Intermédiaire',
    experience: 2,
    bio: 'Milieu de terrain créatif avec une excellente vision du jeu.',
    description: 'Joueuse technique qui aime créer le jeu. Recherche une équipe qui valorise le jeu de possession.',
    rechercheClub: true,
    disponibilite: 'Disponible',
    statistiques: {
      matchsJoues: 120,
      butsMarques: 18,
      passesDecisives: 45,
      ratioVictoire: 0.62
    }
  },
  {
    pseudo: 'ThomasBernard',
    age: 28,
    nationalite: 'Française',
    ville: 'Marseille',
    plateforme: 'Xbox',
    position: 'Défenseur',
    postePrincipal: 'DC',
    postesSecondaires: ['DD', 'DG'],
    langues: ['Français', 'Anglais'],
    niveau: 'Expert',
    experience: 5,
    bio: 'Défenseur central solide et expérimenté.',
    description: 'Défenseur central avec une grande expérience. Spécialisé dans l\'interception et la relance propre.',
    rechercheClub: false,
    disponibilite: 'Occupé',
    statistiques: {
      matchsJoues: 280,
      butsMarques: 12,
      passesDecisives: 28,
      ratioVictoire: 0.75
    }
  },
  {
    pseudo: 'SophiePetit',
    age: 21,
    nationalite: 'Française',
    ville: 'Toulouse',
    plateforme: 'PS5',
    position: 'Gardien',
    postePrincipal: 'GB',
    postesSecondaires: ['DC'],
    langues: ['Français', 'Anglais'],
    niveau: 'Avancé',
    experience: 3,
    bio: 'Gardien agile avec d\'excellents réflexes.',
    description: 'Gardienne jeune mais prometteuse. Excellente sur les sorties et les relances.',
    rechercheClub: true,
    disponibilite: 'Recherche équipe',
    statistiques: {
      matchsJoues: 95,
      butsMarques: 0,
      passesDecisives: 15,
      ratioVictoire: 0.58
    }
  },
  {
    pseudo: 'LucasRobert',
    age: 26,
    nationalite: 'Française',
    ville: 'Nantes',
    plateforme: 'PC',
    position: 'Attaquant',
    postePrincipal: 'AG',
    postesSecondaires: ['BU', 'AD'],
    langues: ['Français', 'Anglais', 'Allemand'],
    niveau: 'Pro',
    experience: 6,
    bio: 'Attaquant de pointe redoutable avec un excellent sens du but.',
    description: 'Attaquant professionnel avec une grande expérience. Spécialisé dans les buts décisifs et les actions décisives.',
    rechercheClub: false,
    disponibilite: 'Occupé',
    statistiques: {
      matchsJoues: 320,
      butsMarques: 156,
      passesDecisives: 89,
      ratioVictoire: 0.82
    }
  },
  {
    pseudo: 'JulieRichard',
    age: 24,
    nationalite: 'Française',
    ville: 'Bordeaux',
    plateforme: 'Xbox',
    position: 'Milieu',
    postePrincipal: 'MG',
    postesSecondaires: ['MOC', 'MD'],
    langues: ['Français', 'Anglais'],
    niveau: 'Intermédiaire',
    experience: 2,
    bio: 'Milieu gauche technique avec une bonne frappe.',
    description: 'Joueuse polyvalente qui peut évoluer sur plusieurs postes. Recherche une équipe pour progresser.',
    rechercheClub: true,
    disponibilite: 'Disponible',
    statistiques: {
      matchsJoues: 110,
      butsMarques: 25,
      passesDecisives: 38,
      ratioVictoire: 0.65
    }
  },
  {
    pseudo: 'PierreDurand',
    age: 29,
    nationalite: 'Française',
    ville: 'Lille',
    plateforme: 'PS5',
    position: 'Défenseur',
    postePrincipal: 'DD',
    postesSecondaires: ['DC', 'MD'],
    langues: ['Français', 'Anglais'],
    niveau: 'Avancé',
    experience: 4,
    bio: 'Latéral droit offensif avec une bonne relance.',
    description: 'Défenseur latéral qui aime monter en attaque. Bonne relance et centres de qualité.',
    rechercheClub: true,
    disponibilite: 'Disponible',
    statistiques: {
      matchsJoues: 200,
      butsMarques: 8,
      passesDecisives: 42,
      ratioVictoire: 0.70
    }
  },
  {
    pseudo: 'CamilleMoreau',
    age: 22,
    nationalite: 'Française',
    ville: 'Strasbourg',
    plateforme: 'PC',
    position: 'Milieu',
    postePrincipal: 'MDC',
    postesSecondaires: ['DC', 'MOC'],
    langues: ['Français', 'Allemand'],
    niveau: 'Intermédiaire',
    experience: 2,
    bio: 'Milieu défensif solide avec une bonne récupération.',
    description: 'Joueur défensif qui aime récupérer le ballon et relancer proprement.',
    rechercheClub: true,
    disponibilite: 'Disponible',
    statistiques: {
      matchsJoues: 85,
      butsMarques: 5,
      passesDecisives: 22,
      ratioVictoire: 0.55
    }
  },
  {
    pseudo: 'AntoineSimon',
    age: 27,
    nationalite: 'Française',
    ville: 'Nice',
    plateforme: 'Xbox',
    position: 'Attaquant',
    postePrincipal: 'AD',
    postesSecondaires: ['AG', 'BU'],
    langues: ['Français', 'Anglais', 'Italien'],
    niveau: 'Expert',
    experience: 5,
    bio: 'Ailier droit rapide avec une excellente technique.',
    description: 'Ailier droit avec une grande vitesse et une excellente technique. Spécialisé dans les débordements.',
    rechercheClub: false,
    disponibilite: 'Occupé',
    statistiques: {
      matchsJoues: 250,
      butsMarques: 78,
      passesDecisives: 95,
      ratioVictoire: 0.78
    }
  },
  {
    pseudo: 'LauraMichel',
    age: 25,
    nationalite: 'Française',
    ville: 'Rennes',
    plateforme: 'PS5',
    position: 'Milieu',
    postePrincipal: 'MD',
    postesSecondaires: ['MG', 'MOC'],
    langues: ['Français', 'Anglais'],
    niveau: 'Avancé',
    experience: 3,
    bio: 'Milieu droit polyvalent avec une bonne frappe.',
    description: 'Milieu de terrain polyvalent qui peut évoluer sur plusieurs postes. Bonne frappe et vision du jeu.',
    rechercheClub: true,
    disponibilite: 'Disponible',
    statistiques: {
      matchsJoues: 180,
      butsMarques: 35,
      passesDecisives: 52,
      ratioVictoire: 0.68
    }
  }
];

const seedPlayers = async () => {
  try {
    // Connexion à MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connexion à MongoDB établie');

    // Récupérer les utilisateurs de test
    const users = await User.find({ email: { $regex: /@test\.com$/ } });
    console.log(`👥 ${users.length} utilisateurs de test trouvés`);

    if (users.length === 0) {
      console.log('❌ Aucun utilisateur de test trouvé. Exécutez d\'abord seedUsers.js');
      return;
    }

    // Supprimer les profils de joueurs existants pour les utilisateurs de test
    const existingPlayers = await Player.find({ userId: { $in: users.map(u => u._id) } });
    if (existingPlayers.length > 0) {
      await Player.deleteMany({ userId: { $in: users.map(u => u._id) } });
      console.log(`🗑️ ${existingPlayers.length} profils de joueurs supprimés`);
    }

    // Créer les profils de joueurs
    const playersToCreate = users.map((user, index) => ({
      userId: user._id,
      ...playerData[index]
    }));

    const createdPlayers = await Player.insertMany(playersToCreate);
    console.log(`✅ ${createdPlayers.length} profils de joueurs créés avec succès !`);

    // Afficher les joueurs créés
    console.log('\n📋 Joueurs créés :');
    createdPlayers.forEach((player, index) => {
      console.log(`${index + 1}. ${player.pseudo} - ${player.position} (${player.plateforme})`);
    });

  } catch (error) {
    console.error('❌ Erreur lors du seeding des joueurs:', error);
  } finally {
    // Fermer la connexion
    await mongoose.connection.close();
    console.log('🔌 Connexion MongoDB fermée');
  }
};

// Exécuter le script
seedPlayers(); 