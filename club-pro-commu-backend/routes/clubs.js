const express = require('express');
const Club = require('../models/Club');
const User = require('../models/User');
const auth = require('../middleware/auth');
const adminAuth = require('../middleware/adminAuth');
const { updatePlayerAvailability } = require('../utils/playerUtils');
const discordService = require('../services/discordService');

const router = express.Router();

// Récupérer tous les clubs avec filtres
router.get('/', async (req, res) => {
  try {
    const { search, plateforme, pays, recrute, langue } = req.query;
    
    let query = {};
    
    // Filtre par recherche (nom)
    if (search) {
      query.nom = { $regex: search, $options: 'i' };
    }
    
    // Filtre par plateforme
    if (plateforme) {
      query.plateformes = { $in: [plateforme] };
    }
    
    // Filtre par pays
    if (pays) {
      query.pays = pays;
    }
    
    // Filtre par langue
    if (langue) {
      query.langues = { $in: [langue] };
    }
    
    // Filtre par recrutement
    if (recrute === 'true') {
      query.recrute = true;
    } else if (recrute === 'false') {
      query.recrute = false;
    }
    
    let clubs = await Club.find(query)
      .populate('createurId', 'pseudo')
      .sort({ dateCreation: -1 });
    
    // Si on filtre par recrutement, recalculer le statut de recrutement
    if (recrute === 'true' || recrute === 'false') {
      clubs = clubs.filter(club => {
        const recruteStatus = club.calculateRecrute();
        return recrute === 'true' ? recruteStatus : !recruteStatus;
      });
    }
    
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
      .populate('membres.userId', 'pseudo _id');
    
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
      plateformes, 
      pays, 
      description, 
      effectifMax, 
      langues, 
      recrute,
 
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
      plateformes: plateformes || [user.plateforme], // Use form platforms or user's platform as array
      pays,
      description,
      effectifMax: effectifMax || 11, // Handle effectifMax from form
      langues: langues || ['Français'], // Handle languages from form
      recrute: recrute !== undefined ? recrute : true, // Handle recrute from form

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
    
    // Champs autorisés pour la modification
    const allowedUpdates = {
      nom: req.body.nom,
      description: req.body.description,
      plateformes: req.body.plateformes,
      langues: req.body.langues,
      effectifMax: req.body.effectifMax,
      recrute: req.body.recrute,
      pays: req.body.pays,

      postesRecherches: req.body.postesRecherches,
      horaires: req.body.horaires
    };
    
    // Filtrer les champs undefined
    const updates = Object.fromEntries(
      Object.entries(allowedUpdates).filter(([_, value]) => value !== undefined)
    );
    
    const updatedClub = await Club.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true }
    ).populate('createurId', 'pseudo email')
     .populate('membres.userId', 'pseudo _id');
    
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
    
    // Vérifier si l'utilisateur a déjà une demande en attente
    const hasPendingRequest = club.demandesAdhesion.some(demande => 
      demande.userId.toString() === req.user.id && demande.statut === 'En attente'
    );
    
    if (hasPendingRequest) {
      return res.status(400).json({ message: 'Vous avez déjà une demande d\'adhésion en attente pour ce club.' });
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
    
    // Créer une demande d'adhésion
    const message = req.body.message || '';
    const nouvelleDemande = {
      userId: req.user.id,
      message: message,
      dateDemande: new Date(),
      statut: 'En attente'
    };
    
    club.demandesAdhesion.push(nouvelleDemande);
    await club.save();
    
    // Créer des notifications pour tous les admins du club
    const Notification = require('../models/Notification');
    const admins = club.membres.filter(membre => membre.role === 'Admin');
    
    for (const admin of admins) {
      await Notification.create({
        userId: admin.userId,
        type: 'demande_adhesion',
        titre: 'Nouvelle demande d\'adhésion',
        message: `${req.user.pseudo} souhaite rejoindre votre club "${club.nom}"`,
        donnees: {
          clubId: club._id,
          demandeurId: req.user.id,
          demandeId: nouvelleDemande._id
        }
      });
    }
    
    res.json({ message: 'Demande d\'adhésion envoyée ! Les administrateurs du club vont l\'examiner.' });
  } catch (error) {
    console.error('Erreur demande adhésion:', error);
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
    
    // Créer des notifications pour tous les admins du club
    const Notification = require('../models/Notification');
    const admins = club.membres.filter(membre => membre.role === 'Admin');
    
    for (const admin of admins) {
      await Notification.create({
        userId: admin.userId,
        type: 'exclusion_club',
        titre: 'Membre parti du club',
        message: `${req.user.pseudo} a quitté le club "${club.nom}"`,
        donnees: {
          clubId: club._id,
          membreId: req.user.id
        }
      });
    }
    
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

// Accepter une demande d'adhésion
router.put('/:id/demandes/:demandeId/accept', auth, async (req, res) => {
  try {
    const { id, demandeId } = req.params;
    const club = await Club.findById(id);
    
    if (!club) {
      return res.status(404).json({ message: 'Club non trouvé.' });
    }
    
    // Vérifier que l'utilisateur est admin du club
    const currentMember = club.membres.find(m => m.userId.toString() === req.user.id);
    if (!currentMember || currentMember.role !== 'Admin') {
      return res.status(403).json({ message: 'Vous devez être admin pour accepter une demande.' });
    }
    
    // Trouver la demande
    const demande = club.demandesAdhesion.find(d => d._id.toString() === demandeId);
    if (!demande) {
      return res.status(404).json({ message: 'Demande non trouvée.' });
    }
    
    if (demande.statut !== 'En attente') {
      return res.status(400).json({ message: 'Cette demande a déjà été traitée.' });
    }
    
    // Vérifier si le club a de la place
    if (club.effectifActuel >= club.effectifMax) {
      return res.status(400).json({ message: 'Le club est complet.' });
    }
    
    // Vérifier si le joueur peut rejoindre ce club (système multi-clubs)
    const Player = require('../models/Player');
    const player = await Player.findOne({ userId: demande.userId });
    
    if (!player) {
      return res.status(404).json({ message: 'Profil joueur non trouvé.' });
    }
    
    try {
      // Utiliser la nouvelle méthode pour rejoindre le club
      await player.joinClub(club._id, 'Joueur');
    } catch (error) {
      return res.status(400).json({ message: error.message });
    }
    
    // Accepter la demande
    demande.statut = 'Acceptée';
    
    // Ajouter l'utilisateur comme membre dans le club (compatibilité)
    club.membres.push({
      userId: demande.userId,
      role: 'Joueur',
      dateAdhesion: new Date()
    });
    
    club.effectifActuel += 1;
    
    await club.save();
    
    // Créer une notification pour le demandeur
    const Notification = require('../models/Notification');
    await Notification.create({
      userId: demande.userId,
      type: 'invitation_acceptee',
      titre: 'Demande d\'adhésion acceptée',
      message: `Votre demande d'adhésion au club "${club.nom}" a été acceptée !`,
      donnees: {
        clubId: club._id
      }
    });
    
    // Mettre à jour la disponibilité du joueur avec le nouveau système
    await player.calculateDisponibilite();
    
    res.json({ message: 'Demande acceptée avec succès.' });
  } catch (error) {
    console.error('Erreur acceptation demande:', error);
    res.status(500).json({ message: 'Erreur serveur.' });
  }
});

// Refuser une demande d'adhésion
router.put('/:id/demandes/:demandeId/refuse', auth, async (req, res) => {
  try {
    const { id, demandeId } = req.params;
    const club = await Club.findById(id);
    
    if (!club) {
      return res.status(404).json({ message: 'Club non trouvé.' });
    }
    
    // Vérifier que l'utilisateur est admin du club
    const currentMember = club.membres.find(m => m.userId.toString() === req.user.id);
    if (!currentMember || currentMember.role !== 'Admin') {
      return res.status(403).json({ message: 'Vous devez être admin pour refuser une demande.' });
    }
    
    // Trouver la demande
    const demande = club.demandesAdhesion.find(d => d._id.toString() === demandeId);
    if (!demande) {
      return res.status(404).json({ message: 'Demande non trouvée.' });
    }
    
    if (demande.statut !== 'En attente') {
      return res.status(400).json({ message: 'Cette demande a déjà été traitée.' });
    }
    
    // Refuser la demande
    demande.statut = 'Refusée';
    
    await club.save();
    
    // Créer une notification pour le demandeur
    const Notification = require('../models/Notification');
    await Notification.create({
      userId: demande.userId,
      type: 'invitation_refusee',
      titre: 'Demande d\'adhésion refusée',
      message: `Votre demande d'adhésion au club "${club.nom}" a été refusée.`,
      donnees: {
        clubId: club._id
      }
    });
    
    res.json({ message: 'Demande refusée avec succès.' });
  } catch (error) {
    console.error('Erreur refus demande:', error);
    res.status(500).json({ message: 'Erreur serveur.' });
  }
});

// Récupérer les demandes d'adhésion d'un club
router.get('/:id/demandes', auth, async (req, res) => {
  try {
    console.log('Demande de récupération des demandes pour le club:', req.params.id);
    console.log('Utilisateur connecté:', req.user.id);
    
    const club = await Club.findById(req.params.id)
      .populate('demandesAdhesion.userId', 'pseudo email')
      .populate('membres.userId', 'pseudo email');
    
    if (!club) {
      console.log('Club non trouvé');
      return res.status(404).json({ message: 'Club non trouvé.' });
    }
    
    console.log('Club trouvé:', club.nom);
    console.log('Membres du club:', club.membres.map(m => ({ userId: m.userId._id, role: m.role })));
    
    // Vérifier que l'utilisateur est admin du club
    const currentMember = club.membres.find(m => m.userId._id.toString() === req.user.id);
    console.log('Membre actuel:', currentMember);
    
    if (!currentMember || currentMember.role !== 'Admin') {
      console.log('Utilisateur non admin ou non membre');
      return res.status(403).json({ message: 'Vous devez être admin pour voir les demandes.' });
    }
    
    // Filtrer seulement les demandes en attente
    const demandesEnAttente = club.demandesAdhesion.filter(demande => demande.statut === 'En attente');
    
    console.log('Demandes en attente trouvées:', demandesEnAttente.length);
    
    res.json({
      demandes: demandesEnAttente,
      effectifActuel: club.effectifActuel,
      effectifMax: club.effectifMax
    });
  } catch (error) {
    console.error('Erreur récupération demandes:', error);
    res.status(500).json({ message: 'Erreur serveur.' });
  }
});

// Vérifier si l'utilisateur a une demande en attente pour ce club
router.get('/:id/demande-utilisateur', auth, async (req, res) => {
  try {
    const club = await Club.findById(req.params.id);
    
    if (!club) {
      return res.status(404).json({ message: 'Club non trouvé.' });
    }
    
    // Chercher une demande en attente de cet utilisateur
    const demandeEnAttente = club.demandesAdhesion.find(
      demande => demande.userId.toString() === req.user.id && demande.statut === 'En attente'
    );
    
    res.json({
      hasPendingRequest: !!demandeEnAttente,
      demande: demandeEnAttente ? {
        _id: demandeEnAttente._id,
        message: demandeEnAttente.message,
        dateDemande: demandeEnAttente.dateDemande,
        statut: demandeEnAttente.statut
      } : null
    });
  } catch (error) {
    console.error('Erreur vérification demande utilisateur:', error);
    res.status(500).json({ message: 'Erreur serveur.' });
  }
});

// Annuler une demande d'adhésion
router.delete('/:id/demande-utilisateur', auth, async (req, res) => {
  try {
    const club = await Club.findById(req.params.id);
    
    if (!club) {
      return res.status(404).json({ message: 'Club non trouvé.' });
    }
    
    // Chercher la demande en attente de cet utilisateur
    const demandeIndex = club.demandesAdhesion.findIndex(
      demande => demande.userId.toString() === req.user.id && demande.statut === 'En attente'
    );
    
    if (demandeIndex === -1) {
      return res.status(404).json({ message: 'Aucune demande en attente trouvée.' });
    }
    
    // Supprimer la demande
    club.demandesAdhesion.splice(demandeIndex, 1);
    await club.save();
    
    res.json({ message: 'Demande d\'adhésion annulée avec succès.' });
  } catch (error) {
    console.error('Erreur annulation demande:', error);
    res.status(500).json({ message: 'Erreur serveur.' });
  }
});

// DELETE /api/clubs/:id - Supprimer un club (admin uniquement)
router.delete('/:id', adminAuth, async (req, res) => {
  try {
    const club = await Club.findById(req.params.id);
    
    if (!club) {
      return res.status(404).json({ message: 'Club non trouvé' });
    }

    // Supprimer le club
    await Club.findByIdAndDelete(req.params.id);

    res.json({ message: 'Club supprimé avec succès' });
  } catch (error) {
    console.error('Erreur suppression club:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

module.exports = router; 