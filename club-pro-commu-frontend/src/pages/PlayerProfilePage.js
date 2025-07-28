import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { playerAPI, invitationAPI, clubAPI } from '../services/api';
import Avatar from '../components/Avatar';
import { getCountryDisplay } from '../utils/countryUtils';
import { getPositionDisplay } from '../utils/positionUtils';

export default function PlayerProfilePage() {
  const { id } = useParams();
  const { user } = useAuth();
  const [player, setPlayer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [userClubs, setUserClubs] = useState([]);
  const [selectedClub, setSelectedClub] = useState('');
  const [inviteMessage, setInviteMessage] = useState('');
  const [inviting, setInviting] = useState(false);

  const loadPlayer = useCallback(async () => {
    try {
      setLoading(true);
      const data = await playerAPI.getPlayer(id);
      setPlayer(data);
      setError('');
    } catch (err) {
      setError('Erreur lors du chargement du joueur');
      console.error('Erreur chargement joueur:', err);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadPlayer();
  }, [loadPlayer]);

  const handleInvite = async () => {
    if (!user) {
      alert('Vous devez être connecté pour inviter un joueur');
      return;
    }
    
    try {
      // Charger les clubs de l'utilisateur
      const clubs = await clubAPI.getMyClubs(user.token);
      setUserClubs(clubs);
      setShowInviteModal(true);
    } catch (error) {
      alert('Erreur lors du chargement de vos clubs: ' + error.message);
    }
  };

  const handleSendInvitation = async () => {
    if (!selectedClub) {
      alert('Veuillez sélectionner un club');
      return;
    }

    try {
      setInviting(true);
      await invitationAPI.invitePlayer(selectedClub, id, inviteMessage, user.token);
      alert('Invitation envoyée avec succès !');
      setShowInviteModal(false);
      setSelectedClub('');
      setInviteMessage('');
    } catch (error) {
      alert('Erreur lors de l\'envoi de l\'invitation: ' + error.message);
    } finally {
      setInviting(false);
    }
  };

  if (loading) {
    return (
      <div className="container mt-4 text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Chargement...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mt-4">
        <div className="alert alert-danger">
          <h4>Erreur</h4>
          <p>{error}</p>
          <Link to="/recherche-joueur" className="btn btn-primary">Retour à la recherche</Link>
        </div>
      </div>
    );
  }

  if (!player) {
    return (
      <div className="container mt-4">
        <div className="alert alert-warning">
          <h4>Joueur non trouvé</h4>
          <p>Le profil demandé n'existe pas.</p>
          <Link to="/recherche-joueur" className="btn btn-primary">Retour à la recherche</Link>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container mt-4">
        <div className="alert alert-warning">
          <h4>Connexion requise</h4>
          <p>Vous devez être connecté pour voir les profils des joueurs.</p>
          <Link to="/login" className="btn btn-primary">Se connecter</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mt-4">
      <div className="row">
        <div className="col-lg-8">
          <div className="card shadow-lg border-0">
            <div className="card-header text-white" style={{background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'}}>
              <div className="d-flex align-items-center">
                <Avatar
                  src={player.photoProfil}
                  name={player.pseudo}
                  size="lg"
                  type="player"
                  className="me-3"
                />
                <div>
                  <h2 className="mb-0">
                    {player.pseudo}
                  </h2>
                  <small className="text-light">
                    {getPositionDisplay(player.postePrincipal)} • {player.plateforme}
                  </small>
                </div>
              </div>
            </div>
            
            <div className="card-body p-4">
              <div className="row">
                <div className="col-md-6">
                  <h5 className="text-primary mb-3">
                    <i className="fas fa-info-circle me-2"></i>
                    Informations générales
                  </h5>
                  <ul className="list-unstyled">
                    <li className="mb-2">
                      <strong>Pseudo:</strong> 
                      <span className="badge bg-dark ms-2">{player.pseudo}</span>
                    </li>
                    <li className="mb-2">
                      <strong>Pseudo sur {player.plateforme}:</strong> 
                      <span className="badge bg-secondary ms-2">{player.pseudoPlateforme}</span>
                    </li>
                    <li className="mb-2">
                      <strong>Âge:</strong> 
                      <span className="badge bg-info ms-2">
                        {player.age ? `${player.age} ans` : 'Non renseigné'}
                      </span>
                    </li>
                    <li className="mb-2">
                      <strong>Nationalité:</strong> 
                      <span className="badge bg-primary ms-2">
                        {player.pays ? getCountryDisplay(player.pays) : 'Non renseignée'}
                      </span>
                    </li>
                    <li className="mb-2">
                      <strong>Plateforme:</strong> 
                      <span className="badge bg-dark ms-2">{player.plateforme}</span>
                    </li>

                    <li className="mb-2">
                      <strong>Expérience:</strong> 
                      <span className="badge bg-success ms-2">{player.experience || 0} matchs</span>
                    </li>
                    <li className="mb-2">
                      <strong>Statut:</strong> 
                    </li>
                  </ul>
                </div>
                
                <div className="col-md-6">
                  <h5 className="text-primary mb-3">
                    <i className="fas fa-futbol me-2"></i>
                    Postes & Disponibilité
                  </h5>
                  <ul className="list-unstyled">
                    <li className="mb-2">
                      <strong>Poste principal:</strong> 
                      <span className="badge bg-primary ms-2">
                        {getPositionDisplay(player.postePrincipal)}
                      </span>
                    </li>
                    {player.postesSecondaires && player.postesSecondaires.length > 0 && (
                      <li className="mb-2">
                        <strong>Postes secondaires:</strong> 
                        <div className="mt-1">
                          {player.postesSecondaires.map((poste, index) => (
                            <span key={index} className="badge bg-secondary me-1">
                              {getPositionDisplay(poste)}
                            </span>
                          ))}
                        </div>
                      </li>
                    )}
                    <li className="mb-2">
                      <strong>Disponibilité:</strong> 
                      <span className="badge bg-success ms-2">
                        {player.disponibilite || 'Disponible'}
                      </span>
                    </li>
                    <li className="mb-2">
                      <strong>Recherche un club:</strong> 
                      {player.rechercheClub ? (
                        <span className="badge bg-success ms-2">✅ Oui</span>
                      ) : (
                        <span className="badge bg-secondary ms-2">❌ Non</span>
                      )}
                    </li>
                  </ul>
                </div>
              </div>
              
              {player.description && (
                <div className="mt-4">
                  <h5 className="text-primary mb-3">
                    <i className="fas fa-comment me-2"></i>
                    Description
                  </h5>
                  <div className="card bg-light">
                    <div className="card-body">
                      <p className="mb-0">{player.description}</p>
                    </div>
                  </div>
                </div>
              )}
              
              {player.langues && player.langues.length > 0 && (
                <div className="mt-4">
                  <h5 className="text-primary mb-3">
                    <i className="fas fa-language me-2"></i>
                    Langues parlées
                  </h5>
                  <div>
                    {player.langues.map((langue, index) => (
                      <span key={index} className="badge bg-info me-2">
                        {langue}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        
        <div className="col-lg-4">
          <div className="card shadow-lg border-0">
            <div className="card-header text-white" style={{background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'}}>
              <h5 className="mb-0">
                <i className="fas fa-chart-line me-2"></i>
                Actions
              </h5>
            </div>
            <div className="card-body">
              <button 
                className="btn btn-primary w-100 mb-2"
                onClick={handleInvite}
              >
                <i className="fas fa-user-plus me-1"></i>
                Inviter ce joueur dans mon club
              </button>
              
              <Link to="/recherche-joueur" className="btn btn-outline-secondary w-100">
                <i className="fas fa-arrow-left me-1"></i>
                Retour à la recherche
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Modal d'invitation */}
      {showInviteModal && (
        <div className="modal fade show" style={{display: 'block'}} tabIndex="-1">
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  <i className="fas fa-user-plus me-2"></i>
                  Inviter {player?.pseudo} dans votre club
                </h5>
                <button 
                  type="button" 
                  className="btn-close" 
                  onClick={() => setShowInviteModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                <div className="mb-3">
                  <label className="form-label">Sélectionner un club :</label>
                  <select 
                    className="form-select"
                    value={selectedClub}
                    onChange={(e) => setSelectedClub(e.target.value)}
                  >
                    <option value="">Choisir un club...</option>
                    {userClubs.map(club => (
                      <option key={club._id} value={club._id}>
                        {club.nom} ({club.plateforme})
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="mb-3">
                  <label className="form-label">Message (optionnel) :</label>
                  <textarea 
                    className="form-control"
                    rows="3"
                    placeholder="Ajoutez un message personnalisé..."
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
                  className="btn btn-primary"
                  onClick={handleSendInvitation}
                  disabled={inviting || !selectedClub}
                >
                  {inviting ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2"></span>
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
          <div className="modal-backdrop fade show"></div>
        </div>
      )}
    </div>
  );
} 