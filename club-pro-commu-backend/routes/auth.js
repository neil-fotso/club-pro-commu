const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Player = require('../models/Player');
const auth = require('../middleware/auth');

const router = express.Router();

// Fonction de mapping des positions frontend vers backend
const mapPositionToBackend = (frontendPosition) => {
  const positionMap = {
    // Positions d'attaque
    'BU': 'Attaquant',
    'AG': 'Attaquant',
    'AD': 'Attaquant',

    // Positions de milieu
    'MOC': 'Milieu',
    'MG': 'Milieu',
    'MD': 'Milieu',
    'MC': 'Milieu',
    'MDC': 'Milieu',

    // Positions de défense
    'DD': 'Défenseur',
    'DG': 'Défenseur',
    'DC': 'Défenseur',
    'DLD': 'Défenseur',
    'DLG': 'Défenseur',

    // Position de gardien
    'GB': 'Gardien'
  };

  return positionMap[frontendPosition] || 'Polyvalent';
};

// POST /api/auth/register - Inscription avec création automatique du profil joueur
router.post('/register', async (req, res) => {
  try {
    const {
      pseudo,
      email,
      password,
      age,
      pays,
      nationalite,
      ville,
      plateforme,
      pseudoPlateforme,
      postePrincipal,
      bio = ''
    } = req.body;

    // Validation des champs obligatoires
    if (!pseudo || !email || !password) {
      return res.status(400).json({
        message: 'Pseudo, email et mot de passe sont obligatoires'
      });
    }

    // Pour les comptes admin, la plateforme n'est pas obligatoire
    const isAdminAccount = req.body.isAdmin === true;
    if (!isAdminAccount && !plateforme) {
      return res.status(400).json({
        message: 'La plateforme est obligatoire pour les comptes joueurs'
      });
    }

    // Validation du mot de passe
    if (password.length < 6) {
      return res.status(400).json({
        message: 'Le mot de passe doit contenir au moins 6 caractères'
      });
    }

    // Validation de l'email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        message: 'Format d\'email invalide'
      });
    }

    // Validation de l'âge
    if (age && (age < 13 || age > 100)) {
      return res.status(400).json({
        message: 'L\'âge doit être entre 13 et 100 ans'
      });
    }

    // Vérifier si l'email existe déjà
    console.log('🔍 Vérification email:', email.toLowerCase());
    console.log('   Base de données:', User.db.name);
    const existingUserByEmail = await User.findOne({ email: email.toLowerCase() });
    console.log('   Résultat email:', existingUserByEmail ? 'EXISTE' : 'N\'EXISTE PAS');
    
    if (existingUserByEmail) {
      return res.status(400).json({
        message: 'Un compte avec cet email existe déjà',
        field: 'email',
        type: 'duplicate'
      });
    }

    // Vérifier si le pseudo existe déjà
    console.log('🔍 Vérification pseudo:', pseudo);
    console.log('   Base de données:', User.db.name);
    const existingUserByPseudo = await User.findOne({ pseudo });
    console.log('   Résultat pseudo:', existingUserByPseudo ? 'EXISTE' : 'N\'EXISTE PAS');
    
    if (existingUserByPseudo) {
      return res.status(400).json({
        message: 'Ce pseudo est déjà utilisé',
        field: 'pseudo',
        type: 'duplicate'
      });
    }

    // Créer l'utilisateur (le mot de passe sera hashé automatiquement par le middleware pre('save'))
    const user = new User({
      pseudo,
      email: email.toLowerCase(),
      password: password, // Le middleware pre('save') va hasher automatiquement
      isAdmin: isAdminAccount || false,
      dateCreation: new Date()
    });

    await user.save();

    // Créer automatiquement le profil joueur (seulement pour les comptes non-admin)
    let player = null;
    if (!isAdminAccount) {
      player = new Player({
      userId: user._id,
      pseudo,
      age: age ? parseInt(age) : undefined,
      pays: pays || '',
      nationalite: nationalite || '',
      ville: ville || '',
      plateforme,
      pseudoPlateforme: pseudoPlateforme || '',
      position: postePrincipal ? mapPositionToBackend(postePrincipal) : 'Polyvalent', // Position générale pour compatibilité
      postePrincipal: postePrincipal || undefined, // Position détaillée du frontend (optionnel)

      bio,
      disponibilite: 'Disponible',
      derniereActivite: new Date(),
      preferences: {
        langue: 'Français',
        fuseauHoraire: 'Europe/Paris',
        notifications: {
          email: true,
          push: true,
          discord: true
        },
        visibilite: {
          profil: 'Public',
          statistiques: 'Public',
          disponibilite: 'Public'
        }
      },
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
    }

    // Générer le token JWT
    const jwtSecret = process.env.JWT_SECRET || 'votre_secret_jwt_tres_long_et_securise_pour_le_developpement_local';
    const token = jwt.sign(
      { id: user._id, pseudo: user.pseudo },
      jwtSecret,
      { expiresIn: '7d' }
    );

    // Retourner les données utilisateur (sans mot de passe)
    const userResponse = {
      _id: user._id,
      pseudo: user.pseudo,
      email: user.email,
      dateCreation: user.dateCreation,
      isAdmin: user.isAdmin,
      token
    };

    const response = {
      message: isAdminAccount ? 'Administrateur créé avec succès' : 'Inscription réussie',
      user: userResponse
    };

    // Ajouter les données joueur seulement si ce n'est pas un admin
    if (player) {
      response.player = {
        _id: player._id,
        pseudo: player.pseudo,
        plateforme: player.plateforme,
        pseudoPlateforme: player.pseudoPlateforme,
        position: player.position,
        postePrincipal: player.postePrincipal,
        disponibilite: player.disponibilite
      };
    }

    res.status(201).json(response);

  } catch (error) {
    console.error('Erreur inscription:', error);
    res.status(500).json({ message: 'Oups ! Il semble y avoir eu un petit problème technique. Pas de panique, réessayez dans quelques instants ! 🚀' });
  }
});

