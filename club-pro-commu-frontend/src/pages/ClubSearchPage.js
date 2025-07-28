import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { clubAPI } from '../services/api';
import Avatar from '../components/Avatar';

export default function ClubSearchPage() {
  const { user } = useAuth();
  const [clubs, setClubs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [userClub, setUserClub] = useState(null);
  const [filters, setFilters] = useState({
    pays: '',
    plateforme: '',
    niveau: '',
    recrute: ''
  });

  const loadClubs = useCallback(async () => {
    try {
      setLoading(true);
      const data = await clubAPI.getClubs(filters);
      setClubs(data);
      setError('');
    } catch (err) {
      setError('Erreur lors du chargement des clubs');
      console.error('Erreur chargement clubs:', err);
    } finally {
      setLoading(false);
    }
  }, [filters]);

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
    loadClubs();
    loadUserClub();
  }, [loadClubs, loadUserClub]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFilterSubmit = (e) => {
    e.preventDefault();
    loadClubs();
  };

  const handleJoinRequest = async (clubId, clubName) => {
    if (!user) {
      alert('Vous devez être connecté pour rejoindre un club');
      return;
    }

    if (userClub) {
      alert('Vous êtes déjà membre d\'un club. Vous devez le quitter avant de rejoindre un autre club.');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await clubAPI.joinClub(clubId, token);
      alert(`Demande d'adhésion envoyée au club ${clubName} !`);
      loadUserClub(); // Recharger le club de l'utilisateur
    } catch (err) {
      alert(err.message || 'Erreur lors de la demande d\'adhésion');
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

  const getStatusBadge = (status) => {
    const badges = {
      'Actif': 'bg-success',
      'Inactif': 'bg-secondary',
      'En construction': 'bg-warning'
    };
    return badges[status] || 'bg-secondary';
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
        </div>
      </div>
    );
  }

  return (
    <div className="container mt-4">
      <div className="row">
        <div className="col-lg-3">
          <div className="card shadow-lg border-0">
            <div className="card-header text-white" style={{background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'}}>
              <h5 className="mb-0">
                <i className="fas fa-filter me-2"></i>
                Filtres
              </h5>
            </div>
            <div className="card-body">
              <form onSubmit={handleFilterSubmit}>
                <div className="mb-3">
                  <label className="form-label fw-bold">
                    <i className="fas fa-flag me-1"></i>
                    Pays
                  </label>
                  <select
                    className="form-select"
                    name="pays"
                    value={filters.pays}
                    onChange={handleFilterChange}
                  >
                    <option value="">Tous les pays</option>
                    <option value="France">🇫🇷 France</option>
                    <option value="Espagne">🇪🇸 Espagne</option>
                    <option value="Angleterre">🇬🇧 Angleterre</option>
                    <option value="Allemagne">🇩🇪 Allemagne</option>
                    <option value="Italie">🇮🇹 Italie</option>
                    <option value="Portugal">🇵🇹 Portugal</option>
                    <option value="Pays-Bas">🇳🇱 Pays-Bas</option>
                  </select>
                </div>

                <div className="mb-3">
                  <label className="form-label fw-bold">
                    <i className="fas fa-gamepad me-1"></i>
                    Plateforme
                  </label>
                  <select
                    className="form-select"
                    name="plateforme"
                    value={filters.plateforme}
                    onChange={handleFilterChange}
                  >
                    <option value="">Toutes les plateformes</option>
                    <option value="PS5">PlayStation 5</option>
                    <option value="Xbox">Xbox</option>
                    <option value="PC">PC</option>
                  </select>
                </div>

                <div className="mb-3">
                  <label className="form-label fw-bold">
                    <i className="fas fa-trophy me-1"></i>
                    Niveau
                  </label>
                  <select
                    className="form-select"
                    name="niveau"
                    value={filters.niveau}
                    onChange={handleFilterChange}
                  >
                    <option value="">Tous les niveaux</option>
                    <option value="Débutant">🥉 Débutant</option>
                    <option value="Intermédiaire">🥈 Intermédiaire</option>
                    <option value="Avancé">🥇 Avancé</option>
                    <option value="Expert">👑 Expert</option>
                  </select>
                </div>

                <div className="mb-3">
                  <label className="form-label fw-bold">
                    <i className="fas fa-search me-1"></i>
                    Recrutement
                  </label>
                  <select
                    className="form-select"
                    name="recrute"
                    value={filters.recrute}
                    onChange={handleFilterChange}
                  >
                    <option value="">Tous</option>
                    <option value="true">Recrutent</option>
                    <option value="false">Ne recrutent pas</option>
                  </select>
                </div>

                <div className="d-grid">
                  <button type="submit" className="btn btn-primary">
                    <i className="fas fa-search me-1"></i>
                    Filtrer
                  </button>
                </div>
              </form>
            </div>
          </div>

          {userClub && (
            <div className="card shadow-lg border-0 mt-3">
              <div className="card-header text-white" style={{background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'}}>
                <h6 className="mb-0">
                  <i className="fas fa-info-circle me-2"></i>
                  Votre club
                </h6>
              </div>
              <div className="card-body">
                <div className="d-flex align-items-center mb-2">
                  <Avatar
                    src={userClub.photoProfil}
                    name={userClub.nom}
                    size="sm"
                    type="club"
                    className="me-2"
                  />
                  <div>
                    <strong>{userClub.nom}</strong>
                    <br />
                    <small className="text-muted">
                      {userClub.membres?.length || 0}/{userClub.effectifMax} membres
                    </small>
                  </div>
                </div>
                <Link to={`/club/${userClub._id}`} className="btn btn-outline-primary btn-sm w-100">
                  <i className="fas fa-eye me-1"></i>
                  Voir mon club
                </Link>
              </div>
            </div>
          )}
        </div>

        <div className="col-lg-9">
          <div className="card shadow-lg border-0">
            <div className="card-header text-white d-flex justify-content-between align-items-center" style={{background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'}}>
              <h5 className="mb-0">
                <i className="fas fa-shield-alt me-2"></i>
                Clubs disponibles ({clubs.length})
              </h5>
              <Link to="/creer-club" className="btn btn-light btn-sm">
                <i className="fas fa-plus me-1"></i>
                Créer un club
              </Link>
            </div>
            <div className="card-body">
              {clubs.length === 0 ? (
                <div className="text-center py-5">
                  <i className="fas fa-shield-alt fa-3x text-muted mb-3"></i>
                  <h5 className="text-muted">Aucun club trouvé</h5>
                  <p className="text-muted">Essayez de modifier vos filtres</p>
                </div>
              ) : (
                <div className="row">
                  {clubs.map((club) => (
                    <div key={club._id} className="col-md-6 col-lg-4 mb-4">
                      <div className="card h-100 shadow-sm border-0 hover-lift">
                        <div className="card-body text-center p-4">
                          <div className="mb-3">
                            <Avatar
                              src={club.photoProfil}
                              name={club.nom}
                              size="xl"
                              type="club"
                            />
                          </div>
                          
                          <h5 className="card-title mb-2">{club.nom}</h5>
                          
                          <div className="mb-3">
                            <span className="badge bg-primary me-1">
                              {getPlatformIcon(club.plateforme)} {club.plateforme}
                            </span>
                            <span className={`badge ${getStatusBadge(club.statut)} me-1`}>
                              {club.statut}
                            </span>
                            <span className="badge bg-info">
                              {club.pays}
                            </span>
                          </div>
                          
                          <div className="mb-3">
                            <small className="text-muted">
                              <i className="fas fa-users me-1"></i>
                              {club.membres?.length || 0}/{club.effectifMax} membres
                            </small>
                          </div>
                          
                          {club.description && (
                            <p className="card-text small text-muted mb-3">
                              {club.description.length > 100 
                                ? `${club.description.substring(0, 100)}...` 
                                : club.description
                              }
                            </p>
                          )}
                          
                          <div className="d-flex justify-content-between align-items-center">
                            <Link 
                              to={`/club/${club._id}`} 
                              className="btn btn-outline-primary btn-sm"
                            >
                              <i className="fas fa-eye me-1"></i>
                              Voir profil
                            </Link>
                            
                            {club.recrute && (
                              <button 
                                className="btn btn-success btn-sm"
                                onClick={() => handleJoinRequest(club._id, club.nom)}
                              >
                                <i className="fas fa-user-plus me-1"></i>
                                Rejoindre
                              </button>
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
  );
} 