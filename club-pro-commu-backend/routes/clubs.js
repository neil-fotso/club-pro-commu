const express = require('express');
const Club = require('../models/Club');
const User = require('../models/User');
const auth = require('../middleware/auth');
const { updatePlayerAvailability } = require('../utils/playerUtils');
const discordService = require('../services/discordService');

const router = express.Router();

// Récupérer tous les clubs avec filtres
router.get('/', async (req, res) => {
  try {
    const { search, plateforme, pays, recrute } = req.query;
    
    let query = {};
    
    // Filtre par recherche (nom)
    if (search) {
      query.nom = { $regex: search, $options: 'i' };
    }
    
    // Filtre par plateforme
    if (plateforme) {
      query.plateforme = plateforme;
    }
    
    // Filtre par pays
    if (pays) {
      query.pays = pays;
    }
    
    // Filtre par recrutement
    if (recrute === 'true') {
      query.recrute = true;
    }
    
    const clubs = await Club.find(query)
      .populate('createurId', 'pseudo')
      .sort({ dateCreation: -1 });
    
    res.json(clubs);
  } catch (error) {
    console.error('Erreur recherche clubs:', error);
    res.status(500).json({ message: 'Erreur serveur.' });
  }
});

// Récupérer un club par ID
router.get('/:id', async (req, res) => {
  try {
    const club = await Club.findById(req.params.id)
      .populate('createurId', 'pseudo email')
      .populate('membres.userId', 'pseudo');
    
    if (!club) {
      return res.status(404).json({ message: 'Club non trouvé.' });
    }
    
    res.json(club);
  } catch (error) {
    console.error('Erreur récupération club:', error);
    res.status(500).json({ message: 'Erreur serveur.' });
  }
});

// Créer un nouveau club
router.post('/', auth, async (req, res) => {
  try {
    console.log('Données reçues:', req.body);
    console.log('Content-Type:', req.headers['content-type']);
    console.log('User-Agent:', req.headers['user-agent']);
    
    if (!req.body) {
      return res.status(400).json({ 
        message: 'Données manquantes - req.body est undefined. Vérifiez que le Content-Type est application/json.' 
      });
    }
    
    if (Object.keys(req.body).length === 0) {
      return res.status(400).json({ 
        message: 'Données manquantes - req.body est vide. Vérifiez que les données sont bien envoyées.' 
      });
    }
    
    // Vérifier le Content-Type
    const contentType = req.headers['content-type'];
    if (!contentType || !contentType.includes('application/json')) {
      return res.status(400).json({ 
        message: `Content-Type incorrect: ${contentType}. Attendu: application/json` 
      });
    }
    
    const { 
      nom, 
      plateforme, 
      pays, 
      statut, 
      description, 
      effectifMax, 
      langues, 
      recrute,
      niveauRecherche, 
      postesRecherches, 
      horaires 
    } = req.body;
    
    if (!nom) {
      return res.status(400).json({ message: 'Le nom du club est requis' });
    }
    
    // Vérifier si l'utilisateur est déjà membre d'un club
    const existingClub = await Club.findOne({
      'membres.userId': req.user.id
    });
    
    if (existingClub) {
      return res.status(400).json({ 
        message: `Vous êtes déjà membre du club "${existingClub.nom}". Vous devez d'abord quitter ce club avant d'en créer un nouveau.` 
      });
    }
    
    const user = await User.findById(req.user.id);
    const club = new Club({
      nom,
      createurId: req.user.id,
      plateforme: plateforme || user.plateforme, // Use form platform or user's
      pays,
      statut: statut || 'Actif', // Handle status from form
      description,
      effectifMax: effectifMax || 11, // Handle effectifMax from form
      langues: langues || ['Français'], // Handle languages from form
      recrute: recrute !== undefined ? recrute : true, // Handle recrute from form
      niveauRecherche: niveauRecherche || 'Tous niveaux',
      postesRecherches: postesRecherches || [],
      horaires,
      membres: [{
        userId: req.user.id,
        role: 'Admin',
        dateAdhesion: new Date()
      }],
      effectifActuel: 1
    });
    
    await club.save();
    res.status(201).json(club);
  } catch (error) {
    console.error('Erreur création club:', error);
    res.status(500).json({ message: 'Erreur serveur.' });
  }
});

