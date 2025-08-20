const mongoose = require('mongoose');

const clubSchema = new mongoose.Schema({
  nom: {
    type: String,
    required: true,
    unique: true
  },
  createurId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  plateformes: [{
    type: String,
    required: true,
    enum: ['PS5', 'Xbox', 'PC']
  }],
  pays: {
    type: String,
    required: true
  },
  description: {
    type: String,
    maxlength: 1000
  },
  recrute: {
    type: Boolean,
    default: true
  },

  postesRecherches: [{
    type: String,
    enum: ['Attaquant', 'Milieu', 'Défenseur', 'Gardien']
  }],
  effectifMax: {
    type: Number,
    default: 11
  },
  effectifActuel: {
    type: Number,
    default: 0
  },
  membres: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    role: {
      type: String,
      enum: ['Admin', 'Capitaine', 'Joueur'],
      default: 'Joueur'
    },
    dateAdhesion: {
      type: Date,
      default: Date.now
    }
  }],
  demandesAdhesion: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    message: {
      type: String,
      maxlength: 500
    },
    dateDemande: {
      type: Date,
      default: Date.now
    },
    statut: {
      type: String,
      enum: ['En attente', 'Acceptée', 'Refusée'],
      default: 'En attente'
    }
  }],
  langues: [{
    type: String
  }],
  horaires: {
    type: String
  },
  dateCreation: {
    type: Date,
    default: Date.now
  }
});

// Méthode pour calculer si le club recrute automatiquement
clubSchema.methods.calculateRecrute = function() {
  // Si le club a explicitement désactivé le recrutement
  if (this.recrute === false) {
    return false;
  }
  
  // Si le club a atteint son effectif maximum
  if (this.membres && this.membres.length >= this.effectifMax) {
    return false;
  }
  
  // Sinon, le club recrute
  return true;
};

// Middleware pour mettre à jour recrute avant la sauvegarde
clubSchema.pre('save', function(next) {
  // Calculer automatiquement si le club recrute
  this.recrute = this.calculateRecrute();
  next();
});

module.exports = mongoose.model('Club', clubSchema); 