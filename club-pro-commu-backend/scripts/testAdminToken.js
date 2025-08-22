require('dotenv').config();
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const axios = require('axios');
const User = require('../models/User');

const testAdminToken = async () => {
  try {
    console.log('🔄 Connexion à MongoDB...');
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/club-pro-commu');
    
    console.log('🔍 TEST DU TOKEN JWT ADMIN\n');
    console.log('═══════════════════════════════════════════════════════════════════════════\n');

    // 1️⃣ Récupérer l'admin
    const admin = await User.findOne({ email: 'admin.work@clubprocommu.fr' });
    console.log(`✅ Admin trouvé: ${admin.email} (ID: ${admin._id})`);

    // 2️⃣ Connecter l'admin et récupérer le token
    console.log('\n🔑 CONNEXION ADMIN...');
    const loginResponse = await axios.post('http://localhost:3001/api/auth/login', {
      email: admin.email,
      password: 'AdminWork123!'
    });

    if (loginResponse.data.message === 'Connexion réussie') {
      const token = loginResponse.data.user.token;
      console.log(`✅ Token reçu: ${token.substring(0, 30)}...`);

      // 3️⃣ Décoder le token
      console.log('\n🔓 DÉCODAGE DU TOKEN...');
      try {
        const secret = process.env.JWT_SECRET || 'votre_secret_jwt_tres_long_et_securise_pour_le_developpement_local';
        console.log(`🔐 Secret utilisé: ${secret.substring(0, 20)}...`);
        
        const decoded = jwt.verify(token, secret);
        console.log('✅ Token valide !');
        console.log('📋 Payload décodé:', JSON.stringify(decoded, null, 2));

        // 4️⃣ Tester avec l'API admin
        console.log('\n🧪 TEST API ADMIN AVEC TOKEN...');
        const authHeaders = {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        };

        const statsResponse = await axios.get('http://localhost:3001/api/admin/dashboard/stats', {
          headers: authHeaders
        });
        
        console.log('✅ API Admin accessible !');
        console.log('📊 Données stats récupérées:', Object.keys(statsResponse.data.data || {}));

      } catch (tokenError) {
        console.error('❌ Erreur de vérification token:', tokenError.message);
        
        // Essayer avec différents secrets
        console.log('\n🔄 Test avec différents secrets...');
        const secrets = [
          process.env.JWT_SECRET,
          'votre_secret_jwt_tres_long_et_securise_pour_le_developpement_local',
          'votre_jwt_secret_key',
          'your_secret_key'
        ];

        for (const testSecret of secrets) {
          if (!testSecret) continue;
          try {
            const testDecoded = jwt.verify(token, testSecret);
            console.log(`✅ Token valide avec secret: ${testSecret.substring(0, 20)}...`);
            console.log('📋 Payload:', testDecoded);
            break;
          } catch (err) {
            console.log(`❌ Échec avec secret: ${testSecret.substring(0, 20)}...`);
          }
        }
      }

    } else {
      console.log('❌ Échec de connexion:', loginResponse.data);
    }

    // 5️⃣ Vérifier les variables d'environnement
    console.log('\n🔧 VARIABLES D\'ENVIRONNEMENT:');
    console.log(`   NODE_ENV: ${process.env.NODE_ENV || 'undefined'}`);
    console.log(`   JWT_SECRET: ${process.env.JWT_SECRET ? process.env.JWT_SECRET.substring(0, 20) + '...' : 'undefined'}`);
    console.log(`   PORT: ${process.env.PORT || 'undefined'}`);
    console.log(`   MONGO_URI: ${process.env.MONGO_URI ? 'défini' : 'undefined'}`);

  } catch (error) {
    console.error('❌ Erreur lors du test:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Déconnexion MongoDB');
  }
};

if (require.main === module) {
  testAdminToken();
}

module.exports = testAdminToken; 