// Mettre à jour un club
router.put('/:id', auth, async (req, res) => {
  try {
    const club = await Club.findById(req.params.id);
    
    if (!club) {
      return res.status(404).json({ message: 'Club non trouvé.' });
    }
    
    // Vérifier que l'utilisateur est admin du club
    const isAdmin = club.membres.some(membre => 
      membre.userId.toString() === req.user.id && membre.role === 'Admin'
    );
    
    if (!isAdmin) {
      return res.status(403).json({ message: 'Non autorisé.' });
    }
    
    const updatedClub = await Club.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    
    res.json(updatedClub);
  } catch (error) {
    console.error('Erreur mise à jour club:', error);
    res.status(500).json({ message: 'Erreur serveur.' });
  }
});

// Demander à rejoindre un club
router.post('/:id/join', auth, async (req, res) => {
  try {
    const club = await Club.findById(req.params.id);
    
    if (!club) {
      return res.status(404).json({ message: 'Club non trouvé.' });
    }
    
    // Vérifier si l'utilisateur est déjà membre de ce club
    const isAlreadyMember = club.membres.some(membre => 
      membre.userId.toString() === req.user.id
    );
    
    if (isAlreadyMember) {
      return res.status(400).json({ message: 'Vous êtes déjà membre de ce club.' });
    }
    
    // Vérifier si l'utilisateur est déjà membre d'un autre club
    const existingClub = await Club.findOne({
      'membres.userId': req.user.id
    });
    
    if (existingClub) {
      return res.status(400).json({ 
        message: `Vous êtes déjà membre du club "${existingClub.nom}". Vous devez d'abord quitter ce club avant de rejoindre un autre.` 
      });
    }
    
    // Vérifier si le club recrute et a de la place
    if (!club.recrute || club.effectifActuel >= club.effectifMax) {
      return res.status(400).json({ message: 'Ce club ne recrute pas actuellement.' });
    }
    
    // Ajouter l'utilisateur comme membre
    club.membres.push({
      userId: req.user.id,
      role: 'Joueur',
      dateAdhesion: new Date()
    });
    
    club.effectifActuel += 1;
    
    await club.save();
    
    // Mettre à jour la disponibilité du joueur
    await updatePlayerAvailability(req.user.id, require('../models/Player'));
    
    res.json({ message: 'Vous avez rejoint le club avec succès !' });
  } catch (error) {
    console.error('Erreur rejoindre club:', error);
    res.status(500).json({ message: 'Erreur serveur.' });
  }
});

// Quitter un club
router.post('/:id/leave', auth, async (req, res) => {
  try {
    const club = await Club.findById(req.params.id);
    
    if (!club) {
      return res.status(404).json({ message: 'Club non trouvé.' });
    }
    
    // Vérifier si l'utilisateur est membre
    const memberIndex = club.membres.findIndex(membre => 
      membre.userId.toString() === req.user.id
    );
    
    if (memberIndex === -1) {
      return res.status(400).json({ message: 'Vous n\'êtes pas membre de ce club.' });
    }
    
    // Empêcher l'admin de quitter s'il est le seul admin
    const isAdmin = club.membres[memberIndex].role === 'Admin';
    const adminCount = club.membres.filter(m => m.role === 'Admin').length;
    
    if (isAdmin && adminCount === 1) {
      return res.status(400).json({ message: 'Vous ne pouvez pas quitter le club car vous êtes le seul administrateur.' });
    }
    
    // Retirer l'utilisateur
    club.membres.splice(memberIndex, 1);
    club.effectifActuel -= 1;
    
    await club.save();
    
    // Mettre à jour la disponibilité du joueur
    await updatePlayerAvailability(req.user.id, require('../models/Player'));
    
    res.json({ message: 'Vous avez quitté le club.' });
  } catch (error) {
    console.error('Erreur quitter club:', error);
    res.status(500).json({ message: 'Erreur serveur.' });
  }
});

