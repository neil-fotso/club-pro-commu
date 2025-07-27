import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { playerAPI } from '../services/api';

export default function PlayerSearchPage() {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [positionFilter, setPositionFilter] = useState('');
  const [platformFilter, setPlatformFilter] = useState('');
  const [onlyLooking, setOnlyLooking] = useState(false);
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadPlayers();
  }, []);

  const loadPlayers = async (filters = {}) => {
    try {
      setLoading(true);
      const data = await playerAPI.getPlayers(filters);
      setPlayers(data);
      setError('');
    } catch (err) {
      setError('Erreur lors du chargement des joueurs');
      console.error('Erreur chargement joueurs:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    const filters = {};
    if (searchTerm) filters.search = searchTerm;
    if (positionFilter) filters.poste = positionFilter;
    if (platformFilter) filters.plateforme = platformFilter;
    if (onlyLooking) filters.rechercheClub = 'true';
    
    loadPlayers(filters);
  };

  const handleInvite = async (playerId) => {
    if (!user) {
      alert('Vous devez être connecté pour inviter un joueur');
      return;
    }
    
    alert('Invitation envoyée au joueur !');
  };

  const getPositionIcon = (position) => {
    switch(position) {
      case 'Attaquant': return '⚽';
      case 'Milieu': return '🎯';
      case 'Défenseur': return '🛡️';
      case 'Gardien': return '🥅';
      default: return '👤';
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
                    <p className="text-white-90">Vous devez être connecté pour voir la liste des joueurs.</p>
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
          <h1 className="display-5 fw-bold mb-3">🔍 Rechercher un Joueur</h1>
          <p className="lead text-muted">Trouvez le joueur parfait pour votre équipe</p>
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
                  placeholder="Pseudo du joueur..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="col-lg-2">
                <label className="form-label fw-bold">
                  <i className="fas fa-user me-2"></i>
                  Poste
                </label>
                <select
                  className="form-select form-select-lg"
                  value={positionFilter}
                  onChange={(e) => setPositionFilter(e.target.value)}
                >
                  <option value="">Tous les postes</option>
                  <option value="Attaquant">⚽ Attaquant</option>
                  <option value="Milieu">🎯 Milieu</option>
                  <option value="Défenseur">🛡️ Défenseur</option>
                  <option value="Gardien">🥅 Gardien</option>
                </select>
              </div>
              <div className="col-lg-2">
                <label className="form-label fw-bold">
                  <i className="fas fa-gamepad me-2"></i>
                  Plateforme
                </label>
                <select
                  className="form-select form-select-lg"
                  value={platformFilter}
                  onChange={(e) => setPlatformFilter(e.target.value)}
                >
                  <option value="">Toutes</option>
                  <option value="PS5">🎮 PS5</option>
                  <option value="Xbox">🎮 Xbox</option>
                  <option value="PC">💻 PC</option>
                </select>
              </div>
              <div className="col-lg-2">
                <label className="form-label fw-bold">
                  <i className="fas fa-filter me-2"></i>
                  Statut
                </label>
                <div className="form-check mt-3">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id="onlyLooking"
                    checked={onlyLooking}
                    onChange={(e) => setOnlyLooking(e.target.checked)}
                  />
                  <label className="form-check-label" htmlFor="onlyLooking">
                    Recherche un club
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
            <p className="mt-3 text-muted">Chargement des joueurs...</p>
          </div>
        ) : (
          <>
            {/* Statistiques */}
            <div className="row mb-4">
              <div className="col-md-3">
                <div className="card border-0 shadow-sm text-center">
                  <div className="card-body">
                    <div className="h4 text-primary mb-1">{players.length}</div>
                    <small className="text-muted">Joueurs trouvés</small>
                  </div>
                </div>
              </div>
              <div className="col-md-3">
                <div className="card border-0 shadow-sm text-center">
                  <div className="card-body">
                    <div className="h4 text-success mb-1">
                      {players.filter(p => p.rechercheClub).length}
                    </div>
                    <small className="text-muted">Recherchent un club</small>
                  </div>
                </div>
              </div>
              <div className="col-md-3">
                <div className="card border-0 shadow-sm text-center">
                  <div className="card-body">
                    <div className="h4 text-info mb-1">
                      {players.filter(p => p.plateforme === 'PS5').length}
                    </div>
                    <small className="text-muted">Sur PS5</small>
                  </div>
                </div>
              </div>
              <div className="col-md-3">
                <div className="card border-0 shadow-sm text-center">
                  <div className="card-body">
                    <div className="h4 text-warning mb-1">
                      {players.filter(p => p.niveau === 'Expert').length}
                    </div>
                    <small className="text-muted">Niveau expert</small>
                  </div>
                </div>
              </div>
            </div>

            {/* Liste des joueurs */}
            {players.length === 0 ? (
              <div className="text-center py-5">
                <div className="mb-4" style={{fontSize: '4rem'}}>😕</div>
                <h3 className="text-muted">Aucun joueur trouvé</h3>
                <p className="text-muted">Essayez de modifier vos critères de recherche</p>
              </div>
            ) : (
              <div className="row g-4">
                {players.map((player) => (
                  <div key={player._id} className="col-lg-6 col-xl-4">
                    <div className="card border-0 shadow-sm hover-shadow h-100" 
                         style={{
                           background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                           color: 'white'
                         }}>
                      <div className="card-body p-4">
                        <div className="d-flex align-items-center mb-3">
                          <div className="bg-white bg-opacity-20 rounded-circle d-flex align-items-center justify-content-center me-3" style={{width: '50px', height: '50px'}}>
                            <span style={{fontSize: '1.5rem'}}>{getPositionIcon(player.postePrincipal)}</span>
                          </div>
                          <div className="flex-grow-1">
                            <h5 className="mb-1">
                              <Link to={`/joueur/${player._id}`} className="text-decoration-none text-white">
                                {player.pseudo}
                              </Link>
                            </h5>
                            <small className="text-white-75">
                              {getPlatformIcon(player.plateforme)} {player.plateforme} • {player.age} ans
                            </small>
                          </div>
                          <div className="text-end">
                            {player.rechercheClub ? (
                              <span className="badge bg-success">Recherche club</span>
                            ) : (
                              <span className="badge bg-secondary">Club trouvé</span>
                            )}
                          </div>
                        </div>
                        
                        <div className="row mb-3">
                          <div className="col-6">
                            <small className="text-white-75">Poste principal</small>
                            <div className="fw-bold">{player.postePrincipal}</div>
                          </div>
                          <div className="col-6">
                            <small className="text-white-75">Niveau</small>
                            <div className="fw-bold">{player.niveau}</div>
                          </div>
                        </div>
                        
                        <div className="row mb-3">
                          <div className="col-6">
                            <small className="text-white-75">Pays</small>
                            <div className="fw-bold">{player.pays}</div>
                          </div>
                          <div className="col-6">
                            <small className="text-white-75">Langues</small>
                            <div className="fw-bold">{player.langues?.join(', ') || 'Non spécifié'}</div>
                          </div>
                        </div>
                        
                        {player.description && (
                          <p className="text-white-90 mb-3" style={{fontSize: '0.9rem'}}>
                            {player.description}
                          </p>
                        )}
                        
                        <div className="d-flex gap-2">
                          <Link to={`/joueur/${player._id}`} className="btn btn-outline-light btn-sm flex-grow-1">
                            <i className="fas fa-eye me-1"></i>
                            Voir profil
                          </Link>
                          <button
                            className="btn btn-light btn-sm"
                            onClick={() => handleInvite(player._id)}
                          >
                            <i className="fas fa-user-plus me-1"></i>
                            Inviter
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
} 