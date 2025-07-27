import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { clubAPI } from '../services/api';

export default function ClubProfilePage() {
  const { id } = useParams();
  const { user } = useAuth();
  const [club, setClub] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [joining, setJoining] = useState(false);
  const [userClub, setUserClub] = useState(null);

  const loadClub = useCallback(async () => {
    try {
      setLoading(true);
      const data = await clubAPI.getClub(id);
      setClub(data);
      setError('');
    } catch (err) {
      setError('Erreur lors du chargement du club');
      console.error('Erreur chargement club:', err);
    } finally {
      setLoading(false);
    }
  }, [id]);

  const loadUserClub = useCallback(async () => {
    if (!user) return;
    
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      
      const userClubs = await clubAPI.getMyClubs(token);
      if (userClubs.length > 0) {
        setUserClub(userClubs[0]); // L'utilisateur ne peut avoir qu'un seul club
      }
    } catch (err) {
      console.error('Erreur chargement club utilisateur:', err);
    }
  }, [user]);

  useEffect(() => {
    loadClub();
    loadUserClub();
  }, [loadClub, loadUserClub]);

  const handleJoinRequest = async () => {
    if (!user) {
      alert('Vous devez être connecté pour demander à rejoindre un club');
      return;
    }
    
    // Vérifier si l'utilisateur est déjà membre d'un autre club
    if (userClub && userClub._id !== id) {
      alert(`Vous êtes déjà membre du club "${userClub.nom}". Vous devez d'abord quitter ce club avant de rejoindre un autre.`);
      return;
    }
    
    setJoining(true);
    try {
      // Récupérer le token depuis localStorage
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Token d\'authentification manquant');
      }

      // Appel à l'API pour rejoindre le club
      const response = await clubAPI.joinClub(id, token);
      
      // Recharger les données du club et du club utilisateur
      await loadClub();
      await loadUserClub();
      
      alert(response.message || 'Vous avez rejoint le club avec succès !');
    } catch (err) {
      console.error('Erreur demande:', err);
      alert(err.message || 'Erreur lors de la demande de rejoindre le club');
    } finally {
      setJoining(false);
    }
  };

  const getPlatformIcon = (platform) => {
    switch(platform) {
      case 'PS5': return '🎮';
      case 'Xbox': return '🎮';
      case 'PC': return '💻';
      default: return '🎮';
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'Actif': return 'success';
      case 'Inactif': return 'secondary';
      case 'En construction': return 'warning';
      default: return 'info';
    }
  };

  const getRoleBadgeColor = (role) => {
    switch(role) {
      case 'Admin': return 'danger';
      case 'Capitaine': return 'warning';
      case 'Joueur': return 'primary';
      default: return 'secondary';
    }
  };

  if (loading) {
    return (
      <div className="min-vh-100 d-flex align-items-center justify-content-center" 
           style={{
             background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%)'
           }}>
        <div className="text-center">
          <div className="spinner-border text-primary" role="status" style={{width: '3rem', height: '3rem'}}>
            <span className="visually-hidden">Chargement...</span>
          </div>
          <p className="mt-3 text-muted">Chargement du club...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-vh-100 d-flex align-items-center justify-content-center" 
           style={{
             background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%)'
           }}>
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-lg-6">
              <div className="card border-0 shadow-lg" 
                   style={{
                     background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                     color: 'white'
                   }}>
                <div className="card-body text-center p-5">
                  <div className="mb-4">
                    <div className="bg-white bg-opacity-20 rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style={{width: '80px', height: '80px'}}>
                      <i className="fas fa-exclamation-triangle text-white" style={{fontSize: '2.5rem'}}></i>
                    </div>
                    <h2 className="card-title mb-3">Erreur</h2>
                    <p className="text-white-90">{error}</p>
                  </div>
                  <Link to="/clubs" className="btn btn-light btn-lg">
                    <i className="fas fa-arrow-left me-2"></i>
                    Retour à la recherche
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!club) {
    return (
      <div className="min-vh-100 d-flex align-items-center justify-content-center" 
           style={{
             background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%)'
           }}>
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-lg-6">
              <div className="card border-0 shadow-lg" 
                   style={{
                     background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                     color: 'white'
                   }}>
                <div className="card-body text-center p-5">
                  <div className="mb-4">
                    <div className="bg-white bg-opacity-20 rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style={{width: '80px', height: '80px'}}>
                      <i className="fas fa-question-circle text-white" style={{fontSize: '2.5rem'}}></i>
                    </div>
                    <h2 className="card-title mb-3">Club non trouvé</h2>
                    <p className="text-white-90">Le club demandé n'existe pas.</p>
                  </div>
                  <Link to="/clubs" className="btn btn-light btn-lg">
                    <i className="fas fa-arrow-left me-2"></i>
                    Retour à la recherche
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-vh-100 d-flex align-items-center justify-content-center" 
           style={{
             background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%)'
           }}>
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-lg-6">
              <div className="card border-0 shadow-lg" 
                   style={{
                     background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                     color: 'white'
                   }}>
                <div className="card-body text-center p-5">
                  <div className="mb-4">
                    <div className="bg-white bg-opacity-20 rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style={{width: '80px', height: '80px'}}>
                      <i className="fas fa-lock text-white" style={{fontSize: '2.5rem'}}></i>
                    </div>
                    <h2 className="card-title mb-3">Connexion requise</h2>
                    <p className="text-white-90">Vous devez être connecté pour voir les profils des clubs.</p>
                  </div>
                  <Link to="/login" className="btn btn-light btn-lg">
                    <i className="fas fa-sign-in-alt me-2"></i>
                    Se connecter
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-vh-100" 
         style={{
           background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%)'
         }}>
      <div className="container py-5">
        <div className="row">
          {/* Informations principales */}
          <div className="col-lg-8">
            <div className="card border-0 shadow-lg mb-4" 
                 style={{
                   background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                   color: 'white'
                 }}>
              <div className="card-body p-4">
                <div className="d-flex align-items-center mb-4">
                  <div className="bg-white bg-opacity-20 rounded-circle d-flex align-items-center justify-content-center me-4" style={{width: '80px', height: '80px'}}>
                    <i className="fas fa-shield-alt text-white" style={{fontSize: '2.5rem'}}></i>
                  </div>
                  <div className="flex-grow-1">
                    <h1 className="mb-2">{club.nom}</h1>
                    <div className="d-flex align-items-center gap-3">
                      <span className="badge bg-light text-dark">
                        {getPlatformIcon(club.plateforme)} {club.plateforme}
                      </span>
                      <span className={`badge bg-${getStatusColor(club.statut)}`}>
                        {club.statut}
                      </span>
                      <span className="badge bg-info">
                        {club.effectifActuel}/{club.effectifMax} membres
                      </span>
                    </div>
                  </div>
                </div>

                {/* Statistiques rapides */}
                <div className="row mb-4">
                  <div className="col-md-3">
                    <div className="text-center">
                      <div className="h4 mb-1">{club.effectifActuel}</div>
                      <small className="text-white-75">Membres actuels</small>
                    </div>
                  </div>
                  <div className="col-md-3">
                    <div className="text-center">
                      <div className="h4 mb-1">{club.effectifMax - club.effectifActuel}</div>
                      <small className="text-white-75">Places libres</small>
                    </div>
                  </div>
                  <div className="col-md-3">
                    <div className="text-center">
                      <div className="h4 mb-1">{club.pays}</div>
                      <small className="text-white-75">Pays</small>
                    </div>
                  </div>
                  <div className="col-md-3">
                    <div className="text-center">
                      <div className="h4 mb-1">
                        {club.recrute ? (
                          <span className="badge bg-success">Oui</span>
                        ) : (
                          <span className="badge bg-secondary">Non</span>
                        )}
                      </div>
                      <small className="text-white-75">Recrute</small>
                    </div>
                  </div>
                </div>

                {/* Description */}
                {club.description && (
                  <div className="mb-4">
                    <h5 className="mb-3">
                      <i className="fas fa-align-left me-2"></i>
                      Description
                    </h5>
                    <p className="text-white-90">{club.description}</p>
                  </div>
                )}

                {/* Informations détaillées */}
                <div className="row">
                  <div className="col-md-6">
                    <h5 className="mb-3">
                      <i className="fas fa-info-circle me-2"></i>
                      Informations
                    </h5>
                    <ul className="list-unstyled">
                      <li className="mb-2">
                        <i className="fas fa-user me-2 text-primary"></i>
                        <strong>Créateur:</strong> {club.createurId?.pseudo}
                      </li>
                      <li className="mb-2">
                        <i className="fas fa-flag me-2 text-primary"></i>
                        <strong>Pays:</strong> {club.pays}
                      </li>
                      <li className="mb-2">
                        <i className="fas fa-calendar me-2 text-primary"></i>
                        <strong>Créé le:</strong> {new Date(club.dateCreation).toLocaleDateString('fr-FR')}
                      </li>
                      {club.horaires && (
                        <li className="mb-2">
                          <i className="fas fa-clock me-2 text-primary"></i>
                          <strong>Horaires:</strong> {club.horaires}
                        </li>
                      )}
                    </ul>
                  </div>
                  <div className="col-md-6">
                    <h5 className="mb-3">
                      <i className="fas fa-search me-2"></i>
                      Recrutement
                    </h5>
                    <ul className="list-unstyled">
                      {club.niveauRecherche && (
                        <li className="mb-2">
                          <i className="fas fa-star me-2 text-warning"></i>
                          <strong>Niveau:</strong> {club.niveauRecherche}
                        </li>
                      )}
                      {club.postesRecherches && club.postesRecherches.length > 0 && (
                        <li className="mb-2">
                          <i className="fas fa-users me-2 text-info"></i>
                          <strong>Postes:</strong> {club.postesRecherches.join(', ')}
                        </li>
                      )}
                      {club.langues && club.langues.length > 0 && (
                        <li className="mb-2">
                          <i className="fas fa-language me-2 text-success"></i>
                          <strong>Langues:</strong> {club.langues.join(', ')}
                        </li>
                      )}
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* Membres du club */}
            {club.membres && club.membres.length > 0 && (
              <div className="card border-0 shadow-lg" 
                   style={{
                     background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                     color: 'white'
                   }}>
                <div className="card-body p-4">
                  <h5 className="mb-4">
                    <i className="fas fa-users me-2"></i>
                    Membres du club ({club.membres.length})
                  </h5>
                  <div className="row g-3">
                    {club.membres.map((membre, index) => (
                      <div key={index} className="col-md-6 col-lg-4">
                        <div className="bg-white bg-opacity-10 rounded p-3">
                          <div className="d-flex align-items-center">
                            <div className="bg-white bg-opacity-20 rounded-circle d-flex align-items-center justify-content-center me-3" style={{width: '40px', height: '40px'}}>
                              <i className="fas fa-user text-white"></i>
                            </div>
                            <div className="flex-grow-1">
                              <div className="fw-bold">{membre.userId?.pseudo || 'Membre'}</div>
                              <small className="text-white-75">
                                {new Date(membre.dateAdhesion).toLocaleDateString('fr-FR')}
                              </small>
                            </div>
                            <span className={`badge bg-${getRoleBadgeColor(membre.role)}`}>
                              {membre.role}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="col-lg-4">
            <div className="card border-0 shadow-lg" 
                 style={{
                   background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                   color: 'white'
                 }}>
              <div className="card-body p-4">
                <h5 className="mb-4">
                  <i className="fas fa-cogs me-2"></i>
                  Actions
                </h5>
                
                {club.recrute && club.effectifActuel < club.effectifMax ? (
                  userClub ? (
                    userClub._id === id ? (
                      <div className="alert alert-success bg-success bg-opacity-20 border-0 mb-3">
                        <i className="fas fa-check-circle me-2"></i>
                        Vous êtes déjà membre de ce club
                      </div>
                    ) : (
                      <div className="alert alert-warning bg-warning bg-opacity-20 border-0 mb-3">
                        <i className="fas fa-exclamation-triangle me-2"></i>
                        Vous êtes déjà membre du club "{userClub.nom}"
                      </div>
                    )
                  ) : (
                    <button 
                      className="btn btn-light btn-lg w-100 mb-3"
                      onClick={handleJoinRequest}
                      disabled={joining}
                    >
                      {joining ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                          Envoi en cours...
                        </>
                      ) : (
                        <>
                          <i className="fas fa-user-plus me-2"></i>
                          Demander à rejoindre
                        </>
                      )}
                    </button>
                  )
                ) : (
                  <div className="alert alert-light bg-white bg-opacity-20 border-0 mb-3">
                    <i className="fas fa-info-circle me-2"></i>
                    Ce club ne recrute pas actuellement
                  </div>
                )}

                <Link to="/clubs" className="btn btn-outline-light btn-lg w-100 mb-3">
                  <i className="fas fa-arrow-left me-2"></i>
                  Retour à la recherche
                </Link>

                <Link to="/" className="btn btn-outline-light btn-sm w-100">
                  <i className="fas fa-home me-2"></i>
                  Accueil
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 