// Récupérer les clubs de l'utilisateur connecté
router.get('/user/my-clubs', auth, async (req, res) => {
  try {
    const clubs = await Club.find({
      'membres.userId': req.user.id
    })
    .populate('createurId', 'pseudo')
    .populate('membres.userId', 'pseudo')
    .sort({ dateCreation: -1 });
    
    res.json(clubs);
  } catch (error) {
    console.error('Erreur récupération clubs utilisateur:', error);
    res.status(500).json({ message: 'Erreur serveur.' });
  }
});

// Promouvoir un membre en admin
router.put('/:id/promouvoir/:userId', auth, async (req, res) => {
  try {
    const { id, userId } = req.params;
    const club = await Club.findById(id);
    
    if (!club) {
      return res.status(404).json({ message: 'Club non trouvé.' });
    }
    
    // Vérifier que l'utilisateur est admin du club
    const currentMember = club.membres.find(m => m.userId.toString() === req.user.id);
    if (!currentMember || currentMember.role !== 'Admin') {
      return res.status(403).json({ message: 'Vous devez être admin pour promouvoir un membre.' });
    }
    
    // Vérifier que le membre à promouvoir existe
    const memberToPromote = club.membres.find(m => m.userId.toString() === userId);
    if (!memberToPromote) {
      return res.status(404).json({ message: 'Membre non trouvé.' });
    }
    
    if (memberToPromote.role === 'Admin') {
      return res.status(400).json({ message: 'Ce membre est déjà admin.' });
    }
    
    // Promouvoir le membre
    memberToPromote.role = 'Admin';
    await club.save();
    
    // Envoyer notification Discord
    const promoteur = await User.findById(req.user.id);
    const joueurPromu = await User.findById(userId);
    await discordService.sendAdminPromotion(club, joueurPromu, promoteur);
    
    res.json({ message: 'Membre promu avec succès.' });
  } catch (error) {
    console.error('Erreur promotion membre:', error);
    res.status(500).json({ message: 'Erreur serveur.' });
  }
});

// Exclure un membre du club
router.delete('/:id/exclure/:userId', auth, async (req, res) => {
  try {
    const { id, userId } = req.params;
    const club = await Club.findById(id);
    
    if (!club) {
      return res.status(404).json({ message: 'Club non trouvé.' });
    }
    
    // Vérifier que l'utilisateur est admin du club
    const currentMember = club.membres.find(m => m.userId.toString() === req.user.id);
    if (!currentMember || currentMember.role !== 'Admin') {
      return res.status(403).json({ message: 'Vous devez être admin pour exclure un membre.' });
    }
    
    // Empêcher l'exclusion d'un autre admin
    const memberToExclude = club.membres.find(m => m.userId.toString() === userId);
    if (!memberToExclude) {
      return res.status(404).json({ message: 'Membre non trouvé.' });
    }
    
    if (memberToExclude.role === 'Admin') {
      return res.status(400).json({ message: 'Vous ne pouvez pas exclure un autre admin.' });
    }
    
    // Exclure le membre
    const memberIndex = club.membres.findIndex(m => m.userId.toString() === userId);
    club.membres.splice(memberIndex, 1);
    club.effectifActuel -= 1;
    
    await club.save();
    
    // Envoyer notification Discord
    const excluteur = await User.findById(req.user.id);
    const joueurExclu = await User.findById(userId);
    await discordService.sendClubExclusion(club, joueurExclu, excluteur);
    
    // Mettre à jour la disponibilité du joueur exclu
    await updatePlayerAvailability(userId, require('../models/Player'));
    
    res.json({ message: 'Membre exclu avec succès.' });
  } catch (error) {
    console.error('Erreur exclusion membre:', error);
    res.status(500).json({ message: 'Erreur serveur.' });
  }
});

module.exports = router; 