// Script pour créer les profils joueurs manquants pour les utilisateurs existants
const mongoose = require('mongoose');
const User = require('../models/User');
const Player = require('../models/Player');
require('dotenv').config({ path: '../.env' });

async function main() {
  await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/club-pro-commu', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  console.log('✅ Connecté à MongoDB');

  console.log('🔍 Recherche des utilisateurs...');
  const users = await User.find();
  console.log(`📊 ${users.length} utilisateurs trouvés`);

  if (users.length === 0) {
    console.log('⚠️ Aucun utilisateur trouvé dans la base de données');
    await mongoose.disconnect();
    return;
  }

  let createdCount = 0;
  let skippedCount = 0;

  for (const user of users) {
    console.log(`\n🔍 Vérification pour l'utilisateur: ${user.pseudo} (ID: ${user._id})`);
    
    const existingPlayer = await Player.findOne({ userId: user._id });
    if (existingPlayer) {
      console.log(`  ✅ Profil joueur déjà existant pour ${user.pseudo}`);
      skippedCount++;
    } else {
      console.log(`  ⚠️ Aucun profil joueur trouvé pour ${user.pseudo}, création en cours...`);
      
      try {
        const player = new Player({
          userId: user._id,
          pseudo: user.pseudo,
          age: 25,
          pays: 'France',
          plateforme: 'PS5',
          position: 'Milieu',
          postePrincipal: 'MC',
          postesSecondaires: ['MOC'],
          langues: ['Français'],
          niveau: 'Intermédiaire',
          description: `Profil automatiquement créé pour ${user.pseudo}`,
          rechercheClub: true,
          disponibilite: 'Disponible',
          statistiques: {
            matchsJoues: 0,
            victoires: 0,
            defaites: 0,
            nuls: 0,
            butsMarques: 0,
            butsEncaisses: 0,
            passesDecisives: 0,
            cleanSheets: 0
          }
        });
        
        await player.save();
        console.log(`  ✅ Profil joueur créé avec succès pour ${user.pseudo}`);
        createdCount++;
      } catch (error) {
        console.log(`  ❌ Erreur lors de la création du profil pour ${user.pseudo}:`, error.message);
      }
    }
  }

  console.log(`\n📊 Résumé:`);
  console.log(`  - Profils créés: ${createdCount}`);
  console.log(`  - Profils déjà existants: ${skippedCount}`);
  console.log(`  - Total utilisateurs traités: ${users.length}`);

  await mongoose.disconnect();
  console.log('✅ Déconnecté de MongoDB');
}

main().catch(console.error); 