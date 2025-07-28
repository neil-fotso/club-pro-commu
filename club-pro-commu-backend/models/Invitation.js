const mongoose = require('mongoose');

const invitationSchema = new mongoose.Schema({
  clubId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Club',
    required: true
  },
  inviteurId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  inviteId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Player',
    required: true
  },
  statut: {
    type: String,
    enum: ['En attente', 'Acceptée', 'Refusée'],
    default: 'En attente'
  },
  message: {
    type: String,
    maxlength: 500
  },
  dateInvitation: {
    type: Date,
    default: Date.now
  },
  dateReponse: {
    type: Date
  }
});

// Index pour optimiser les requêtes
invitationSchema.index({ inviteId: 1, statut: 1 });
invitationSchema.index({ clubId: 1, statut: 1 });

module.exports = mongoose.model('Invitation', invitationSchema); 