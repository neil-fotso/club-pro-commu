require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const Club = require('../models/Club');
const Competition = require('../models/Competition');

const createTestCompetition = async () => {
  try {
    console.log('🔄 Connexion à MongoDB...');
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/club-pro-commu');
    console.log('✅ Connexion établie.');

    // 1. Trouver ou créer l'administrateur
    console.log('🔍 Recherche de l\'administrateur...');
    let admin = await User.findOne({ email: 'admin.dashboard@clubprocommu.fr' });
    if (!admin) {
      admin = await User.findOne({ isAdmin: true });
    }
    if (!admin) {
      console.log('⚠️ Aucun admin trouvé. Création de l\'admin de test...');
      admin = new User({
        email: 'admin.dashboard@clubprocommu.fr',
        pseudo: 'AdminTest',
        password: 'AdminTest123!',
        isAdmin: true
      });
      await admin.save();
    }
    console.log(`✅ Admin utilisé : ${admin.email} (ID: ${admin._id})`);

    // 2. Trouver ou créer 8 clubs pour la compétition
    console.log('🔍 Recherche de 8 clubs...');
    let clubs = await Club.find().limit(8);
    
    const fakeNames = [
      'Spartans FC', 'Titanium Pro', 'Gala Esport', 'Olympiens FC', 
      'Roosters Club', 'Phenix XI', 'Vortex United', 'Galactic United'
    ];

    while (clubs.length < 8) {
      const idx = clubs.length;
      console.log(`⚙️ Création du club de test "${fakeNames[idx]}"...`);
      const newClub = new Club({
        nom: fakeNames[idx],
        description: `Club de test numéro ${idx + 1} créé pour le bracket.`,
        createurId: admin._id,
        plateformes: ['PS5'],
        pays: 'France',
        membres: [{
          userId: admin._id,
          role: 'Admin',
          dateAdhesion: new Date()
        }],
        effectifActuel: 1
      });
      await newClub.save();
      clubs.push(newClub);
    }
    console.log(`✅ Clubs participants (${clubs.length}) :`, clubs.map(c => c.nom));

    // 3. Supprimer d'anciennes compétitions de test pour faire place nette
    console.log('🧹 Nettoyage des anciennes compétitions de test...');
    await Competition.deleteMany({ nom: 'la street club pro compétition' });

    // 4. Configurer les équipes inscrites
    const equipesInscrites = clubs.map(club => ({
      clubId: club._id,
      statut: 'Confirmé',
      dateInscription: new Date()
    }));

    // 5. Générer les matchs de bracket (tas binaire de 8 équipes)
    console.log('🎮 Génération du bracket de test (8 équipes, élimination directe)...');
    const matchsElimination = [];

    // Matchs du premier tour (Quarts de finale, index de tas 3, 4, 5, 6)
    matchsElimination.push({
      equipe1: clubs[0]._id,
      equipe2: clubs[1]._id,
      statut: 'Programmé',
      phase: 'Quart',
      tour: 3,
      stats: { buteurs: [], passeurs: [], cartonsJaunes: [], cartonsRouges: [] }
    });
    matchsElimination.push({
      equipe1: clubs[2]._id,
      equipe2: clubs[3]._id,
      statut: 'Programmé',
      phase: 'Quart',
      tour: 4,
      stats: { buteurs: [], passeurs: [], cartonsJaunes: [], cartonsRouges: [] }
    });
    matchsElimination.push({
      equipe1: clubs[4]._id,
      equipe2: clubs[5]._id,
      statut: 'Programmé',
      phase: 'Quart',
      tour: 5,
      stats: { buteurs: [], passeurs: [], cartonsJaunes: [], cartonsRouges: [] }
    });
    matchsElimination.push({
      equipe1: clubs[6]._id,
      equipe2: clubs[7]._id,
      statut: 'Programmé',
      phase: 'Quart',
      tour: 6,
      stats: { buteurs: [], passeurs: [], cartonsJaunes: [], cartonsRouges: [] }
    });

    // Matchs du second tour (Demi-finales, index de tas 1, 2)
    matchsElimination.push({
      equipe1: null,
      equipe2: null,
      statut: 'Programmé',
      phase: 'Demi',
      tour: 1,
      stats: { buteurs: [], passeurs: [], cartonsJaunes: [], cartonsRouges: [] }
    });
    matchsElimination.push({
      equipe1: null,
      equipe2: null,
      statut: 'Programmé',
      phase: 'Demi',
      tour: 2,
      stats: { buteurs: [], passeurs: [], cartonsJaunes: [], cartonsRouges: [] }
    });

    // Match de Finale (index de tas 0)
    matchsElimination.push({
      equipe1: null,
      equipe2: null,
      statut: 'Programmé',
      phase: 'Finale',
      tour: 0,
      stats: { buteurs: [], passeurs: [], cartonsJaunes: [], cartonsRouges: [] }
    });

    // Petite finale (3ème place)
    matchsElimination.push({
      equipe1: null,
      equipe2: null,
      statut: 'Programmé',
      phase: 'Petite finale',
      tour: 99,
      stats: { buteurs: [], passeurs: [], cartonsJaunes: [], cartonsRouges: [] }
    });

    // 6. Créer la compétition
    console.log('📝 Enregistrement de la compétition...');
    const competition = new Competition({
      nom: 'la street club pro compétition',
      description: 'Compétition de test officielle pour valider le visualiseur d\'arbre et la tarification.',
      type: 'elimination_directe',
      nombreEquipes: 8,
      plateforme: 'PS5',
      dateDebut: new Date(Date.now() + 24 * 60 * 60 * 1000), // Demain
      statut: 'En cours',
      inscriptionsOuvertes: false,
      inscriptionGratuite: true,
      cashprizeFinal: 100,
      createurId: admin._id,
      equipesInscrites: equipesInscrites,
      matchsElimination: matchsElimination
    });

    await competition.save();
    console.log('🏆 Compétition créée avec succès !');
    console.log(`   📌 ID : ${competition._id}`);
    console.log(`   📌 Nom : "${competition.nom}"`);
    console.log(`   📌 Nombre d'équipes : ${competition.nombreEquipes}`);
    console.log(`   📌 Statut : "${competition.statut}"`);

  } catch (error) {
    console.error('❌ Erreur lors de la création de la compétition de test:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Déconnexion.');
  }
};

createTestCompetition();
