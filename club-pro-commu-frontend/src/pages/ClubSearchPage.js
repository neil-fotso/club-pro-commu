import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { clubAPI } from '../services/api';

export default function ClubSearchPage() {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [platformFilter, setPlatformFilter] = useState('');
  const [onlyRecruiting, setOnlyRecruiting] = useState(false);
  const [clubs, setClubs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [userClub, setUserClub] = useState(null);

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

  const loadClubs = async (filters = {}) => {
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
  };

  useEffect(() => {
    loadClubs();
    loadUserClub();
  }, [loadUserClub]);

  const handleSearch = () => {
    const filters = {};
    if (searchTerm) filters.search = searchTerm;
    if (platformFilter) filters.plateforme = platformFilter;
    if (onlyRecruiting) filters.recrute = 'true';
    
    loadClubs(filters);
  };

  const handleJoinRequest = async (clubId) => {
    if (!user) {
      alert('Vous devez être connecté pour demander à rejoindre un club');
      return;
    }

    // Vérifier si l'utilisateur est déjà membre d'un autre club
    if (userClub && userClub._id !== clubId) {
      alert(`Vous êtes déjà membre du club "${userClub.nom}". Vous devez d'abord quitter ce club avant de rejoindre un autre.`);
      return;
    }
    
    alert('Demande envoyée au club !');
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

  const getRecruitmentStatus = (recrute, effectifActuel, effectifMax) => {
    if (!recrute) return { text: 'Complet', color: 'secondary' };
    if (effectifActuel >= effectifMax) return { text: 'Complet', color: 'secondary' };
    return { text: 'Recrute', color: 'success' };
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
                    <p className="text-white-90">Vous devez être connecté pour voir la liste des clubs.</p>
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
          <h1 className="display-5 fw-bold mb-3">🏆 Rechercher un Club</h1>
          <p className="lead text-muted">Trouvez le club parfait pour votre carrière FIFA Pro Clubs</p>
          
          {userClub && (
            <div className="alert alert-info border-0 bg-info bg-opacity-10 mt-3">
              <i className="fas fa-info-circle me-2"></i>
              Vous êtes actuellement membre du club <strong>"{userClub.nom}"</strong>
            </div>
          )}
        </div>
        
        {/* Filtres */}
        <div className="card border-0 shadow-lg mb-5" 
             style={{
               background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
               color: 'white'
             }}>
          <div className="card-body p-4">
            <div className="row g-3">
              <div className="col-lg-4">
                <label className="form-label fw-bold">
                  <i className="fas fa-search me-2"></i>
                  Recherche
                </label>
                <input
                  type="text"
                  className="form-control form-control-lg"
                  placeholder="Nom du club..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="col-lg-3">
                <label className="form-label fw-bold">
                  <i className="fas fa-gamepad me-2"></i>
                  Plateforme
                </label>
                <select
                  className="form-select form-select-lg"
                  value={platformFilter}
                  onChange={(e) => setPlatformFilter(e.target.value)}
                >
                  <option value="">Toutes les plateformes</option>
                  <option value="PS5">🎮 PlayStation 5</option>
                  <option value="Xbox">🎮 Xbox Series X/S</option>
                  <option value="PC">💻 PC</option>
                </select>
              </div>
              <div className="col-lg-3">
                <label className="form-label fw-bold">
                  <i className="fas fa-filter me-2"></i>
                  Statut
                </label>
                <div className="form-check mt-3">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id="onlyRecruiting"
                    checked={onlyRecruiting}
                    onChange={(e) => setOnlyRecruiting(e.target.checked)}
                  />
                  <label className="form-check-label" htmlFor="onlyRecruiting">
                    Recrute des joueurs
                  </label>
                </div>
              </div>
              <div className="col-lg-2">
                <label className="form-label fw-bold">
                  <i className="fas fa-search me-2"></i>
                  Action
                </label>
                <button className="btn btn-light btn-lg w-100" onClick={handleSearch}>
                  <i className="fas fa-search me-2"></i>
                  Rechercher
                </button>
              </div>
            </div>
          </div>
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
            <p className="mt-3 text-muted">Chargement des clubs...</p>
          </div>
        ) : (
          <>
            {/* Statistiques */}
            <div className="row mb-4">
              <div className="col-md-3">
                <div className="card border-0 shadow-sm text-center">
                  <div className="card-body">
                    <div className="h4 text-primary mb-1">{clubs.length}</div>
                    <small className="text-muted">Clubs trouvés</small>
                  </div>
                </div>
              </div>
              <div className="col-md-3">
                <div className="card border-0 shadow-sm text-center">
                  <div className="card-body">
                    <div className="h4 text-success mb-1">
                      {clubs.filter(c => c.recrute && c.effectifActuel < c.effectifMax).length}
                    </div>
                    <small className="text-muted">Recrutent</small>
                  </div>
                </div>
              </div>
              <div className="col-md-3">
                <div className="card border-0 shadow-sm text-center">
                  <div className="card-body">
                    <div className="h4 text-info mb-1">
                      {clubs.filter(c => c.plateforme === 'PS5').length}
                    </div>
                    <small className="text-muted">Sur PS5</small>
                  </div>
                </div>
              </div>
              <div className="col-md-3">
                <div className="card border-0 shadow-sm text-center">
                  <div className="card-body">
                    <div className="h4 text-warning mb-1">
                      {clubs.filter(c => c.statut === 'Actif').length}
                    </div>
                    <small className="text-muted">Clubs actifs</small>
                  </div>
                </div>
              </div>
            </div>

            {/* Liste des clubs */}
            {clubs.length === 0 ? (
              <div className="text-center py-5">
                <div className="mb-4" style={{fontSize: '4rem'}}>🏆</div>
                <h3 className="text-muted">Aucun club trouvé</h3>
                <p className="text-muted">Essayez de modifier vos critères de recherche</p>
              </div>
            ) : (
              <div className="row g-4">
                {clubs.map((club) => {
                  const recruitmentStatus = getRecruitmentStatus(club.recrute, club.effectifActuel, club.effectifMax);
                  return (
                    <div key={club._id} className="col-lg-6 col-xl-4">
                      <div className="card border-0 shadow-sm hover-shadow h-100" 
                           style={{
                             background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                             color: 'white'
                           }}>
                        <div className="card-body p-4">
                          <div className="d-flex align-items-center mb-3">
                            <div className="bg-white bg-opacity-20 rounded-circle d-flex align-items-center justify-content-center me-3" style={{width: '50px', height: '50px'}}>
                              <i className="fas fa-shield-alt text-white" style={{fontSize: '1.5rem'}}></i>
                            </div>
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
                              <small className="text-white-75">Recrutement</small>
                              <div className="fw-bold">
                                <span className={`badge bg-${recruitmentStatus.color}`}>
                                  {recruitmentStatus.text}
                                </span>
                              </div>
                            </div>
                          </div>
                          
                          <div className="row mb-3">
                            <div className="col-6">
                              <small className="text-white-75">Pays</small>
                              <div className="fw-bold">{club.pays}</div>
                            </div>
                            <div className="col-6">
                              <small className="text-white-75">Langues</small>
                              <div className="fw-bold">{club.langues?.join(', ') || 'Non spécifié'}</div>
                            </div>
                          </div>
                          
                          {club.description && (
                            <p className="text-white-90 mb-3" style={{fontSize: '0.9rem'}}>
                              {club.description}
                            </p>
                          )}
                          
                          <div className="d-flex gap-2">
                            <Link to={`/club/${club._id}`} className="btn btn-outline-light btn-sm flex-grow-1">
                              <i className="fas fa-eye me-1"></i>
                              Voir profil
                            </Link>
                            {recruitmentStatus.color === 'success' && (
                              userClub ? (
                                userClub._id === club._id ? (
                                  <span className="badge bg-success">Déjà membre</span>
                                ) : (
                                  <button
                                    className="btn btn-outline-warning btn-sm"
                                    onClick={() => handleJoinRequest(club._id)}
                                    title={`Vous êtes déjà membre de ${userClub.nom}`}
                                  >
                                    <i className="fas fa-exclamation-triangle"></i>
                                  </button>
                                )
                              ) : (
                                <button
                                  className="btn btn-light btn-sm"
                                  onClick={() => handleJoinRequest(club._id)}
                                >
                                  <i className="fas fa-user-plus me-1"></i>
                                  Rejoindre
                                </button>
                              )
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