import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { playerAPI } from '../services/api';

// Styles améliorés pour la page de recherche
const enhancedStyles = `
  /* Page container avec glassmorphism */
  .search-page-container {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    min-height: 100vh;
    padding: 2rem 0;
  }
  
  .search-content {
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
  
  /* Header amélioré */
  .search-header {
    text-align: center;
    margin-bottom: 3rem;
    animation: slideInDown 0.8s ease-out;
  }
  
  @keyframes slideInDown {
    0% {
      opacity: 0;
      transform: translateY(-30px);
    }
    100% {
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  .search-header h2 {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    font-size: 2.5rem;
    font-weight: 700;
    margin-bottom: 0.5rem;
  }
  
  /* Filtres améliorés */
  .filters-container {
    background: rgba(255, 255, 255, 0.8);
    backdrop-filter: blur(10px);
    border-radius: 15px;
    padding: 1.5rem;
    margin-bottom: 2rem;
    border: 1px solid rgba(255, 255, 255, 0.2);
    animation: slideInUp 0.8s ease-out 0.2s both;
  }
  
  @keyframes slideInUp {
    0% {
      opacity: 0;
      transform: translateY(30px);
    }
    100% {
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  .filter-input {
    border: 2px solid transparent;
    border-radius: 10px;
    transition: all 0.3s ease;
    background: rgba(255, 255, 255, 0.9);
  }
  
  .filter-input:focus {
    border-color: #667eea;
    box-shadow: 0 0 0 0.2rem rgba(102, 126, 234, 0.25);
    transform: translateY(-2px);
  }
  
  .filter-btn {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border: none;
    border-radius: 25px;
    padding: 0.75rem 1.5rem;
    color: white;
    font-weight: 600;
    transition: all 0.3s ease;
    box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
  }
  
  .filter-btn:hover {
    transform: translateY(-3px);
    box-shadow: 0 8px 25px rgba(102, 126, 234, 0.4);
  }
  
  /* Cartes de joueurs améliorées */
  .player-card {
    transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    border-radius: 20px;
    border: 2px solid transparent;
    background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
    overflow: hidden;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
    animation: cardEntrance 0.8s cubic-bezier(0.4, 0, 0.2, 1);
    position: relative;
  }
  
  .player-card::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
    transform: scaleX(0);
    transition: transform 0.3s ease;
  }
  
  .player-card:hover::before {
    transform: scaleX(1);
  }
  
  .player-card:hover {
    transform: translateY(-12px) scale(1.02);
    box-shadow: 0 25px 50px rgba(0, 0, 0, 0.15);
    border-color: #667eea;
    background: linear-gradient(135deg, #ffffff 0%, #e8f2ff 100%);
  }
  
  @keyframes cardEntrance {
    0% {
      opacity: 0;
      transform: translateY(40px) scale(0.9) rotateX(10deg);
    }
    100% {
      opacity: 1;
      transform: translateY(0) scale(1) rotateX(0deg);
    }
  }
  
  .player-card:nth-child(1) { animation-delay: 0.1s; }
  .player-card:nth-child(2) { animation-delay: 0.2s; }
  .player-card:nth-child(3) { animation-delay: 0.3s; }
  .player-card:nth-child(4) { animation-delay: 0.4s; }
  .player-card:nth-child(5) { animation-delay: 0.5s; }
  .player-card:nth-child(6) { animation-delay: 0.6s; }
  
  .player-card .card-header {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    border: none;
    padding: 1.5rem;
    position: relative;
    overflow: hidden;
  }
  
  .player-card .card-header::before {
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
  
  .player-card .stats-grid {
    margin: 1.5rem 0;
  }
  
  .player-card .stat-item {
    text-align: center;
    padding: 1rem;
    background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
    border-radius: 12px;
    transition: all 0.3s ease;
    max-width: 140px;
    margin: 0 auto;
    border: 1px solid rgba(0,0,0,0.05);
  }
  
  .player-card:hover .stat-item {
    background: linear-gradient(135deg, #e8f2ff 0%, #d1e7ff 100%);
    transform: scale(1.08);
    box-shadow: 0 8px 20px rgba(102, 126, 234, 0.2);
  }
  
  .player-card .badge {
    font-size: 0.75rem;
    padding: 0.6rem 1rem;
    border-radius: 25px;
    font-weight: 600;
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  }
  
  .player-card .player-info {
    display: flex;
    align-items: center;
    gap: 1.2rem;
    margin-bottom: 1rem;
    position: relative;
    z-index: 1;
  }
  
  .avatar-default {
    width: 60px;
    height: 60px;
    border-radius: 50%;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    border: 3px solid rgba(255, 255, 255, 0.3);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
    transition: all 0.3s ease;
  }
  
  .avatar-default i {
    font-size: 1.5rem;
    color: white;
  }
  
  .player-card:hover .avatar-default {
    transform: scale(1.1);
    box-shadow: 0 12px 35px rgba(0, 0, 0, 0.2);
  }
  
  .player-card .player-details {
    flex-grow: 1;
  }
  
  .player-card .btn-view {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border: none;
    color: white;
    border-radius: 30px;
    padding: 0.75rem 2rem;
    font-weight: 600;
    transition: all 0.3s ease;
    box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
  }
  
  .player-card .btn-view:hover {
    transform: translateY(-3px);
    box-shadow: 0 8px 25px rgba(102, 126, 234, 0.4);
  }
  
  /* Loading animation */
  .loading-container {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 300px;
  }
  
  .loading-spinner {
    width: 50px;
    height: 50px;
    border: 4px solid #f3f3f3;
    border-top: 4px solid #667eea;
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
  
  /* Responsive improvements */
  @media (max-width: 768px) {
    .search-content {
      padding: 1rem;
      margin: 1rem;
    }
    
    .search-header h2 {
      font-size: 2rem;
    }
    
    .filters-container {
      padding: 1rem;
    }
  }
`;

