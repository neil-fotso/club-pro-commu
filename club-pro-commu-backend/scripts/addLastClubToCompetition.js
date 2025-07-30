const mongoose = require('mongoose');
const Competition = require('../models/Competition');
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

const addLastClubToCompetition = async () => {
  try {
    console.log('🚀 Ajout du dernier club à la compétition toppers...');
    
    // Trouver la compétition "toppers"
    const competition = await Competition.findOne({ nom: 'toppers' });
    if (!competition) {
      console.log('❌ Compétition "toppers" non trouvée');
      return;
    }
    
    console.log(`✅ Compétition trouvée: ${competition.nom}`);
    console.log(`📊 Équipes inscrites actuellement: ${competition.equipesInscrites.length}/${competition.nombreEquipes}`);
    
    // Trouver les clubs déjà inscrits
    const clubsInscrits = competition.equipesInscrites.map(eq => eq.clubId.toString());
    
    // Trouver les clubs disponibles (non inscrits et pas "champs")
    const clubsDisponibles = await Club.find({ 
      nom: { $ne: 'champs' }, 
      _id: { $nin: clubsInscrits } 
    });
    
    if (clubsDisponibles.length === 0) {
      console.log('❌ Aucun club disponible pour l\'inscription');
      return;
    }
    
    // Prendre le premier club disponible
    const clubAAjouter = clubsDisponibles[0];
    
    console.log(`✅ Club à ajouter: ${clubAAjouter.nom}`);
    
    // Ajouter le club à la compétition
    const nouvelleInscription = {
      clubId: clubAAjouter._id,
      dateInscription: new Date(),
      statut: 'Inscrit'
    };
    
    competition.equipesInscrites.push(nouvelleInscription);
    
    // Sauvegarder la compétition
    await competition.save();
    
    console.log('\n📊 Résumé:');
    console.log(`✅ Compétition: ${competition.nom}`);
    console.log(`✅ Club ajouté: ${clubAAjouter.nom}`);
    console.log(`✅ Total équipes inscrites: ${competition.equipesInscrites.length}/${competition.nombreEquipes}`);
    
    // Afficher la liste complète des équipes inscrites
    console.log('\n🏆 Équipes inscrites:');
    for (let i = 0; i < competition.equipesInscrites.length; i++) {
      const inscription = competition.equipesInscrites[i];
      const club = await Club.findById(inscription.clubId);
      if (club) {
        console.log(`${i + 1}. ${club.nom} - Statut: ${inscription.statut}`);
      }
    }

  } catch (error) {
    console.error('❌ Erreur générale:', error);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Connexion MongoDB fermée');
  }
};

// Exécuter le script
connectDB().then(() => {
  addLastClubToCompetition();
}); 