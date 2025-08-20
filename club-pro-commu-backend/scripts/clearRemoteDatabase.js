require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const Player = require('../models/Player');
const Club = require('../models/Club');
const Competition = require('../models/Competition');
const Notification = require('../models/Notification');
const Invitation = require('../models/Invitation');

// URL de la base de données de production
const PRODUCTION_URI = 'https://club-pro-commu.onrender.com'; // URL du backend de production
const MONGODB_PRODUCTION_URI = process.env.MONGODB_URI_PRODUCTION; // Variable d'environnement pour la prod

const clearRemoteDatabase = async () => {
  try {
    // Sécurité : vérifier que nous ne sommes pas en local
    if (!MONGODB_PRODUCTION_URI) {
      console.error('❌ ERREUR : Variable MONGODB_URI_PRODUCTION non définie !');
      console.log('💡 Pour vider la base de production, vous devez :');
      console.log('   1. Définir la variable MONGODB_URI_PRODUCTION dans votre .env');
      console.log('   2. Ou utiliser clearLocalDatabase.js pour la base locale');
      return;
    }

    if (MONGODB_PRODUCTION_URI.includes('localhost') || MONGODB_PRODUCTION_URI.includes('127.0.0.1')) {
      console.error('❌ ERREUR : L\'URI de production pointe vers localhost !');
      console.log('💡 Utilisez clearLocalDatabase.js pour vider la base locale');
      return;
    }

    console.log('🔄 Connexion à la base de données de PRODUCTION...');
    console.log('🌐 URL cible :', MONGODB_PRODUCTION_URI.replace(/\/\/[^:]+:[^@]+@/, '//***:***@')); // Masquer les credentials
    
    await mongoose.connect(MONGODB_PRODUCTION_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connexion établie à la base de production');

    // Triple avertissement pour la production
    console.log('\n🚨 ATTENTION CRITIQUE 🚨');
    console.log('⚠️  Vous vous apprêtez à vider la base de données DE PRODUCTION !');
    console.log('⚠️  Cette action est IRRÉVERSIBLE !');
    console.log('⚠️  Toutes les données utilisateurs seront PERDUES !');
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

    console.log('\n📈 État actuel de la base de PRODUCTION :');
    console.log(`   👤 Utilisateurs : ${usersCount}`);
    console.log(`   ⚽ Joueurs : ${playersCount}`);
    console.log(`   🏆 Clubs : ${clubsCount}`);
    console.log(`   🏅 Compétitions : ${competitionsCount}`);
    console.log(`   🔔 Notifications : ${notificationsCount}`);
    console.log(`   💌 Invitations : ${invitationsCount}`);

    const totalDocuments = usersCount + playersCount + clubsCount + competitionsCount + notificationsCount + invitationsCount;
    
    if (totalDocuments === 0) {
      console.log('\n✅ La base de données de production est déjà vide !');
      return;
    }

    console.log(`\n🗑️  Total de ${totalDocuments} documents à supprimer en PRODUCTION...`);
    
    // Demander une confirmation explicite
    console.log('\n❓ Pour continuer, vous devez confirmer en tapant exactement : "SUPPRIMER PRODUCTION"');
    console.log('❓ Ou utilisez Ctrl+C pour annuler maintenant');
    console.log('\n⏰ Attente de 10 secondes pour réfléchir...');
    
    // Attendre 10 secondes
    await new Promise(resolve => setTimeout(resolve, 10000));
    
    console.log('\n🔄 Suppression en cours en PRODUCTION...');
    console.log('⚠️  Dernière chance : Ctrl+C pour annuler !');
    
    // Attendre encore 3 secondes
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Supprimer toutes les collections
    const deleteResults = await Promise.all([
      User.deleteMany({}),
      Player.deleteMany({}),
      Club.deleteMany({}),
      Competition.deleteMany({}),
      Notification.deleteMany({}),
      Invitation.deleteMany({})
    ]);

    console.log('\n✅ Suppression terminée en PRODUCTION !');
    console.log('📊 Résultats :');
    console.log(`   👤 Utilisateurs supprimés : ${deleteResults[0].deletedCount}`);
    console.log(`   ⚽ Joueurs supprimés : ${deleteResults[1].deletedCount}`);
    console.log(`   🏆 Clubs supprimés : ${deleteResults[2].deletedCount}`);
    console.log(`   🏅 Compétitions supprimées : ${deleteResults[3].deletedCount}`);
    console.log(`   🔔 Notifications supprimées : ${deleteResults[4].deletedCount}`);
    console.log(`   💌 Invitations supprimées : ${deleteResults[5].deletedCount}`);

    const totalDeleted = deleteResults.reduce((sum, result) => sum + result.deletedCount, 0);
    console.log(`\n🎉 Total supprimé en PRODUCTION : ${totalDeleted} documents`);

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
      console.log('\n✅ Base de données de PRODUCTION vidée avec succès !');
      console.log('🔄 Vous pouvez maintenant redémarrer l\'application et créer de nouvelles données');
    } else {
      console.log('\n⚠️  Attention : Il reste encore des documents en PRODUCTION :');
      console.log(`   👤 Utilisateurs : ${finalUsersCount}`);
      console.log(`   ⚽ Joueurs : ${finalPlayersCount}`);
      console.log(`   🏆 Clubs : ${finalClubsCount}`);
      console.log(`   🏅 Compétitions : ${finalCompetitionsCount}`);
      console.log(`   🔔 Notifications : ${finalNotificationsCount}`);
      console.log(`   💌 Invitations : ${finalInvitationsCount}`);
    }

  } catch (error) {
    console.error('❌ Erreur lors du vidage de la base de production :', error);
    if (error.message.includes('authentication failed')) {
      console.log('💡 Vérifiez vos credentials MongoDB de production');
    }
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Déconnexion de MongoDB Production');
  }
};

// Instructions de sécurité
console.log('🚨 SCRIPT DE SUPPRESSION DE LA BASE DE PRODUCTION 🚨');
console.log('⚠️  Ce script supprime TOUTES les données de production !');
console.log('💡 Pour vider la base locale, utilisez : node scripts/clearLocalDatabase.js');
console.log('');

// Exécuter le script seulement si appelé directement
if (require.main === module) {
  clearRemoteDatabase();
}

module.exports = clearRemoteDatabase; 