const PlayerSearchPage = () => {
  // const { user: authUser } = useAuth(); // Variable non utilisée pour le moment
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [, setError] = useState(null);
  const [pagination, setPagination] = useState({});
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  
  // Filtres avancés
  const [filters, setFilters] = useState({
    pseudo: '',
    pays: '',
    plateforme: '',
    position: '',
    niveau: '',
    disponibilite: '',
    ageMin: '',
    ageMax: '',
    experienceMin: '',
    experienceMax: '',
    matchsMin: '',
    winRateMin: '',
    langue: ''
  });
  
  const [sortBy] = useState('derniereActivite');
  const [sortOrder] = useState('desc');
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const fetchPlayers = async () => {
      try {
        setLoading(true);
        const params = new URLSearchParams({
          page: currentPage,
          limit: 20,
          tri: sortBy,
          ordre: sortOrder,
          ...filters
        });

        const response = await playerAPI.searchPlayers(params);
        setPlayers(response.players);
        setPagination(response.pagination);
        setError(null);
      } catch (err) {
        setError('Erreur lors du chargement des joueurs');
        console.error('Erreur recherche joueurs:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPlayers();
  }, [filters, sortBy, sortOrder, currentPage]);

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({ ...prev, [field]: value }));
    setCurrentPage(1); // Reset à la première page
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

  if (loading && players.length === 0) {
    return (
      <div className="search-page-container">
        <style>{enhancedStyles}</style>
        <div className="container">
          <div className="search-content">
            <div className="loading-container">
              <div className="loading-spinner"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="search-page-container">
      <style>{enhancedStyles}</style>
      <div className="container">
        <div className="search-content">
          {/* Header amélioré */}
          <div className="search-header">
            <h2>
              <i className="fas fa-users me-3"></i>
              Recherche de Joueurs
            </h2>
            <p className="lead text-muted">Trouve des joueurs pour rejoindre ton équipe</p>
          </div>

          {/* Filtres améliorés */}
          <div className="filters-container">
            <h5 className="mb-3">
              <i className="fas fa-filter me-2"></i>
              Critères de recherche
            </h5>
            {/* Critères de base */}
            <div className="row g-3">
              <div className="col-md-6">
                <label className="form-label">Pseudo</label>
                <input
                  type="text"
                  className="form-control"
                  value={filters.pseudo}
                  onChange={(e) => handleFilterChange('pseudo', e.target.value)}
                  placeholder="Rechercher par pseudo..."
                />
              </div>
              <div className="col-md-6">
                <label className="form-label">Plateforme</label>
                <select
                  className="form-select"
                  value={filters.plateforme}
                  onChange={(e) => handleFilterChange('plateforme', e.target.value)}
                >
                  <option value="">Toutes les plateformes</option>
                  <option value="PC">PC</option>
                  <option value="PS5">PS5</option>
                  <option value="Xbox">Xbox</option>
                </select>
              </div>
            </div>
            {/* Bouton pour afficher/masquer les critères avancés */}
            <div className="row mt-3">
              <div className="col">
                <button
                  type="button"
                  className="btn filter-btn"
                  onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                >
                  <i className={`fas fa-chevron-${showAdvancedFilters ? 'up' : 'down'} me-2`}></i>
                  {showAdvancedFilters ? 'Masquer' : 'Afficher'} les critères avancés
                </button>
              </div>
            </div>
            {/* Critères avancés (masqués par défaut) */}
            {showAdvancedFilters && (
              <div className="mt-4">
                <h6 className="mb-3">
                  <i className="fas fa-cogs me-2"></i>
                  Critères avancés
                </h6>
                <div className="row g-3">
                  <div className="col-md-3">
                    <label className="form-label">Pays</label>
                    <input
                      type="text"
                      className="form-control"
                      value={filters.pays}
                      onChange={(e) => handleFilterChange('pays', e.target.value)}
                      placeholder="France, Belgique..."
                    />
                  </div>
                  <div className="col-md-3">
                    <label className="form-label">Position</label>
                    <select
                      className="form-select"
                      value={filters.position}
                      onChange={(e) => handleFilterChange('position', e.target.value)}
                    >
                      <option value="">Toutes les positions</option>
                      <option value="Attaquant">Attaquant</option>
                      <option value="Milieu">Milieu</option>
                      <option value="Défenseur">Défenseur</option>
                      <option value="Gardien">Gardien</option>
                      <option value="Polyvalent">Polyvalent</option>
                    </select>
                  </div>
                  <div className="col-md-3">
                    <label className="form-label">Niveau</label>
                    <select
                      className="form-select"
                      value={filters.niveau}
                      onChange={(e) => handleFilterChange('niveau', e.target.value)}
                    >
                      <option value="">Tous les niveaux</option>
                      <option value="Débutant">Débutant</option>
                      <option value="Intermédiaire">Intermédiaire</option>
                      <option value="Avancé">Avancé</option>
                      <option value="Expert">Expert</option>
                      <option value="Pro">Pro</option>
                    </select>
                  </div>
                  <div className="col-md-3">
                    <label className="form-label">Disponibilité</label>
                    <select
                      className="form-select"
                      value={filters.disponibilite}
                      onChange={(e) => handleFilterChange('disponibilite', e.target.value)}
                    >
                      <option value="">Toutes</option>
                      <option value="Disponible">Disponible</option>
                      <option value="Occupé">Occupé</option>
                      <option value="Absent">Absent</option>
                      <option value="Recherche équipe">Recherche équipe</option>
                    </select>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Liste des joueurs */}
          <div className="row">
            {players.map((player) => (
              <div key={player._id} className="col-md-6 col-lg-4 mb-4">
                <div className="card h-100 player-card">
                  <div className="card-header">
                    <div className="player-info">
                      <div className="avatar-default">
                        <i className="fas fa-user"></i>
                      </div>
                      <div className="player-details">
                        <h5 className="mb-1 text-white">
                          <Link to={`/player/${player._id}`} className="text-white text-decoration-none">
                            {player.pseudo}
                          </Link>
                        </h5>
                        <div className="d-flex gap-2">
                          <span className={`badge bg-${getDisponibiliteColor(player.disponibilite)}`}>
                            {player.disponibilite}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="card-body">
                    <div className="row mb-3">
                      <div className="col-6">
                        <small className="text-muted d-block">
                          <i className="fas fa-futbol me-1"></i>Position
                        </small>
                        <strong>{player.position || 'Non renseigné'}</strong>
                      </div>
                      <div className="col-6">
                        <small className="text-muted d-block">
                          <i className="fas fa-gamepad me-1"></i>Plateforme
                        </small>
                        <strong>{player.plateforme}</strong>
                      </div>
                    </div>
                    <div className="d-flex justify-content-between align-items-center">
                      <small className="text-muted">
                        <i className="fas fa-map-marker-alt me-1"></i>
                        {player.pays || 'Non renseigné'}
                        {player.ville && `, ${player.ville}`}
                      </small>
                      <Link 
                        to={`/player/${player._id}`}
                        className="btn btn-view"
                      >
                        <i className="fas fa-eye me-1"></i>
                        Voir profil
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <nav aria-label="Pagination des joueurs">
              <ul className="pagination justify-content-center">
                <li className={`page-item ${!pagination.hasPrev ? 'disabled' : ''}`}>
                  <button
                    className="page-link"
                    onClick={() => setCurrentPage(currentPage - 1)}
                    disabled={!pagination.hasPrev}
                  >
                    Précédent
                  </button>
                </li>
                {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                  const page = i + 1;
                  return (
                    <li key={page} className={`page-item ${currentPage === page ? 'active' : ''}`}>
                      <button
                        className="page-link"
                        onClick={() => setCurrentPage(page)}
                      >
                        {page}
                      </button>
                    </li>
                  );
                })}
                <li className={`page-item ${!pagination.hasNext ? 'disabled' : ''}`}>
                  <button
                    className="page-link"
                    onClick={() => setCurrentPage(currentPage + 1)}
                    disabled={!pagination.hasNext}
                  >
                    Suivant
                  </button>
                </li>
              </ul>
            </nav>
          )}

          {players.length === 0 && !loading && (
            <div className="text-center py-5">
              <i className="fas fa-users fa-3x text-muted mb-3"></i>
              <h5 className="text-muted">Aucun joueur trouvé</h5>
              <p className="text-muted">Essaie de modifier tes critères de recherche</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PlayerSearchPage; 