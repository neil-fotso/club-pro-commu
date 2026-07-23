const express = require('express');
const Competition = require('../models/Competition');
const Club = require('../models/Club');
const Notification = require('../models/Notification');
const auth = require('../middleware/auth');
const adminAuth = require('../middleware/adminAuth');
const discordSimple = require('../services/discordSimple');
const multer = require('multer');
const fs = require('fs');
const path = require('path');

// S'assurer que les dossiers de destination existent
const uploadDir = path.resolve('uploads/disputes');
const uploadPhotoDir = path.resolve('uploads/disputes/photos');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}
if (!fs.existsSync(uploadPhotoDir)) {
  fs.mkdirSync(uploadPhotoDir, { recursive: true });
}

// Configurer le stockage multer (vidéo)
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, 'dispute-' + req.params.matchId + '-' + uniqueSuffix + ext);
  }
});

// Filtrer pour n'autoriser que les vidéos
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('video/')) {
    cb(null, true);
  } else {
    cb(new Error('Uniquement les fichiers vidéo sont autorisés !'), false);
  }
};

const upload = multer({ 
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 100 * 1024 * 1024 // Limite de 100 Mo
  }
});

// Configurer le stockage multer pour les photos de litige
const photoStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadPhotoDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, 'photo-' + req.params.matchId + '-' + uniqueSuffix + ext);
  }
});

// Filtrer pour n'autoriser que les images
const photoFileFilter = (req, file, cb) => {
  const allowedMimes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Uniquement les images (JPG, PNG, WEBP) sont autorisées !'), false);
  }
};

const uploadPhoto = multer({
  storage: photoStorage,
  fileFilter: photoFileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // Limite de 5 Mo
  }
});

const router = express.Router();

// 🔹 1. CRÉATION DE COMPÉTITION

