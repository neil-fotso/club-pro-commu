import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { playerAPI } from '../services/api';
import Avatar from '../components/Avatar';
import { getCountryDisplay } from '../utils/countryUtils';
import { getPositionDisplay } from '../utils/positionUtils';

export default function PlayerSearchPage() {
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    postePrincipal: '',
    plateforme: '',
    rechercheClub: '',
    status: ''
  });

  const loadPlayers = useCallback(async () => {
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
  }, [filters]);

  useEffect(() => {
    loadPlayers();
  }, [loadPlayers]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFilterSubmit = (e) => {
    e.preventDefault();
    loadPlayers();
  };

  const handleInvite = (playerId, playerName) => {
    // Simulation d'invitation
    alert(`Invitation envoyée à ${playerName} !`);
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
                    <i className="fas fa-futbol me-1"></i>
                    Poste principal
                  </label>
                  <select
                    className="form-select"
                    name="postePrincipal"
                    value={filters.postePrincipal}
                    onChange={handleFilterChange}
                  >
                    <option value="">Tous les postes</option>
                    <optgroup label="⚽ Attaquants">
                      <option value="BU">⚽ Buteur (BU)</option>
                      <option value="AG">⚽ Ailier Gauche (AG)</option>
                      <option value="AD">⚽ Ailier Droit (AD)</option>
                    </optgroup>
                    <optgroup label="🎯 Milieux">
                      <option value="MOC">🎯 Milieu Offensif Central (MOC)</option>
                      <option value="MG">🎯 Milieu Gauche (MG)</option>
                      <option value="MD">🎯 Milieu Droit (MD)</option>
                      <option value="MC">🎯 Milieu Central (MC)</option>
                      <option value="MDC">🛡️ Milieu Défensif Central (MDC)</option>
                    </optgroup>
                    <optgroup label="🛡️ Défenseurs">
                      <option value="DD">🛡️ Défenseur Droit (DD)</option>
                      <option value="DG">🛡️ Défenseur Gauche (DG)</option>
                      <option value="DC">🛡️ Défenseur Central (DC)</option>
                      <option value="DLD">🛡️ Défenseur Latéral Droit (DLD)</option>
                      <option value="DLG">🛡️ Défenseur Latéral Gauche (DLG)</option>
                    </optgroup>
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
                    <i className="fas fa-search me-1"></i>
                    Recherche de club
                  </label>
                  <select
                    className="form-select"
                    name="rechercheClub"
                    value={filters.rechercheClub}
                    onChange={handleFilterChange}
                  >
                    <option value="">Tous</option>
                    <option value="true">Recherche un club</option>
                    <option value="false">Ne recherche pas</option>
                  </select>
                </div>

                <div className="mb-3">
                  <label className="form-label fw-bold">
                    <i className="fas fa-circle me-1"></i>
                    Statut de connexion
                  </label>
                  <select
                    className="form-select"
                    name="status"
                    value={filters.status}
                    onChange={handleFilterChange}
                  >
                    <option value="">Tous les statuts</option>
                    <option value="online">🟢 Connecté</option>
                    <option value="offline">🔴 Déconnecté</option>
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
        </div>

        <div className="col-lg-9">
          <div className="card shadow-lg border-0">
            <div className="card-header text-white d-flex justify-content-between align-items-center" style={{background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'}}>
              <h5 className="mb-0">
                <i className="fas fa-users me-2"></i>
                Joueurs disponibles ({players.length})
              </h5>
              <Link to="/mon-profil" className="btn btn-light btn-sm">
                <i className="fas fa-user-plus me-1"></i>
                Mon profil
              </Link>
            </div>
            <div className="card-body">
              {players.length === 0 ? (
                <div className="text-center py-5">
                  <i className="fas fa-users fa-3x text-muted mb-3"></i>
                  <h5 className="text-muted">Aucun joueur trouvé</h5>
                  <p className="text-muted">Essayez de modifier vos filtres</p>
                </div>
              ) : (
                <div className="row">
                  {players.map((player) => (
                    <div key={player._id} className="col-md-6 col-lg-4 mb-4">
                      <div className="card h-100 shadow-sm border-0 hover-lift">
                        <div className="card-body text-center p-4">
                          <div className="mb-3">
                            <Avatar
                              src={player.photoProfil}
                              name={player.pseudo}
                              size="xl"
                              type="player"
                            />
                          </div>
                          
                          <h5 className="card-title mb-2">
                            {player.pseudo}
                            <span className={`badge ms-2 ${player.isOnline ? 'bg-success' : 'bg-secondary'}`}>
                              {player.isOnline ? '🟢' : '🔴'} {player.isOnline ? 'Connecté' : 'Déconnecté'}
                            </span>
                          </h5>
                          
                          <div className="mb-3">
                            <span className="badge bg-primary me-1">
                              {getPositionDisplay(player.postePrincipal)}
                            </span>
                            <span className="badge bg-dark">
                              {player.plateforme}
                            </span>
                          </div>
                          
                          <div className="mb-3">
                            <small className="text-muted">
                              <i className="fas fa-map-marker-alt me-1"></i>
                              {player.pays ? getCountryDisplay(player.pays) : 'Pays non renseigné'} • {player.age ? `${player.age} ans` : 'Âge non renseigné'}
                            </small>
                          </div>
                          
                          {player.description && (
                            <p className="card-text small text-muted mb-3">
                              {player.description.length > 100 
                                ? `${player.description.substring(0, 100)}...` 
                                : player.description
                              }
                            </p>
                          )}
                          
                          <div className="d-flex justify-content-between align-items-center">
                            <Link 
                              to={`/joueur/${player._id}`} 
                              className="btn btn-outline-primary btn-sm"
                            >
                              <i className="fas fa-eye me-1"></i>
                              Voir profil
                            </Link>
                            
                            {player.rechercheClub && (
                              <button 
                                className="btn btn-success btn-sm"
                                onClick={() => handleInvite(player._id, player.pseudo)}
                              >
                                <i className="fas fa-user-plus me-1"></i>
                                Inviter
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