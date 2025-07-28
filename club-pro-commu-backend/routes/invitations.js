const express = require('express');
const router = express.Router();
const Invitation = require('../models/Invitation');
const Club = require('../models/Club');
const User = require('../models/User');
const Player = require('../models/Player');
const Notification = require('../models/Notification');
const auth = require('../middleware/auth');
const discordService = require('../services/discordService');

// Inviter un joueur dans un club
router.post('/inviter', auth, async (req, res) => {
  try {
    const { clubId, inviteId, message } = req.body;
    const inviteurId = req.user.id;

    // Vérifier que le club existe
    const club = await Club.findById(clubId);
    if (!club) {
      return res.status(404).json({ message: 'Club non trouvé' });
    }

    // Vérifier que l'inviteur est membre du club
    const estMembre = club.membres.some(m => m.userId.toString() === inviteurId);
    if (!estMembre) {
      return res.status(403).json({ message: 'Vous devez être membre du club pour inviter des joueurs' });
    }

    // Vérifier que l'inviteur est admin ou capitaine
    const membreInviteur = club.membres.find(m => m.userId.toString() === inviteurId);
    if (!membreInviteur || (membreInviteur.role !== 'Admin' && membreInviteur.role !== 'Capitaine')) {
      return res.status(403).json({ message: 'Vous devez être admin ou capitaine pour inviter des joueurs' });
    }

    // Vérifier que l'invite existe
    const invite = await Player.findById(inviteId);
    if (!invite) {
      return res.status(404).json({ message: 'Joueur non trouvé' });
    }

    // Vérifier que l'invite n'est pas déjà membre du club
    const estDejaMembre = club.membres.some(m => m.userId.toString() === inviteId);
    if (estDejaMembre) {
      return res.status(400).json({ message: 'Ce joueur est déjà membre du club' });
    }

    // Vérifier qu'il n'y a pas déjà une invitation en attente
    const invitationExistante = await Invitation.findOne({
      clubId,
      inviteId,
      statut: 'En attente'
    });

    if (invitationExistante) {
      return res.status(400).json({ message: 'Une invitation est déjà en attente pour ce joueur' });
    }

    // Créer l'invitation
    const invitation = new Invitation({
      clubId,
      inviteurId,
      inviteId,
      message: message || ''
    });

    await invitation.save();

    // Créer une notification pour l'invite
    const notification = new Notification({
      userId: invite.userId._id,
      type: 'invitation_club',
      titre: 'Invitation à rejoindre un club',
      message: `${club.nom} vous invite à rejoindre leur club`,
      donnees: {
        clubId,
        inviteurId,
        invitationId: invitation._id
      }
    });

    await notification.save();

    // Envoyer notification Discord
    const inviteur = await User.findById(inviteurId);
    await discordService.sendClubInvitation(invitation, club, inviteur, invite);

    res.status(201).json({
      message: 'Invitation envoyée avec succès',
      invitation
    });

  } catch (error) {
    console.error('Erreur lors de l\'invitation:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Accepter une invitation
router.put('/accepter/:invitationId', auth, async (req, res) => {
  try {
    const { invitationId } = req.params;
    const userId = req.user.id;

    const invitation = await Invitation.findById(invitationId);
    if (!invitation) {
      return res.status(404).json({ message: 'Invitation non trouvée' });
    }

    // Vérifier que l'utilisateur est bien l'invité
    const player = await Player.findOne({ 'userId': userId });
    if (!player || invitation.inviteId.toString() !== player._id.toString()) {
      return res.status(403).json({ message: 'Vous ne pouvez pas accepter cette invitation' });
    }

    if (invitation.statut !== 'En attente') {
      return res.status(400).json({ message: 'Cette invitation a déjà été traitée' });
    }

    // Récupérer le club
    const club = await Club.findById(invitation.clubId);
    if (!club) {
      return res.status(404).json({ message: 'Club non trouvé' });
    }

    // Vérifier que le joueur n'est pas déjà membre d'un autre club
    const clubExistant = await Club.findOne({
      'membres.userId': userId
    });

    if (clubExistant && clubExistant._id.toString() !== invitation.clubId.toString()) {
      return res.status(400).json({ message: 'Vous êtes déjà membre d\'un autre club' });
    }

    // Ajouter le joueur au club
    club.membres.push({
      userId,
      role: 'Joueur',
      dateAdhesion: new Date()
    });

    club.effectifActuel = club.membres.length;
    await club.save();

    // Mettre à jour l'invitation
    invitation.statut = 'Acceptée';
    invitation.dateReponse = new Date();
    await invitation.save();

    // Créer une notification pour l'inviteur
    const notification = new Notification({
      userId: invitation.inviteurId,
      type: 'invitation_acceptee',
      titre: 'Invitation acceptée',
      message: `${req.user.pseudo} a accepté votre invitation à rejoindre ${club.nom}`,
      donnees: {
        clubId: invitation.clubId,
        invitationId: invitation._id
      }
    });

    await notification.save();

    // Envoyer notification Discord
    await discordService.sendInvitationAccepted(invitation, club, player);

    res.json({
      message: 'Invitation acceptée avec succès',
      club
    });

  } catch (error) {
    console.error('Erreur lors de l\'acceptation:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Refuser une invitation
router.put('/refuser/:invitationId', auth, async (req, res) => {
  try {
    const { invitationId } = req.params;
    const userId = req.user.id;

    const invitation = await Invitation.findById(invitationId);
    if (!invitation) {
      return res.status(404).json({ message: 'Invitation non trouvée' });
    }

    // Vérifier que l'utilisateur est bien l'invité
    const player = await Player.findOne({ 'userId': userId });
    if (!player || invitation.inviteId.toString() !== player._id.toString()) {
      return res.status(403).json({ message: 'Vous ne pouvez pas refuser cette invitation' });
    }

    if (invitation.statut !== 'En attente') {
      return res.status(400).json({ message: 'Cette invitation a déjà été traitée' });
    }

    // Mettre à jour l'invitation
    invitation.statut = 'Refusée';
    invitation.dateReponse = new Date();
    await invitation.save();

    // Créer une notification pour l'inviteur
    const club = await Club.findById(invitation.clubId);
    const notification = new Notification({
      userId: invitation.inviteurId,
      type: 'invitation_refusee',
      titre: 'Invitation refusée',
      message: `${req.user.pseudo} a refusé votre invitation à rejoindre ${club.nom}`,
      donnees: {
        clubId: invitation.clubId,
        invitationId: invitation._id
      }
    });

    await notification.save();

    // Envoyer notification Discord
    await discordService.sendInvitationRefused(invitation, club, player);

    res.json({
      message: 'Invitation refusée avec succès'
    });

  } catch (error) {
    console.error('Erreur lors du refus:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Obtenir les invitations reçues par l'utilisateur
router.get('/recues', auth, async (req, res) => {
  try {
    const userId = req.user.id;

    // Trouver le profil joueur de l'utilisateur
    const player = await Player.findOne({ 'userId': userId });
    
    if (!player) {
      return res.json([]);
    }

    const invitations = await Invitation.find({
      inviteId: player._id,
      statut: 'En attente'
    }).populate('clubId', 'nom plateforme pays').populate('inviteurId', 'pseudo');

    res.json(invitations);

  } catch (error) {
    console.error('Erreur lors de la récupération des invitations:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Obtenir les invitations envoyées par l'utilisateur
router.get('/envoyees', auth, async (req, res) => {
  try {
    const userId = req.user.id;

    const invitations = await Invitation.find({
      inviteurId: userId
    }).populate('clubId', 'nom plateforme pays').populate('inviteId', 'pseudo userId');

    res.json(invitations);

  } catch (error) {
    console.error('Erreur lors de la récupération des invitations envoyées:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

module.exports = router; 