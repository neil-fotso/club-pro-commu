const express = require('express');
const Competition = require('../models/Competition');
const Club = require('../models/Club');
const Notification = require('../models/Notification');
const auth = require('../middleware/auth');
const discordSimple = require('../services/discordSimple');

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

// GET /api/competitions/:id - Récupérer une compétition spécifique
router.get('/:id', async (req, res) => {
  try {
    const competition = await Competition.findById(req.params.id)
      .populate('createurId', 'pseudo _id')
      .populate('equipesInscrites.clubId', 'nom logo description')
      .populate('equipesInscrites.clubId.membres.userId', 'pseudo')
      .populate('demandesInscription.clubId', 'nom logo')
      .populate('poules.equipes', 'nom logo')
      .populate('poules.matchs.equipe1', 'nom logo')
      .populate('poules.matchs.equipe2', 'nom logo')
      .populate('poules.matchs.arbitre', 'pseudo')
      .populate('matchsElimination.equipe1', 'nom logo')
      .populate('matchsElimination.equipe2', 'nom logo')
      .populate('matchsElimination.arbitre', 'pseudo')
      .populate('poules.matchs.equipe1.membres.userId', 'pseudo')
      .populate('poules.matchs.equipe2.membres.userId', 'pseudo')
      .populate('matchsElimination.equipe1.membres.userId', 'pseudo')
      .populate('matchsElimination.equipe2.membres.userId', 'pseudo')
      .populate('gagnant', 'nom logo')
      .populate('finaliste', 'nom logo')
      .populate('troisieme', 'nom logo')
      .populate('statistiques.meilleurButeur.club', 'nom logo')
      .populate('statistiques.meilleurPasseur.club', 'nom logo')
      .populate('statistiques.meilleurJoueur.club', 'nom logo');

    if (!competition) {
      return res.status(404).json({ message: 'Compétition non trouvée' });
    }



    res.json(competition);
  } catch (error) {
    console.error('Erreur récupération compétition:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// POST /api/competitions - Créer une nouvelle compétition
router.post('/', auth, async (req, res) => {
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
      notifications
    } = req.body;

    // Validation des données
    if (!nom || !type || !dateDebut || !nombreEquipes) {
      return res.status(400).json({ 
        message: 'Nom, type, date de début et nombre d\'équipes sont requis' 
      });
    }

    // Vérifier si une compétition avec le même nom existe déjà
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
      statut: 'Brouillon'
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

    // Vérifier que l'utilisateur est le créateur
    if (competition.createurId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Non autorisé' });
    }

    // Empêcher la suppression si la compétition a des équipes inscrites
    if (competition.equipesInscrites.length > 0) {
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

    // Vérifier que la compétition n'est pas pleine
    if (competition.equipesInscrites.length >= competition.limiteInscriptions) {
      return res.status(400).json({ message: 'La compétition a atteint sa limite d\'équipes' });
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
        statut: 'Inscrit'
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

    // Vérifier que la compétition n'est pas pleine si on accepte
    if (action === 'accepter' && competition.equipesInscrites.length >= competition.limiteInscriptions) {
      return res.status(400).json({ message: 'La compétition a atteint sa limite d\'équipes' });
    }

    // Traiter la demande
    demande.statut = action === 'accepter' ? 'Acceptée' : 'Refusée';
    demande.reponse = reponse;

    if (action === 'accepter') {
      // Ajouter l'équipe à la compétition
      competition.equipesInscrites.push({
        clubId: demande.clubId,
        statut: 'Inscrit'
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
    const equipesConfirmees = competition.equipesInscrites.filter(e => e.statut === 'Inscrit');
    if (equipesConfirmees.length < 2) {
      return res.status(400).json({ message: 'Il faut au moins 2 équipes pour lancer la compétition' });
    }

    // Générer les matchs selon le type
    if (competition.type === 'championnat') {
      // Générer tous les matchs aller-retour
      for (let i = 0; i < equipesConfirmees.length; i++) {
        for (let j = i + 1; j < equipesConfirmees.length; j++) {
          // Match aller
          competition.poules[0].matchs.push({
            equipe1: equipesConfirmees[i].clubId,
            equipe2: equipesConfirmees[j].clubId,
            statut: 'Programmé'
          });
          // Match retour
          competition.poules[0].matchs.push({
            equipe1: equipesConfirmees[j].clubId,
            equipe2: equipesConfirmees[i].clubId,
            statut: 'Programmé'
          });
        }
      }
    } else if (competition.type === 'elimination_directe') {
      // Générer les matchs d'élimination directe
      for (let i = 0; i < equipesConfirmees.length; i += 2) {
        if (i + 1 < equipesConfirmees.length) {
          competition.matchsElimination.push({
            equipe1: equipesConfirmees[i].clubId,
            equipe2: equipesConfirmees[i + 1].clubId,
            phase: 'Huitième',
            tour: 1,
            statut: 'Programmé'
          });
        }
      }
    } else if (competition.type === 'poule_elimination') {
      // Générer les poules puis les matchs d'élimination
      const equipesParPoule = Math.ceil(equipesConfirmees.length / competition.nombreEquipesParPoule);
      
      for (let i = 0; i < competition.nombreEquipesParPoule; i++) {
        const poule = {
          nom: `Poule ${String.fromCharCode(65 + i)}`,
          equipes: equipesConfirmees.slice(i * equipesParPoule, (i + 1) * equipesParPoule).map(e => e.clubId),
          matchs: []
        };
        
        // Générer les matchs de la poule
        for (let j = 0; j < poule.equipes.length; j++) {
          for (let k = j + 1; k < poule.equipes.length; k++) {
            poule.matchs.push({
              equipe1: poule.equipes[j],
              equipe2: poule.equipes[k],
              statut: 'Programmé'
            });
          }
        }
        
        competition.poules.push(poule);
      }
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

    // Vérifier que l'utilisateur est admin du site ou admin d'un des clubs du match
    const isAdmin = req.user.isAdmin;
    
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
    
    if (!isAdmin && !estAdminEquipe1 && !estAdminEquipe2) {
      return res.status(403).json({ message: 'Seuls les admins des équipes concernées peuvent programmer ce match' });
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

    // Vérifier que l'utilisateur est admin d'une des équipes
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
    
    if (!estAdminEquipe1 && !estAdminEquipe2) {
      return res.status(403).json({ message: 'Seuls les admins des équipes peuvent modifier les scores' });
    }

    // Mettre à jour le score
    match.score1 = score1;
    match.score2 = score2;
    match.statut = 'Terminé';
    match.stats = stats || {};
    if (captureEcran) match.captureEcran = captureEcran;

    // Marquer comme validé par l'équipe correspondante
    if (estAdminEquipe1) {
      match.valideParEquipe1 = true;
    }
    if (estAdminEquipe2) {
      match.valideParEquipe2 = true;
    }

    // Si les deux équipes ont validé, mettre à jour les statistiques
    if (match.valideParEquipe1 && match.valideParEquipe2) {
      // Mettre à jour les statistiques des équipes
      await updateTeamStats(competition, match);
    }

    await competition.save();

    res.json({ message: 'Score mis à jour avec succès' });
  } catch (error) {
    console.error('Erreur mise à jour score:', error);
    res.status(500).json({ message: 'Erreur lors de la mise à jour' });
  }
});

// 🔹 6. FONCTIONS UTILITAIRES

// Fonction pour mettre à jour les statistiques des équipes
async function updateTeamStats(competition, match) {
  const equipe1 = competition.equipesInscrites.find(e => e.clubId.toString() === match.equipe1.toString());
  const equipe2 = competition.equipesInscrites.find(e => e.clubId.toString() === match.equipe2.toString());

  if (equipe1 && equipe2) {
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
      .filter(equipe => equipe.statut === 'Inscrit')
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

    res.json(competition.statistiques);
  } catch (error) {
    console.error('Erreur récupération statistiques:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

module.exports = router; 