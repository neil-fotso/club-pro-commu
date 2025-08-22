const mongoose = require('mongoose');

const playerSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  pseudo: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 3,
    maxlength: 20
  },
  photoProfil: {
    type: String,
    default: ''
  },
  age: {
    type: Number,
    min: 13,
    max: 100
  },
  pays: {
    type: String,
    default: ''
  },
  nationalite: {
    type: String,
    default: ''
  },
  ville: {
    type: String,
    default: ''
  },
  plateforme: {
    type: String,
    enum: ['PC', 'PS5', 'Xbox'],
    required: true
  },
  pseudoPlateforme: {
    type: String,
    default: '',
    trim: true
  },
  position: {
    type: String,
    enum: ['Attaquant', 'Milieu', 'Défenseur', 'Gardien', 'Polyvalent'],
    required: true
  },
  postePrincipal: {
    type: String,
    enum: ['BU', 'AG', 'AD', 'MOC', 'MG', 'MD', 'MC', 'MDC', 'DD', 'DG', 'DC', 'DLD', 'DLG', 'GB']
  },
  postesSecondaires: [{
    type: String,
    enum: ['BU', 'AG', 'AD', 'MOC', 'MG', 'MD', 'MC', 'MDC', 'DD', 'DG', 'DC', 'DLD', 'DLG', 'GB']
  }],
  langues: [{
    type: String,
    enum: [
      'Français', 'Anglais', 'Espagnol', 'Allemand', 'Italien', 'Portugais', 'Néerlandais',
      'Suédois', 'Norvégien', 'Danois', 'Finnois', 'Polonais', 'Tchèque', 'Slovaque',
      'Hongrois', 'Roumain', 'Bulgare', 'Grec', 'Turc', 'Russe', 'Ukrainien',
      'Biélorusse', 'Serbe', 'Croate', 'Bosniaque', 'Monténégrin', 'Macédonien',
      'Albanais', 'Estonien', 'Letton', 'Lituanien', 'Arabe', 'Hébreu', 'Persan',
      'Hindi', 'Bengali', 'Ourdou', 'Chinois', 'Japonais', 'Coréen', 'Thaï',
      'Vietnamien', 'Indonésien', 'Malais', 'Tagalog', 'Swahili', 'Zoulou',
      'Afrikaans', 'Autre'
    ]
  }],

  experience: {
    type: Number,
    default: 0,
    min: 0
  },
  // Nouvelles améliorations
  bio: {
    type: String,
    maxlength: 500,
    default: ''
  },
  description: {
    type: String,
    maxlength: 1000,
    default: ''
  },
  rechercheClub: {
    type: Boolean,
    default: true
  },
  disponibilite: {
    type: String,
    enum: ['Disponible', 'Indisponible'],
    default: 'Disponible'
  },
  horaires: {
    lundi: { type: String, default: '' },
    mardi: { type: String, default: '' },
    mercredi: { type: String, default: '' },
    jeudi: { type: String, default: '' },
    vendredi: { type: String, default: '' },
    samedi: { type: String, default: '' },
    dimanche: { type: String, default: '' }
  },
  jeux: [{
    nom: { type: String, required: true },
    niveau: { type: String, enum: ['Débutant', 'Intermédiaire', 'Avancé', 'Expert'], default: 'Intermédiaire' },
    tempsJeu: { type: Number, default: 0 }, // en heures
    favori: { type: Boolean, default: false }
  }],
  statistiques: {
    matchsJoues: { type: Number, default: 0 },
    victoires: { type: Number, default: 0 },
    defaites: { type: Number, default: 0 },
    nuls: { type: Number, default: 0 },
    butsMarques: { type: Number, default: 0 },
    butsEncaisses: { type: Number, default: 0 },
    passesDecisives: { type: Number, default: 0 },
    cleanSheets: { type: Number, default: 0 }
  },
  recompenses: [{
    nom: { type: String, required: true },
    description: { type: String },
    date: { type: Date, default: Date.now },
    type: { type: String, enum: ['Trophée', 'Médaille', 'Certificat', 'Autre'] }
  }],
  reseauxSociaux: {
    discord: { type: String, default: '' },
    twitter: { type: String, default: '' },
    twitch: { type: String, default: '' },
    youtube: { type: String, default: '' },
    instagram: { type: String, default: '' }
  },
  preferences: {
    langue: { type: String, default: 'Français' },
    fuseauHoraire: { type: String, default: 'Europe/Paris' },
    notifications: {
      email: { type: Boolean, default: true },
      push: { type: Boolean, default: true },
      discord: { type: Boolean, default: true }
    },
    visibilite: {
      profil: { type: String, enum: ['Public', 'Amis', 'Privé'], default: 'Public' },
      statistiques: { type: String, enum: ['Public', 'Amis', 'Privé'], default: 'Public' },
      disponibilite: { type: String, enum: ['Public', 'Amis', 'Privé'], default: 'Public' }
    }
  },
  derniereActivite: {
    type: Date,
    default: Date.now
  },
  statutVerification: {
    type: String,
    enum: ['Non vérifié', 'Vérifié', 'Premium'],
    default: 'Non vérifié'
  },
  
  // NOUVEAU : Liste des clubs du joueur
  clubs: [{
    clubId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Club',
      required: true
    },
    role: {
      type: String,
      enum: ['Admin', 'Capitaine', 'Joueur'],
      default: 'Joueur'
    },
    dateAdhesion: {
      type: Date,
      default: Date.now
    },
    statut: {
      type: String,
      enum: ['Actif', 'Inactif', 'Suspendu'],
      default: 'Actif'
    }
  }],
  
  // NOUVEAU : Nombre maximum de clubs autorisés
  maxClubs: {
    type: Number,
    default: 3, // Un joueur peut être dans 3 clubs maximum
    min: 1,
    max: 10
  }
}, {
  timestamps: true
});

