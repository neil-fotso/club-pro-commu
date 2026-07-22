import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { playerAPI, clubAPI, invitationAPI } from '../services/api';

// Styles améliorés pour la page de profil
const profileStyles = `
  .profile-container {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    min-height: 100vh;
    padding: 2rem 0;
  }
  
  .profile-content {
    background: rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(10px);
    border-radius: 20px;
    padding: 2rem;
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
    animation: fadeInUp 0.8s ease-out;
  }
  
  @keyframes fadeInUp {
    0% {
      opacity: 0;
      transform: translateY(30px);
    }
    100% {
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  .profile-header {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    border-radius: 15px;
    padding: 2rem;
    margin-bottom: 2rem;
    position: relative;
    overflow: hidden;
  }
  
  .profile-header::before {
    content: '';
    position: absolute;
    top: -50%;
    left: -50%;
    width: 200%;
    height: 200%;
    background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%);
    animation: shimmer 3s infinite;
  }
  
  @keyframes shimmer {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
  
  .profile-info {
    position: relative;
    z-index: 1;
  }
  
  .profile-avatar {
    border: 4px solid rgba(255, 255, 255, 0.3);
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
    transition: all 0.3s ease;
  }
  
  .profile-avatar:hover {
    transform: scale(1.05);
    box-shadow: 0 15px 40px rgba(0, 0, 0, 0.3);
  }
  
  .profile-badge {
    font-size: 0.8rem;
    padding: 0.5rem 1rem;
    border-radius: 25px;
    font-weight: 600;
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    transition: all 0.3s ease;
  }
  
  .profile-badge:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  }
  
  .profile-card {
    border-radius: 15px;
    border: none;
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
    transition: all 0.3s ease;
    overflow: hidden;
  }
  
  .profile-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 15px 35px rgba(0, 0, 0, 0.15);
  }
  
  .profile-card .card-header {
    background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
    border-bottom: 2px solid rgba(102, 126, 234, 0.1);
    padding: 1.5rem;
  }
  
  .profile-card .card-body {
    padding: 1.5rem;
  }
  
  .stats-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
    gap: 1rem;
    margin-bottom: 1.5rem;
  }
  
  .stat-item {
    text-align: center;
    padding: 1rem;
    background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
    border-radius: 12px;
    transition: all 0.3s ease;
    border: 1px solid rgba(0,0,0,0.05);
  }
  
  .stat-item:hover {
    background: linear-gradient(135deg, #e8f2ff 0%, #d1e7ff 100%);
    transform: scale(1.05);
    box-shadow: 0 8px 20px rgba(102, 126, 234, 0.2);
  }
  
  .stat-value {
    font-size: 1.5rem;
    font-weight: 700;
    margin-bottom: 0.5rem;
  }
  
  .stat-label {
    font-size: 0.9rem;
    color: #6c757d;
    font-weight: 500;
  }
  
  .action-btn {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border: none;
    color: white;
    padding: 0.75rem 1.5rem;
    border-radius: 25px;
    font-weight: 600;
    transition: all 0.3s ease;
    box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
  }
  
  .action-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(102, 126, 234, 0.4);
    color: white;
  }
  
  .loading-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 400px;
  }
  
  .loading-spinner {
    width: 50px;
    height: 50px;
    border: 4px solid #f3f3f3;
    border-top: 4px solid #667eea;
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
  
  .error-container {
    text-align: center;
    padding: 3rem;
  }
  
  .error-container i {
    color: #dc3545;
    margin-bottom: 1rem;
  }
`;

