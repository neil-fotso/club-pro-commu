const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Club = require('./models/Club');
const Player = require('./models/Player');

// Configuration de connexion MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ MongoDB connecté pour le seeding');
  } catch (err) {
    console.error('❌ Erreur MongoDB :', err);
    process.exit(1);
  }
};

// Données de test pour les utilisateurs
const usersData = [
  {
    pseudo: 'Zidane10',
    email: 'zidane@test.com',
    password: 'password123',
    plateforme: 'PS5',
    niveau: 'Pro',
    position: 'Milieu',
    description: 'Joueur expérimenté, recherche club compétitif'
  },
  {
    pseudo: 'Mbappe7',
    email: 'mbappe@test.com',
    password: 'password123',
    plateforme: 'PS5',
    niveau: 'Elite',
    position: 'Attaquant',
    description: 'Attaquant rapide, buteur régulier'
  },
  {
    pseudo: 'Benzema9',
    email: 'benzema@test.com',
    password: 'password123',
    plateforme: 'Xbox',
    niveau: 'Pro',
    position: 'Attaquant',
    description: 'Avant-centre technique, jeu de tête'
  },
  {
    pseudo: 'Kante13',
    email: 'kante@test.com',
    password: 'password123',
    plateforme: 'PC',
    niveau: 'Intermédiaire',
    position: 'Milieu',
    description: 'Milieu défensif, récupération'
  },
  {
    pseudo: 'Varane4',
    email: 'varane@test.com',
    password: 'password123',
    plateforme: 'PS5',
    niveau: 'Pro',
    position: 'Défenseur',
    description: 'Défenseur central, leadership'
  },
  {
    pseudo: 'Pogba6',
    email: 'pogba@test.com',
    password: 'password123',
    plateforme: 'Xbox',
    niveau: 'Elite',
    position: 'Milieu',
    description: 'Milieu créatif, passes décisives'
  },
  {
    pseudo: 'Griezmann7',
    email: 'griezmann@test.com',
    password: 'password123',
    plateforme: 'PC',
    niveau: 'Pro',
    position: 'Attaquant',
    description: 'Second attaquant, technique'
  },
  {
    pseudo: 'Lloris1',
    email: 'lloris@test.com',
    password: 'password123',
    plateforme: 'PS5',
    niveau: 'Intermédiaire',
    position: 'Gardien',
    description: 'Gardien expérimenté, réflexes'
  }
];

// Données de test pour les clubs
const clubsData = [
  {
    nom: 'Real Madrid Pro',
    plateforme: 'PS5',
    pays: 'Espagne',
    statut: 'Actif',
    description: 'Club historique, recherche joueurs de haut niveau pour compétitions',
    effectifMax: 25,
    langues: ['Espagnol', 'Anglais', 'Français'],
    recrute: true,
    niveau: 'Elite'
  },
  {
    nom: 'Barcelona FC',
    plateforme: 'PS5',
    pays: 'Espagne',
    statut: 'Actif',
    description: 'Club basé sur le jeu de possession, recherche milieux créatifs',
    effectifMax: 20,
    langues: ['Espagnol', 'Catalan', 'Anglais'],
    recrute: true,
    niveau: 'Pro'
  },
  {
    nom: 'Manchester United',
    plateforme: 'Xbox',
    pays: 'Angleterre',
    statut: 'Actif',
    description: 'Club légendaire, recherche attaquants et défenseurs',
    effectifMax: 30,
    langues: ['Anglais'],
    recrute: true,
    niveau: 'Elite'
  },
  {
    nom: 'Paris Saint-Germain',
    plateforme: 'PC',
    pays: 'France',
    statut: 'Actif',
    description: 'Club parisien, recherche joueurs pour championnat',
    effectifMax: 22,
    langues: ['Français', 'Anglais'],
    recrute: true,
    niveau: 'Pro'
  },
  {
    nom: 'Bayern Munich',
    plateforme: 'PS5',
    pays: 'Allemagne',
    statut: 'Actif',
    description: 'Club allemand, jeu direct et efficace',
    effectifMax: 18,
    langues: ['Allemand', 'Anglais'],
    recrute: true,
    niveau: 'Pro'
  },
  {
    nom: 'Juventus FC',
    plateforme: 'Xbox',
    pays: 'Italie',
    statut: 'Actif',
    description: 'Club italien, défense solide et contre-attaque',
    effectifMax: 24,
    langues: ['Italien', 'Anglais'],
    recrute: true,
    niveau: 'Intermédiaire'
  },
  {
    nom: 'Ajax Amsterdam',
    plateforme: 'PC',
    pays: 'Pays-Bas',
    statut: 'Actif',
    description: 'Club formateur, recherche jeunes talents',
    effectifMax: 16,
    langues: ['Néerlandais', 'Anglais'],
    recrute: true,
    niveau: 'Intermédiaire'
  },
  {
    nom: 'Porto FC',
    plateforme: 'PS5',
    pays: 'Portugal',
    statut: 'Actif',
    description: 'Club portugais, jeu technique et offensif',
    effectifMax: 20,
    langues: ['Portugais', 'Anglais'],
    recrute: true,
    niveau: 'Pro'
  }
];

