require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const Player = require('../models/Player');
const Club = require('../models/Club');
const Competition = require('../models/Competition');
const Notification = require('../models/Notification');
const Invitation = require('../models/Invitation');

const MONGODB_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/club-pro-commu';

const clearLocalDatabase = async () => {
  try {
    console.log('🔄 Connexion à la base de données locale...');
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connexion établie à:', MONGODB_URI);

    // Demander confirmation
    console.log('\n⚠️  ATTENTION : Cette action va supprimer TOUTES les données de la base locale !');
    console.log('📊 Base de données cible :', mongoose.connection.db.databaseName);
    
    // Compter les documents avant suppression
    const [
      usersCount,
      playersCount,
      clubsCount,
      competitionsCount,
      notificationsCount,
      invitationsCount
    ] = await Promise.all([
      User.countDocuments(),
      Player.countDocuments(),
      Club.countDocuments(),
      Competition.countDocuments(),
      Notification.countDocuments(),
      Invitation.countDocuments()
    ]);

    console.log('\n📈 État actuel de la base :');
    console.log(`   👤 Utilisateurs : ${usersCount}`);
    console.log(`   ⚽ Joueurs : ${playersCount}`);
    console.log(`   🏆 Clubs : ${clubsCount}`);
    console.log(`   🏅 Compétitions : ${competitionsCount}`);
    console.log(`   🔔 Notifications : ${notificationsCount}`);
    console.log(`   💌 Invitations : ${invitationsCount}`);

    const totalDocuments = usersCount + playersCount + clubsCount + competitionsCount + notificationsCount + invitationsCount;
    
    if (totalDocuments === 0) {
      console.log('\n✅ La base de données est déjà vide !');
      return;
    }

    console.log(`\n🗑️  Total de ${totalDocuments} documents à supprimer...`);
    console.log('\n🔄 Suppression en cours...');

    // Supprimer toutes les collections
    const deleteResults = await Promise.all([
      User.deleteMany({}),
      Player.deleteMany({}),
      Club.deleteMany({}),
      Competition.deleteMany({}),
      Notification.deleteMany({}),
      Invitation.deleteMany({})
    ]);

    console.log('\n✅ Suppression terminée !');
    console.log('📊 Résultats :');
    console.log(`   👤 Utilisateurs supprimés : ${deleteResults[0].deletedCount}`);
    console.log(`   ⚽ Joueurs supprimés : ${deleteResults[1].deletedCount}`);
    console.log(`   🏆 Clubs supprimés : ${deleteResults[2].deletedCount}`);
    console.log(`   🏅 Compétitions supprimées : ${deleteResults[3].deletedCount}`);
    console.log(`   🔔 Notifications supprimées : ${deleteResults[4].deletedCount}`);
    console.log(`   💌 Invitations supprimées : ${deleteResults[5].deletedCount}`);

    const totalDeleted = deleteResults.reduce((sum, result) => sum + result.deletedCount, 0);
    console.log(`\n🎉 Total supprimé : ${totalDeleted} documents`);

    // Vérification finale
    const [
      finalUsersCount,
      finalPlayersCount,
      finalClubsCount,
      finalCompetitionsCount,
      finalNotificationsCount,
      finalInvitationsCount
    ] = await Promise.all([
      User.countDocuments(),
      Player.countDocuments(),
      Club.countDocuments(),
      Competition.countDocuments(),
      Notification.countDocuments(),
      Invitation.countDocuments()
    ]);

    const finalTotal = finalUsersCount + finalPlayersCount + finalClubsCount + finalCompetitionsCount + finalNotificationsCount + finalInvitationsCount;

    if (finalTotal === 0) {
      console.log('\n✅ Base de données locale vidée avec succès !');
    } else {
      console.log('\n⚠️  Attention : Il reste encore des documents :');
      console.log(`   👤 Utilisateurs : ${finalUsersCount}`);
      console.log(`   ⚽ Joueurs : ${finalPlayersCount}`);
      console.log(`   🏆 Clubs : ${finalClubsCount}`);
      console.log(`   🏅 Compétitions : ${finalCompetitionsCount}`);
      console.log(`   🔔 Notifications : ${finalNotificationsCount}`);
      console.log(`   💌 Invitations : ${finalInvitationsCount}`);
    }

  } catch (error) {
    console.error('❌ Erreur lors du vidage de la base :', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Déconnexion de MongoDB');
  }
};

// Exécuter le script seulement si appelé directement
if (require.main === module) {
  clearLocalDatabase();
}

module.exports = clearLocalDatabase; 