// Index pour améliorer les performances de recherche
playerSchema.index({ pseudo: 1 });
playerSchema.index({ pays: 1, plateforme: 1, position: 1 });
playerSchema.index({ disponibilite: 1 });
playerSchema.index({ 'statistiques.matchsJoues': -1 });
playerSchema.index({ derniereActivite: -1 });

// Méthodes virtuelles
playerSchema.virtual('winRate').get(function() {
  if (this.statistiques.matchsJoues === 0) return 0;
  return Math.round((this.statistiques.victoires / this.statistiques.matchsJoues) * 100);
});

playerSchema.virtual('goalsPerMatch').get(function() {
  if (this.statistiques.matchsJoues === 0) return 0;
  return (this.statistiques.butsMarques / this.statistiques.matchsJoues).toFixed(2);
});

playerSchema.virtual('assistsPerMatch').get(function() {
  if (this.statistiques.matchsJoues === 0) return 0;
  return (this.statistiques.passesDecisives / this.statistiques.matchsJoues).toFixed(2);
});

// Méthodes d'instance
playerSchema.methods.updateActivity = function() {
  this.derniereActivite = new Date();
  return this.save();
};

playerSchema.methods.addStatistic = function(type, value = 1) {
  if (this.statistiques[type] !== undefined) {
    this.statistiques[type] += value;
  }
  return this.save();
};

playerSchema.methods.addReward = function(reward) {
  this.recompenses.push(reward);
  return this.save();
};

// Méthode pour calculer automatiquement la disponibilité
playerSchema.methods.calculateDisponibilite = async function() {
  // Compter les clubs actifs du joueur
  const activeClubs = this.clubs.filter(club => club.statut === 'Actif');
  
  // Logique de disponibilité pour multi-clubs
  if (this.rechercheClub) {
    // Si le joueur cherche un club et n'a pas atteint son maximum
    if (activeClubs.length < this.maxClubs) {
      this.disponibilite = 'Disponible';
    } else {
      this.disponibilite = 'Indisponible'; // A atteint son maximum de clubs
    }
  } else {
    this.disponibilite = 'Indisponible'; // Ne cherche pas de nouveau club
  }
  
  return this.save();
};

// NOUVELLE MÉTHODE : Ajouter un club au joueur
playerSchema.methods.joinClub = function(clubId, role = 'Joueur') {
  // Vérifier si déjà membre de ce club
  const alreadyMember = this.clubs.some(club => 
    club.clubId.toString() === clubId.toString() && club.statut === 'Actif'
  );
  
  if (alreadyMember) {
    throw new Error('Déjà membre de ce club');
  }
  
  // Vérifier le nombre maximum de clubs
  const activeClubs = this.clubs.filter(club => club.statut === 'Actif');
  if (activeClubs.length >= this.maxClubs) {
    throw new Error(`Nombre maximum de clubs atteint (${this.maxClubs})`);
  }
  
  // Ajouter le club
  this.clubs.push({
    clubId: clubId,
    role: role,
    dateAdhesion: new Date(),
    statut: 'Actif'
  });
  
  return this.save();
};

// NOUVELLE MÉTHODE : Quitter un club
playerSchema.methods.leaveClub = function(clubId) {
  const clubIndex = this.clubs.findIndex(club => 
    club.clubId.toString() === clubId.toString() && club.statut === 'Actif'
  );
  
  if (clubIndex === -1) {
    throw new Error('Pas membre de ce club');
  }
  
  // Marquer comme inactif plutôt que supprimer (historique)
  this.clubs[clubIndex].statut = 'Inactif';
  
  return this.save();
};

// NOUVELLE MÉTHODE : Obtenir les clubs actifs
playerSchema.methods.getActiveClubs = function() {
  return this.clubs.filter(club => club.statut === 'Actif');
};

module.exports = mongoose.model('Player', playerSchema); 