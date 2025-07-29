const mongoose = require('mongoose');
const Competition = require('./models/Competition');
const User = require('./models/User');

require('dotenv').config();

// Connexion à MongoDB
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/club-pro-commu', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB connecté'))
.catch((err) => console.error('Erreur MongoDB :', err));

const competitionsData = [
  {
    nom: "Coupe de France Pro Clubs 2024",
    type: "coupe",
    description: "La plus grande compétition française de EA Sports FC Pro Clubs. Plus de 100 équipes s'affrontent pour remporter le titre de champion de France.",
    dateDebut: new Date('2024-02-15'),
    dateFin: new Date('2024-03-15'),
    nombreEquipes: 64,
    niveau: "Tous niveaux",
    plateforme: "PS5",
    statut: "Ouvert",
    inscriptionGratuite: true,
    montantInscription: 0,
    recompense: "🏆 Trophée de champion de France\n💰 500€ de récompenses\n🎮 Équipements exclusifs\n📺 Diffusion sur Twitch",
    reglement: "1. Format : Élimination directe\n2. Matchs : 2x12 minutes\n3. Règles EA Sports FC 24 officielles\n4. Pas de glitch autorisé\n5. Respect obligatoire des adversaires\n6. Arbitrage vidéo en cas de litige",
    equipesInscrites: []
  },
  {
    nom: "Championnat Ligue 1 Pro Clubs",
    type: "championnat",
    description: "Championnat saisonnier avec 20 équipes. Chaque équipe affronte tous les autres clubs en matchs aller-retour.",
    dateDebut: new Date('2024-01-20'),
    dateFin: new Date('2024-05-20'),
    nombreEquipes: 20,
    niveau: "Intermédiaire",
    plateforme: "PS5",
    statut: "En cours",
    inscriptionGratuite: false,
    montantInscription: 10,
    recompense: "🏆 Trophée de champion\n💰 300€ de récompenses\n🎮 Équipements exclusifs",
    reglement: "1. Format : Championnat\n2. Matchs : 2x12 minutes\n3. 3 points pour une victoire, 1 pour un nul\n4. Classement par points puis goal average\n5. Respect des règles EA Sports FC 24",
    equipesInscrites: []
  },
  {
    nom: "Tournoi Amical International",
    type: "tournoi",
    description: "Tournoi amical ouvert à tous les niveaux. L'occasion de rencontrer de nouveaux joueurs et de s'amuser !",
    dateDebut: new Date('2024-02-01'),
    dateFin: new Date('2024-02-03'),
    nombreEquipes: 16,
    niveau: "Tous niveaux",
    plateforme: "Cross-Platform",
    statut: "Ouvert",
    inscriptionGratuite: true,
    montantInscription: 0,
    recompense: "🎮 Équipements exclusifs\n🏆 Diplôme de participation\n📸 Photo souvenir",
    reglement: "1. Format : Tournoi à élimination directe\n2. Matchs : 2x8 minutes\n3. Règles amicales\n4. Pas de pression, que du fun !\n5. Respect mutuel obligatoire",
    equipesInscrites: []
  },
  {
    nom: "Elite Cup - Expert Only",
    type: "tournoi",
    description: "Compétition réservée aux meilleurs joueurs. Niveau expert requis avec preuves de compétences.",
    dateDebut: new Date('2024-03-01'),
    dateFin: new Date('2024-03-10'),
    nombreEquipes: 8,
    niveau: "Expert",
    plateforme: "PS5",
    statut: "Ouvert",
    inscriptionGratuite: false,
    montantInscription: 25,
    recompense: "🏆 Trophée Elite Cup\n💰 1000€ de récompenses\n🎮 Équipements ultra-rares\n📺 Diffusion professionnelle\n🌟 Statut VIP permanent",
    reglement: "1. Format : Tournoi élite\n2. Matchs : 2x15 minutes\n3. Règles EA Sports FC 24 strictes\n4. Arbitrage professionnel\n5. Vérification des compétences\n6. Zéro tolérance pour le manque de respect",
    equipesInscrites: []
  },
  {
    nom: "Weekend Challenge",
    type: "friendly",
    description: "Challenge du weekend pour s'amuser entre amis. Pas de pression, juste du bon temps !",
    dateDebut: new Date('2024-02-10'),
    dateFin: new Date('2024-02-11'),
    nombreEquipes: 4,
    niveau: "Débutant",
    plateforme: "Xbox",
    statut: "Ouvert",
    inscriptionGratuite: true,
    montantInscription: 0,
    recompense: "🎮 Équipements amicaux\n🏆 Diplôme de participation\n😊 Bonne humeur garantie",
    reglement: "1. Format : Matchs amicaux\n2. Matchs : 2x6 minutes\n3. Règles détendues\n4. Priorité au fun\n5. Pas de prise de tête !",
    equipesInscrites: []
  }
];

const seedCompetitions = async () => {
  try {
    // Supprimer les anciennes compétitions
    await Competition.deleteMany({});
    console.log('Anciennes compétitions supprimées');

    // Récupérer un utilisateur pour être le créateur
    const user = await User.findOne({});
    if (!user) {
      console.log('Aucun utilisateur trouvé, impossible de créer des compétitions');
      return;
    }

    // Créer les nouvelles compétitions
    const competitions = competitionsData.map(comp => ({
      ...comp,
      createurId: user._id
    }));

    await Competition.insertMany(competitions);
    console.log(`${competitions.length} compétitions créées avec succès !`);

    // Afficher les compétitions créées
    const createdCompetitions = await Competition.find().populate('createurId', 'pseudo');
    console.log('\nCompétitions créées :');
    createdCompetitions.forEach(comp => {
      console.log(`- ${comp.nom} (${comp.statut}) - Créé par ${comp.createurId.pseudo}`);
    });

  } catch (error) {
    console.error('Erreur lors du seeding des compétitions:', error);
  } finally {
    mongoose.connection.close();
    console.log('Connexion MongoDB fermée');
  }
};

seedCompetitions(); 