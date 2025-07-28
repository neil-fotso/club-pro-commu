import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { invitationAPI } from '../services/api';

const InvitationsPage = () => {
  const { user } = useAuth();
  const [invitationsRecues, setInvitationsRecues] = useState([]);
  const [invitationsEnvoyees, setInvitationsEnvoyees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('recues');

  const fetchInvitations = useCallback(async () => {
    if (!user || !user.token) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const [recues, envoyees] = await Promise.all([
        invitationAPI.getReceivedInvitations(user.token),
        invitationAPI.getSentInvitations(user.token)
      ]);
      setInvitationsRecues(recues);
      setInvitationsEnvoyees(envoyees);
    } catch (error) {
      console.error('Erreur lors de la récupération des invitations:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchInvitations();
  }, [fetchInvitations]);

  const handleAcceptInvitation = async (invitationId) => {
    if (!user || !user.token) return;
    
    try {
      await invitationAPI.acceptInvitation(invitationId, user.token);
      alert('Invitation acceptée avec succès !');
      fetchInvitations();
    } catch (error) {
      alert('Erreur lors de l\'acceptation de l\'invitation: ' + error.message);
    }
  };

  const handleRefuseInvitation = async (invitationId) => {
    if (!user || !user.token) return;
    
    try {
      await invitationAPI.refuseInvitation(invitationId, user.token);
      alert('Invitation refusée.');
      fetchInvitations();
    } catch (error) {
      alert('Erreur lors du refus de l\'invitation: ' + error.message);
    }
  };

  const getStatusBadge = (statut) => {
    const badges = {
      'En attente': 'badge bg-warning',
      'Acceptée': 'badge bg-success',
      'Refusée': 'badge bg-danger'
    };
    return badges[statut] || 'badge bg-secondary';
  };

  if (!user) {
    return (
      <div className="container mt-4">
        <div className="text-center">
          <i className="fas fa-user-lock fa-3x text-muted mb-3"></i>
          <h5 className="text-muted">Connexion requise</h5>
          <p className="text-muted">Vous devez être connecté pour voir vos invitations.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="container mt-4">
        <div className="text-center">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Chargement...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mt-4">
      <div className="row">
        <div className="col-12">
          <div className="card">
            <div className="card-header text-white" style={{background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'}}>
              <h4 className="mb-0">
                <i className="fas fa-envelope me-2"></i>
                Mes Invitations
              </h4>
            </div>
            <div className="card-body">
              {/* Onglets */}
              <ul className="nav nav-tabs mb-3" id="invitationsTab" role="tablist">
                <li className="nav-item" role="presentation">
                  <button
                    className={`nav-link ${activeTab === 'recues' ? 'active' : ''}`}
                    onClick={() => setActiveTab('recues')}
                  >
                    <i className="fas fa-inbox me-1"></i>
                    Reçues ({invitationsRecues.length})
                  </button>
                </li>
                <li className="nav-item" role="presentation">
                  <button
                    className={`nav-link ${activeTab === 'envoyees' ? 'active' : ''}`}
                    onClick={() => setActiveTab('envoyees')}
                  >
                    <i className="fas fa-paper-plane me-1"></i>
                    Envoyées ({invitationsEnvoyees.length})
                  </button>
                </li>
              </ul>

              {/* Contenu des onglets */}
              <div className="tab-content" id="invitationsTabContent">
                {/* Invitations reçues */}
                <div className={`tab-pane fade ${activeTab === 'recues' ? 'show active' : ''}`}>
                  {invitationsRecues.length === 0 ? (
                    <div className="text-center py-4">
                      <i className="fas fa-inbox fa-3x text-muted mb-3"></i>
                      <h5 className="text-muted">Aucune invitation reçue</h5>
                      <p className="text-muted">Vous n'avez pas encore reçu d'invitations à rejoindre des clubs.</p>
                    </div>
                  ) : (
                    <div className="row">
                      {invitationsRecues.map((invitation) => (
                        <div key={invitation._id} className="col-md-6 mb-3">
                          <div className="card h-100">
                            <div className="card-body">
                              <div className="d-flex justify-content-between align-items-start mb-2">
                                <h6 className="card-title mb-0">
                                  <i className="fas fa-shield-alt me-1"></i>
                                  {invitation.clubId?.nom}
                                </h6>
                                <span className={getStatusBadge(invitation.statut)}>
                                  {invitation.statut}
                                </span>
                              </div>
                              
                              <p className="card-text text-muted small">
                                <i className="fas fa-user me-1"></i>
                                Invité par: {invitation.inviteurId?.pseudo}
                              </p>
                              
                              {invitation.message && (
                                <p className="card-text small">
                                  <i className="fas fa-comment me-1"></i>
                                  "{invitation.message}"
                                </p>
                              )}
                              
                              <div className="d-flex justify-content-between align-items-center">
                                <small className="text-muted">
                                  <i className="fas fa-calendar me-1"></i>
                                  {new Date(invitation.dateInvitation).toLocaleDateString()}
                                </small>
                                
                                {invitation.statut === 'En attente' && (
                                  <div className="btn-group btn-group-sm">
                                    <button
                                      className="btn btn-success btn-sm"
                                      onClick={() => handleAcceptInvitation(invitation._id)}
                                    >
                                      <i className="fas fa-check me-1"></i>
                                      Accepter
                                    </button>
                                    <button
                                      className="btn btn-danger btn-sm"
                                      onClick={() => handleRefuseInvitation(invitation._id)}
                                    >
                                      <i className="fas fa-times me-1"></i>
                                      Refuser
                                    </button>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Invitations envoyées */}
                <div className={`tab-pane fade ${activeTab === 'envoyees' ? 'show active' : ''}`}>
                  {invitationsEnvoyees.length === 0 ? (
                    <div className="text-center py-4">
                      <i className="fas fa-paper-plane fa-3x text-muted mb-3"></i>
                      <h5 className="text-muted">Aucune invitation envoyée</h5>
                      <p className="text-muted">Vous n'avez pas encore envoyé d'invitations.</p>
                    </div>
                  ) : (
                    <div className="row">
                      {invitationsEnvoyees.map((invitation) => (
                        <div key={invitation._id} className="col-md-6 mb-3">
                          <div className="card h-100">
                            <div className="card-body">
                              <div className="d-flex justify-content-between align-items-start mb-2">
                                <h6 className="card-title mb-0">
                                  <i className="fas fa-user me-1"></i>
                                  {invitation.inviteId?.pseudo}
                                </h6>
                                <span className={getStatusBadge(invitation.statut)}>
                                  {invitation.statut}
                                </span>
                              </div>
                              
                              <p className="card-text text-muted small">
                                <i className="fas fa-shield-alt me-1"></i>
                                Club: {invitation.clubId?.nom}
                              </p>
                              
                              {invitation.message && (
                                <p className="card-text small">
                                  <i className="fas fa-comment me-1"></i>
                                  "{invitation.message}"
                                </p>
                              )}
                              
                              <div className="d-flex justify-content-between align-items-center">
                                <small className="text-muted">
                                  <i className="fas fa-calendar me-1"></i>
                                  {new Date(invitation.dateInvitation).toLocaleDateString()}
                                </small>
                                
                                {invitation.statut !== 'En attente' && (
                                  <small className="text-muted">
                                    <i className="fas fa-clock me-1"></i>
                                    Répondu le {new Date(invitation.dateReponse).toLocaleDateString()}
                                  </small>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvitationsPage; 