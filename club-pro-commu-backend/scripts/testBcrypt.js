const bcrypt = require('bcryptjs');

const testBcrypt = async () => {
  console.log('🔍 Test de bcrypt.hash et bcrypt.compare...');
  
  const testPassword = 'password123';
  
  try {
    // Test 1: Hashage du mot de passe
    console.log('\n1️⃣ Test de hashage...');
    const salt = await bcrypt.genSalt(10);
    console.log('✅ Salt généré:', salt);
    
    const hashedPassword = await bcrypt.hash(testPassword, salt);
    console.log('✅ Mot de passe hashé:', hashedPassword);
    
    // Test 2: Comparaison avec le bon mot de passe
    console.log('\n2️⃣ Test de comparaison avec bon mot de passe...');
    const isValid1 = await bcrypt.compare(testPassword, hashedPassword);
    console.log('✅ Comparaison avec bon mot de passe:', isValid1);
    
    // Test 3: Comparaison avec un mauvais mot de passe
    console.log('\n3️⃣ Test de comparaison avec mauvais mot de passe...');
    const isValid2 = await bcrypt.compare('wrongpassword', hashedPassword);
    console.log('✅ Comparaison avec mauvais mot de passe:', isValid2);
    
    // Test 4: Hashage direct sans salt (comme dans l'inscription)
    console.log('\n4️⃣ Test de hashage direct...');
    const hashedPassword2 = await bcrypt.hash(testPassword, 10);
    console.log('✅ Mot de passe hashé (direct):', hashedPassword2);
    
    const isValid3 = await bcrypt.compare(testPassword, hashedPassword2);
    console.log('✅ Comparaison avec hash direct:', isValid3);
    
    console.log('\n✅ Tous les tests bcrypt sont OK !');
    
  } catch (error) {
    console.error('❌ Erreur bcrypt:', error);
  }
};

// Exécuter le script
testBcrypt(); 