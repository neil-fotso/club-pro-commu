const jwt = require('jsonwebtoken');

module.exports = function(req, res, next) {
  const authHeader = req.header('Authorization');
  console.log('🔐 Auth header:', authHeader);
  
  const token = authHeader?.replace('Bearer ', '');
  console.log('🔐 Token extrait:', token ? token.substring(0, 20) + '...' : 'Aucun token');
  
  if (!token) {
    console.log('❌ Aucun token fourni');
    return res.status(401).json({ message: 'Accès refusé. Aucun token fourni.' });
  }
  
  try {
    const jwtSecret = process.env.JWT_SECRET || 'votre_secret_jwt_tres_long_et_securise_pour_le_developpement_local';
    console.log('🔐 JWT Secret utilisé:', jwtSecret.substring(0, 20) + '...');
    
    const decoded = jwt.verify(token, jwtSecret);
    console.log('✅ Token décodé:', decoded);
    
    req.user = decoded;
    next();
  } catch (err) {
    console.error('❌ Erreur vérification token:', err.message);
    res.status(401).json({ message: 'Token invalide.' });
  }
}; 