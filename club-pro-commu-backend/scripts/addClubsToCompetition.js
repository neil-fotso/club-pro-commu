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

const addClubsToCompetition = async () => {
  try {
    console.log('🚀 Début de l\'ajout des clubs à la compétition...');
    
    // Trouver la compétition "toppers"
    const competition = await Competition.findOne({ nom: { $regex: /toppers/i } });
    if (!competition) {
      console.log('❌ Compétition "toppers" non trouvée');
      return;
    }
    
    console.log(`✅ Compétition trouvée: ${competition.nom}`);
    console.log(`📊 Équipes inscrites actuellement: ${competition.equipesInscrites.length}`);
    
    // Trouver 7 clubs existants (excluant le club "champs")
    const clubs = await Club.find({ nom: { $ne: 'champs' } }).limit(7);
    
    if (clubs.length === 0) {
      console.log('❌ Aucun club trouvé');
      return;
    }
    
    console.log(`✅ ${clubs.length} clubs trouvés`);
    
    // Vérifier quels clubs sont déjà inscrits
    const clubsDejaInscrits = competition.equipesInscrites.map(eq => eq.clubId.toString());
    const clubsAAjouter = clubs.filter(club => !clubsDejaInscrits.includes(club._id.toString()));
    
    if (clubsAAjouter.length === 0) {
      console.log('⚠️ Tous les clubs sont déjà inscrits à cette compétition');
      return;
    }
    
    console.log(`📝 Clubs à ajouter: ${clubsAAjouter.length}`);
    
    // Ajouter les clubs à la compétition
    for (const club of clubsAAjouter) {
      const nouvelleInscription = {
        clubId: club._id,
        dateInscription: new Date(),
        statut: 'Inscrit'
      };
      
      competition.equipesInscrites.push(nouvelleInscription);
      console.log(`✅ Club ajouté: ${club.nom}`);
    }
    
    // Sauvegarder la compétition
    await competition.save();
    
    console.log('\n📊 Résumé:');
    console.log(`✅ Compétition: ${competition.nom}`);
    console.log(`✅ Clubs ajoutés: ${clubsAAjouter.length}`);
    console.log(`✅ Total équipes inscrites: ${competition.equipesInscrites.length}`);
    
    // Afficher la liste des équipes inscrites
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
  addClubsToCompetition();
}); 