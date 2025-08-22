require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

const debugAdminLogin = async () => {
  try {
    console.log('🔄 Connexion à MongoDB...');
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/club-pro-commu');
    
    console.log('🔍 DEBUG DE LA CONNEXION ADMINISTRATEUR\n');
    console.log('═══════════════════════════════════════════════════════════════════════════\n');

    const adminEmail = 'admin.dashboard@clubprocommu.fr';
    const testPassword = 'AdminTest123!';

    // Rechercher l'admin
    const admin = await User.findOne({ email: adminEmail });
    
    if (!admin) {
      console.log('❌ PROBLÈME: Administrateur non trouvé !');
      console.log(`📧 Email recherché: ${adminEmail}`);
      
      // Lister tous les admins
      console.log('\n📋 Admins existants:');
      const allAdmins = await User.find({ isAdmin: true });
      if (allAdmins.length === 0) {
        console.log('   ⚠️  Aucun administrateur trouvé dans la base !');
      } else {
        allAdmins.forEach(admin => {
          console.log(`   👤 ${admin.email} - ${admin.pseudo} - isAdmin: ${admin.isAdmin}`);
        });
      }
      return;
    }

    console.log('✅ Administrateur trouvé:');
    console.log(`   📧 Email: ${admin.email}`);
    console.log(`   👤 Pseudo: ${admin.pseudo}`);
    console.log(`   🛡️  isAdmin: ${admin.isAdmin}`);
    console.log(`   🔐 Hash password: ${admin.password?.substring(0, 20)}...`);

    // Tester la comparaison de mot de passe
    console.log('\n🔐 TEST DU MOT DE PASSE:');
    console.log(`   🔤 Mot de passe testé: ${testPassword}`);
    
    try {
      const passwordMatch = await bcrypt.compare(testPassword, admin.password);
      console.log(`   ✅ Comparaison bcrypt: ${passwordMatch ? 'SUCCÈS' : 'ÉCHEC'}`);
      
      if (!passwordMatch) {
        console.log('\n🔧 CORRECTION DU MOT DE PASSE...');
        const newHashedPassword = await bcrypt.hash(testPassword, 10);
        admin.password = newHashedPassword;
        admin.isAdmin = true; // S'assurer que isAdmin est true
        await admin.save();
        console.log('   ✅ Mot de passe corrigé et droits admin confirmés !');
        
        // Re-tester
        const retestMatch = await bcrypt.compare(testPassword, admin.password);
        console.log(`   🔄 Nouveau test: ${retestMatch ? 'SUCCÈS' : 'ÉCHEC'}`);
      }
    } catch (error) {
      console.error('❌ Erreur lors de la comparaison:', error);
    }

    // Vérifier la structure complète de l'admin
    console.log('\n📊 STRUCTURE COMPLÈTE DE L\'ADMIN:');
    console.log('┌─────────────────────────────────────────────────────────────────────────┐');
    console.log(`│ ID:        ${admin._id}`);
    console.log(`│ Email:     ${admin.email}`);
    console.log(`│ Pseudo:    ${admin.pseudo}`);
    console.log(`│ Nom:       ${admin.nom} ${admin.prenom}`);
    console.log(`│ isAdmin:   ${admin.isAdmin}`);
    console.log(`│ Pays:      ${admin.pays}`);
    console.log(`│ Créé le:   ${admin.createdAt}`);
    console.log('└─────────────────────────────────────────────────────────────────────────┘');

    console.log('\n🚀 IDENTIFIANTS CONFIRMÉS:');
    console.log(`📧 Email:    ${admin.email}`);
    console.log(`🔐 Password: ${testPassword}`);
    console.log(`🛡️  Admin:    ${admin.isAdmin ? 'OUI' : 'NON'}`);

    console.log('\n💡 CONSEILS DE DEBUG:');
    console.log('   1. Vérifiez que le frontend pointe sur le bon backend');
    console.log('   2. Vérifiez les logs de la requête de connexion');
    console.log('   3. Testez avec curl pour isoler le problème');
    console.log('   4. Vérifiez que le middleware auth fonctionne');

  } catch (error) {
    console.error('❌ Erreur lors du debug:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Déconnexion MongoDB');
  }
};

if (require.main === module) {
  debugAdminLogin();
}

module.exports = debugAdminLogin; 