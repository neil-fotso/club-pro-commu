import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { clubAPI } from '../services/api';
import Avatar from '../components/Avatar';

const myClubsStyles = `
  .gaming-club-card {
    background: rgba(13, 19, 32, 0.7) !important;
    border: 1px solid var(--border-glass) !important;
    backdrop-filter: blur(12px);
    border-radius: 16px !important;
    transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1) !important;
    overflow: hidden;
    position: relative;
  }
  
  .gaming-club-card:hover {
    transform: translateY(-5px);
    border-color: var(--neon-purple) !important;
    box-shadow: 0 10px 25px var(--neon-purple-glow) !important;
  }
  
  .gaming-club-card::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 4px;
    height: 100%;
    background: var(--gradient-esports);
  }
  
  .gaming-club-title {
    font-family: 'Rajdhani', sans-serif;
    font-weight: 700;
    text-transform: uppercase;
    font-size: 1.25rem;
    letter-spacing: 0.5px;
  }
  
  .gaming-stat-label {
    font-size: 0.65rem;
    text-transform: uppercase;
    color: var(--text-silver);
    letter-spacing: 0.5px;
    display: block;
    margin-bottom: 2px;
  }
  
  .gaming-stat-val {
    font-family: 'Rajdhani', sans-serif;
    font-weight: 700;
    font-size: 1.1rem;
    color: white;
  }
  
  .gaming-badge {
    padding: 0.35rem 0.75rem !important;
    border-radius: 6px !important;
    font-size: 0.75rem !important;
    font-weight: 700 !important;
    font-family: 'Rajdhani', sans-serif !important;
    text-transform: uppercase !important;
    letter-spacing: 0.5px !important;
    border: 1px solid transparent !important;
    display: inline-block;
  }
  
  .gaming-badge-admin {
    background: rgba(220, 53, 69, 0.15) !important;
    color: #ff6b6b !important;
    border-color: rgba(220, 53, 69, 0.3) !important;
  }
  
  .gaming-badge-captain {
    background: rgba(255, 193, 7, 0.15) !important;
    color: #ffd166 !important;
    border-color: rgba(255, 193, 7, 0.3) !important;
  }
  
  .gaming-badge-player {
    background: rgba(0, 240, 255, 0.15) !important;
    color: #00f0ff !important;
    border-color: rgba(0, 240, 255, 0.3) !important;
  }
  
  .gaming-badge-member {
    background: rgba(255, 255, 255, 0.05) !important;
    color: var(--text-silver) !important;
    border-color: var(--border-glass) !important;
  }
  
  .gaming-platform-tag {
    display: inline-flex;
    align-items: center;
    background: rgba(255, 255, 255, 0.03);
    border: 1px solid var(--border-glass);
    padding: 0.25rem 0.5rem;
    border-radius: 4px;
    font-size: 0.75rem;
    font-family: 'Outfit', sans-serif;
    color: var(--text-silver);
  }
  
  .gaming-btn-view {
    background: rgba(255, 255, 255, 0.04) !important;
    border: 1px solid var(--border-glass) !important;
    color: white !important;
    font-family: 'Rajdhani', sans-serif;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    transition: all 0.2s ease;
    border-radius: 8px !important;
    text-decoration: none;
    display: inline-flex;
    align-items: center;
    justify-content: center;
  }
  
  .gaming-btn-view:hover {
    background: var(--gradient-esports) !important;
    border-color: transparent !important;
    box-shadow: 0 4px 15px var(--neon-purple-glow);
    transform: translateY(-1px);
    color: white !important;
  }
  
  .gaming-btn-leave {
    background: rgba(220, 53, 69, 0.1) !important;
    border: 1px solid rgba(220, 53, 69, 0.2) !important;
    color: #ff6b6b !important;
    transition: all 0.2s ease;
    border-radius: 8px !important;
    display: inline-flex;
    align-items: center;
    justify-content: center;
  }
  
  .gaming-btn-leave:hover {
    background: #dc3545 !important;
    color: white !important;
    border-color: transparent !important;
    box-shadow: 0 4px 15px rgba(220, 53, 69, 0.4);
    transform: translateY(-1px);
  }
  
  .empty-state-card {
    background: rgba(13, 19, 32, 0.6) !important;
    border: 1px solid var(--border-glass) !important;
    border-radius: 16px !important;
    padding: 3rem;
    backdrop-filter: blur(12px);
  }
`;

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

  const getRoleBadgeColor = (role) => {
    const colors = {
      'Admin': 'danger',
      'Capitaine': 'warning',
      'Joueur': 'primary',
      'Membre': 'secondary'
    };
    return colors[role] || 'secondary';
  };

  const getRoleBadgeClass = (role) => {
    switch(role) {
      case 'Admin': return 'gaming-badge gaming-badge-admin';
      case 'Capitaine': return 'gaming-badge gaming-badge-captain';
      case 'Joueur': return 'gaming-badge gaming-badge-player';
      default: return 'gaming-badge gaming-badge-member';
    }
  };

  if (!user) {
    return (
      <div className="min-vh-100 d-flex align-items-center justify-content-center">
        <style>{myClubsStyles}</style>
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-lg-6">
              <div className="empty-state-card text-center p-5">
                <div className="mb-4">
                  <div className="header-icon">
                    <i className="fas fa-lock text-gradient"></i>
                  </div>
                  <h2 className="text-gradient font-rajdhani text-uppercase mb-3">Connexion requise</h2>
                  <p className="text-muted">Vous devez être connecté pour voir vos clubs.</p>
                </div>
                <Link to="/login" className="btn submit-btn btn-lg w-100">
                  <i className="fas fa-sign-in-alt me-2"></i>
                  Se connecter
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="my-clubs-container py-4 px-4 px-md-5">
      <style>{myClubsStyles}</style>
      <div className="container-fluid px-0">
        {/* Header */}
        <div className="text-center mb-5">
          <h1 className="display-5 fw-bold text-gradient font-rajdhani text-uppercase mb-2">Mes Clubs</h1>
          <p className="lead text-muted">Gérez vos clubs et vos adhésions</p>
        </div>

        {error && (
          <div className="alert alert-danger mb-4">
            <i className="fas fa-exclamation-triangle me-2"></i>
            {error}
          </div>
        )}

        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-primary mb-3" role="status" style={{width: '3rem', height: '3rem'}}>
              <span className="visually-hidden">Chargement...</span>
            </div>
            <p className="text-muted">Chargement de vos clubs...</p>
          </div>
        ) : (
          <>
            {clubs.length === 0 ? (
              <div className="empty-state-card text-center py-5">
                <div className="mb-4" style={{fontSize: '4rem'}}>🏆</div>
                <h3 className="text-white font-rajdhani text-uppercase mb-2">Aucun club trouvé</h3>
                <p className="text-muted mb-4">Vous n'êtes membre d'aucun club pour le moment.</p>
                <div className="d-flex flex-column flex-md-row gap-3 justify-content-center px-4">
                  <Link to="/clubs" className="btn submit-btn btn-lg">
                    <i className="fas fa-search me-2"></i>
                    Rechercher un club
                  </Link>
                  <Link to="/create-club" className="btn cancel-btn btn-lg">
                    <i className="fas fa-plus me-2"></i>
                    Créer un club
                  </Link>
                </div>
              </div>
            ) : (
              <div className="row g-4">
                {clubs.map((club) => {
                  // Trouver le rôle de l'utilisateur dans ce club
                  const userMember = club.membres.find(membre => {
                    const membreUserId = membre.userId._id || membre.userId;
                    const currentUserId = user.id || user._id;
                    return membreUserId === currentUserId;
                  });
                  
                  const isCreateur = (() => {
                    const createurId = club.createurId?._id || club.createurId;
                    const currentUserId = user.id || user._id;
                    return createurId === currentUserId;
                  })();
                  
                  const userRole = isCreateur ? 'Admin' : (userMember ? userMember.role : 'Membre');

                  return (
                    <div key={club._id} className="col-lg-6 col-xl-4">
                      <div className="card gaming-club-card h-100">
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
                                <Link to={`/club/${club._id}`} className="text-decoration-none text-white gaming-club-title">
                                  {club.nom}
                                </Link>
                              </h5>
                              <div className="d-flex gap-2 mt-1">
                                <span className="gaming-platform-tag">
                                  {getPlatformIcon(club.plateforme)} {club.plateforme}
                                </span>
                                <span className="gaming-platform-tag">
                                  🇫🇷 {club.pays}
                                </span>
                              </div>
                            </div>
                          </div>
                          
                          <div className="row mb-3">
                            <div className="col-6">
                              <small className="gaming-stat-label">Effectif</small>
                              <div className="gaming-stat-val">{club.effectifActuel} / {club.effectifMax}</div>
                            </div>
                            <div className="col-6">
                              <small className="gaming-stat-label">Votre rôle</small>
                              <div className="mt-1">
                                <span className={getRoleBadgeClass(userRole)}>
                                  {userRole}
                                </span>
                              </div>
                            </div>
                          </div>
                          
                          <div className="row mb-3">
                            <div className="col-6">
                              <small className="gaming-stat-label">Créé par</small>
                              <div className="gaming-stat-val text-truncate" style={{maxWidth: '120px'}} title={club.createurId?.pseudo}>
                                {club.createurId?.pseudo || 'Inconnu'}
                              </div>
                            </div>
                            <div className="col-6">
                              <small className="gaming-stat-label">Créé le</small>
                              <div className="gaming-stat-val">
                                {new Date(club.dateCreation).toLocaleDateString('fr-FR')}
                              </div>
                            </div>
                          </div>
                          
                          {club.description && (
                            <p className="text-white-50 mb-3" style={{fontSize: '0.85rem', minHeight: '40px'}}>
                              {club.description.length > 90 
                                ? `${club.description.substring(0, 90)}...` 
                                : club.description
                              }
                            </p>
                          )}
                          
                          <div className="d-flex gap-2 mt-auto">
                            <Link to={`/club/${club._id}`} className="btn gaming-btn-view flex-grow-1 py-2">
                              <i className="fas fa-eye me-2"></i>
                              Voir profil
                            </Link>
                            {userRole !== 'Admin' && (
                              <button
                                className="btn gaming-btn-leave px-3"
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