const PlayerProfilePage = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [player, setPlayer] = useState(null);
  const [userClubs, setUserClubs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [inviting, setInviting] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [selectedClub, setSelectedClub] = useState(null);
  const [inviteMessage, setInviteMessage] = useState('');

  const fetchPlayer = useCallback(async () => {
    try {
      setLoading(true);
      const data = await playerAPI.getPlayer(id);
      setPlayer(data);
      setError(null);
    } catch (err) {
      setError('Erreur lors du chargement du profil');
      console.error('Erreur chargement joueur:', err);
    } finally {
      setLoading(false);
    }
  }, [id]);

  const fetchUserClubs = useCallback(async () => {
    if (!user) return;
    
    try {
      const clubs = await clubAPI.getMyClubs();
      setUserClubs(clubs);
    } catch (err) {
      console.error('Erreur chargement clubs utilisateur:', err);
    }
  }, [user]);

  useEffect(() => {
    fetchPlayer();
    fetchUserClubs();
  }, [fetchPlayer, fetchUserClubs]);

  const handleInvite = () => {
    if (userClubs.length === 1) {
      setSelectedClub(userClubs[0]);
      setShowInviteModal(true);
    } else {
      setShowInviteModal(true);
    }
  };

  const handleSendInvitation = async () => {
    if (!selectedClub) return;
    
    try {
      setInviting(true);
      await invitationAPI.sendInvitation(selectedClub._id, player._id, inviteMessage);
      alert('Invitation envoyée avec succès !');
      setShowInviteModal(false);
      setInviteMessage('');
      setSelectedClub(null);
    } catch (err) {
      alert(err.message || 'Erreur lors de l\'envoi de l\'invitation');
    } finally {
      setInviting(false);
    }
  };

  const getDisponibiliteColor = (disponibilite) => {
    const colors = {
      'Disponible': 'success',
      'Indisponible': 'danger'
    };
    return colors[disponibilite] || 'secondary';
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="profile-container">
        <style>{profileStyles}</style>
        <div className="container">
          <div className="profile-content">
            <div className="loading-container">
              <div className="loading-spinner"></div>
              <p className="mt-3">Chargement du profil...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !player) {
    return (
      <div className="profile-container">
        <style>{profileStyles}</style>
        <div className="container">
          <div className="profile-content">
            <div className="error-container">
              <i className="fas fa-exclamation-triangle fa-3x"></i>
              <h3>Erreur</h3>
              <p>{error || 'Profil non trouvé'}</p>
              <Link to="/joueurs" className="btn btn-primary">
                <i className="fas fa-arrow-left me-2"></i>
                Retour à la recherche
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const isUserAdminOfClub = userClubs.some(club => club.role === 'Admin');
  const isOwnProfile = user && player.userId === user.id;

  return true ? (
    <div className="container mt-4 text-center">
      <div className="card shadow-lg border-0 p-5 mt-5">
        <h2 className="mb-4 text-primary">
          <i className="fas fa-user-circle me-2"></i>
          Profil de {player?.pseudo || 'Joueur'}
        </h2>
        <div className="alert alert-info py-4 mt-4">
          <i className="fas fa-tools fa-3x mb-3 text-info"></i>
          <h4>Page en cours de construction</h4>
          <p className="mb-0">Les informations détaillées du profil seront bientôt disponibles.</p>
        </div>
      </div>
    </div>
  ) : (
    <div className="profile-container">
      <style>{profileStyles}</style>
      <div className="container">
        <div className="profile-content">
          {/* Header du profil */}
          <div className="profile-header">
            <div className="profile-info">
              <div className="row align-items-center">
                <div className="col-md-8">
                  <div className="d-flex align-items-center">
                    <div>
                      <h1 className="mb-3 text-white">{player.pseudo}</h1>
                      <div className="d-flex gap-2 mb-3 flex-wrap">
                        {/* <span className={`badge bg-${getDisponibiliteColor(player.disponibilite)} profile-badge`}>
                          {player.disponibilite}
                        </span> */}
                        <span className="badge bg-primary profile-badge">
                          {player.position}
                        </span>
                        <span className="badge bg-secondary profile-badge">
                          {player.plateforme}
                        </span>
                      </div>
                      <div className="text-white-75">
                        <i className="fas fa-map-marker-alt me-2"></i>
                        {player.pays}
                        {player.ville && `, ${player.ville}`}
                        {player.age && ` • ${player.age} ans`}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="col-md-4 text-end">
                  {!isOwnProfile && isUserAdminOfClub && (
                    <button
                      className="btn action-btn btn-lg"
                      onClick={handleInvite}
                    >
                      <i className="fas fa-user-plus me-2"></i>
                      Inviter dans mon club
                    </button>
                  )}
                  {isOwnProfile && (
                    <Link to="/mon-profil/edit" className="btn action-btn btn-lg">
                      <i className="fas fa-edit me-2"></i>
                      Modifier mon profil
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="row">
            {/* Informations principales */}
            <div className="col-lg-8">
              {/* Bio */}
              {/* player.bio && (
                <div className="card profile-card mb-4">
                  <div className="card-header">
                    <h5 className="mb-0">
                      <i className="fas fa-user me-2"></i>
                      À propos
                    </h5>
                  </div>
                  <div className="card-body">
                    <p className="mb-0">{player.bio}</p>
                  </div>
                </div>
              ) */}

              {/* Informations détaillées */}
              <div className="card profile-card mb-4">
                <div className="card-header">
                  <h5 className="mb-0">
                    <i className="fas fa-info-circle me-2"></i>
                    Informations
                  </h5>
                </div>
                <div className="card-body">
                  <div className="row">
                    <div className="col-md-6">
                      {/* 
                      <div className="mb-3">
                        <strong>Position principale:</strong>
                        <div className="text-muted">{player.postePrincipal || 'Non renseigné'}</div>
                      </div>
                      
                      {player.postesSecondaires && player.postesSecondaires.length > 0 && (
                        <div className="mb-3">
                          <strong>Postes secondaires:</strong>
                          <div className="mt-2">
                            {player.postesSecondaires.map((poste, index) => (
                              <span key={index} className="badge bg-light text-dark me-1">
                                {poste}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                      */}
                      
                      <div className="mb-3">
                        <strong>Recherche un club:</strong>
                        <div className="text-muted">
                          {player.rechercheClub ? 'Oui' : 'Non'}
                        </div>
                      </div>
                    </div>
                    
                    <div className="col-md-6">
                      {player.langues && player.langues.length > 0 && (
                        <div className="mb-3">
                          <strong>Langues:</strong>
                          <div className="mt-2">
                            {player.langues.map((langue, index) => (
                              <span key={index} className="badge bg-info me-1">
                                {langue}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      <div className="mb-3">
                        <strong>Membre depuis:</strong>
                        <div className="text-muted">
                          {formatDate(player.createdAt)}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Statistiques */}
              {false && player.statistiques && (
                <div className="card profile-card mb-4">
                  <div className="card-header">
                    <h5 className="mb-0">
                      <i className="fas fa-chart-bar me-2"></i>
                      Statistiques
                    </h5>
                  </div>
                  <div className="card-body">
                    <div className="stats-grid">
                      <div className="stat-item">
                        <div className="stat-value text-primary">{player.statistiques.matchsJoues}</div>
                        <div className="stat-label">Matchs joués</div>
                      </div>
                      <div className="stat-item">
                        <div className="stat-value text-success">{player.winRate || 0}%</div>
                        <div className="stat-label">Win Rate</div>
                      </div>
                      <div className="stat-item">
                        <div className="stat-value text-info">{player.statistiques.butsMarques}</div>
                        <div className="stat-label">Buts marqués</div>
                      </div>
                      <div className="stat-item">
                        <div className="stat-value text-warning">{player.statistiques.passesDecisives}</div>
                        <div className="stat-label">Passes décisives</div>
                      </div>
                    </div>
                    
                    <div className="row mt-4">
                      <div className="col-md-4">
                        <div className="d-flex justify-content-between">
                          <span>Victoires:</span>
                          <strong>{player.statistiques.victoires}</strong>
                        </div>
                      </div>
                      <div className="col-md-4">
                        <div className="d-flex justify-content-between">
                          <span>Défaites:</span>
                          <strong>{player.statistiques.defaites}</strong>
                        </div>
                      </div>
                      <div className="col-md-4">
                        <div className="d-flex justify-content-between">
                          <span>Nuls:</span>
                          <strong>{player.statistiques.nuls}</strong>
                        </div>
                      </div>
                    </div>

                    <div className="row mt-3">
                      <div className="col-md-4">
                        <div className="d-flex justify-content-between">
                          <span>Buts/Match:</span>
                          <strong>{player.goalsPerMatch || 0}</strong>
                        </div>
                      </div>
                      <div className="col-md-4">
                        <div className="d-flex justify-content-between">
                          <span>Passes/Match:</span>
                          <strong>{player.assistsPerMatch || 0}</strong>
                        </div>
                      </div>
                      <div className="col-md-4">
                        <div className="d-flex justify-content-between">
                          <span>Clean Sheets:</span>
                          <strong>{player.statistiques.cleanSheets}</strong>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Jeux */}
              {player.jeux && player.jeux.length > 0 && (
                <div className="card profile-card mb-4">
                  <div className="card-header">
                    <h5 className="mb-0">
                      <i className="fas fa-gamepad me-2"></i>
                      Jeux
                    </h5>
                  </div>
                  <div className="card-body">
                    <div className="row">
                      {player.jeux.map((jeu, index) => (
                        <div key={index} className="col-md-6 mb-3">
                          <div className="d-flex justify-content-between align-items-center">
                            <div>
                              <strong>{jeu.nom}</strong>
                              {jeu.favori && (
                                <i className="fas fa-star text-warning ms-2"></i>
                              )}
                            </div>
                            <span className="text-muted">{jeu.heures} heures</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
              {/* Section Palmarès & Trophées */}
              {false && (
              <div className="card profile-card mb-4 shadow-sm border-0">
                <div className="card-header text-white" style={{background: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)'}}>
                  <h5 className="mb-0">
                    <i className="fas fa-award me-2"></i>
                    Palmarès & Trophées
                  </h5>
                </div>
                <div className="card-body">
                  {(!player.palmares || ((!player.palmares.clubs || player.palmares.clubs.length === 0) && (!player.palmares.individuel || player.palmares.individuel.length === 0))) ? (
                    <div className="text-center py-4 text-muted">
                      <i className="fas fa-medal fa-3x mb-3 text-secondary opacity-50"></i>
                      <p className="mb-0">Aucun trophée ou distinction individuelle enregistré pour le moment. 🌟</p>
                    </div>
                  ) : (
                    <div>
                      {/* Trophées de clubs */}
                      {player.palmares.clubs && player.palmares.clubs.length > 0 && (
                        <div className="mb-4">
                          <h6 className="text-primary mb-3 fw-bold"><i className="fas fa-shield-alt me-2 text-warning"></i>Trophées Collectifs (Clubs)</h6>
                          <div className="row g-2">
                            {player.palmares.clubs.map((trophy, idx) => (
                              <div key={idx} className="col-md-6 col-12">
                                <div className="d-flex align-items-center p-3 border rounded bg-light">
                                  <span className="fs-2 me-3">
                                    {trophy.typeTrophée === 'vainqueur' ? '🏆' : trophy.typeTrophée === 'finaliste' ? '🥈' : '🥉'}
                                  </span>
                                  <div>
                                    <h6 className="mb-0 fw-bold small text-dark">{trophy.nom}</h6>
                                    <small className="text-muted d-block text-truncate" style={{maxWidth: '200px'}}>
                                      Avec <strong>{trophy.clubNom}</strong>
                                    </small>
                                    <span className="badge bg-secondary text-capitalize mt-1" style={{fontSize: '0.75rem'}}>
                                      {trophy.typeTrophée}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Récompenses Individuelles */}
                      {player.palmares.individuel && player.palmares.individuel.length > 0 && (
                        <div>
                          <h6 className="text-primary mb-3 fw-bold"><i className="fas fa-star me-2 text-warning"></i>Distinctions Individuelles</h6>
                          <div className="row g-2">
                            {player.palmares.individuel.map((award, idx) => (
                              <div key={idx} className="col-12">
                                <div className="d-flex align-items-center p-3 border border-warning border-opacity-25 rounded bg-warning bg-opacity-10">
                                  <span className="fs-2 me-3">
                                    {award.nom.includes('Soulier') ? '⚽' : award.nom.includes('Passeur') ? '🅰️' : '🌟'}
                                  </span>
                                  <div>
                                    <h6 className="mb-1 fw-bold text-dark">{award.nom}</h6>
                                    <p className="mb-0 text-muted small">{award.description}</p>
                                    <small className="text-muted small mt-1 d-block">
                                      Obtenu le {award.date ? new Date(award.date).toLocaleDateString('fr-FR') : ''}
                                    </small>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="col-lg-4">
              {/* Clubs du joueur */}
              {userClubs.length > 0 && (
                <div className="card profile-card mb-4">
                  <div className="card-header">
                    <h5 className="mb-0">
                      <i className="fas fa-users me-2"></i>
                      Clubs
                    </h5>
                  </div>
                  <div className="card-body">
                    {userClubs.map((club) => (
                      <div key={club._id} className="mb-3">
                        <div className="d-flex justify-content-between align-items-center">
                          <Link to={`/club/${club._id}`} className="text-decoration-none">
                            <strong>{club.nom}</strong>
                          </Link>
                          <span className={`badge bg-${club.role === 'Admin' ? 'danger' : 'secondary'}`}>
                            {club.role}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Invitation */}
              {!isOwnProfile && isUserAdminOfClub && (
                <div className="card profile-card">
                  <div className="card-header">
                    <h5 className="mb-0">
                      <i className="fas fa-user-plus me-2"></i>
                      Invitation
                    </h5>
                  </div>
                  <div className="card-body">
                    <p className="text-muted mb-3">
                      Invitez ce joueur à rejoindre votre club
                    </p>
                    <button
                      className="btn btn-primary w-100"
                      onClick={handleInvite}
                      disabled={inviting}
                    >
                      {inviting ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                          Envoi en cours...
                        </>
                      ) : (
                        <>
                          <i className="fas fa-user-plus me-2"></i>
                          Inviter
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modal d'invitation */}
      {showInviteModal && (
        <div className="modal fade show" style={{display: 'block'}}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Inviter {player.pseudo}</h5>
                <button 
                  type="button" 
                  className="btn-close" 
                  onClick={() => setShowInviteModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                <div className="mb-3">
                  <label className="form-label">Sélectionner un club</label>
                  <select 
                    className="form-select"
                    value={selectedClub?._id || ''}
                    onChange={(e) => {
                      const club = userClubs.find(c => c._id === e.target.value);
                      setSelectedClub(club || null);
                    }}
                  >
                    <option value="">Choisir un club...</option>
                    {userClubs.map(club => (
                      <option key={club._id} value={club._id}>
                        {club.nom}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="mb-3">
                  <label className="form-label">Message (optionnel)</label>
                  <textarea 
                    className="form-control"
                    rows="3"
                    value={inviteMessage}
                    onChange={(e) => setInviteMessage(e.target.value)}
                    placeholder="Message personnalisé..."
                  ></textarea>
                </div>
              </div>
              <div className="modal-footer">
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  onClick={() => setShowInviteModal(false)}
                >
                  Annuler
                </button>
                <button 
                  type="button" 
                  className="btn btn-primary"
                  onClick={handleSendInvitation}
                  disabled={inviting || !selectedClub}
                >
                  {inviting ? 'Envoi...' : 'Envoyer l\'invitation'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PlayerProfilePage; 