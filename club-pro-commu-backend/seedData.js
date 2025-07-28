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
    nom: 'Les Champions PS5',
    createurId: users[0]._id,
    plateforme: 'PS5',
    pays: 'France',
    description: 'Club compétitif PS5, recherche de joueurs motivés pour les compétitions.',
    recrute: true,
    niveauRecherche: 'Intermédiaire+',
    postesRecherches: ['Attaquant', 'Milieu'],
    effectifMax: 15,
    effectifActuel: 8,
    membres: [
      { userId: users[0]._id, role: 'Admin' },
      { userId: users[1]._id, role: 'Capitaine' },
      { userId: users[2]._id, role: 'Joueur' }
    ],
    langues: ['Français'],
    horaires: 'Soirées et weekends',
    dateCreation: new Date('2024-01-15')
  },
  {
    nom: 'Elite Xbox',
    createurId: users[1]._id,
    plateforme: 'Xbox',
    pays: 'France',
    description: 'Club Xbox pour joueurs expérimentés, focus sur la performance.',
    recrute: false,
    niveauRecherche: 'Expert uniquement',
    postesRecherches: ['Défenseur', 'Gardien'],
    effectifMax: 12,
    effectifActuel: 12,
    membres: [
      { userId: users[1]._id, role: 'Admin' },
      { userId: users[3]._id, role: 'Capitaine' }
    ],
    langues: ['Français', 'Anglais'],
    horaires: 'Tous les jours 20h-23h',
    dateCreation: new Date('2024-02-01')
  },
  {
    nom: 'PC Masters',
    createurId: users[2]._id,
    plateforme: 'PC',
    pays: 'Belgique',
    description: 'Club PC pour tous niveaux, ambiance conviviale et progression.',
    recrute: true,
    niveauRecherche: 'Tous niveaux',
    postesRecherches: ['Attaquant', 'Milieu', 'Défenseur', 'Gardien'],
    effectifMax: 20,
    effectifActuel: 5,
    membres: [
      { userId: users[2]._id, role: 'Admin' },
      { userId: users[4]._id, role: 'Joueur' }
    ],
    langues: ['Français', 'Néerlandais'],
    horaires: 'Weekends',
    dateCreation: new Date('2024-01-20')
  },
  {
    nom: 'PS5 Warriors',
    createurId: users[3]._id,
    plateforme: 'PS5',
    pays: 'France',
    description: 'Club PS5 compétitif, recherche de joueurs pour tournois.',
    recrute: true,
    niveauRecherche: 'Avancé+',
    postesRecherches: ['Attaquant', 'Milieu'],
    effectifMax: 11,
    effectifActuel: 7,
    membres: [
      { userId: users[3]._id, role: 'Admin' },
      { userId: users[5]._id, role: 'Capitaine' }
    ],
    langues: ['Français'],
    horaires: 'Soirées',
    dateCreation: new Date('2024-02-10')
  },
  {
    nom: 'Xbox Legends',
    createurId: users[4]._id,
    plateforme: 'Xbox',
    pays: 'France',
    description: 'Club Xbox légendaire, pour les vrais passionnés du jeu.',
    recrute: true,
    niveauRecherche: 'Intermédiaire+',
    postesRecherches: ['Milieu', 'Défenseur'],
    effectifMax: 15,
    effectifActuel: 3,
    membres: [
      { userId: users[4]._id, role: 'Admin' }
    ],
    langues: ['Français'],
    horaires: 'Flexible',
    dateCreation: new Date('2024-01-25')
  },
  {
    nom: 'PC Elite',
    createurId: users[5]._id,
    plateforme: 'PC',
    pays: 'France',
    description: 'Club PC d\'élite, pour les meilleurs joueurs.',
    recrute: false,
    niveauRecherche: 'Expert uniquement',
    postesRecherches: ['Attaquant', 'Gardien'],
    effectifMax: 10,
    effectifActuel: 10,
    membres: [
      { userId: users[5]._id, role: 'Admin' },
      { userId: users[0]._id, role: 'Capitaine' }
    ],
    langues: ['Français', 'Anglais'],
    horaires: 'Tous les jours',
    dateCreation: new Date('2024-02-05')
  },
  {
    nom: 'PS5 United',
    createurId: users[6]._id,
    plateforme: 'PS5',
    pays: 'Belgique',
    description: 'Club PS5 unifié, pour tous les joueurs.',
    recrute: true,
    niveauRecherche: 'Tous niveaux',
    postesRecherches: ['Attaquant', 'Milieu', 'Défenseur'],
    effectifMax: 18,
    effectifActuel: 9,
    membres: [
      { userId: users[6]._id, role: 'Admin' },
      { userId: users[1]._id, role: 'Joueur' }
    ],
    langues: ['Français', 'Néerlandais'],
    horaires: 'Soirées et weekends',
    dateCreation: new Date('2024-01-30')
  },
  {
    nom: 'Xbox United',
    createurId: users[7]._id,
    plateforme: 'Xbox',
    pays: 'France',
    description: 'Club Xbox unifié, pour tous les joueurs.',
    recrute: true,
    niveauRecherche: 'Tous niveaux',
    postesRecherches: ['Attaquant', 'Milieu', 'Défenseur', 'Gardien'],
    effectifMax: 16,
    effectifActuel: 4,
    membres: [
      { userId: users[7]._id, role: 'Admin' },
      { userId: users[2]._id, role: 'Joueur' }
    ],
    langues: ['Français'],
    horaires: 'Weekends',
    dateCreation: new Date('2024-02-15')
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