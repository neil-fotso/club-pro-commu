import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { clubAPI } from '../services/api';
import Avatar from '../components/Avatar';

export default function MyClubsPage() {
  const { user } = useAuth();
  const [clubs, setClubs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user) {
      loadMyClubs();
    }
  }, [user]);

  const loadMyClubs = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Token d\'authentification manquant');
      }
      
      const data = await clubAPI.getMyClubs(token);
      setClubs(data);
      setError('');
    } catch (err) {
      setError('Erreur lors du chargement de vos clubs');
      console.error('Erreur chargement clubs:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLeaveClub = async (clubId, clubName) => {
    if (!window.confirm(`Êtes-vous sûr de vouloir quitter le club "${clubName}" ?`)) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Token d\'authentification manquant');
      }

      await clubAPI.leaveClub(clubId, token);
      alert('Vous avez quitté le club avec succès');
      loadMyClubs(); // Recharger la liste
    } catch (err) {
      console.error('Erreur quitter club:', err);
      alert(err.message || 'Erreur lors du départ du club');
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
                    <p className="text-white-90">Vous devez être connecté pour voir vos clubs.</p>
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
        {/* Header */}
        <div className="text-center mb-5">
          <h1 className="display-5 fw-bold mb-3">🏆 Mes Clubs</h1>
          <p className="lead text-muted">Gérez vos clubs et vos adhésions</p>
        </div>

        {error && (
          <div className="alert alert-danger border-0 bg-danger bg-opacity-10 mb-4">
            <i className="fas fa-exclamation-triangle me-2"></i>
            {error}
          </div>
        )}

        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status" style={{width: '3rem', height: '3rem'}}>
              <span className="visually-hidden">Chargement...</span>
            </div>
            <p className="mt-3 text-muted">Chargement de vos clubs...</p>
          </div>
        ) : (
          <>
            {clubs.length === 0 ? (
              <div className="text-center py-5">
                <div className="mb-4" style={{fontSize: '4rem'}}>🏆</div>
                <h3 className="text-muted">Aucun club trouvé</h3>
                <p className="text-muted">Vous n'êtes membre d'aucun club pour le moment.</p>
                <div className="mt-4">
                  <Link to="/clubs" className="btn btn-primary btn-lg me-3">
                    <i className="fas fa-search me-2"></i>
                    Rechercher un club
                  </Link>
                  <Link to="/create-club" className="btn btn-outline-primary btn-lg">
                    <i className="fas fa-plus me-2"></i>
                    Créer un club
                  </Link>
                </div>
              </div>
            ) : (
              <div className="row g-4">
                {clubs.map((club) => {
                  // Trouver le rôle de l'utilisateur dans ce club
                  const userMember = club.membres.find(membre => 
                    membre.userId._id === user.id || membre.userId === user.id
                  );
                  const userRole = userMember ? userMember.role : 'Membre';

                  return (
                    <div key={club._id} className="col-lg-6 col-xl-4">
                      <div className="card border-0 shadow-sm hover-shadow h-100" 
                           style={{
                             background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                             color: 'white'
                           }}>
                        <div className="card-body p-4">
                          <div className="d-flex align-items-center mb-3">
                            <Avatar
                              src={club.photoProfil}
                              name={club.nom}
                              size="md"
                              type="club"
                              className="me-3"
                            />
                            <div className="flex-grow-1">
                              <h5 className="mb-1">
                                <Link to={`/club/${club._id}`} className="text-decoration-none text-white">
                                  {club.nom}
                                </Link>
                              </h5>
                              <small className="text-white-75">
                                {getPlatformIcon(club.plateforme)} {club.plateforme} • {club.pays}
                              </small>
                            </div>
                            <div className="text-end">
                              <span className={`badge bg-${getStatusColor(club.statut)}`}>
                                {club.statut}
                              </span>
                            </div>
                          </div>
                          
                          <div className="row mb-3">
                            <div className="col-6">
                              <small className="text-white-75">Effectif</small>
                              <div className="fw-bold">{club.effectifActuel}/{club.effectifMax}</div>
                            </div>
                            <div className="col-6">
                              <small className="text-white-75">Votre rôle</small>
                              <div className="fw-bold">
                                <span className={`badge bg-${getRoleBadgeColor(userRole)}`}>
                                  {userRole}
                                </span>
                              </div>
                            </div>
                          </div>
                          
                          <div className="row mb-3">
                            <div className="col-6">
                              <small className="text-white-75">Créé par</small>
                              <div className="fw-bold">{club.createurId?.pseudo}</div>
                            </div>
                            <div className="col-6">
                              <small className="text-white-75">Créé le</small>
                              <div className="fw-bold">{new Date(club.dateCreation).toLocaleDateString('fr-FR')}</div>
                            </div>
                          </div>
                          
                          {club.description && (
                            <p className="text-white-90 mb-3" style={{fontSize: '0.9rem'}}>
                              {club.description.length > 100 
                                ? `${club.description.substring(0, 100)}...` 
                                : club.description
                              }
                            </p>
                          )}
                          
                          <div className="d-flex gap-2">
                            <Link to={`/club/${club._id}`} className="btn btn-outline-light btn-sm flex-grow-1">
                              <i className="fas fa-eye me-1"></i>
                              Voir profil
                            </Link>
                            {userRole !== 'Admin' && (
                              <button
                                className="btn btn-outline-danger btn-sm"
                                onClick={() => handleLeaveClub(club._id, club.nom)}
                                title="Quitter le club"
                              >
                                <i className="fas fa-sign-out-alt"></i>
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
} 