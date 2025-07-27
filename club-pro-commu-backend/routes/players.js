const express = require('express');
const Player = require('../models/Player');
const User = require('../models/User');
const auth = require('../middleware/auth');
const { calculatePlayerAvailability, updatePlayerAvailability } = require('../utils/playerUtils');

const router = express.Router();

// Récupérer tous les joueurs avec filtres
router.get('/', async (req, res) => {
  try {
    const { search, poste, plateforme, age, rechercheClub, status } = req.query;
    
    let query = {};
    
    // Filtre par recherche (pseudo)
    if (search) {
      query.pseudo = { $regex: search, $options: 'i' };
    }
    
    // Filtre par poste
    if (poste) {
      query.$or = [
        { postePrincipal: poste },
        { postesSecondaires: poste }
      ];
    }
    
    // Filtre par plateforme
    if (plateforme) {
      query.plateforme = plateforme;
    }
    
    // Filtre par âge
    if (age) {
      query.age = { $gte: parseInt(age) };
    }
    
    // Filtre par recherche de club
    if (rechercheClub === 'true') {
      query.rechercheClub = true;
    }
    
    // Filtre par statut de connexion
    if (status === 'online') {
      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
      query.lastActivity = { $gte: fiveMinutesAgo };
    } else if (status === 'offline') {
      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
      query.lastActivity = { $lt: fiveMinutesAgo };
    }
    
    const players = await Player.find(query)
      .populate('userId', 'pseudo email')
      .sort({ dateCreation: -1 });
    
    // Ajouter le statut de connexion et calculer la disponibilité pour chaque joueur
    const playersWithStatus = await Promise.all(players.map(async (player) => {
      const playerObj = player.toObject();
      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
      playerObj.isOnline = player.lastActivity >= fiveMinutesAgo;
      
      // Calculer la disponibilité en fonction de l'appartenance à un club
      playerObj.disponibilite = await calculatePlayerAvailability(player.userId);
      
      return playerObj;
    }));
    
    res.json(playersWithStatus);
  } catch (error) {
    console.error('Erreur recherche joueurs:', error);
    res.status(500).json({ message: 'Erreur serveur.' });
  }
});

// Récupérer un joueur par ID
router.get('/:id', async (req, res) => {
  try {
    const player = await Player.findById(req.params.id)
      .populate('userId', 'pseudo email plateforme');
    
    if (!player) {
      return res.status(404).json({ message: 'Joueur non trouvé.' });
    }
    
    // Ajouter le statut de connexion et calculer la disponibilité
    const playerObj = player.toObject();
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    playerObj.isOnline = player.lastActivity >= fiveMinutesAgo;
    
    // Calculer la disponibilité en fonction de l'appartenance à un club
    playerObj.disponibilite = await calculatePlayerAvailability(player.userId);
    
    res.json(playerObj);
  } catch (error) {
    console.error('Erreur récupération joueur:', error);
    res.status(500).json({ message: 'Erreur serveur.' });
  }
});

// Récupérer le profil joueur de l'utilisateur connecté
router.get('/me/profile', auth, async (req, res) => {
  try {
    let player = await Player.findOne({ userId: req.user.id });
    
    if (!player) {
      // Créer automatiquement un profil joueur basique
      const user = await User.findById(req.user.id);
      if (!user) {
        return res.status(404).json({ message: 'Utilisateur non trouvé.' });
      }
      
      player = new Player({
        pseudo: user.pseudo,
        userId: req.user.id,
        postePrincipal: user.postePrincipal || '',
        postesSecondaires: [],
        age: undefined, // Pas d'âge par défaut
        pays: undefined, // Pas de pays par défaut
        plateforme: user.plateforme || 'PS5', // Valeur par défaut si manquante
        langues: ['Français'],
        description: 'Joueur FIFA Pro Clubs',
        rechercheClub: true, // Par défaut, recherche un club
        lastActivity: new Date() // Initialiser avec la date actuelle
      });
      
      await player.save();
    }
    
    // Ajouter le statut de connexion et calculer la disponibilité
    const playerObj = player.toObject();
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    playerObj.isOnline = player.lastActivity >= fiveMinutesAgo;
    
    // Calculer la disponibilité en fonction de l'appartenance à un club
    playerObj.disponibilite = await calculatePlayerAvailability(player.userId);
    
    res.json(playerObj);
  } catch (error) {
    console.error('Erreur récupération profil joueur:', error);
    res.status(500).json({ message: 'Erreur serveur.' });
  }
});

