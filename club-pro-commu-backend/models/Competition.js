const mongoose = require('mongoose');

const competitionSchema = new mongoose.Schema({
  // 🔹 1. Informations de base
  nom: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  logo: {
    type: String, // URL du logo
    default: null
  },
  description: {
    type: String,
    maxlength: 2000
  },
  reglement: {
    type: String,
    maxlength: 5000
  },
  lienDiscord: {
    type: String,
    default: null
  },

  // 🔹 Type et format
  type: {
    type: String,
    required: true,
    enum: ['elimination_directe', 'poule_elimination', 'championnat'],
    default: 'elimination_directe'
  },
  modeMatch: {
    type: String,
    enum: ['simple', 'aller_retour'],
    default: 'simple'
  },

  // 🔹 Configuration des équipes
  nombreEquipes: {
    type: Number,
    required: true,
    min: 2,
    max: 128,
    default: 8
  },
  nombreEquipesParPoule: {
    type: Number,
    min: 2,
    max: 8,
    default: 4
  },

  // 🔹 Plateforme
  plateforme: {
    type: String,
    enum: ['PS5', 'PS4', 'Xbox', 'PC', 'Cross-Platform'],
    default: 'PS5'
  },

  // 🔹 Calendrier
  dateDebut: {
    type: Date,
    required: true
  },
  dateFin: {
    type: Date
  },
  zoneHoraire: {
    type: String,
    default: 'Europe/Paris'
  },

  // 🔹 Statut et visibilité
  statut: {
    type: String,
    enum: ['Brouillon', 'Ouvert', 'Fermé', 'En cours', 'Terminé', 'Archivé'],
    default: 'Brouillon'
  },
  visibilite: {
    type: String,
    enum: ['publique', 'privée'],
    default: 'publique'
  },

  // 🔹 Inscriptions
  inscriptionsOuvertes: {
    type: Boolean,
    default: true
  },
  modeInscription: {
    type: String,
    enum: ['libre', 'sur_invitation', 'validation_requise'],
    default: 'libre'
  },
  limiteInscriptions: {
    type: Number,
    min: 2,
    max: 128
  },

  // 🔹 Récompenses
  recompenses: {
    champion: { type: String, default: '🏆 Champion' },
    finaliste: { type: String, default: '🥈 Finaliste' },
    troisieme: { type: String, default: '🥉 3ème place' },
    meilleurJoueur: { type: String, default: '🎖️ Meilleur joueur' },
    meilleurButeur: { type: String, default: '🎯 Meilleur buteur' }
  },

  // 🔹 Créateur
  createurId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  // 🔹 Équipes inscrites
  equipesInscrites: [{
    clubId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Club',
      required: true
    },
    dateInscription: {
      type: Date,
      default: Date.now
    },
    statut: {
      type: String,
      enum: ['Inscrit', 'Confirmé', 'Eliminé', 'Gagnant', 'Finaliste', 'Troisième'],
      default: 'Inscrit'
    },
    poule: {
      type: String,
      default: null
    },
    points: {
      type: Number,
      default: 0
    },
    butsPour: {
      type: Number,
      default: 0
    },
    butsContre: {
      type: Number,
      default: 0
    },
    differenceButs: {
      type: Number,
      default: 0
    },
    matchsJoues: {
      type: Number,
      default: 0
    },
    victoires: {
      type: Number,
      default: 0
    },
    nuls: {
      type: Number,
      default: 0
    },
    defaites: {
      type: Number,
      default: 0
    }
  }],

  // 🔹 Demandes d'inscription
  demandesInscription: [{
    clubId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Club',
      required: true
    },
    message: {
      type: String,
      maxlength: 500,
      default: ''
    },
    dateDemande: {
      type: Date,
      default: Date.now
    },
    statut: {
      type: String,
      enum: ['En attente', 'Acceptée', 'Refusée'],
      default: 'En attente'
    },
    reponse: {
      type: String,
      maxlength: 500,
      default: ''
    }
  }],

  // 🔹 Poules (pour les tournois avec phases de poules)
  poules: [{
    nom: {
      type: String,
      required: true
    },
    equipes: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Club'
    }],
    matchs: [{
      equipe1: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Club'
      },
      equipe2: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Club'
      },
      score1: {
        type: Number,
        default: null
      },
      score2: {
        type: Number,
        default: null
      },
      dateMatch: {
        type: Date
      },
      statut: {
        type: String,
        enum: ['Programmé', 'En cours', 'Terminé', 'Annulé'],
        default: 'Programmé'
      },
      valideParEquipe1: {
        type: Boolean,
        default: false
      },
      valideParEquipe2: {
        type: Boolean,
        default: false
      },
      captureEcran: {
        type: String, // URL de la capture
        default: null
      },
      stats: {
        buteurs: [{
          joueur: String,
          buts: Number
        }],
        passeurs: [{
          joueur: String,
          passes: Number
        }],
        cartonsJaunes: [String],
        cartonsRouges: [String]
      },
      litige: {
        type: Boolean,
        default: false
      },
      arbitre: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
      }
    }]
  }],

  // 🔹 Matchs d'élimination directe
  matchsElimination: [{
    equipe1: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Club'
    },
    equipe2: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Club'
    },
    score1: {
      type: Number,
      default: null
    },
    score2: {
      type: Number,
      default: null
    },
    dateMatch: {
      type: Date
    },
    statut: {
      type: String,
      enum: ['Programmé', 'En cours', 'Terminé', 'Annulé'],
      default: 'Programmé'
    },
    phase: {
      type: String,
      enum: ['Huitième', 'Quart', 'Demi', 'Finale', 'Petite finale'],
      default: 'Huitième'
    },
    tour: {
      type: Number,
      default: 1
    },
    valideParEquipe1: {
      type: Boolean,
      default: false
    },
    valideParEquipe2: {
      type: Boolean,
      default: false
    },
    captureEcran: {
      type: String,
      default: null
    },
    stats: {
      buteurs: [{
        joueur: String,
        buts: Number
      }],
      passeurs: [{
        joueur: String,
        passes: Number
      }],
      cartonsJaunes: [String],
      cartonsRouges: [String]
    },
    litige: {
      type: Boolean,
      default: false
    },
    arbitre: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    }
  }],

  // 🔹 Résultats finaux
  gagnant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Club'
  },
  finaliste: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Club'
  },
  troisieme: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Club'
  },

  // 🔹 Statistiques
  statistiques: {
    meilleurButeur: {
      joueur: String,
      club: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Club'
      },
      buts: Number
    },
    meilleurPasseur: {
      joueur: String,
      club: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Club'
      },
      passes: Number
    },
    meilleurJoueur: {
      joueur: String,
      club: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Club'
      }
    },
    totalMatchs: {
      type: Number,
      default: 0
    },
    totalButs: {
      type: Number,
      default: 0
    }
  },

  // 🔹 Notifications et rappels
  notifications: {
    rappelMatch: {
      type: Boolean,
      default: true
    },
    delaiRappel: {
      type: Number, // en heures
      default: 24
    }
  },

  // 🔹 Métadonnées
  dateCreation: {
    type: Date,
    default: Date.now
  },
  dateModification: {
    type: Date,
    default: Date.now
  },
  archive: {
    type: Boolean,
    default: false
  }
});

// Index pour améliorer les performances
competitionSchema.index({ statut: 1, dateDebut: 1 });
competitionSchema.index({ createurId: 1 });
competitionSchema.index({ plateforme: 1 });
competitionSchema.index({ archive: 1 });

// Middleware pour mettre à jour dateModification
competitionSchema.pre('save', function(next) {
  this.dateModification = new Date();
  next();
});

module.exports = mongoose.model('Competition', competitionSchema); 