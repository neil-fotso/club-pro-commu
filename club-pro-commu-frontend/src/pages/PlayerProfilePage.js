import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { playerAPI, clubAPI, invitationAPI } from '../services/api';
import Avatar from '../components/Avatar';

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
    fetchPlayer();
    if (user) {
      fetchUserClubs();
    }
  }, [id, user]);

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

  const getNiveauColor = (niveau) => {
    const colors = {
      'Débutant': 'success',
      'Intermédiaire': 'info',
      'Avancé': 'warning',
      'Expert': 'danger',
      'Pro': 'dark'
    };
    return colors[niveau] || 'secondary';
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
      <div className="container mt-4">
        <div className="text-center">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Chargement...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error || !player) {
    return (
      <div className="container mt-4">
        <div className="alert alert-danger" role="alert">
          <i className="fas fa-exclamation-triangle me-2"></i>
          {error || 'Joueur non trouvé'}
        </div>
      </div>
    );
  }

  const isOwnProfile = user && player.userId === user.id;

  return (
    <div className="container mt-4">
      {/* Header du profil */}
      <div className="row mb-4">
        <div className="col-md-8">
          <div className="d-flex align-items-center">
            <Avatar 
              src={player.photoProfil} 
              alt={player.pseudo}
              size="xl"
              className="me-4"
            />
            <div>
              <h1 className="mb-2">{player.pseudo}</h1>
              <div className="d-flex gap-2 mb-3">
                <span className={`badge bg-${getNiveauColor(player.niveau)} fs-6`}>
                  {player.niveau}
                </span>
                <span className={`badge bg-${getDisponibiliteColor(player.disponibilite)} fs-6`}>
                  {player.disponibilite}
                </span>
                <span className="badge bg-primary fs-6">
                  {player.position}
                </span>
                <span className="badge bg-secondary fs-6">
                  {player.plateforme}
                </span>
              </div>
              <div className="text-muted">
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
              className="btn btn-primary btn-lg"
              onClick={handleInvite}
            >
              <i className="fas fa-user-plus me-2"></i>
              Inviter dans mon club
            </button>
          )}
          {isOwnProfile && (
            <Link to="/mon-profil/edit" className="btn btn-outline-primary btn-lg">
              <i className="fas fa-edit me-2"></i>
              Modifier mon profil
            </Link>
          )}
        </div>
      </div>

      <div className="row">
        {/* Informations principales */}
        <div className="col-lg-8">
          {/* Bio */}
          {player.bio && (
            <div className="card mb-4">
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
            <div className="card mb-4">
              <div className="card-header">
                <h5 className="mb-0">
                  <i className="fas fa-chart-bar me-2"></i>
                  Statistiques
                </h5>
              </div>
              <div className="card-body">
                <div className="row">
                  <div className="col-md-3 text-center mb-3">
                    <div className="h3 text-primary mb-1">{player.statistiques.matchsJoues}</div>
                    <div className="text-muted">Matchs joués</div>
                  </div>
                  <div className="col-md-3 text-center mb-3">
                    <div className="h3 text-success mb-1">{player.winRate || 0}%</div>
                    <div className="text-muted">Win Rate</div>
                  </div>
                  <div className="col-md-3 text-center mb-3">
                    <div className="h3 text-info mb-1">{player.statistiques.butsMarques}</div>
                    <div className="text-muted">Buts marqués</div>
                  </div>
                  <div className="col-md-3 text-center mb-3">
                    <div className="h3 text-warning mb-1">{player.statistiques.passesDecisives}</div>
                    <div className="text-muted">Passes décisives</div>
                  </div>
                </div>
                
                <div className="row">
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
            <div className="card mb-4">
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
                        <span className={`badge bg-${getNiveauColor(jeu.niveau)}`}>
                          {jeu.niveau}
                        </span>
                      </div>
                      {jeu.tempsJeu > 0 && (
                        <small className="text-muted">
                          {jeu.tempsJeu}h de jeu
                        </small>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Récompenses */}
          {player.recompenses && player.recompenses.length > 0 && (
            <div className="card mb-4">
              <div className="card-header">
                <h5 className="mb-0">
                  <i className="fas fa-trophy me-2"></i>
                  Récompenses
                </h5>
              </div>
              <div className="card-body">
                <div className="row">
                  {player.recompenses.map((recompense, index) => (
                    <div key={index} className="col-md-6 mb-3">
                      <div className="d-flex align-items-center">
                        <i className="fas fa-medal text-warning me-3 fs-4"></i>
                        <div>
                          <strong>{recompense.nom}</strong>
                          {recompense.description && (
                            <div className="text-muted small">{recompense.description}</div>
                          )}
                          <small className="text-muted">
                            {formatDate(recompense.date)}
                          </small>
                        </div>
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
          {/* Informations personnelles */}
          <div className="card mb-4">
            <div className="card-header">
              <h6 className="mb-0">
                <i className="fas fa-info-circle me-2"></i>
                Informations
              </h6>
            </div>
            <div className="card-body">
              <div className="mb-3">
                <small className="text-muted d-block">Expérience</small>
                <strong>{player.experience || 0} ans</strong>
              </div>
              {player.nationalite && (
                <div className="mb-3">
                  <small className="text-muted d-block">Nationalité</small>
                  <strong>{player.nationalite}</strong>
                </div>
              )}
              <div className="mb-3">
                <small className="text-muted d-block">Dernière activité</small>
                <strong>{formatDate(player.derniereActivite)}</strong>
              </div>
              {player.statutVerification && (
                <div className="mb-3">
                  <small className="text-muted d-block">Statut</small>
                  <span className={`badge bg-${player.statutVerification === 'Vérifié' ? 'success' : 'secondary'}`}>
                    {player.statutVerification}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Horaires */}
          {player.horaires && Object.values(player.horaires).some(h => h) && (
            <div className="card mb-4">
              <div className="card-header">
                <h6 className="mb-0">
                  <i className="fas fa-clock me-2"></i>
                  Horaires de jeu
                </h6>
              </div>
              <div className="card-body">
                {Object.entries(player.horaires).map(([jour, horaire]) => (
                  horaire && (
                    <div key={jour} className="d-flex justify-content-between mb-2">
                      <span className="text-capitalize">{jour}:</span>
                      <strong>{horaire}</strong>
                    </div>
                  )
                ))}
              </div>
            </div>
          )}

          {/* Réseaux sociaux */}
          {player.reseauxSociaux && Object.values(player.reseauxSociaux).some(r => r) && (
            <div className="card mb-4">
              <div className="card-header">
                <h6 className="mb-0">
                  <i className="fas fa-share-alt me-2"></i>
                  Réseaux sociaux
                </h6>
              </div>
              <div className="card-body">
                {Object.entries(player.reseauxSociaux).map(([reseau, username]) => (
                  username && (
                    <div key={reseau} className="mb-2">
                      <i className={`fab fa-${reseau} me-2`}></i>
                      <span className="text-capitalize">{reseau}:</span>
                      <strong className="ms-2">{username}</strong>
                    </div>
                  )
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal d'invitation */}
      {showInviteModal && (
        <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  <i className="fas fa-user-plus me-2"></i>
                  Inviter {player.pseudo}
                </h5>
                <button
                  type="button" 
                  className="btn-close" 
                  onClick={() => setShowInviteModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                <div className="mb-3">
                  <label className="form-label">
                    <i className="fas fa-shield-alt me-1"></i>
                    Sélectionner un club
                  </label>
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
                  <label className="form-label">
                    <i className="fas fa-comment me-1"></i>
                    Message (optionnel)
                  </label>
                  <textarea 
                    className="form-control"
                    rows="3"
                    placeholder="Message personnalisé pour l'invitation..."
                    value={inviteMessage}
                    onChange={(e) => setInviteMessage(e.target.value)}
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
                  className="btn btn-success"
                  onClick={handleSendInvitation}
                  disabled={inviting || !selectedClub}
                >
                  {inviting ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                      Envoi...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-paper-plane me-1"></i>
                      Envoyer l'invitation
                    </>
                  )}
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