// GET /api/competitions - Récupérer toutes les compétitions
router.get('/', async (req, res) => {
  try {
    const { 
      statut, 
      plateforme, 
      type, 
      visibilite, 
      page = 1, 
      limit = 12,
      archive = false
    } = req.query;
    
    const query = { archive: archive === 'true' };
    if (statut) query.statut = statut;
    if (plateforme) query.plateforme = plateforme;
    if (type) query.type = type;
    if (visibilite) query.visibilite = visibilite;


    const competitions = await Competition.find(query)
      .populate('createurId', 'pseudo')
      .populate('equipesInscrites.clubId', 'nom logo')
      .populate('gagnant', 'nom logo')
      .populate('finaliste', 'nom logo')
      .populate('troisieme', 'nom logo')
      .sort({ dateCreation: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Competition.countDocuments(query);

    res.json({
      competitions,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      total
    });
  } catch (error) {
    console.error('Erreur récupération compétitions:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// GET /api/competitions/mes-competitions - Récupérer les compétitions de l'utilisateur
router.get('/mes-competitions', auth, async (req, res) => {
  try {
    console.log('Recherche compétitions pour user:', req.user.id);
    const competitions = await Competition.find({ 
      createurId: req.user.id,
      archive: false
    })
      .populate('createurId', 'pseudo')
      .populate('equipesInscrites.clubId', 'nom logo')
      .populate('gagnant', 'nom logo')
      .populate('finaliste', 'nom logo')
      .populate('troisieme', 'nom logo')
      .sort({ dateCreation: -1 });

    console.log('Compétitions trouvées:', competitions.length);
    res.json(competitions);
  } catch (error) {
    console.error('Erreur récupération mes compétitions:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// POST /api/competitions/:id/matchs/:matchId/chat/:messageId/signaler - Signaler un message offensant
router.post('/:id/matchs/:matchId/chat/:messageId/signaler', auth, async (req, res) => {
  try {
    const { id: competitionId, matchId, messageId } = req.params;
    const { raison } = req.body;

    const competition = await Competition.findById(competitionId);
    if (!competition) return res.status(404).json({ message: 'Compétition non trouvée' });

    let match = competition.matchsElimination.id(matchId);
    if (!match && competition.poules) {
      for (const poule of competition.poules) {
        match = poule.matchs.id(matchId);
        if (match) break;
      }
    }
    if (!match) return res.status(404).json({ message: 'Match non trouvé' });

    // Vérifier l'autorisation (membre de l'une des deux équipes ou admin)
    const User = require('../models/User');
    const user = await User.findById(req.user.id);
    const estAdminSite = user && user.isAdmin;
    const estCreateurCompetition = competition.createurId && competition.createurId.toString() === req.user.id;

    let isAuthorized = estAdminSite || estCreateurCompetition;
    if (!isAuthorized) {
      const Club = require('../models/Club');
      const userClub = await Club.findOne({
        _id: { $in: [match.equipe1, match.equipe2] },
        'membres.userId': req.user.id
      });
      if (userClub) isAuthorized = true;
    }
    if (!isAuthorized) return res.status(403).json({ message: 'Vous ne participez pas à ce match' });

    // Trouver le message
    const message = match.messages.id(messageId);
    if (!message) return res.status(404).json({ message: 'Message non trouvé' });

    // Interdit de se signaler soi-même
    if (message.expediteur.toString() === req.user.id) {
      return res.status(400).json({ message: 'Vous ne pouvez pas signaler votre propre message' });
    }

    // Vérifier si déjà signalé par cet utilisateur
    const dejaSignale = message.signalements && message.signalements.some(
      s => s.userId && s.userId.toString() === req.user.id
    );
    if (dejaSignale) {
      return res.status(400).json({ message: 'Vous avez déjà signalé ce message' });
    }

    // Ajouter le signalement
    if (!message.signalements) message.signalements = [];
    message.signalements.push({ userId: req.user.id, raison: raison || '', date: new Date() });
    message.estSignale = true;

    await competition.save();
    res.json({ success: true, message: 'Message signalé avec succès' });
  } catch (error) {
    console.error('Erreur signalement message:', error);
    res.status(500).json({ message: 'Erreur lors du signalement' });
  }
});

// GET /api/competitions/:id/matchs/:matchId/chat - Récupérer les messages du chat de match
router.get('/:id/matchs/:matchId/chat', auth, async (req, res) => {
  try {
    const { id: competitionId, matchId } = req.params;
    const competition = await Competition.findById(competitionId);
    if (!competition) return res.status(404).json({ message: 'Compétition non trouvée' });

    // Trouver le match
    let match = competition.matchsElimination.id(matchId);
    if (!match && competition.poules) {
      for (const poule of competition.poules) {
        match = poule.matchs.id(matchId);
        if (match) break;
      }
    }
    if (!match) return res.status(404).json({ message: 'Match non trouvé' });

    // Vérifier l'autorisation
    const User = require('../models/User');
    const user = await User.findById(req.user.id);
    const estAdminSite = user && user.isAdmin;
    const estCreateurCompetition = competition.createurId && competition.createurId.toString() === req.user.id;

    let isAuthorized = estAdminSite || estCreateurCompetition;

    if (!isAuthorized) {
      const Club = require('../models/Club');
      const userClub = await Club.findOne({
        _id: { $in: [match.equipe1, match.equipe2] },
        'membres.userId': req.user.id
      });
      if (userClub) isAuthorized = true;
    }

    if (!isAuthorized) return res.status(403).json({ message: 'Vous ne participez pas à ce match' });

    res.json(match.messages || []);
  } catch (error) {
    console.error('Erreur récupération chat de match:', error);
    res.status(500).json({ message: 'Erreur lors de la récupération des messages' });
  }
});

// POST /api/competitions/:id/matchs/:matchId/chat - Envoyer un message dans le chat de match
router.post('/:id/matchs/:matchId/chat', auth, async (req, res) => {
  try {
    const { id: competitionId, matchId } = req.params;
    const { texte } = req.body;

    if (!texte || typeof texte !== 'string' || !texte.trim()) {
      return res.status(400).json({ message: 'Le texte du message ne peut pas être vide' });
    }
    if (texte.length > 1000) {
      return res.status(400).json({ message: 'Le message est trop long (max 1000 caractères)' });
    }

    const competition = await Competition.findById(competitionId);
    if (!competition) return res.status(404).json({ message: 'Compétition non trouvée' });

    let match = competition.matchsElimination.id(matchId);
    if (!match && competition.poules) {
      for (const poule of competition.poules) {
        match = poule.matchs.id(matchId);
        if (match) break;
      }
    }
    if (!match) return res.status(404).json({ message: 'Match non trouvé' });

    const User = require('../models/User');
    const user = await User.findById(req.user.id);
    const estAdminSite = user && user.isAdmin;
    const estCreateurCompetition = competition.createurId && competition.createurId.toString() === req.user.id;

    let isAuthorized = estAdminSite || estCreateurCompetition;

    if (!isAuthorized) {
      const Club = require('../models/Club');
      const userClub = await Club.findOne({
        _id: { $in: [match.equipe1, match.equipe2] },
        'membres.userId': req.user.id
      });
      if (userClub) isAuthorized = true;
    }

    if (!isAuthorized) return res.status(403).json({ message: 'Vous ne participez pas à ce match' });

    // Vérifier le bannissement chat
    if (user && user.chatBanni) {
      // Vérifier si le ban temporaire est expiré
      if (user.chatBanniJusquAu && new Date() > new Date(user.chatBanniJusquAu)) {
        // Lever le ban automatiquement
        user.chatBanni = false;
        user.chatBanniJusquAu = null;
        await user.save();
      } else {
        const msg = user.chatBanniJusquAu
          ? `Vous êtes banni du chat jusqu'au ${new Date(user.chatBanniJusquAu).toLocaleDateString('fr-FR')}`
          : 'Vous êtes banni définitivement du chat';
        return res.status(403).json({ message: msg, code: 'CHAT_BANNED' });
      }
    }

    const pseudo = user ? user.pseudo : 'Joueur';
    if (!match.messages) match.messages = [];
    match.messages.push({ expediteur: req.user.id, pseudo, texte: texte.trim() });

    await competition.save();
    res.json(match.messages);
  } catch (error) {
    console.error('Erreur envoi message chat de match:', error);
    res.status(500).json({ message: 'Erreur lors de l\'envoi du message' });
  }
});

// GET /api/competitions/:id - Récupérer une compétition spécifique
router.get('/:id', async (req, res) => {
  try {
    let competition = await Competition.findById(req.params.id);
    if (!competition) {
      return res.status(404).json({ message: 'Compétition non trouvée' });
    }

    // Exécuter la vérification automatique des minuteurs/forfaits
    const modified = await checkMatchTimers(competition);
    if (modified) {
      await competition.save();
    }

    // Re-charger avec toutes les relations popuplées
    competition = await Competition.findById(req.params.id)
      .populate('createurId', 'pseudo _id')
      .populate({
        path: 'equipesInscrites.clubId',
        select: 'nom logo description membres',
        populate: {
          path: 'membres.userId',
          select: 'pseudo _id'
        }
      })
      .populate('demandesInscription.clubId', 'nom logo')
      .populate('poules.equipes', 'nom logo')
      .populate('poules.matchs.equipe1', 'nom logo')
      .populate('poules.matchs.equipe2', 'nom logo')
      .populate('poules.matchs.arbitre', 'pseudo')
      .populate('matchsElimination.equipe1', 'nom logo')
      .populate('matchsElimination.equipe2', 'nom logo')
      .populate('matchsElimination.arbitre', 'pseudo')
      .populate('gagnant', 'nom logo')
      .populate('finaliste', 'nom logo')
      .populate('troisieme', 'nom logo')
      .populate('statistiques.meilleurButeur.club', 'nom logo')
      .populate('statistiques.meilleurPasseur.club', 'nom logo')
      .populate('statistiques.meilleurJoueur.club', 'nom logo');

    res.json(competition);
  } catch (error) {
    console.error('Erreur récupération compétition:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// POST /api/competitions - Créer une nouvelle compétition
router.post('/', adminAuth, async (req, res) => {
  try {
    const {
      nom,
      type,
      modeMatch,
      description,
      reglement,
      dateDebut,
      dateFin,
      nombreEquipes,
      nombreEquipesParPoule,
      plateforme,
      visibilite,
      modeInscription,
      limiteInscriptions,
      lienDiscord,
      recompenses,
      zoneHoraire,
      notifications,
      inscriptionGratuite,
      montantInscription,
      cashprizeFinal,
      cashprizeMinimal
    } = req.body;

    // Validation des données
    if (!nom || !type || !dateDebut || !nombreEquipes) {
      return res.status(400).json({ 
        message: 'Nom, type, date de début et nombre d\'équipes sont requis' 
      });
    }

    // Vérifier si une compétition avec le même nom existe déjà (désactivé temporairement car format unique "la street club pro compétition")
    /*
    const competitionExistante = await Competition.findOne({ 
      nom: nom.trim(),
      createurId: req.user.id,
      archive: false
    });
    
    if (competitionExistante) {
      return res.status(400).json({ 
        message: 'Une compétition avec ce nom existe déjà. Veuillez choisir un autre nom.' 
      });
    }
    */

    // Validation du nombre d'équipes selon le type
    if (type === 'elimination_directe') {
      // Doit être une puissance de 2
      if (!Number.isInteger(Math.log2(nombreEquipes))) {
        return res.status(400).json({ 
          message: 'Le nombre d\'équipes doit être une puissance de 2 pour un tournoi à élimination directe' 
        });
      }
    }

    const competition = new Competition({
      nom,
      type,
      modeMatch: modeMatch || 'simple',
      description,
      reglement,
      dateDebut,
      dateFin,
      nombreEquipes,
      nombreEquipesParPoule: nombreEquipesParPoule || 4,

      plateforme: plateforme || 'PS5',
      visibilite: visibilite || 'publique',
      modeInscription: modeInscription || 'libre',
      limiteInscriptions: limiteInscriptions || nombreEquipes,
      lienDiscord,
      recompenses,
      zoneHoraire: zoneHoraire || 'Europe/Paris',
      notifications,
      createurId: req.user.id,
      statut: 'Brouillon',
      inscriptionGratuite: inscriptionGratuite !== undefined ? inscriptionGratuite : true,
      montantInscription: montantInscription || 0,
      cashprizeFinal: cashprizeFinal || 0,
      cashprizeMinimal: cashprizeMinimal || 0
    });

    await competition.save();

    // Notification Discord
    try {
      await discordSimple.sendNewCompetition(competition, req.user);
    } catch (discordError) {
      console.error('Erreur notification Discord:', discordError);
    }

    res.status(201).json(competition);
  } catch (error) {
    console.error('Erreur création compétition:', error);
    res.status(500).json({ message: 'Erreur lors de la création' });
  }
});

// PUT /api/competitions/:id - Mettre à jour une compétition
router.put('/:id', auth, async (req, res) => {
  try {
    const competition = await Competition.findById(req.params.id);
    if (!competition) {
      return res.status(404).json({ message: 'Compétition non trouvée' });
    }

    // Vérifier que l'utilisateur est le créateur
    if (competition.createurId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Non autorisé' });
    }

    // Empêcher la modification si la compétition est en cours ou terminée
    if (['En cours', 'Terminé'].includes(competition.statut)) {
      return res.status(400).json({ 
        message: 'Impossible de modifier une compétition en cours ou terminée' 
      });
    }

    const updatedCompetition = await Competition.findByIdAndUpdate(
      req.params.id,
      { ...req.body, dateModification: new Date() },
      { new: true, runValidators: true }
    );

    res.json(updatedCompetition);
  } catch (error) {
    console.error('Erreur mise à jour compétition:', error);
    res.status(500).json({ message: 'Erreur lors de la mise à jour' });
  }
});

// DELETE /api/competitions/:id - Supprimer une compétition
router.delete('/:id', auth, async (req, res) => {
  try {
    const competition = await Competition.findById(req.params.id);
    if (!competition) {
      return res.status(404).json({ message: 'Compétition non trouvée' });
    }

    // Vérifier que l'utilisateur est le créateur ou un administrateur
    const isCreator = competition.createurId.toString() === req.user.id;
    const isAdmin = req.user.isAdmin === true;
    if (!isCreator && !isAdmin) {
      return res.status(403).json({ message: 'Non autorisé' });
    }

    // Empêcher la suppression si la compétition a des équipes inscrites (sauf pour les admins)
    if (competition.equipesInscrites.length > 0 && !isAdmin) {
      return res.status(400).json({ 
        message: 'Impossible de supprimer une compétition avec des équipes inscrites' 
      });
    }

    await Competition.findByIdAndDelete(req.params.id);
    res.json({ message: 'Compétition supprimée avec succès' });
  } catch (error) {
    console.error('Erreur suppression compétition:', error);
    res.status(500).json({ message: 'Erreur lors de la suppression' });
  }
});

// 🔹 2. INSCRIPTIONS

// POST /api/competitions/:id/inscription - S'inscrire à une compétition
router.post('/:id/inscription', auth, async (req, res) => {
  try {
    const { clubId, message = '' } = req.body;
    const competitionId = req.params.id;

    if (!clubId) {
      return res.status(400).json({ message: 'ID du club requis' });
    }

    const competition = await Competition.findById(competitionId);
    if (!competition) {
      return res.status(404).json({ message: 'Compétition non trouvée' });
    }

    // Vérifier que les inscriptions sont ouvertes
    if (!competition.inscriptionsOuvertes) {
      return res.status(400).json({ message: 'Les inscriptions sont fermées' });
    }

    // Vérifier que le club n'est pas déjà inscrit
    const dejaInscrit = competition.equipesInscrites.some(
      equipe => equipe.clubId.toString() === clubId
    );
    if (dejaInscrit) {
      return res.status(400).json({ message: 'Ce club est déjà inscrit' });
    }

    // Vérifier que l'utilisateur est admin du club ou créateur du club
    const club = await Club.findById(clubId);
    if (!club) {
      return res.status(404).json({ message: 'Club non trouvé' });
    }

    const estAdmin = club.membres.some(
      membre => membre.userId.toString() === req.user.id && (membre.role === 'Admin' || membre.role === 'Capitaine')
    );
    const estCreateurClub = club.createurId && club.createurId.toString() === req.user.id;
    
    if (!estAdmin && !estCreateurClub) {
      return res.status(403).json({ message: 'Vous devez être admin ou créateur du club pour l\'inscrire' });
    }

    // Ajouter l'équipe selon le mode d'inscription
    if (competition.modeInscription === 'validation_requise') {
      // Ajouter à la liste des demandes
      competition.demandesInscription.push({
        clubId,
        message,
        statut: 'En attente'
      });
    } else {
      // Inscription directe
      competition.equipesInscrites.push({
        clubId,
        statut: competition.inscriptionGratuite ? 'Confirmé' : 'Inscrit',
        statutPaiement: competition.inscriptionGratuite ? 'Gratuit' : 'En attente'
      });
    }

    await competition.save();

    // Notification Discord
    try {
      await discordSimple.sendNotification(
        `🏆 **Inscription à une compétition**\n` +
        `📝 Compétition: ${competition.nom}\n` +
        `🏆 Club: ${club.nom}\n` +
        `👤 Inscrit par: ${req.user.pseudo}\n` +
        `⏰ ${new Date().toLocaleString('fr-FR')}`
      );
    } catch (discordError) {
      console.error('Erreur notification Discord:', discordError);
    }

    res.json({ 
      message: competition.modeInscription === 'validation_requise' 
        ? 'Demande d\'inscription envoyée' 
        : 'Club inscrit avec succès' 
    });
  } catch (error) {
    console.error('Erreur inscription compétition:', error);
    res.status(500).json({ message: 'Erreur lors de l\'inscription' });
  }
});

// DELETE /api/competitions/:id/inscription - Quitter une compétition
router.delete('/:id/inscription', auth, async (req, res) => {
  try {
    const { clubId } = req.body;
    const competitionId = req.params.id;

    if (!clubId) {
      return res.status(400).json({ message: 'ID du club requis' });
    }

    const competition = await Competition.findById(competitionId);
    if (!competition) {
      return res.status(404).json({ message: 'Compétition non trouvée' });
    }

    // Vérifier que l'utilisateur est admin du club ou créateur du club
    const club = await Club.findById(clubId);
    if (!club) {
      return res.status(404).json({ message: 'Club non trouvé' });
    }

    const estAdmin = club.membres.some(
      membre => membre.userId.toString() === req.user.id && (membre.role === 'Admin' || membre.role === 'Capitaine')
    );
    const estCreateurClub = club.createurId && club.createurId.toString() === req.user.id;
    
    if (!estAdmin && !estCreateurClub) {
      return res.status(403).json({ message: 'Vous devez être admin ou créateur du club' });
    }

    // Vérifier si le club est inscrit
    const equipeInscrite = competition.equipesInscrites.find(
      equipe => equipe.clubId.toString() === clubId
    );
    if (!equipeInscrite) {
      return res.status(400).json({ message: 'Ce club n\'est pas inscrit à cette compétition' });
    }

    // Empêcher de quitter si la compétition est en cours ou terminée
    if (competition.statut === 'En cours' || competition.statut === 'Terminé') {
      return res.status(400).json({ message: 'Impossible de quitter une compétition en cours ou terminée' });
    }

    // Retirer le club de la compétition
    competition.equipesInscrites = competition.equipesInscrites.filter(
      equipe => equipe.clubId.toString() !== clubId
    );

    await competition.save();

    res.json({ message: 'Club retiré de la compétition avec succès' });
  } catch (error) {
    console.error('Erreur désinscription compétition:', error);
    res.status(500).json({ message: 'Erreur lors de la désinscription' });
  }
});

// POST /api/competitions/:id/inscriptions/:clubId/payer - Simuler le paiement des frais d'inscription
router.post('/:id/inscriptions/:clubId/payer', auth, async (req, res) => {
  try {
    const { id: competitionId, clubId } = req.params;
    const { numeroCarte, dateExpiration, cvv, nomTitulaire } = req.body;

    // Validation factice minimale
    if (!numeroCarte || !dateExpiration || !cvv || !nomTitulaire) {
      return res.status(400).json({ message: 'Toutes les informations bancaires sont requises pour la simulation' });
    }

    const competition = await Competition.findById(competitionId);
    if (!competition) {
      return res.status(404).json({ message: 'Compétition non trouvée' });
    }

    if (competition.inscriptionGratuite) {
      return res.status(400).json({ message: 'Cette compétition est gratuite' });
    }

    const equipe = competition.equipesInscrites.find(
      e => e.clubId.toString() === clubId
    );

    if (!equipe) {
      return res.status(404).json({ message: 'Le club n\'est pas inscrit à cette compétition' });
    }

    if (equipe.statutPaiement === 'Payé') {
      return res.status(400).json({ message: 'L\'inscription de ce club a déjà été payée' });
    }

    // Effectuer le paiement factice
    equipe.statutPaiement = 'Payé';
    equipe.statut = 'Confirmé'; // Devient confirmé pour participer
    equipe.transactionId = `tx_stripe_${Math.random().toString(36).substring(2, 15)}`;
    equipe.datePaiement = new Date();

    await competition.save();

    // Optionnel : notification Discord
    try {
      const Club = require('../models/Club');
      const clubObj = await Club.findById(clubId);
      await discordSimple.sendNotification(
        `💳 **Paiement d'inscription confirmé**\n` +
        `📝 Compétition: ${competition.nom}\n` +
        `🏆 Club: ${clubObj?.nom || 'Inconnu'}\n` +
        `💸 Montant: ${competition.montantInscription}€\n` +
        `💰 Cagnotte mise à jour: ${competition.cashprizeFinal}€\n` +
        `⏰ ${new Date().toLocaleString('fr-FR')}`
      );
    } catch (err) {
      console.error('Erreur notification Discord paiement:', err);
    }

    res.json({ 
      success: true, 
      message: 'Paiement simulé avec succès. L\'inscription est confirmée !',
      cashprizeFinal: competition.cashprizeFinal
    });
  } catch (error) {
    console.error('Erreur simulation paiement:', error);
    res.status(500).json({ message: 'Erreur lors du traitement du paiement' });
  }
});

// 🔹 3. GESTION DES DEMANDES D'INSCRIPTION

// PUT /api/competitions/:id/demandes/:demandeId - Traiter une demande d'inscription
router.put('/:id/demandes/:demandeId', auth, async (req, res) => {
  try {
    const { action, reponse = '' } = req.body;
    const { id: competitionId, demandeId } = req.params;

    if (!['accepter', 'refuser'].includes(action)) {
      return res.status(400).json({ message: 'Action invalide' });
    }

    const competition = await Competition.findById(competitionId);
    if (!competition) {
      return res.status(404).json({ message: 'Compétition non trouvée' });
    }

    // Vérifier que l'utilisateur est le créateur
    if (competition.createurId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Non autorisé' });
    }

    const demande = competition.demandesInscription.id(demandeId);
    if (!demande) {
      return res.status(404).json({ message: 'Demande non trouvée' });
    }

    if (demande.statut !== 'En attente') {
      return res.status(400).json({ message: 'Cette demande a déjà été traitée' });
    }

    // Traiter la demande
    demande.statut = action === 'accepter' ? 'Acceptée' : 'Refusée';
    demande.reponse = reponse;

    if (action === 'accepter') {
      // Ajouter l'équipe à la compétition
      competition.equipesInscrites.push({
        clubId: demande.clubId,
        statut: competition.inscriptionGratuite ? 'Confirmé' : 'Inscrit',
        statutPaiement: competition.inscriptionGratuite ? 'Gratuit' : 'En attente'
      });
    }

    await competition.save();

    // Notification Discord
    try {
      const club = await Club.findById(demande.clubId);
      await discordSimple.sendNotification(
        `🏆 **Demande d'inscription traitée**\n` +
        `📝 Compétition: ${competition.nom}\n` +
        `🏆 Club: ${club.nom}\n` +
        `👤 Traitée par: ${req.user.pseudo}\n` +
        `✅ Action: ${action === 'accepter' ? 'Acceptée' : 'Refusée'}\n` +
        `⏰ ${new Date().toLocaleString('fr-FR')}`
      );
    } catch (discordError) {
      console.error('Erreur notification Discord:', discordError);
    }

    res.json({ 
      message: `Demande ${action === 'accepter' ? 'acceptée' : 'refusée'} avec succès` 
    });
  } catch (error) {
    console.error('Erreur traitement demande:', error);
    res.status(500).json({ message: 'Erreur lors du traitement' });
  }
});

// 🔹 4. LANCEMENT DE COMPÉTITION

// PUT /api/competitions/:id/lancer - Lancer une compétition
router.put('/:id/lancer', auth, async (req, res) => {
  try {
    const competition = await Competition.findById(req.params.id);
    if (!competition) {
      return res.status(404).json({ message: 'Compétition non trouvée' });
    }



    // Vérifier que l'utilisateur est le créateur
    if (competition.createurId._id.toString() !== req.user.id.toString()) {
      return res.status(403).json({ 
        message: 'Seul le créateur de la compétition peut la lancer' 
      });
    }

    if (competition.statut !== 'Ouvert' && competition.statut !== 'Brouillon') {
      return res.status(400).json({ 
        message: `La compétition ne peut plus être lancée (statut actuel: ${competition.statut})` 
      });
    }

    // Vérifier qu'il y a assez d'équipes
    const equipesConfirmees = competition.equipesInscrites.filter(e => e.statut === 'Confirmé');
    if (equipesConfirmees.length < 2) {
      return res.status(400).json({ message: 'Il faut au moins 2 équipes pour lancer la compétition' });
    }

    // Générer les matchs selon le type
    if (competition.type === 'championnat') {
      // Planifier intelligemment les journées du championnat
      const matchs = [];
      const nombreEquipes = equipesConfirmees.length;
      
      // Générer les matchs (aller simple ou aller-retour)
      for (let i = 0; i < nombreEquipes; i++) {
        for (let j = i + 1; j < nombreEquipes; j++) {
          // Match aller / unique
          matchs.push({
            equipe1: equipesConfirmees[i].clubId,
            equipe2: equipesConfirmees[j].clubId,
            statut: 'Programmé',
            type: competition.modeMatch === 'aller_retour' ? 'aller' : 'simple'
          });
          
          // Match retour (seulement si aller_retour est sélectionné)
          if (competition.modeMatch === 'aller_retour') {
            matchs.push({
              equipe1: equipesConfirmees[j].clubId,
              equipe2: equipesConfirmees[i].clubId,
              statut: 'Programmé',
              type: 'retour'
            });
          }
        }
      }
      
      // Planifier les journées les journées intelligemment
      const matchsPlanifies = planifierJourneesChampionnat(matchs, nombreEquipes);
      
      // Ajouter les matchs planifiés à la poule
      competition.poules[0].matchs = matchsPlanifies;
      
      console.log(`🏆 Championnat planifié: ${matchsPlanifies.length} matchs sur ${Math.ceil(matchsPlanifies.length / Math.floor(nombreEquipes / 2))} journées`);
    } else if (competition.type === 'elimination_directe') {
      // Générer les matchs d'élimination directe avec byes (tas binaire)
      generateEliminationBracket(competition, equipesConfirmees);
    } else if (competition.type === 'poule_elimination') {
      // Générer les poules puis les matchs d'élimination
      const equipesParPoule = Math.ceil(equipesConfirmees.length / competition.nombreEquipesParPoule);
      
      for (let i = 0; i < competition.nombreEquipesParPoule; i++) {
        const poule = {
          nom: `Poule ${String.fromCharCode(65 + i)}`,
          equipes: equipesConfirmees.slice(i * equipesParPoule, (i + 1) * equipesParPoule).map(e => e.clubId),
          matchs: []
        };
        
        // Générer les matchs de la poule (aller simple ou aller-retour)
        for (let j = 0; j < poule.equipes.length; j++) {
          for (let k = j + 1; k < poule.equipes.length; k++) {
            // Match aller / unique
            poule.matchs.push({
              equipe1: poule.equipes[j],
              equipe2: poule.equipes[k],
              statut: 'Programmé',
              type: competition.modeMatch === 'aller_retour' ? 'aller' : 'simple'
            });
            // Match retour (seulement si aller_retour est sélectionné)
            if (competition.modeMatch === 'aller_retour') {
              poule.matchs.push({
                equipe1: poule.equipes[k],
                equipe2: poule.equipes[j],
                statut: 'Programmé',
                type: 'retour'
              });
            }
          }
        }
        
        competition.poules.push(poule);
      }
    }

    // ─── Calcul de l'heure limite de début pour chaque match du premier tour ───
    // Les matchs du premier tour doivent tous commencer au plus tard +10 min après le lancement
    const DELAI_LANCEMENT = (competition.delaiLancementMatch || 10) * 60 * 1000;
    const dateLimiteDebut = new Date(Date.now() + DELAI_LANCEMENT);

    // Appliquer dateLimiteDebut à tous les matchs qui ont déjà leurs deux équipes connues (sauf retour)
    competition.matchsElimination.forEach(match => {
      if (match.equipe1 && match.equipe2 && !match.dateLimiteDebut && match.type !== 'retour') {
        match.dateLimiteDebut = dateLimiteDebut;
      }
    });
    if (competition.poules) {
      competition.poules.forEach(poule => {
        poule.matchs.forEach(match => {
          if (match.equipe1 && match.equipe2 && !match.dateLimiteDebut && match.type !== 'retour') {
            match.dateLimiteDebut = dateLimiteDebut;
          }
        });
      });
    }

    competition.statut = 'En cours';
    await competition.save();

    // Notification Discord
    try {
      await discordSimple.sendNotification(
        `🏆 **Compétition lancée !**\n` +
        `📝 Compétition: ${competition.nom}\n` +
        `👤 Lancée par: ${req.user.pseudo}\n` +
        `🏟️ Équipes: ${competition.equipesInscrites.length}\n` +
        `⏰ ${new Date().toLocaleString('fr-FR')}`
      );
    } catch (discordError) {
      console.error('Erreur notification Discord:', discordError);
    }

    res.json({ message: 'Compétition lancée avec succès' });
  } catch (error) {
    console.error('Erreur lancement compétition:', error);
    res.status(500).json({ message: 'Erreur lors du lancement' });
  }
});

// 🔹 5. GESTION DES RÉSULTATS

// PUT /api/competitions/:id/matchs/:matchId/date - Programmer une date pour un match
router.put('/:id/matchs/:matchId/date', auth, async (req, res) => {
  try {
    const { id, matchId } = req.params;
    const { dateMatch } = req.body;

    const competition = await Competition.findById(id);
    if (!competition) {
      return res.status(404).json({ message: 'Compétition non trouvée' });
    }

    // Vérifier les permissions - plusieurs autorisations possibles :
    // 1. Admin du site
    const isAdmin = req.user.isAdmin;
    
    // 2. Créateur de la compétition
    const estCreateurCompetition = competition.createurId && competition.createurId.toString() === req.user.id;
    
    // Trouver le match pour identifier les clubs concernés
    let match = null;
    
    // Chercher dans les poules
    if (competition.poules) {
      for (let poule of competition.poules) {
        if (poule.matchs) {
          match = poule.matchs.find(m => m._id.toString() === matchId);
          if (match) break;
        }
      }
    }

    // Si pas trouvé dans les poules, chercher dans l'élimination
    if (!match && competition.matchsElimination) {
      match = competition.matchsElimination.find(m => m._id.toString() === matchId);
    }

    if (!match) {
      return res.status(404).json({ message: 'Match non trouvé' });
    }

    // Vérifier que l'utilisateur est admin d'une des équipes du match
    const estAdminEquipe1 = await Club.findOne({ 
      _id: match.equipe1, 
      'membres.userId': req.user.id,
      'membres.role': 'Admin'
    });
    const estAdminEquipe2 = await Club.findOne({ 
      _id: match.equipe2, 
      'membres.userId': req.user.id,
      'membres.role': 'Admin'
    });
    
    if (!isAdmin && !estCreateurCompetition && !estAdminEquipe1 && !estAdminEquipe2) {
      return res.status(403).json({ 
        message: 'Seuls les admins du site, le créateur de la compétition ou les admins des équipes concernées peuvent programmer ce match' 
      });
    }

    // Trouver et mettre à jour le match
    let matchUpdated = false;

    // Chercher dans les poules
    if (competition.poules) {
      for (let poule of competition.poules) {
        if (poule.matchs) {
          const matchIndex = poule.matchs.findIndex(m => m._id.toString() === matchId);
          if (matchIndex !== -1) {
            poule.matchs[matchIndex].dateMatch = new Date(dateMatch);
            matchUpdated = true;
            break;
          }
        }
      }
    }

    // Chercher dans les matchs d'élimination
    if (!matchUpdated && competition.matchsElimination) {
      const matchIndex = competition.matchsElimination.findIndex(m => m._id.toString() === matchId);
      if (matchIndex !== -1) {
        competition.matchsElimination[matchIndex].dateMatch = new Date(dateMatch);
        matchUpdated = true;
      }
    }

    if (!matchUpdated) {
      return res.status(404).json({ message: 'Match non trouvé' });
    }

    await competition.save();
    res.json({ message: 'Date programmée avec succès' });
  } catch (error) {
    console.error('Erreur programmation date:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// ─── Utilitaire : Vérifier les forfaits automatiques sur tous les matchs en cours ───
async function checkMatchTimers(competition) {
  const READY_TIMEOUT_MS  = 10 * 60 * 1000; // 10 minutes
  const INGAME_TIMEOUT_MS = 25 * 60 * 1000; // 25 minutes
  const now = Date.now();
  let modified = false;

  // Collecte tous les matchs (poules + élimination)
  const allMatches = [
    ...competition.matchsElimination,
    ...(competition.poules || []).flatMap(p => p.matchs)
  ].filter(m => m && m.statut !== 'Terminé' && m.statut !== 'Annulé' && m.equipe1 && m.equipe2);

  for (const match of allMatches) {
    // Phase Préparation (Ready Check) — 10 min
    if (match.dateDebutPreparation && !match.dateDebutMatch) {
      const elapsed = now - new Date(match.dateDebutPreparation).getTime();
      if (elapsed >= READY_TIMEOUT_MS) {
        const e1Ready = match.equipe1Prete;
        const e2Ready = match.equipe2Prete;
        if (!e1Ready && !e2Ready) {
          // Double forfait
          match.score1 = 0; match.score2 = 0;
          match.statut = 'Terminé';
          match.valideParEquipe1 = true; match.valideParEquipe2 = true;
          console.log(`⏰ Forfait double (aucun prêt) - match ${match._id}`);
        } else if (!e1Ready) {
          match.score1 = 0; match.score2 = 3;
          match.statut = 'Terminé';
          match.valideParEquipe1 = true; match.valideParEquipe2 = true;
          console.log(`⏰ Forfait Équipe 1 (non prête) - match ${match._id}`);
        } else if (!e2Ready) {
          match.score1 = 3; match.score2 = 0;
          match.statut = 'Terminé';
          match.valideParEquipe1 = true; match.valideParEquipe2 = true;
          console.log(`⏰ Forfait Équipe 2 (non prête) - match ${match._id}`);
        }
        modified = true;
        if (match.statut === 'Terminé' && competition.type === 'elimination_directe' && match.phase) {
          await handleEliminationProgression(competition, match);
        }
      }
    }

    // Phase In-Game — 20 min pour saisir le score
    if (match.dateDebutMatch && match.statut === 'En cours') {
      const elapsed = now - new Date(match.dateDebutMatch).getTime();
      if (elapsed >= INGAME_TIMEOUT_MS) {
        const prop = match.propositionScore;
        const scorePropose = prop && prop.proposePar !== null;
        if (!scorePropose) {
          // Aucun score saisi — double forfait
          match.score1 = 0; match.score2 = 0;
          match.statut = 'Terminé';
          match.valideParEquipe1 = true; match.valideParEquipe2 = true;
          console.log(`⏰ Forfait double (aucun score) - match ${match._id}`);
        } else {
          // Un seul score saisi — le valider automatiquement
          match.score1 = prop.score1;
          match.score2 = prop.score2;
          match.statut = 'Terminé';
          match.valideParEquipe1 = true; match.valideParEquipe2 = true;
          console.log(`⏰ Score validé par défaut (${prop.proposePar}) - match ${match._id}`);
        }
        modified = true;
        if (match.statut === 'Terminé' && competition.type === 'elimination_directe' && match.phase) {
          await handleEliminationProgression(competition, match);
        }
      }
    }
  }
  return modified;
}

// POST /api/competitions/:id/matchs/:matchId/pret - Signaler qu'une équipe est prête
router.post('/:id/matchs/:matchId/pret', auth, async (req, res) => {
  try {
    const { id: competitionId, matchId } = req.params;
    const competition = await Competition.findById(competitionId);
    if (!competition) return res.status(404).json({ message: 'Compétition non trouvée' });

    // Chercher le match
    let match = competition.matchsElimination.id(matchId);
    if (!match) {
      for (const poule of competition.poules) {
        match = poule.matchs.id(matchId);
        if (match) break;
      }
    }
    if (!match) return res.status(404).json({ message: 'Match non trouvé' });

    if (match.statut === 'Terminé' || match.statut === 'Annulé') {
      return res.status(400).json({ message: 'Ce match est déjà terminé' });
    }
    if (!match.equipe1 || !match.equipe2) {
      return res.status(400).json({ message: 'Les deux équipes ne sont pas encore connues' });
    }

    // Si c'est un match retour, vérifier que le match aller est terminé
    if (match.type === 'retour') {
      let matchAller = null;
      if (competition.matchsElimination.id(matchId)) {
        // Élimination directe
        matchAller = competition.matchsElimination.find(m => m.tour === match.tour && m.type === 'aller');
      } else {
        // Poules / Championnat
        for (const poule of competition.poules) {
          const m = poule.matchs.id(matchId);
          if (m) {
            matchAller = poule.matchs.find(other => 
              other.type === 'aller' &&
              other.equipe1.toString() === match.equipe2.toString() &&
              other.equipe2.toString() === match.equipe1.toString()
            );
            break;
          }
        }
      }

      if (matchAller && matchAller.statut !== 'Terminé') {
        return res.status(400).json({ message: "Le match retour ne peut pas être lancé tant que le match aller n'est pas terminé." });
      }
    }

    // Déterminer quelle équipe est le capitaine
    const estAdminEquipe1 = await Club.findOne({ _id: match.equipe1, 'membres.userId': req.user.id, 'membres.role': 'Admin' });
    const estAdminEquipe2 = await Club.findOne({ _id: match.equipe2, 'membres.userId': req.user.id, 'membres.role': 'Admin' });

    if (!estAdminEquipe1 && !estAdminEquipe2) {
      return res.status(403).json({ message: 'Seuls les capitaines des équipes peuvent se déclarer prêts' });
    }

    if (estAdminEquipe1) match.equipe1Prete = true;
    if (estAdminEquipe2) match.equipe2Prete = true;

    // Si les deux équipes sont prêtes → lancer le chrono de jeu
    if (match.equipe1Prete && match.equipe2Prete && !match.dateDebutMatch) {
      match.dateDebutMatch = new Date();
      match.statut = 'En cours';
      console.log(`🏟️  Les deux équipes sont prêtes ! Chrono de 20 min lancé pour match ${match._id}`);
    }

    // Initialiser le ready check si pas encore fait
    if (!match.dateDebutPreparation) {
      match.dateDebutPreparation = new Date();
    }

    await competition.save();
    res.json({
      message: match.equipe1Prete && match.equipe2Prete ? 'Les deux équipes sont prêtes ! Le match commence.' : 'Statut "Prêt" enregistré, en attente de l\'adversaire.',
      equipe1Prete: match.equipe1Prete,
      equipe2Prete: match.equipe2Prete,
      dateDebutMatch: match.dateDebutMatch
    });
  } catch (error) {
    console.error('Erreur ready check:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// PUT /api/competitions/:id/matchs/:matchId/score - Mettre à jour le score d'un match
router.put('/:id/matchs/:matchId/score', auth, async (req, res) => {
  try {
    const { score1, score2, stats, captureEcran } = req.body;
    const { id: competitionId, matchId } = req.params;

    const competition = await Competition.findById(competitionId);
    if (!competition) {
      return res.status(404).json({ message: 'Compétition non trouvée' });
    }

    // Chercher le match dans les poules
    let match = null;
    let pouleIndex = -1;
    
    for (let i = 0; i < competition.poules.length; i++) {
      match = competition.poules[i].matchs.id(matchId);
      if (match) {
        pouleIndex = i;
        break;
      }
    }

    // Si pas trouvé dans les poules, chercher dans l'élimination
    if (!match) {
      match = competition.matchsElimination.id(matchId);
    }

    if (!match) {
      return res.status(404).json({ message: 'Match non trouvé' });
    }

    // Vérifier les permissions - plusieurs autorisations possibles :
    // 1. Admin du site
    const User = require('../models/User');
    const user = await User.findById(req.user.id);
    const estAdminSite = user && user.isAdmin;
    
    // 2. Créateur de la compétition
    const estCreateurCompetition = competition.createurId && competition.createurId.toString() === req.user.id;
    
    // 3. Admin d'une des équipes du match
    const estAdminEquipe1 = await Club.findOne({ 
      _id: match.equipe1, 
      'membres.userId': req.user.id,
      'membres.role': 'Admin'
    });
    const estAdminEquipe2 = await Club.findOne({ 
      _id: match.equipe2, 
      'membres.userId': req.user.id,
      'membres.role': 'Admin'
    });
    
    if (!estAdminSite && !estCreateurCompetition && !estAdminEquipe1 && !estAdminEquipe2) {
      return res.status(403).json({ 
        message: 'Seuls les admins du site, le créateur de la compétition ou les admins des équipes peuvent modifier les scores' 
      });
    }

    // ─── Double Validation des scores ────────────────────────────────────────────
    const isAdmin = estAdminSite || estCreateurCompetition;
    const teamRole = estAdminEquipe1 ? 'equipe1' : estAdminEquipe2 ? 'equipe2' : null;

    const numScore1 = Number(score1);
    const numScore2 = Number(score2);

    if (isAdmin) {
      // L'admin force le score directement sans double validation
      match.score1 = numScore1;
      match.score2 = numScore2;
      match.statut = 'Terminé';
      match.litige = false;
      match.valideParEquipe1 = true;
      match.valideParEquipe2 = true;
      match.stats = stats || {};
      if (captureEcran) match.captureEcran = captureEcran;
    } else {
      // Un capitaine propose son score
      const prop = match.propositionScore;
      const dejaPropose = prop && prop.proposePar !== null;

      if (!dejaPropose) {
        // Première proposition
        match.propositionScore = {
          score1: numScore1,
          score2: numScore2,
          proposePar: teamRole,
          dateSaisie: new Date()
        };
        await competition.save();
        return res.json({
          message: 'Score soumis. En attente de la validation de l\'équipe adverse.',
          statut: 'en_attente_validation',
          propositionScore: match.propositionScore
        });
      } else {
        // Deuxième proposition — comparer avec la première
        if (prop.proposePar === teamRole) {
          return res.status(400).json({ message: 'Vous avez déjà soumis votre score. En attente de l\'adversaire.' });
        }

        if (Number(prop.score1) === numScore1 && Number(prop.score2) === numScore2) {
          // ✅ Scores concordants → Valider définitivement
          match.score1 = numScore1;
          match.score2 = numScore2;
          match.statut = 'Terminé';
          match.litige = false;
          match.valideParEquipe1 = true;
          match.valideParEquipe2 = true;
          match.stats = stats || {};
          if (captureEcran) match.captureEcran = captureEcran;
          // ❌ Scores divergents → Litige automatique
          match.litige = true;
          const raisonLitige = `Désaccord de scores : Équipe 1 propose ${prop.score1}-${prop.score2}, Équipe 2 propose ${numScore1}-${numScore2}.`;
          match.litigeDetails = {
            signalePar: req.user.id,
            clubId: estAdminEquipe1 ? match.equipe1 : match.equipe2,
            description: raisonLitige,
            preuveVideo: captureEcran || null,
            dateSignalement: new Date(),
            statut: 'En attente'
          };
          match.statut = 'En cours'; // Bloqué, en attente de l'admin

          // Envoyer des notifications aux capitaines des deux clubs
          try {
            const club1 = await Club.findById(match.equipe1);
            const club2 = await Club.findById(match.equipe2);
            const usersToNotify = [];
            if (club1) club1.membres.forEach(m => { if (m.role === 'Admin' || m.role === 'Capitaine') usersToNotify.push(m.userId.toString()); });
            if (club2) club2.membres.forEach(m => { if (m.role === 'Admin' || m.role === 'Capitaine') usersToNotify.push(m.userId.toString()); });
            const uniqUsers = [...new Set(usersToNotify)];
            for (const uId of uniqUsers) {
              await Notification.create({
                userId: uId,
                type: 'litige',
                titre: 'Litige automatique sur un match',
                message: `Un litige a été automatiquement créé pour le match opposant ${club1?.nom || 'Équipe 1'} et ${club2?.nom || 'Équipe 2'}. Raison : ${raisonLitige}`
              });
            }
          } catch (notifErr) {
            console.error('Erreur lors de la création des notifications de litige:', notifErr);
          }

          await competition.save();
          return res.json({
            message: `⚠️ Les scores ne correspondent pas (${prop.score1}-${prop.score2} vs ${numScore1}-${numScore2}). Le match est en litige. L'administrateur va trancher.`,
            statut: 'litige',
            litigeDetails: match.litigeDetails
          });
      }
    }

    // Mettre à jour les statistiques des équipes (pour tous les types de compétitions)
    await updateTeamStats(competition, match);
    
    // Recalculer les statistiques individuelles
    const individualStats = await calculateCompetitionStats(competition);
    competition.statistiques = individualStats;
    
    // Gérer la progression en élimination directe
    if (competition.type === 'elimination_directe' && match.phase) {
      await handleEliminationProgression(competition, match);
    }

    await competition.save();

    res.json({ message: 'Score validé et enregistré avec succès !' });
  } catch (error) {
    console.error('Erreur mise à jour score:', error);
    res.status(500).json({ message: 'Erreur lors de la mise à jour' });
  }
});


// POST /api/competitions/:id/matchs/:matchId/litige - Déclarer un litige sur un match
router.post('/:id/matchs/:matchId/litige', auth, async (req, res) => {
  try {
    const { description, preuveVideo } = req.body;
    const { id: competitionId, matchId } = req.params;

    const competition = await Competition.findById(competitionId);
    if (!competition) {
      return res.status(404).json({ message: 'Compétition non trouvée' });
    }

    // Chercher le match dans les poules
    let match = null;
    let pouleIndex = -1;
    
    for (let i = 0; i < competition.poules.length; i++) {
      match = competition.poules[i].matchs.id(matchId);
      if (match) {
        pouleIndex = i;
        break;
      }
    }

    // Si pas trouvé dans les poules, chercher dans l'élimination
    if (!match) {
      match = competition.matchsElimination.id(matchId);
    }

    if (!match) {
      return res.status(404).json({ message: 'Match non trouvé' });
    }

    // Vérifier que l'utilisateur est admin ou capitaine d'une des deux équipes
    const User = require('../models/User');
    const user = await User.findById(req.user.id);
    const estAdminSite = user && user.isAdmin;
    
    const estCreateurCompetition = competition.createurId && competition.createurId.toString() === req.user.id;
    
    // Pour les clubs
    const club1 = await Club.findById(match.equipe1);
    const club2 = await Club.findById(match.equipe2);
    
    const estMembreEquipe1 = club1 && club1.membres.some(m => m.userId.toString() === req.user.id && (m.role === 'Admin' || m.role === 'Capitaine'));
    const estMembreEquipe2 = club2 && club2.membres.some(m => m.userId.toString() === req.user.id && (m.role === 'Admin' || m.role === 'Capitaine'));
    
    if (!estAdminSite && !estCreateurCompetition && !estMembreEquipe1 && !estMembreEquipe2) {
      return res.status(403).json({ 
        message: 'Vous devez être capitaine ou administrateur de l\'une des équipes du match pour signaler un litige.' 
      });
    }

    // Déterminer de quel club provient le signalement
    let clubSignataireId = null;
    if (estMembreEquipe1) {
      clubSignataireId = match.equipe1;
    } else if (estMembreEquipe2) {
      clubSignataireId = match.equipe2;
    }

    // Mettre à jour le statut de litige
    match.litige = true;
    const raisonLitige = description || 'Litige signalé';
    match.litigeDetails = {
      signalePar: req.user.id,
      clubId: clubSignataireId,
      description: raisonLitige,
      preuveVideo: preuveVideo || '',
      dateSignalement: new Date(),
      statut: 'En attente'
    };

    // Envoyer des notifications aux capitaines des deux clubs
    try {
      const club1 = await Club.findById(match.equipe1);
      const club2 = await Club.findById(match.equipe2);
      const usersToNotify = [];
      if (club1) club1.membres.forEach(m => { if (m.role === 'Admin' || m.role === 'Capitaine') usersToNotify.push(m.userId.toString()); });
      if (club2) club2.membres.forEach(m => { if (m.role === 'Admin' || m.role === 'Capitaine') usersToNotify.push(m.userId.toString()); });
      const uniqUsers = [...new Set(usersToNotify)];
      for (const uId of uniqUsers) {
        await Notification.create({
          userId: uId,
          type: 'litige',
          titre: 'Litige signalé sur un match',
          message: `Un litige a été manuellement signalé pour le match opposant ${club1?.nom || 'Équipe 1'} et ${club2?.nom || 'Équipe 2'}. Raison : ${raisonLitige}`
        });
      }
    } catch (notifErr) {
      console.error('Erreur lors de la création des notifications de litige:', notifErr);
    }

    await competition.save();

    res.json({ success: true, message: 'Litige signalé avec succès' });
  } catch (error) {
    console.error('Erreur signalement litige:', error);
    res.status(500).json({ message: 'Erreur lors du signalement du litige' });
  }
});

// POST /api/competitions/:id/matchs/:matchId/upload-video - Charger une vidéo de preuve
router.post('/:id/matchs/:matchId/upload-video', auth, upload.single('video'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Veuillez sélectionner un fichier vidéo' });
    }

    const fileUrl = `/uploads/disputes/${req.file.filename}`;
    res.json({ 
      success: true, 
      videoUrl: fileUrl,
      message: 'Fichier vidéo chargé avec succès' 
    });
  } catch (error) {
    console.error('Erreur chargement vidéo:', error);
    res.status(500).json({ message: 'Erreur lors du chargement de la vidéo' });
  }
});

// POST /api/competitions/:id/matchs/:matchId/upload-photo - Charger une photo de preuve litige
router.post('/:id/matchs/:matchId/upload-photo', auth, uploadPhoto.single('photo'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Veuillez sélectionner une image (JPG, PNG, WEBP)' });
    }

    const { id: competitionId, matchId } = req.params;
    const competition = await Competition.findById(competitionId);
    if (!competition) return res.status(404).json({ message: 'Compétition non trouvée' });

    // Chercher le match et mettre à jour la preuve photo du litige
    let match = competition.matchsElimination.id(matchId);
    if (!match) {
      for (const poule of competition.poules) {
        match = poule.matchs.id(matchId);
        if (match) break;
      }
    }
    if (match && match.litige && match.litigeDetails) {
      const photoUrl = `/uploads/disputes/photos/${req.file.filename}`;
      match.litigeDetails.preuveVideo = photoUrl;
      await competition.save();
    }

    const photoUrl = `/uploads/disputes/photos/${req.file.filename}`;
    res.json({
      success: true,
      photoUrl: photoUrl,
      message: 'Photo de preuve chargée avec succès'
    });
  } catch (error) {
    console.error('Erreur chargement photo:', error);
    res.status(500).json({ message: 'Erreur lors du chargement de la photo' });
  }
});

// POST /api/competitions/:id/matchs/:matchId/forfait - Déclarer forfait manuellement (admin)
router.post('/:id/matchs/:matchId/forfait', auth, async (req, res) => {
  try {
    const { id: competitionId, matchId } = req.params;
    const { equipeEnForfait } = req.body; // 'equipe1', 'equipe2' ou 'double'

    const competition = await Competition.findById(competitionId);
    if (!competition) return res.status(404).json({ message: 'Compétition non trouvée' });

    // Vérifier que l'utilisateur est admin du site ou créateur de la compétition
    const User = require('../models/User');
    const user = await User.findById(req.user.id);
    const estAdminSite = user && user.isAdmin;
    const estCreateurCompetition = competition.createurId && competition.createurId.toString() === req.user.id;

    if (!estAdminSite && !estCreateurCompetition) {
      return res.status(403).json({ message: 'Seuls les admins peuvent déclarer un forfait manuellement' });
    }

    // Trouver le match
    let match = competition.matchsElimination.id(matchId);
    if (!match) {
      for (const poule of competition.poules) {
        match = poule.matchs.id(matchId);
        if (match) break;
      }
    }
    if (!match) return res.status(404).json({ message: 'Match non trouvé' });
    if (match.statut === 'Terminé') return res.status(400).json({ message: 'Ce match est déjà terminé' });

    // Appliquer le forfait
    if (equipeEnForfait === 'double') {
      match.score1 = 0; match.score2 = 0;
    } else if (equipeEnForfait === 'equipe1') {
      match.score1 = 0; match.score2 = 3;
    } else if (equipeEnForfait === 'equipe2') {
      match.score1 = 3; match.score2 = 0;
    } else {
      return res.status(400).json({ message: 'equipeEnForfait doit être "equipe1", "equipe2" ou "double"' });
    }

    match.statut = 'Terminé';
    match.valideParEquipe1 = true;
    match.valideParEquipe2 = true;

    // Progression en élimination directe
    if (competition.type === 'elimination_directe' && match.phase) {
      await handleEliminationProgression(competition, match);
    }

    await updateTeamStats(competition, match);
    await competition.save();

    res.json({ success: true, message: `Forfait déclaré : ${equipeEnForfait === 'double' ? 'les deux équipes' : equipeEnForfait} forfait.` });
  } catch (error) {
    console.error('Erreur déclaration forfait:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// POST /api/competitions/:id/matchs/:matchId/resoudre-litige - Trancher, faire rejouer ou rejeter un litige par l'admin ou le créateur de la compétition
router.post('/:id/matchs/:matchId/resoudre-litige', auth, async (req, res) => {
  try {
    const { id: competitionId, matchId } = req.params;
    const { action, decisionAdmin, score1, score2 } = req.body;

    const competition = await Competition.findById(competitionId);
    if (!competition) return res.status(404).json({ message: 'Compétition non trouvée' });

    // Vérifier que l'utilisateur est admin du site ou créateur de la compétition
    const User = require('../models/User');
    const user = await User.findById(req.user.id);
    const estAdminSite = user && user.isAdmin;
    const estCreateurCompetition = competition.createurId && competition.createurId.toString() === req.user.id;

    if (!estAdminSite && !estCreateurCompetition) {
      return res.status(403).json({ message: 'Seuls les administrateurs ou le créateur de la compétition peuvent arbitrer les litiges' });
    }

    // Trouver le match
    let match = competition.matchsElimination.id(matchId);
    if (!match) {
      for (const poule of competition.poules) {
        match = poule.matchs.id(matchId);
        if (match) break;
      }
    }
    if (!match) return res.status(404).json({ message: 'Match non trouvé' });

    if (action === 'trancher') {
      match.score1 = parseInt(score1);
      match.score2 = parseInt(score2);
      match.statut = 'Terminé';
      match.litige = false;
      
      if (!match.litigeDetails) match.litigeDetails = {};
      match.litigeDetails.statut = 'Tranché';
      match.litigeDetails.decisionAdmin = decisionAdmin || 'Tranché par l\'administrateur';
      match.litigeDetails.dateResolution = new Date();
      match.litigeDetails.resoluPar = req.user.id;

      // Mettre à jour les stats d'équipe
      await updateTeamStats(competition, match);

      // Recalculer les stats de la compétition
      const stats = await calculateCompetitionStats(competition);
      competition.statistiques = stats;

      // Gérer la progression si élimination directe (hors Petite finale)
      if (competition.type === 'elimination_directe' && match.phase && match.phase !== 'Petite finale') {
        await handleEliminationProgression(competition, match);
      }
    } else if (action === 'rejouer') {
      match.score1 = null;
      match.score2 = null;
      match.statut = 'Programmé';
      match.litige = false;
      match.equipe1Prete = false;
      match.equipe2Prete = false;
      match.dateDebutPreparation = null;
      match.dateDebutMatch = null;
      match.propositionScore = {
        score1: null,
        score2: null,
        proposePar: null,
        dateSaisie: null
      };
      
      if (!match.litigeDetails) match.litigeDetails = {};
      match.litigeDetails.statut = 'Tranché';
      match.litigeDetails.decisionAdmin = decisionAdmin || 'Match réinitialisé pour être rejoué';
      match.litigeDetails.dateResolution = new Date();
      match.litigeDetails.resoluPar = req.user.id;
    } else if (action === 'rejeter') {
      match.litige = false;
      if (!match.litigeDetails) match.litigeDetails = {};
      match.litigeDetails.statut = 'Rejeté';
      match.litigeDetails.decisionAdmin = decisionAdmin || 'Litige rejeté par l\'administrateur';
      match.litigeDetails.dateResolution = new Date();
      match.litigeDetails.resoluPar = req.user.id;
    } else {
      return res.status(400).json({ message: 'Action non reconnue. Doit être trancher, rejouer ou rejeter.' });
    }

    // ⚖️ Envoyer le rapport d'arbitrage automatique dans le lobby de match
    let texteDecision = `⚖️ [ARBITRAGE DE L'ADMIN] :\n`;
    if (action === 'trancher') {
      texteDecision += `• Décision : Litige Tranché\n`;
      texteDecision += `• Score validé par l'arbitre : ${score1} - ${score2}\n`;
    } else if (action === 'rejouer') {
      texteDecision += `• Décision : Match réinitialisé pour être rejoué\n`;
    } else if (action === 'rejeter') {
      texteDecision += `• Décision : Litige rejeté par l'arbitre\n`;
    }
    texteDecision += `• Motif : "${decisionAdmin || 'Non spécifié'}"`;

    if (!match.messages) match.messages = [];
    match.messages.push({
      expediteur: req.user.id,
      pseudo: `Arbitrage [${user.pseudo || 'Admin'}]`,
      texte: texteDecision,
      dateEnvoi: new Date()
    });

    await competition.save();
    res.json({ success: true, message: 'Litige résolu avec succès !' });
  } catch (error) {
    console.error('Erreur résolution litige:', error);
    res.status(500).json({ message: 'Erreur lors de la résolution du litige' });
  }
});


// 🔹 6. FONCTIONS UTILITAIRES

// Fonction pour mettre à jour les statistiques des équipes
async function updateTeamStats(competition, match) {
  const equipe1 = competition.equipesInscrites.find(e => e.clubId.toString() === match.equipe1.toString());
  const equipe2 = competition.equipesInscrites.find(e => e.clubId.toString() === match.equipe2.toString());

  if (equipe1 && equipe2) {
    // Initialiser les statistiques si elles n'existent pas
    if (!equipe1.matchsJoues) equipe1.matchsJoues = 0;
    if (!equipe1.victoires) equipe1.victoires = 0;
    if (!equipe1.nuls) equipe1.nuls = 0;
    if (!equipe1.defaites) equipe1.defaites = 0;
    if (!equipe1.butsPour) equipe1.butsPour = 0;
    if (!equipe1.butsContre) equipe1.butsContre = 0;
    if (!equipe1.points) equipe1.points = 0;

    if (!equipe2.matchsJoues) equipe2.matchsJoues = 0;
    if (!equipe2.victoires) equipe2.victoires = 0;
    if (!equipe2.nuls) equipe2.nuls = 0;
    if (!equipe2.defaites) equipe2.defaites = 0;
    if (!equipe2.butsPour) equipe2.butsPour = 0;
    if (!equipe2.butsContre) equipe2.butsContre = 0;
    if (!equipe2.points) equipe2.points = 0;

    // Mettre à jour les statistiques
    equipe1.matchsJoues += 1;
    equipe2.matchsJoues += 1;
    equipe1.butsPour += match.score1;
    equipe1.butsContre += match.score2;
    equipe2.butsPour += match.score2;
    equipe2.butsContre += match.score1;

    // Déterminer le résultat
    if (match.score1 > match.score2) {
      equipe1.victoires += 1;
      equipe2.defaites += 1;
      equipe1.points += 3;
    } else if (match.score1 < match.score2) {
      equipe2.victoires += 1;
      equipe1.defaites += 1;
      equipe2.points += 3;
    } else {
      equipe1.nuls += 1;
      equipe2.nuls += 1;
      equipe1.points += 1;
      equipe2.points += 1;
    }

    // Calculer la différence de buts
    equipe1.differenceButs = equipe1.butsPour - equipe1.butsContre;
    equipe2.differenceButs = equipe2.butsPour - equipe2.butsContre;
  }
}

// Fonction pour planifier intelligemment les journées du championnat
function planifierJourneesChampionnat(matchs, nombreEquipes) {
  const matchsPlanifies = [];
  const matchsParJournee = Math.floor(nombreEquipes / 2);
  const nombreJourneesAller = nombreEquipes - 1;
  const nombreJourneesTotal = nombreJourneesAller * 2; // Aller + Retour
  
  // Séparer les matchs aller et retour
  const matchsAller = matchs.filter(m => m.type === 'aller');
  const matchsRetour = matchs.filter(m => m.type === 'retour');
  
  // Planifier les matchs aller
  for (let journee = 1; journee <= nombreJourneesAller; journee++) {
    const matchsJournee = [];
    const equipesUtilisees = new Set();
    
    // Prendre les matchs non encore planifiés
    for (const match of matchsAller) {
      if (matchsJournee.length >= matchsParJournee) break;
      
      // Vérifier qu'aucune des deux équipes n'a déjà joué cette journée
      if (!equipesUtilisees.has(match.equipe1.toString()) && 
          !equipesUtilisees.has(match.equipe2.toString())) {
        
        match.journee = journee;
        match.dateMatch = new Date(Date.now() + (journee - 1) * 7 * 24 * 60 * 60 * 1000); // 7 jours entre chaque journée
        matchsJournee.push(match);
        equipesUtilisees.add(match.equipe1.toString());
        equipesUtilisees.add(match.equipe2.toString());
      }
    }
    
    matchsPlanifies.push(...matchsJournee);
  }
  
  // Planifier les matchs retour (après les matchs aller)
  for (let journee = 1; journee <= nombreJourneesAller; journee++) {
    const matchsJournee = [];
    const equipesUtilisees = new Set();
    
    // Prendre les matchs retour non encore planifiés
    for (const match of matchsRetour) {
      if (matchsJournee.length >= matchsParJournee) break;
      
      // Vérifier qu'aucune des deux équipes n'a déjà joué cette journée
      if (!equipesUtilisees.has(match.equipe1.toString()) && 
          !equipesUtilisees.has(match.equipe2.toString())) {
        
        match.journee = nombreJourneesAller + journee;
        match.dateMatch = new Date(Date.now() + (nombreJourneesAller + journee - 1) * 7 * 24 * 60 * 60 * 1000);
        matchsJournee.push(match);
        equipesUtilisees.add(match.equipe1.toString());
        equipesUtilisees.add(match.equipe2.toString());
      }
    }
    
    matchsPlanifies.push(...matchsJournee);
  }
  
  // Nettoyer les propriétés temporaires
  matchsPlanifies.forEach(match => {
    delete match.type;
  });
  
  return matchsPlanifies;
}

// Fonction utilitaire pour générer le bracket d'élimination directe avec byes (tas binaire)
function generateEliminationBracket(competition, equipesConfirmees) {
  const N = equipesConfirmees.length;
  if (N < 2) return;

  // Déterminer la taille du heap (prochaine puissance de 2 >= N)
  const M = Math.pow(2, Math.ceil(Math.log2(N)));
  
  // Mélanger aléatoirement les équipes
  const equipesShuffled = [...equipesConfirmees].sort(() => Math.random() - 0.5);
  
  // Initialiser le tableau heap de taille 2M - 1
  const heap = new Array(2 * M - 1).fill(null);
  
  // Remplir les feuilles du heap
  for (let i = 0; i < M; i++) {
    heap[M - 1 + i] = (i < N) ? equipesShuffled[i].clubId : null;
  }
  
  // Vider les matchs d'élimination existants
  competition.matchsElimination = [];
  
  // Helper pour trouver le nom de la phase
  const getPhaseName = (index, M) => {
    if (index === 0) return 'Finale';
    if (index >= 1 && index <= 2) return 'Demi';
    if (index >= 3 && index <= 6) return 'Quart';
    if (index >= 7 && index <= 14) return 'Huitième';
    if (index >= 15 && index <= 30) return 'Seizième';
    if (index >= 31 && index <= 62) return 'Trente-deuxième';
    return 'Éliminatoire';
  };
  
  // Tableau pour suivre si un match a été créé à un index donné
  const matchCreatedAtIndex = new Array(M - 1).fill(false);
  
  // Parcourir de bas en haut (de M-2 à 0)
  for (let p = M - 2; p >= 0; p--) {
    const c1 = 2 * p + 1;
    const c2 = 2 * p + 2;
    
    const active1 = (heap[c1] !== null) || (c1 < M - 1 && matchCreatedAtIndex[c1]);
    const active2 = (heap[c2] !== null) || (c2 < M - 1 && matchCreatedAtIndex[c2]);
    
    if (active1 && active2) {
      // Les deux enfants sont actifs -> Créer un match à l'index p
      matchCreatedAtIndex[p] = true;
      
      const phase = getPhaseName(p, M);
      
      if (competition.modeMatch === 'aller_retour' && phase !== 'Finale' && phase !== 'Petite finale') {
        // Match Aller
        competition.matchsElimination.push({
          equipe1: heap[c1],
          equipe2: heap[c2],
          score1: null,
          score2: null,
          dateMatch: null,
          statut: 'Programmé',
          phase: phase,
          tour: p,
          type: 'aller',
          valideParEquipe1: false,
          valideParEquipe2: false,
          equipe1Prete: false,
          equipe2Prete: false,
          // Les matchs du 1er tour ont leurs équipes connues dès le départ => chrono Ready Check lance
          dateDebutPreparation: (heap[c1] !== null && heap[c2] !== null) ? new Date() : null,
          dateDebutMatch: null,
          propositionScore: { score1: null, score2: null, proposePar: null, dateSaisie: null },
          captureEcran: null,
          stats: { buteurs: [], passeurs: [], cartonsJaunes: [], cartonsRouges: [] },
          litige: false,
          arbitre: null
        });

        // Match Retour (l'équipe 2 reçoit à domicile)
        competition.matchsElimination.push({
          equipe1: heap[c2],
          equipe2: heap[c1],
          score1: null,
          score2: null,
          dateMatch: null,
          statut: 'Programmé',
          phase: phase,
          tour: p,
          type: 'retour',
          valideParEquipe1: false,
          valideParEquipe2: false,
          equipe1Prete: false,
          equipe2Prete: false,
          dateDebutPreparation: null,
          dateDebutMatch: null,
          propositionScore: { score1: null, score2: null, proposePar: null, dateSaisie: null },
          captureEcran: null,
          stats: { buteurs: [], passeurs: [], cartonsJaunes: [], cartonsRouges: [] },
          litige: false,
          arbitre: null
        });
      } else {
        // Aller simple ou Finale / Petite finale
        competition.matchsElimination.push({
          equipe1: heap[c1],
          equipe2: heap[c2],
          score1: null,
          score2: null,
          dateMatch: null,
          statut: 'Programmé',
          phase: phase,
          tour: p,
          type: 'simple',
          valideParEquipe1: false,
          valideParEquipe2: false,
          equipe1Prete: false,
          equipe2Prete: false,
          dateDebutPreparation: (heap[c1] !== null && heap[c2] !== null) ? new Date() : null,
          dateDebutMatch: null,
          propositionScore: { score1: null, score2: null, proposePar: null, dateSaisie: null },
          captureEcran: null,
          stats: {
            buteurs: [],
            passeurs: [],
            cartonsJaunes: [],
            cartonsRouges: []
          },
          litige: false,
          arbitre: null
        });
      }
      
      heap[p] = null; // Gagnant déterminé plus tard
    } else if (active1) {
      // Un seul enfant actif (gauche) -> le club obtient un bye
      heap[p] = heap[c1];
    } else if (active2) {
      // Un seul enfant actif (droit) -> le club obtient un bye
      heap[p] = heap[c2];
    } else {
      // Aucun enfant actif
      heap[p] = null;
    }
  }
  
  // Gérer la petite finale si le tournoi a au moins des demi-finales (M >= 4)
  if (M >= 4) {
    competition.matchsElimination.push({
      equipe1: null,
      equipe2: null,
      score1: null,
      score2: null,
      dateMatch: new Date(Date.now() + (M) * 24 * 60 * 60 * 1000),
      statut: 'Programmé',
      phase: 'Petite finale',
      tour: -2, // Index spécial pour la petite finale
      valideParEquipe1: false,
      valideParEquipe2: false,
      captureEcran: null,
      stats: {
        buteurs: [],
        passeurs: [],
        cartonsJaunes: [],
        cartonsRouges: []
      },
      litige: false,
      arbitre: null
    });
  }
}

// Fonction pour gérer la progression des équipes en élimination directe
async function handleEliminationProgression(competition, completedMatch) {
  try {
    console.log('🏆 Gestion progression élimination directe...');
    
    // Déterminer l'équipe gagnante
    let winner = completedMatch.score1 > completedMatch.score2 ? 
      completedMatch.equipe1 : completedMatch.equipe2;
    let loser = completedMatch.score1 > completedMatch.score2 ? 
      completedMatch.equipe2 : completedMatch.equipe1;
    
    console.log(`   Gagnant: ${winner}, Phase: ${completedMatch.phase}`);
    
    if (completedMatch.phase === 'Finale') {
      competition.gagnant = winner;
      competition.finaliste = loser;
      console.log('   🏆 Champion déterminé !');
      
      // Mettre à jour le statut des équipes
      const gagnantEquipe = competition.equipesInscrites.find(e => 
        e.clubId.toString() === winner.toString());
      const finalisteEquipe = competition.equipesInscrites.find(e => 
        e.clubId.toString() === loser.toString());
      
      if (gagnantEquipe) gagnantEquipe.statut = 'Gagnant';
      if (finalisteEquipe) finalisteEquipe.statut = 'Finaliste';
      
      // Marquer la compétition comme terminée
      competition.statut = 'Terminé';
      const { cleanCompetitionVideos } = require('../utils/videoCleanup');
      cleanCompetitionVideos(competition);
      return;
    }
    
    if (completedMatch.phase === 'Petite finale') {
      competition.troisieme = winner;
      console.log('   🥉 3ème place déterminée !');
      
      const troisiemeEquipe = competition.equipesInscrites.find(e => 
        e.clubId.toString() === winner.toString());
      if (troisiemeEquipe) troisiemeEquipe.statut = 'Troisième';
      return;
    }
    
    // Déterminer le parent de ce match
    // Le heap index du match actuel est stocké dans completedMatch.tour
    const currentHeapIndex = completedMatch.tour;
    const parentHeapIndex = Math.floor((currentHeapIndex - 1) / 2);
    
    let isConfrontationTerminee = true;
    winner = null;
    loser = null;

    if (competition.modeMatch === 'aller_retour' && completedMatch.phase !== 'Finale' && completedMatch.phase !== 'Petite finale') {
      // Trouver l'autre match de la confrontation (aller ou retour)
      const autreType = completedMatch.type === 'aller' ? 'retour' : 'aller';
      const autreMatch = competition.matchsElimination.find(m => 
        m.tour === completedMatch.tour && m.type === autreType
      );

      if (autreMatch && autreMatch.statut === 'Terminé') {
        // Les deux matchs sont terminés -> calculer les cumuls
        const clubA = completedMatch.equipe1;
        const clubB = completedMatch.equipe2;

        const scoreA_completed = completedMatch.score1;
        const scoreB_completed = completedMatch.score2;

        let scoreA_autre = 0;
        let scoreB_autre = 0;
        if (autreMatch.equipe1.toString() === clubA.toString()) {
          scoreA_autre = autreMatch.score1;
          scoreB_autre = autreMatch.score2;
        } else {
          scoreA_autre = autreMatch.score2;
          scoreB_autre = autreMatch.score1;
        }

        const totalScoreA = scoreA_completed + scoreA_autre;
        const totalScoreB = scoreB_completed + scoreB_autre;

        console.log(`   [Aller-Retour] Cumul des scores pour tour ${completedMatch.tour} :`);
        console.log(`   - Équipe A (${clubA}) : ${scoreA_completed} + ${scoreA_autre} = ${totalScoreA}`);
        console.log(`   - Équipe B (${clubB}) : ${scoreB_completed} + ${scoreB_autre} = ${totalScoreB}`);

        if (totalScoreA > totalScoreB) {
          winner = clubA;
          loser = clubB;
        } else if (totalScoreB > totalScoreA) {
          winner = clubB;
          loser = clubA;
        } else {
          // Égalité -> départager par le match retour
          const matchRetour = completedMatch.type === 'retour' ? completedMatch : autreMatch;
          if (matchRetour.score1 > matchRetour.score2) {
            winner = matchRetour.equipe1;
            loser = matchRetour.equipe2;
          } else {
            winner = matchRetour.equipe2;
            loser = matchRetour.equipe1;
          }
          console.log(`   - Égalité cumulée ! Le match retour départage : Vainqueur = ${winner}`);
        }
      } else {
        // L'autre match n'est pas encore terminé, on ne fait pas progresser les équipes
        isConfrontationTerminee = false;
        console.log(`   ⏳ Match ${completedMatch.type} terminé. En attente du match ${autreType} pour la progression.`);
        
        // Si c'est le match aller qui vient de se terminer, on débloque le match retour
        if (completedMatch.type === 'aller' && autreMatch) {
          autreMatch.dateDebutPreparation = new Date();
          autreMatch.equipe1Prete = false;
          autreMatch.equipe2Prete = false;
          const DELAI_LANCEMENT_MS = (competition.delaiLancementMatch || 10) * 60 * 1000;
          autreMatch.dateLimiteDebut = new Date(Date.now() + DELAI_LANCEMENT_MS);
          console.log(`   ⏰ Match retour débloqué automatiquement suite à la fin de l'aller. Limite: ${autreMatch.dateLimiteDebut}`);
        }
      }
    } else {
      // Aller simple ou Finale / Petite finale
      winner = completedMatch.score1 > completedMatch.score2 ? completedMatch.equipe1 : completedMatch.equipe2;
      loser = completedMatch.score1 > completedMatch.score2 ? completedMatch.equipe2 : completedMatch.equipe1;
    }

    if (!isConfrontationTerminee) {
      return; // On s'arrête là, le second match déclenchera la progression
    }

    console.log(`   → Progression vers le match parent d'index: ${parentHeapIndex}`);
    
    // Chercher les matchs de la phase suivante par leur index de heap (stocké dans tour)
    // Il peut y en avoir un ou deux selon que la phase suivante est aller-retour ou simple (finale)
    let nextMatches = competition.matchsElimination.filter(match => 
      match.tour === parentHeapIndex
    );
    
    if (nextMatches.length > 0) {
      const isLeftChild = (currentHeapIndex % 2 !== 0);
      
      nextMatches.forEach(nextMatch => {
        if (nextMatch.type === 'retour') {
          // Inverser equipe1 et equipe2 pour le match retour
          if (isLeftChild) {
            nextMatch.equipe2 = winner;
            console.log(`   ✅ ${winner} placé en equipe2 (Away) du match retour parent (index ${parentHeapIndex})`);
          } else {
            nextMatch.equipe1 = winner;
            console.log(`   ✅ ${winner} placé en equipe1 (Home) du match retour parent (index ${parentHeapIndex})`);
          }
        } else {
          // Match aller ou simple
          if (isLeftChild) {
            nextMatch.equipe1 = winner;
            console.log(`   ✅ ${winner} placé en equipe1 du match aller/simple parent (index ${parentHeapIndex})`);
          } else {
            nextMatch.equipe2 = winner;
            console.log(`   ✅ ${winner} placé en equipe2 du match aller/simple parent (index ${parentHeapIndex})`);
          }
        }

        // Si les deux équipes du match parent sont maintenant connues, lancer le ready check timer (sauf pour le retour)
        if (nextMatch.equipe1 && nextMatch.equipe2 && nextMatch.type !== 'retour') {
          nextMatch.dateDebutPreparation = new Date();
          nextMatch.equipe1Prete = false;
          nextMatch.equipe2Prete = false;
          // Calculer la dateLimiteDebut : maintenant + delai configurable (défaut 10 min)
          const DELAI_LANCEMENT_MS = (competition.delaiLancementMatch || 10) * 60 * 1000;
          nextMatch.dateLimiteDebut = new Date(Date.now() + DELAI_LANCEMENT_MS);
          console.log(`   ⏰ Salon de match parent prêt (type: ${nextMatch.type || 'simple'}). Chrono de préparation lancé. Limite: ${nextMatch.dateLimiteDebut}`);
        }
      });
    } else {
      console.log(`   ⚠️ Match parent (index ${parentHeapIndex}) introuvable !`);
    }
    
    // Marquer l'équipe perdante comme éliminée
    if (loser) {
      const loserEquipe = competition.equipesInscrites.find(e => 
        e.clubId.toString() === loser.toString());
      if (loserEquipe && loserEquipe.statut === 'Confirmé') {
        loserEquipe.statut = 'Eliminé';
        console.log(`   ❌ ${loser} éliminé`);
      }
    }
    
    // Gérer la petite finale (3ème place)
    if (completedMatch.phase === 'Demi') {
      let petiteFinales = competition.matchsElimination.filter(match => 
        match.tour === -2 // index spécial pour la petite finale
      );
      
      if (petiteFinales.length > 0 && loser) {
        const isLeftChild = (currentHeapIndex % 2 !== 0);
        petiteFinales.forEach(petiteFinale => {
          if (isLeftChild) {
            petiteFinale.equipe1 = loser;
            console.log(`   ✅ ${loser} placé en petite finale (equipe1)`);
          } else {
            petiteFinale.equipe2 = loser;
            console.log(`   ✅ ${loser} placé en petite finale (equipe2)`);
          }

          // Si les deux équipes de la petite finale sont maintenant connues, lancer le ready check timer !
          if (petiteFinale.equipe1 && petiteFinale.equipe2) {
            petiteFinale.dateDebutPreparation = new Date();
            petiteFinale.equipe1Prete = false;
            petiteFinale.equipe2Prete = false;
            const DELAI_LANCEMENT_MS = (competition.delaiLancementMatch || 10) * 60 * 1000;
            petiteFinale.dateLimiteDebut = new Date(Date.now() + DELAI_LANCEMENT_MS);
            console.log(`   ⏰ Salon de petite finale prêt. Chrono de préparation de 10 min lancé.`);
          }
        });
      }
    }
    
  } catch (error) {
    console.error('❌ Erreur progression élimination:', error);
  }
}

// Fonction pour calculer les statistiques individuelles de la compétition
async function calculateCompetitionStats(competition) {
  const stats = {
    meilleurButeur: null,
    meilleurPasseur: null,
    meilleurJoueur: null,
    totalMatchs: 0,
    totalButs: 0
  };

  // Collecter toutes les statistiques des matchs terminés
  const buteursStats = {};
  const passeursStats = {};
  let totalButs = 0;
  let totalMatchs = 0;

  // Parcourir tous les matchs terminés (matchs normaux et matchs d'élimination)
  const allMatches = [
    ...(competition.matchs || []),
    ...(competition.matchsElimination || [])
  ];
  
  allMatches.forEach(match => {
    if (match.statut === 'Terminé' && match.score1 !== null && match.score2 !== null) {
      totalMatchs++;
      totalButs += (match.score1 + match.score2);

      // Compter les buteurs (vérifier dans match.buteurs ET match.stats.buteurs)
      const buteurs = match.buteurs || match.stats?.buteurs || [];
      if (Array.isArray(buteurs)) {
        buteurs.forEach(buteur => {
          const joueur = buteur.joueur;
          const buts = buteur.buts || 1;
          
          if (!buteursStats[joueur]) {
            buteursStats[joueur] = {
              joueur: joueur,
              buts: 0,
              club: null // Sera déterminé plus tard
            };
          }
          buteursStats[joueur].buts += buts;
        });
      }

      // Compter les passeurs (vérifier dans match.passeurs ET match.stats.passeurs)
      const passeurs = match.passeurs || match.stats?.passeurs || [];
      if (Array.isArray(passeurs)) {
        passeurs.forEach(passeur => {
          const joueur = passeur.joueur;
          const passes = passeur.passes || 1;
          
          if (!passeursStats[joueur]) {
            passeursStats[joueur] = {
              joueur: joueur,
              passes: 0,
              club: null // Sera déterminé plus tard
            };
          }
          passeursStats[joueur].passes += passes;
        });
      }
    }
  });

  // Trouver le meilleur buteur
  let maxButs = 0;
  for (const [joueur, data] of Object.entries(buteursStats)) {
    if (data.buts > maxButs) {
      maxButs = data.buts;
      stats.meilleurButeur = {
        joueur: joueur,
        buts: data.buts,
        club: data.club
      };
    }
  }

  // Trouver le meilleur passeur
  let maxPasses = 0;
  for (const [joueur, data] of Object.entries(passeursStats)) {
    if (data.passes > maxPasses) {
      maxPasses = data.passes;
      stats.meilleurPasseur = {
        joueur: joueur,
        passes: data.passes,
        club: data.club
      };
    }
  }

  // Le meilleur joueur pourrait être celui avec le plus de buts + passes
  const joueursGlobaux = {};
  
  // Ajouter les buts
  for (const [joueur, data] of Object.entries(buteursStats)) {
    if (!joueursGlobaux[joueur]) joueursGlobaux[joueur] = { joueur, score: 0, club: null };
    joueursGlobaux[joueur].score += data.buts * 2; // Les buts valent 2 points
  }
  
  // Ajouter les passes
  for (const [joueur, data] of Object.entries(passeursStats)) {
    if (!joueursGlobaux[joueur]) joueursGlobaux[joueur] = { joueur, score: 0, club: null };
    joueursGlobaux[joueur].score += data.passes; // Les passes valent 1 point
  }

  // Trouver le meilleur joueur global
  let maxScore = 0;
  for (const [joueur, data] of Object.entries(joueursGlobaux)) {
    if (data.score > maxScore) {
      maxScore = data.score;
      stats.meilleurJoueur = {
        joueur: joueur,
        club: data.club
      };
    }
  }

  stats.totalMatchs = totalMatchs;
  stats.totalButs = totalButs;

  return stats;
}

// 🔹 7. STATISTIQUES ET CLASSEMENTS

// GET /api/competitions/:id/classement - Récupérer le classement
router.get('/:id/classement', async (req, res) => {
  try {
    const competition = await Competition.findById(req.params.id)
      .populate('equipesInscrites.clubId', 'nom logo');

    if (!competition) {
      return res.status(404).json({ message: 'Compétition non trouvée' });
    }

    // Trier par points, différence de buts, buts pour
    const classement = competition.equipesInscrites
      .filter(equipe => equipe.statut === 'Confirmé')
      .sort((a, b) => {
        if (b.points !== a.points) return b.points - a.points;
        if (b.differenceButs !== a.differenceButs) return b.differenceButs - a.differenceButs;
        return b.butsPour - a.butsPour;
      });

    res.json(classement);
  } catch (error) {
    console.error('Erreur récupération classement:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// GET /api/competitions/:id/statistiques - Récupérer les statistiques
router.get('/:id/statistiques', async (req, res) => {
  try {
    const competition = await Competition.findById(req.params.id);

    if (!competition) {
      return res.status(404).json({ message: 'Compétition non trouvée' });
    }

    // Si les statistiques n'existent pas ou sont vides, les calculer
    if (!competition.statistiques || Object.keys(competition.statistiques).length === 0) {
      console.log('🔄 Calcul des statistiques pour la compétition:', competition.nom);
      const stats = await calculateCompetitionStats(competition);
      competition.statistiques = stats;
      await competition.save();
    }

    res.json(competition.statistiques);
  } catch (error) {
    console.error('Erreur récupération statistiques:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// POST /api/competitions/:id/generer-elimination - Générer le bracket d'élimination directe
router.post('/:id/generer-elimination', async (req, res) => {
  try {
    const competition = await Competition.findById(req.params.id);

    if (!competition) {
      return res.status(404).json({ message: 'Compétition non trouvée' });
    }

    if (competition.type !== 'elimination_directe') {
      return res.status(400).json({ message: 'Cette fonction est uniquement pour les compétitions à élimination directe' });
    }

    const equipes = competition.equipesInscrites;
    if (equipes.length < 2) {
      return res.status(400).json({ message: 'Au moins 2 équipes sont nécessaires' });
    }

    console.log(`🏆 Génération bracket élimination pour ${equipes.length} équipes`);

    // Utiliser la fonction utilitaire
    generateEliminationBracket(competition, equipes);

    // Marquer les équipes comme confirmées
    equipes.forEach(equipe => {
      if (equipe.statut === 'Inscrit') {
        equipe.statut = 'Confirmé';
      }
    });

    await competition.save();

    res.json({ 
      message: `Bracket d'élimination généré avec succès`,
      matchsElimination: competition.matchsElimination
    });
  } catch (error) {
    console.error('Erreur génération bracket:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// POST /api/competitions/:id/recalculer-statistiques - Recalculer toutes les statistiques
router.post('/:id/recalculer-statistiques', async (req, res) => {
  try {
    const competition = await Competition.findById(req.params.id);

    if (!competition) {
      return res.status(404).json({ message: 'Compétition non trouvée' });
    }

    console.log('🔄 Recalcul forcé des statistiques pour:', competition.nom);
    
    // Recalculer les statistiques individuelles
    const stats = await calculateCompetitionStats(competition);
    competition.statistiques = stats;
    await competition.save();

    res.json({ 
      message: 'Statistiques recalculées avec succès',
      statistiques: stats
    });
  } catch (error) {
    console.error('Erreur recalcul statistiques:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Exposer les fonctions utilitaires pour d'autres routeurs (ex: admin.js)
router.updateTeamStats = updateTeamStats;
router.calculateCompetitionStats = calculateCompetitionStats;
router.handleEliminationProgression = handleEliminationProgression;

module.exports = router; 