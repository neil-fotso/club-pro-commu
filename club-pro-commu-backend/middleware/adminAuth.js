const jwt = require('jsonwebtoken');
const User = require('../models/User');

const adminAuth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ message: 'Token requis' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'votre_secret_jwt_tres_long_et_securise_pour_le_developpement_local');
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(401).json({ message: 'Utilisateur non trouvé' });
    }

    if (!user.isAdmin) {
      return res.status(403).json({ message: 'Accès refusé - Admin requis' });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Erreur middleware admin:', error);
    res.status(401).json({ message: 'Token invalide' });
  }
};

module.exports = adminAuth; 