// Créer un profil joueur (pour personnalisation)
router.post('/', auth, async (req, res) => {
  try {
    const { postePrincipal, postesSecondaires, age, pays, langues, description, disponibilite, rechercheClub } = req.body;
    
    // Vérifier si le joueur existe déjà
    const existingPlayer = await Player.findOne({ userId: req.user.id });
    if (existingPlayer) {
      return res.status(400).json({ message: 'Vous avez déjà un profil joueur.' });
    }
    
    // Récupérer les infos de l'utilisateur
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé.' });
    }
    
    const player = new Player({
      pseudo: user.pseudo,
      userId: req.user.id,
      postePrincipal,
      postesSecondaires: postesSecondaires || [],
      age: age ? parseInt(age) : undefined,
      pays: pays || undefined,
      plateforme: user.plateforme || 'PS5', // Valeur par défaut si manquante
      langues: langues || [],
      description,
      disponibilite: 'Disponible', // Sera recalculé automatiquement
      rechercheClub: rechercheClub !== undefined ? rechercheClub : true,
      lastActivity: new Date() // Initialiser avec la date actuelle
    });
    
    await player.save();
    
    res.status(201).json(player);
  } catch (error) {
    console.error('Erreur création profil joueur:', error);
    res.status(500).json({ message: 'Erreur serveur.' });
  }
});

// Mettre à jour un profil joueur
router.put('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Vérifier que le joueur appartient à l'utilisateur connecté
    const player = await Player.findOne({ _id: id, userId: req.user.id });
    if (!player) {
      return res.status(404).json({ message: 'Profil joueur non trouvé.' });
    }
    
    // Préparer les données de mise à jour
    const updateData = {};
    
    // Ajouter seulement les champs qui sont présents dans req.body
    if (req.body) {
      if (req.body.postePrincipal) {
        updateData.postePrincipal = req.body.postePrincipal;
      }
      if (req.body.postesSecondaires !== undefined) {
        updateData.postesSecondaires = Array.isArray(req.body.postesSecondaires) 
          ? req.body.postesSecondaires 
          : [];
      }
      if (req.body.age !== undefined) {
        updateData.age = req.body.age ? parseInt(req.body.age) : undefined;
      }
      if (req.body.pays !== undefined) {
        updateData.pays = req.body.pays || undefined;
      }
      if (req.body.description !== undefined) {
        updateData.description = req.body.description;
      }
      if (req.body.disponibilite !== undefined) {
        updateData.disponibilite = req.body.disponibilite;
      }
      if (req.body.rechercheClub !== undefined) {
        updateData.rechercheClub = req.body.rechercheClub;
      }
      if (req.body.langues !== undefined) {
        updateData.langues = Array.isArray(req.body.langues) ? req.body.langues : [];
      }
    }
    
    // Mettre à jour le profil seulement s'il y a des données à mettre à jour
    if (Object.keys(updateData).length > 0) {
      const updatedPlayer = await Player.findByIdAndUpdate(
        id,
        updateData,
        { new: true, runValidators: true }
      );
      res.json(updatedPlayer);
    } else {
      // Si aucune donnée à mettre à jour, retourner le joueur actuel
      res.json(player);
    }
  } catch (error) {
    console.error('Erreur mise à jour profil joueur:', error);
    res.status(500).json({ message: 'Erreur serveur.' });
  }
});

// Mettre à jour la photo de profil
router.put('/:id/photo', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const { photoProfil } = req.body;
    
    // Vérifier que le joueur appartient à l'utilisateur connecté
    const player = await Player.findOne({ _id: id, userId: req.user.id });
    if (!player) {
      return res.status(404).json({ message: 'Profil joueur non trouvé.' });
    }
    
    // Mettre à jour la photo de profil
    const updatedPlayer = await Player.findByIdAndUpdate(
      id,
      { photoProfil },
      { new: true }
    );
    
    res.json(updatedPlayer);
  } catch (error) {
    console.error('Erreur mise à jour photo profil:', error);
    res.status(500).json({ message: 'Erreur serveur.' });
  }
});

// Route pour mettre à jour la disponibilité de tous les joueurs (maintenance)
router.post('/update-availability', auth, async (req, res) => {
  try {
    const players = await Player.find({});
    let updatedCount = 0;
    
    for (const player of players) {
      await updatePlayerAvailability(player.userId, Player);
      updatedCount++;
    }
    
    res.json({ 
      message: `Disponibilité mise à jour pour ${updatedCount} joueurs.`,
      updatedCount 
    });
  } catch (error) {
    console.error('Erreur mise à jour disponibilité:', error);
    res.status(500).json({ message: 'Erreur serveur.' });
  }
});

module.exports = router; 