// GET /api/auth/test - Endpoint de test
router.get('/test', (req, res) => {
  res.json({ 
    message: 'Backend local avec modifications récentes',
    timestamp: new Date().toISOString(),
    hasDebugLogs: true
  });
});

// GET /api/auth/me - Récupérer les données de l'utilisateur connecté
router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }
    
    const player = await Player.findOne({ userId: user._id });
    
    res.json({
      user: {
        _id: user._id,
        pseudo: user.pseudo,
        email: user.email,
        dateCreation: user.dateCreation,
        isAdmin: user.isAdmin,
      },
      player: player ? {
        _id: player._id,
        pseudo: player.pseudo,
        plateforme: player.plateforme,
        pseudoPlateforme: player.pseudoPlateforme,
        position: player.position,
        postePrincipal: player.postePrincipal,
        disponibilite: player.disponibilite,
        derniereActivite: player.derniereActivite
      } : null
    });
  } catch (error) {
    console.error('Erreur récupération utilisateur:', error);
    res.status(500).json({ message: 'Oups ! Nous rencontrons quelques difficultés techniques. Réessayez dans un instant ! 🔧' });
  }
});

// POST /api/auth/login - Connexion
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation des champs
    if (!email || !password) {
      return res.status(400).json({
        message: 'Email et mot de passe requis'
      });
    }

    // Rechercher l'utilisateur par email ou pseudo
    let user = await User.findOne({ email: email.toLowerCase() }).select('+isAdmin');

    // Si pas trouvé par email, essayer par pseudo
    if (!user) {
      user = await User.findOne({ pseudo: email }).select('+isAdmin');
    }

    if (!user) {
      return res.status(400).json({
        message: 'Email ou mot de passe incorrect'
      });
    }

    // Vérifier le mot de passe avec la méthode du modèle User
    let isPasswordValid = false;
    try {
      isPasswordValid = await user.comparePassword(password);
    } catch (bcryptError) {
      console.error('Erreur de vérification du mot de passe:', bcryptError);
      return res.status(500).json({
        message: 'Erreur de vérification du mot de passe'
      });
    }

    if (!isPasswordValid) {
      return res.status(400).json({
        message: 'Email ou mot de passe incorrect'
      });
    }

    // Récupérer le profil joueur
    const player = await Player.findOne({ userId: user._id });

    // Générer le token JWT
    const jwtSecret = process.env.JWT_SECRET || 'votre_secret_jwt_tres_long_et_securise_pour_le_developpement_local';
    const token = jwt.sign(
      { id: user._id, pseudo: user.pseudo },
      jwtSecret,
      { expiresIn: '7d' }
    );

    // Mettre à jour la dernière activité
    if (player) {
      player.derniereActivite = new Date();
      await player.save();
    }

    // Retourner les données utilisateur
    const userObj = user.toObject();
    const userResponse = {
      _id: user._id,
      pseudo: user.pseudo,
      email: user.email,
      dateCreation: user.dateCreation,
      isAdmin: userObj.isAdmin,
      token
    };

    res.json({
      message: 'Connexion réussie',
      user: userResponse,
      player: player ? {
        _id: player._id,
        pseudo: player.pseudo,
        plateforme: player.plateforme,
        pseudoPlateforme: player.pseudoPlateforme,
        position: player.position,
        postePrincipal: player.postePrincipal,
        disponibilite: player.disponibilite
      } : null
    });

  } catch (error) {
    console.error('Erreur connexion:', error);
    res.status(500).json({ message: 'Oups ! Il semble y avoir eu un petit problème technique. Pas de panique, réessayez dans quelques instants ! 🚀' });
  }
});

// GET /api/auth/me - Récupérer les données de l'utilisateur connecté
router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }

    // Récupérer le profil joueur
    const player = await Player.findOne({ userId: req.user.id });

    res.json({
      user: {
        _id: user._id,
        pseudo: user.pseudo,
        email: user.email,
        dateCreation: user.dateCreation,
        isAdmin: user.isAdmin,
      },
      player: player ? {
        _id: player._id,
        pseudo: player.pseudo,
        plateforme: player.plateforme,
        position: player.position,
        niveau: player.niveau,
        disponibilite: player.disponibilite,
        derniereActivite: player.derniereActivite
      } : null
    });
  } catch (error) {
    console.error('Erreur récupération utilisateur:', error);
    res.status(500).json({ message: 'Oups ! Nous rencontrons quelques difficultés techniques. Réessayez dans un instant ! 🔧' });
  }
});

// POST /api/auth/change-password - Changer le mot de passe
router.post('/change-password', auth, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        message: 'Ancien et nouveau mot de passe requis'
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        message: 'Le nouveau mot de passe doit contenir au moins 6 caractères'
      });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }

    // Vérifier l'ancien mot de passe
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isCurrentPasswordValid) {
      return res.status(400).json({
        message: 'Ancien mot de passe incorrect'
      });
    }

    // Hasher le nouveau mot de passe
    const salt = await bcrypt.genSalt(10);
    const hashedNewPassword = await bcrypt.hash(newPassword, salt);

    // Mettre à jour le mot de passe
    user.password = hashedNewPassword;
    await user.save();

    res.json({ message: 'Mot de passe modifié avec succès' });
  } catch (error) {
    console.error('Erreur changement mot de passe:', error);
    res.status(500).json({ message: 'Oups ! Il semble y avoir eu un petit problème technique. Pas de panique, réessayez dans quelques instants ! 🔐' });
  }
});

module.exports = router; 