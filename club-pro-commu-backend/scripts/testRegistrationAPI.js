const mongoose = require('mongoose');
const Club = require('../models/Club');
const User = require('../models/User');
const Competition = require('../models/Competition');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/club-pro-commu';

async function run() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // 1. Trouver ou créer l'utilisateur AdminTest
    let user = await User.findOne({ email: 'admin.test@clubprocommu.fr' });
    if (!user) {
      console.log('User AdminTest not found, creating one...');
      user = new User({
        pseudo: 'AdminTest',
        email: 'admin.test@clubprocommu.fr',
        motDePasse: 'TestPassword123!',
        isAdmin: true
      });
      await user.save();
    }
    console.log(`User: ${user.pseudo} (ID: ${user._id})`);

    // 2. Trouver ou créer un club pour cet utilisateur
    let club = await Club.findOne({ createurId: user._id });
    if (!club) {
      console.log('Club not found for this user, creating one...');
      club = new Club({
        nom: 'Test Club AdminTest',
        createurId: user._id,
        plateformes: ['PS5'],
        pays: 'France',
        membres: [{
          userId: user._id,
          role: 'Admin',
          dateAdhesion: new Date()
        }],
        effectifActuel: 1
      });
      await club.save();
    }
    console.log(`Club: ${club.nom} (ID: ${club._id})`);

    // 3. Trouver ou créer une compétition ouverte
    let competition = await Competition.findOne({ statut: 'Ouvert' });
    if (!competition) {
      competition = await Competition.findOne({ statut: 'Brouillon' });
    }
    if (!competition) {
      console.log('No competition found, creating one...');
      competition = new Competition({
        nom: 'Test Competition',
        type: 'elimination_directe',
        dateDebut: new Date(Date.now() + 24 * 60 * 60 * 1000),
        nombreEquipes: 8,
        createurId: user._id,
        statut: 'Brouillon',
        inscriptionsOuvertes: true
      });
      await competition.save();
    }
    console.log(`Competition: ${competition.nom} (ID: ${competition._id}), Statut: ${competition.statut}, InscriptionsOuvertes: ${competition.inscriptionsOuvertes}`);

    // Simuler la logique de POST /api/competitions/:id/inscription
    const req = {
      body: { clubId: club._id.toString(), message: 'Hello' },
      user: { id: user._id.toString(), pseudo: user.pseudo }
    };

    console.log('\n--- SIMULATING BACKEND INSCRIPTION LOGIC ---');
    
    const { clubId, message = '' } = req.body;
    const competitionId = competition._id.toString();

    if (!clubId) {
      throw new Error('ID du club requis');
    }

    const comp = await Competition.findById(competitionId);
    if (!comp) {
      throw new Error('Compétition non trouvée');
    }

    // Vérifier que les inscriptions sont ouvertes
    if (!comp.inscriptionsOuvertes) {
      throw new Error('Les inscriptions sont fermées');
    }

    // Vérifier que le club n'est pas déjà inscrit
    const dejaInscrit = comp.equipesInscrites.some(
      equipe => equipe.clubId.toString() === clubId
    );
    if (dejaInscrit) {
      throw new Error('Ce club est déjà inscrit');
    }

    // Vérifier que l'utilisateur est admin du club ou créateur du club
    const dbClub = await Club.findById(clubId);
    if (!dbClub) {
      throw new Error('Club non trouvé');
    }

    console.log('Club Creator ID:', dbClub.createurId);
    console.log('Request User ID:', req.user.id);
    console.log('Club membres:', dbClub.membres);

    const estAdmin = dbClub.membres.some(
      membre => membre.userId.toString() === req.user.id && (membre.role === 'Admin' || membre.role === 'Capitaine')
    );
    const estCreateurClub = dbClub.createurId && dbClub.createurId.toString() === req.user.id;
    
    console.log('estAdmin:', estAdmin);
    console.log('estCreateurClub:', estCreateurClub);

    if (!estAdmin && !estCreateurClub) {
      throw new Error('Vous devez être admin ou créateur du club pour l\'inscrire');
    }

    // Ajouter l'équipe selon le mode d'inscription
    if (comp.modeInscription === 'validation_requise') {
      comp.demandesInscription.push({
        clubId,
        message,
        statut: 'En attente'
      });
    } else {
      comp.equipesInscrites.push({
        clubId,
        statut: comp.inscriptionGratuite ? 'Confirmé' : 'Inscrit',
        statutPaiement: comp.inscriptionGratuite ? 'Gratuit' : 'En attente'
      });
    }

    await comp.save();
    console.log('✅ Simulation completed successfully, club registered!');

    await mongoose.disconnect();
    console.log('✅ Disconnected');
  } catch (err) {
    console.error('❌ Error during simulation:', err.message);
  }
}

run();