// Fonction pour créer les utilisateurs
const createUsers = async () => {
  console.log('🔄 Création des utilisateurs...');
  
  for (const userData of usersData) {
    try {
      // Vérifier si l'utilisateur existe déjà
      const existingUser = await User.findOne({ email: userData.email });
      if (existingUser) {
        console.log(`⚠️  Utilisateur ${userData.pseudo} existe déjà`);
        continue;
      }

      // Hasher le mot de passe
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(userData.password, salt);

      // Créer l'utilisateur
      const user = new User({
        ...userData,
        password: hashedPassword
      });

      await user.save();
      console.log(`✅ Utilisateur créé : ${userData.pseudo}`);

      // Créer le profil joueur associé
      const player = new Player({
        user: user._id,
        pseudo: userData.pseudo,
        plateforme: userData.plateforme,
        niveau: userData.niveau,
        position: userData.position,
        description: userData.description
      });

      await player.save();
      console.log(`✅ Profil joueur créé pour : ${userData.pseudo}`);

    } catch (error) {
      console.error(`❌ Erreur création utilisateur ${userData.pseudo}:`, error.message);
    }
  }
};

// Fonction pour créer les clubs
const createClubs = async () => {
  console.log('🔄 Création des clubs...');
  
  for (const clubData of clubsData) {
    try {
      // Vérifier si le club existe déjà
      const existingClub = await Club.findOne({ nom: clubData.nom });
      if (existingClub) {
        console.log(`⚠️  Club ${clubData.nom} existe déjà`);
        continue;
      }

      // Sélectionner un utilisateur aléatoire comme créateur
      const users = await User.find();
      if (users.length === 0) {
        console.log('❌ Aucun utilisateur trouvé pour créer les clubs');
        return;
      }

      const randomUser = users[Math.floor(Math.random() * users.length)];

      // Créer le club
      const club = new Club({
        ...clubData,
        createur: randomUser._id,
        membres: [randomUser._id]
      });

      await club.save();
      console.log(`✅ Club créé : ${clubData.nom} (créé par ${randomUser.pseudo})`);

    } catch (error) {
      console.error(`❌ Erreur création club ${clubData.nom}:`, error.message);
    }
  }
};

// Fonction principale
const seedDatabase = async () => {
  try {
    await connectDB();
    
    console.log('🚀 Début du seeding de la base de données...');
    
    // Créer les utilisateurs d'abord
    await createUsers();
    
    // Puis créer les clubs
    await createClubs();
    
    console.log('✅ Seeding terminé avec succès !');
    
    // Afficher les statistiques
    const userCount = await User.countDocuments();
    const clubCount = await Club.countDocuments();
    const playerCount = await Player.countDocuments();
    
    console.log('\n📊 Statistiques :');
    console.log(`👥 Utilisateurs : ${userCount}`);
    console.log(`🏟️  Clubs : ${clubCount}`);
    console.log(`⚽ Joueurs : ${playerCount}`);
    
  } catch (error) {
    console.error('❌ Erreur lors du seeding :', error);
  } finally {
    mongoose.connection.close();
    console.log('🔌 Connexion MongoDB fermée');
  }
};

// Exécuter le script
if (require.main === module) {
  seedDatabase();
}

module.exports = { seedDatabase, usersData, clubsData }; 