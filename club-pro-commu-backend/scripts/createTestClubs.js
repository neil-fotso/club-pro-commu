const mongoose = require('mongoose');
const User = require('../models/User');
const Club = require('../models/Club');

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

// Données des clubs de test
const testClubs = [
  {
    nom: 'Les Champions FC',
    description: 'Club compétitif recherchant des joueurs expérimentés pour disputer les championnats. Ambiance sérieuse mais conviviale.',
    plateformes: ['PS5'],
    pays: 'France',
    recrute: true,
    niveauRecherche: 'Avancé+',
    postesRecherches: ['Attaquant', 'Milieu', 'Défenseur'],
    effectifMax: 15,
    langues: ['Français', 'Anglais'],
    horaires: 'Soirées et weekends',
    adminPseudo: 'test1',
    membres: ['test2', 'test3', 'test4']
  },
  {
    nom: 'FC Amical',
    description: 'Club amical pour joueurs de tous niveaux. L\'important c\'est de s\'amuser et de progresser ensemble.',
    plateformes: ['Xbox'],
    pays: 'France',
    recrute: true,
    niveauRecherche: 'Tous niveaux',
    postesRecherches: ['Attaquant', 'Milieu', 'Défenseur', 'Gardien'],
    effectifMax: 12,
    langues: ['Français'],
    horaires: 'Soirées',
    adminPseudo: 'test2',
    membres: ['test5', 'test6']
  },
  {
    nom: 'Elite Gaming',
    description: 'Club d\'élite pour joueurs professionnels. Objectif : domination des compétitions.',
    plateformes: ['PC'],
    pays: 'France',
    recrute: false,
    niveauRecherche: 'Expert uniquement',
    postesRecherches: ['Attaquant', 'Milieu'],
    effectifMax: 11,
    langues: ['Français', 'Anglais'],
    horaires: 'Tous les jours',
    adminPseudo: 'test3',
    membres: ['test7', 'test8', 'AlexTheStriker', 'MidfieldMaestro']
  },
  {
    nom: 'Les Débutants',
    description: 'Club dédié aux nouveaux joueurs. Apprentissage et entraide au programme.',
    plateformes: ['PS5', 'Xbox'],
    pays: 'France',
    recrute: true,
    niveauRecherche: 'Tous niveaux',
    postesRecherches: ['Attaquant', 'Milieu', 'Défenseur', 'Gardien'],
    effectifMax: 20,
    langues: ['Français'],
    horaires: 'Weekends',
    adminPseudo: 'test4',
    membres: ['SpeedDemon', 'LeftBackLegend']
  },
  {
    nom: 'FC Défense',
    description: 'Spécialistes de la défense. Club axé sur la solidité défensive et les clean sheets.',
    plateformes: ['Xbox'],
    pays: 'France',
    recrute: true,
    niveauRecherche: 'Intermédiaire+',
    postesRecherches: ['Défenseur', 'Gardien'],
    effectifMax: 13,
    langues: ['Français', 'Espagnol'],
    horaires: 'Soirées',
    adminPseudo: 'test5',
    membres: ['DefensiveRock', 'WallDefender', 'TackleMaster']
  },
  {
    nom: 'Les Attaquants',
    description: 'Club offensif par excellence. On marque des buts et on s\'amuse !',
    plateformes: ['PS5'],
    pays: 'France',
    recrute: true,
    niveauRecherche: 'Avancé+',
    postesRecherches: ['Attaquant', 'Milieu'],
    effectifMax: 14,
    langues: ['Français', 'Anglais'],
    horaires: 'Soirées',
    adminPseudo: 'test6',
    membres: ['GoldenBoot', 'StrikerSupreme', 'WingWizard']
  },
  {
    nom: 'FC Polyvalent',
    description: 'Club pour joueurs polyvalents. Chacun peut jouer à plusieurs postes.',
    plateformes: ['PC', 'PS5'],
    pays: 'France',
    recrute: true,
    niveauRecherche: 'Tous niveaux',
    postesRecherches: ['Attaquant', 'Milieu', 'Défenseur'],
    effectifMax: 16,
    langues: ['Français'],
    horaires: 'Soirées et weekends',
    adminPseudo: 'test7',
    membres: ['CentralMid', 'PassMaster', 'RightBackRocket']
  },
  {
    nom: 'Les Gardiens',
    description: 'Club spécialisé pour les gardiens. Formation et perfectionnement technique.',
    plateformes: ['Xbox'],
    pays: 'France',
    recrute: true,
    niveauRecherche: 'Intermédiaire+',
    postesRecherches: ['Gardien'],
    effectifMax: 8,
    langues: ['Français'],
    horaires: 'Weekends',
    adminPseudo: 'test8',
    membres: ['GoalkeeperPro', 'ShotStopper']
  }
];

const createTestClubs = async () => {
  try {
    console.log('🚀 Début de la création des clubs de test...');
    
    let createdCount = 0;
    let skippedCount = 0;

    for (const clubData of testClubs) {
      try {
        // Vérifier si le club existe déjà
        const existingClub = await Club.findOne({ nom: clubData.nom });
        if (existingClub) {
          console.log(`⏭️ Club ${clubData.nom} existe déjà, ignoré`);
          skippedCount++;
          continue;
        }

        // Trouver l'admin
        const admin = await User.findOne({ pseudo: clubData.adminPseudo });
        if (!admin) {
          console.log(`❌ Admin ${clubData.adminPseudo} non trouvé pour le club ${clubData.nom}`);
          continue;
        }

        // Trouver les membres
        const membres = [];
        for (const membrePseudo of clubData.membres) {
          const membre = await User.findOne({ pseudo: membrePseudo });
          if (membre) {
            membres.push({
              userId: membre._id,
              role: 'Joueur',
              dateAdhesion: new Date()
            });
          } else {
            console.log(`⚠️ Membre ${membrePseudo} non trouvé pour le club ${clubData.nom}`);
          }
        }

        // Ajouter l'admin comme membre avec le rôle Admin
        membres.push({
          userId: admin._id,
          role: 'Admin',
          dateAdhesion: new Date()
        });

        // Créer le club
        const club = new Club({
          nom: clubData.nom,
          createurId: admin._id,
          plateformes: clubData.plateformes,
          pays: clubData.pays,
          description: clubData.description,
          recrute: clubData.recrute,
          niveauRecherche: clubData.niveauRecherche,
          postesRecherches: clubData.postesRecherches,
          effectifMax: clubData.effectifMax,
          effectifActuel: membres.length,
          membres: membres,
          langues: clubData.langues,
          horaires: clubData.horaires,
          dateCreation: new Date()
        });

        await club.save();
        console.log(`✅ Club créé: ${clubData.nom} (Admin: ${clubData.adminPseudo}, Membres: ${membres.length - 1})`);
        createdCount++;

      } catch (error) {
        console.error(`❌ Erreur création club ${clubData.nom}:`, error.message);
      }
    }

    console.log('\n📊 Résumé de la création:');
    console.log(`✅ Clubs créés: ${createdCount}`);
    console.log(`⏭️ Clubs ignorés (déjà existants): ${skippedCount}`);
    console.log(`📝 Total traité: ${testClubs.length}`);

    // Afficher les clubs créés
    console.log('\n🏆 Clubs créés:');
    testClubs.forEach((club, index) => {
      console.log(`${index + 1}. ${club.nom} - Admin: ${club.adminPseudo} - Membres: ${club.membres.length}`);
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
  createTestClubs();
}); 