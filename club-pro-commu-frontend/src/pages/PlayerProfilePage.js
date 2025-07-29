import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { playerAPI, clubAPI, invitationAPI } from '../services/api';
import Avatar from '../components/Avatar';

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
    border-bottom: 2px solid #667eea;
    padding: 1.5rem;
  }
  
  .stats-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    gap: 1rem;
    margin: 1rem 0;
  }
  
  .stat-item {
    background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
    border-radius: 12px;
    padding: 1.5rem;
    text-align: center;
    transition: all 0.3s ease;
    border: 1px solid rgba(0,0,0,0.05);
  }
  
  .stat-item:hover {
    transform: scale(1.05);
    box-shadow: 0 8px 20px rgba(102, 126, 234, 0.2);
  }
  
  .stat-value {
    font-size: 2rem;
    font-weight: 700;
    margin-bottom: 0.5rem;
  }
  
  .stat-label {
    color: #6c757d;
    font-size: 0.9rem;
    font-weight: 500;
  }
  
  .action-btn {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border: none;
    color: white;
    border-radius: 30px;
    padding: 0.75rem 2rem;
    font-weight: 600;
    transition: all 0.3s ease;
    box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
  }
  
  .action-btn:hover {
    transform: translateY(-3px);
    box-shadow: 0 8px 25px rgba(102, 126, 234, 0.4);
  }
  
  .loading-container {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 400px;
  }
  
  .loading-spinner {
    width: 60px;
    height: 60px;
    border: 4px solid #f3f3f3;
    border-top: 4px solid #667eea;
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
  
  @media (max-width: 768px) {
    .profile-content {
      padding: 1rem;
      margin: 1rem;
    }
    
    .profile-header {
      padding: 1.5rem;
    }
  }
`;

const PlayerProfilePage = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [player, setPlayer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userClubs, setUserClubs] = useState([]);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [selectedClub, setSelectedClub] = useState('');
  const [inviteMessage, setInviteMessage] = useState('');
  const [inviting, setInviting] = useState(false);

  useEffect(() => {
    const fetchPlayer = async () => {
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
    };

    fetchPlayer();
    if (user) {
      fetchUserClubs();
    }
  }, [id, user]);

  const fetchUserClubs = async () => {
    try {
      const clubs = await clubAPI.getMyClubs();
      setUserClubs(clubs);
    } catch (err) {
      console.error('Erreur chargement clubs:', err);
    }
  };

  const handleInvite = () => {
    if (!user) {
      alert('Vous devez être connecté pour inviter un joueur');
      return;
    }
    setShowInviteModal(true);
  };

  const handleSendInvitation = async () => {
    if (!selectedClub) {
      alert('Veuillez sélectionner un club');
      return;
    }

    try {
      setInviting(true);
      await invitationAPI.invitePlayer(selectedClub, id, inviteMessage);
      alert('Invitation envoyée avec succès !');
      setShowInviteModal(false);
      setSelectedClub('');
      setInviteMessage('');
    } catch (error) {
      console.error('Erreur envoi invitation:', error);
      alert('Erreur lors de l\'envoi de l\'invitation: ' + error.message);
    } finally {
      setInviting(false);
    }
  };

  const getDisponibiliteColor = (disponibilite) => {
    const colors = {
      'Disponible': 'success',
      'Occupé': 'warning',
      'Absent': 'danger',
      'Recherche équipe': 'info'
    };
    return colors[disponibilite] || 'secondary';
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
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
            <div className="alert alert-danger" role="alert">
              <i className="fas fa-exclamation-triangle me-2"></i>
              {error || 'Joueur non trouvé'}
            </div>
          </div>
        </div>
      </div>
    );
  }

  const isOwnProfile = user && player.userId === user.id;

  return (
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
                    <Avatar 
                      src={player.photoProfil} 
                      alt={player.pseudo}
                      size="xl"
                      className="me-4 profile-avatar"
                    />
                    <div>
                      <h1 className="mb-3 text-white">{player.pseudo}</h1>
                      <div className="d-flex gap-2 mb-3 flex-wrap">
                        <span className={`badge bg-${getDisponibiliteColor(player.disponibilite)} profile-badge`}>
                          {player.disponibilite}
                        </span>
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
                  {!isOwnProfile && (
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
              {player.bio && (
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
              )}

              {/* Statistiques */}
              {player.statistiques && (
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
            </div>

            {/* Sidebar */}
            <div className="col-lg-4">
              {/* Informations détaillées */}
              <div className="card profile-card mb-4">
                <div className="card-header">
                  <h5 className="mb-0">
                    <i className="fas fa-info-circle me-2"></i>
                    Informations
                  </h5>
                </div>
                <div className="card-body">
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
                    <strong>Recherche un club:</strong>
                    <div className="text-muted">
                      {player.rechercheClub ? 'Oui' : 'Non'}
                    </div>
                  </div>
                  
                  <div className="mb-3">
                    <strong>Membre depuis:</strong>
                    <div className="text-muted">
                      {formatDate(player.createdAt)}
                    </div>
                  </div>
                  
                  <div className="mb-3">
                    <strong>Dernière activité:</strong>
                    <div className="text-muted">
                      {formatDate(player.derniereActivite)}
                    </div>
                  </div>
                </div>
              </div>

              {/* Club actuel */}
              {player.club && (
                <div className="card profile-card mb-4">
                  <div className="card-header">
                    <h5 className="mb-0">
                      <i className="fas fa-shield-alt me-2"></i>
                      Club actuel
                    </h5>
                  </div>
                  <div className="card-body">
                    <div className="d-flex align-items-center">
                      <Avatar 
                        src={player.club.logo} 
                        alt={player.club.nom}
                        size="md"
                        type="club"
                        className="me-3"
                      />
                      <div>
                        <h6 className="mb-1">{player.club.nom}</h6>
                        <small className="text-muted">
                          {player.club.plateforme} • {player.club.pays}
                        </small>
                      </div>
                    </div>
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
                    value={selectedClub}
                    onChange={(e) => setSelectedClub(e.target.value)}
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