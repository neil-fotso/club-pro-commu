const jwt = require('jsonwebtoken');
const User = require('../models/User');

const auth = async (req, res, next) => {
  try {
    const authHeader = req.header('Authorization');
    // console.log('🔐 Auth header:', authHeader);

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      // console.log('❌ Aucun token fourni');
      return res.status(401).json({ message: 'Access denied. No token provided.' });
    }

    const token = authHeader.substring(7);
    // console.log('🔐 Token extrait:', token ? token.substring(0, 20) + '...' : 'Aucun token');

    if (!token) {
      // console.log('❌ Aucun token fourni');
      return res.status(401).json({ message: 'Access denied. No token provided.' });
    }

    const jwtSecret = process.env.JWT_SECRET || 'supersecretjwtkey';
    // console.log('🔐 JWT Secret utilisé:', jwtSecret.substring(0, 20) + '...');

    const decoded = jwt.verify(token, jwtSecret);
    // console.log('✅ Token décodé:', decoded);
    
    req.user = decoded;
    next();
  } catch (error) {
    console.log('❌ Token invalide:', error.message);
    res.status(400).json({ message: 'Invalid token.' });
  }
};

module.exports = auth; 