const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  pseudo: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 3,
    maxlength: 20
  },
  dateCreation: {
    type: Date,
    default: Date.now
  },
  derniereConnexion: {
    type: Date,
    default: Date.now
  },
  isAdmin: {
    type: Boolean,
    default: false
  },
  // Champs RGPD
  markedForDeletion: {
    type: Boolean,
    default: false
  },
  deletionRequestDate: {
    type: Date
  },
  processingOpposed: {
    type: Boolean,
    default: false
  },
  oppositionDate: {
    type: Date
  },
  processingLimited: {
    type: Boolean,
    default: false
  },
  limitationDate: {
    type: Date
  },
  consentMarketing: {
    type: Boolean,
    default: false
  },
  consentAnalytics: {
    type: Boolean,
    default: false
  },
  consentDate: {
    type: Date
  },

  // 🔹 Modération chat
  avertissements: [{
    date: { type: Date, default: Date.now },
    raison: { type: String, maxlength: 500 },
    competitionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Competition' },
    matchId: { type: mongoose.Schema.Types.ObjectId }
  }],
  chatBanni: {
    type: Boolean,
    default: false
  },
  chatBanniJusquAu: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

// Index pour les requêtes RGPD
userSchema.index({ markedForDeletion: 1, deletionRequestDate: 1 });
userSchema.index({ processingOpposed: 1 });
userSchema.index({ processingLimited: 1 });

// Méthode pour hasher le mot de passe
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Méthode pour comparer les mots de passe
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Méthode pour exercer le droit d'effacement
userSchema.methods.markForDeletion = function() {
  this.markedForDeletion = true;
  this.deletionRequestDate = new Date();
  return this.save();
};

// Méthode pour exercer le droit d'opposition
userSchema.methods.opposeProcessing = function() {
  this.processingOpposed = true;
  this.oppositionDate = new Date();
  return this.save();
};

// Méthode pour exercer le droit de limitation
userSchema.methods.limitProcessing = function() {
  this.processingLimited = true;
  this.limitationDate = new Date();
  return this.save();
};

// Méthode pour révoquer les limitations
userSchema.methods.revokeLimitations = function() {
  this.processingOpposed = false;
  this.processingLimited = false;
  this.oppositionDate = null;
  this.limitationDate = null;
  return this.save();
};

module.exports = mongoose.model('User', userSchema); 