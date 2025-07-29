const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['invitation_club', 'invitation_acceptee', 'invitation_refusee', 'promotion_admin', 'exclusion_club', 'demande_adhesion'],
    required: true
  },
  titre: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  donnees: {
    clubId: mongoose.Schema.Types.ObjectId,
    inviteurId: mongoose.Schema.Types.ObjectId,
    invitationId: mongoose.Schema.Types.ObjectId,
    demandeId: mongoose.Schema.Types.ObjectId,
    demandeurId: mongoose.Schema.Types.ObjectId
  },
  lue: {
    type: Boolean,
    default: false
  },
  dateCreation: {
    type: Date,
    default: Date.now
  }
});

// Index pour optimiser les requêtes
notificationSchema.index({ userId: 1, lue: 1 });
notificationSchema.index({ userId: 1, dateCreation: -1 });

module.exports = mongoose.model('Notification', notificationSchema); 