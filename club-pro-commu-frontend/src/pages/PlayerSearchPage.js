import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { playerAPI } from '../services/api';
import { getAllCountries } from '../utils/countryUtils';
import Avatar from '../components/Avatar';

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
  
  /* Options de tri */
  .sorting-options {
    background: rgba(255, 255, 255, 0.8);
    border-radius: 15px;
    padding: 1rem;
    margin-bottom: 1.5rem;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  }
  
  .sorting-options .btn-group .btn {
    border-radius: 8px;
    margin: 0 2px;
    font-size: 0.9rem;
    padding: 0.5rem 0.75rem;
    transition: all 0.3s ease;
  }
  
  .sorting-options .btn:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
  }
  
  /* Cartes de joueurs uniformisées avec les clubs */
  .club-card {
    background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
    border-radius: 20px;
    padding: 1.5rem;
    margin-bottom: 1.5rem;
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
    transition: all 0.3s ease;
    border: 2px solid transparent;
    position: relative;
    overflow: hidden;
  }
  
  .club-card::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(102, 126, 234, 0.05), transparent);
    transition: left 0.5s ease;
  }
  
  .club-card:hover::before {
    left: 100%;
  }
  
  .club-card:hover {
    transform: translateY(-8px) scale(1.02);
    box-shadow: 0 15px 40px rgba(102, 126, 234, 0.15);
    border-color: #667eea;
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
  
  .club-header {
    display: flex;
    align-items: center;
    margin-bottom: 1rem;
  }
  
  .club-avatar {
    width: 60px;
    height: 60px;
    border-radius: 50%;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    margin-right: 1rem;
    color: white;
    font-size: 1.5rem;
  }
  
  .club-info h5 {
    margin: 0;
    font-weight: 600;
    color: #333;
  }
  
  .club-info h5 a {
    color: #333;
    text-decoration: none;
    transition: color 0.3s ease;
  }
  
  .club-info h5 a:hover {
    color: #667eea;
  }
  
  .club-badges {
    margin-top: 0.5rem;
  }
  
  .club-badges .badge {
    font-size: 0.8rem;
    padding: 0.4rem 0.8rem;
    border-radius: 20px;
  }
  
  .club-details {
    font-size: 0.9rem;
    color: #666;
  }
  
  .club-details div {
    margin-bottom: 0.5rem;
  }
  
  .club-details strong {
    color: #333;
  }
  
  .club-actions {
    margin-top: 1rem;
  }
  
  .btn-view {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    border: none;
    padding: 0.75rem 1.5rem;
    border-radius: 25px;
    text-decoration: none;
    display: inline-block;
    font-weight: 600;
    transition: all 0.3s ease;
    box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
  }
  
  .btn-view:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(102, 126, 234, 0.4);
    color: white;
    text-decoration: none;
  }
  

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
  
  /* Optimisations mobile avancées */
  @media (max-width: 768px) {
    .search-page-container {
      padding: 1rem 0;
    }
    
    .search-content {
      padding: 1rem;
      margin: 0 1rem;
      border-radius: 12px;
    }
    
    .search-header {
      margin-bottom: 2rem;
    }
    
    .search-header h2 {
      font-size: 1.6rem;
      margin-bottom: 0.5rem;
    }
    
    .search-header .lead {
      font-size: 0.9rem;
    }
    
    .filters-container {
      padding: 1rem;
      margin-bottom: 2rem;
    }
    
    .filters-container h5 {
      font-size: 1rem;
      margin-bottom: 1rem;
    }
    
    /* Cartes optimisées pour mobile */
    .player-card {
      margin-bottom: 1rem;
      border-radius: 12px;
    }
    
    .player-card .card-header {
      padding: 0.75rem;
    }
    
    .player-info {
      gap: 0.75rem;
      margin-bottom: 0;
    }
    
    .avatar-default {
      width: 40px;
      height: 40px;
    }
    
    .avatar-default i {
      font-size: 1.1rem;
    }
    
    .player-details h5 {
      font-size: 1rem;
      margin-bottom: 0.5rem;
    }
    
    .player-details .badge {
      font-size: 0.7rem;
      padding: 0.25rem 0.5rem;
    }
    
    .player-card .card-body {
      padding: 1rem;
    }
    
    /* Layout mobile : infos à gauche, bouton à droite */
    .player-card .card-body .mobile-layout {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 1rem;
    }
    
    .player-card .card-body .mobile-info {
      flex: 1;
    }
    
    .player-card .card-body .mobile-info .row {
      margin-bottom: 0.75rem;
    }
    
    .player-card .card-body .mobile-info .col-6 {
      margin-bottom: 0.5rem;
    }
    
    .player-card .card-body .mobile-info small {
      font-size: 0.75rem;
    }
    
    .player-card .card-body .mobile-info strong {
      font-size: 0.85rem;
    }
    
    .player-card .card-body .mobile-button {
      flex-shrink: 0;
    }
    
    .btn-view {
      padding: 0.5rem 1rem;
      font-size: 0.8rem;
      border-radius: 20px;
      white-space: nowrap;
    }
    
      /* Pagination améliorée */
  .pagination-container {
    margin-top: 3rem;
    padding: 2rem 0;
    background: rgba(255, 255, 255, 0.8);
    backdrop-filter: blur(10px);
    border-radius: 15px;
    border: 1px solid rgba(255, 255, 255, 0.2);
  }
  
  .pagination {
    margin-top: 1rem;
  }
  
  .pagination .page-link {
    padding: 0.75rem 1rem;
    font-size: 0.9rem;
    border: 2px solid transparent;
    border-radius: 10px;
    margin: 0 0.25rem;
    transition: all 0.3s ease;
    background: rgba(255, 255, 255, 0.9);
    color: #667eea;
    font-weight: 600;
  }
  
  .pagination .page-link:hover {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    transform: translateY(-2px);
    box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
  }
  
  .pagination .page-item.active .page-link {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border-color: #667eea;
    color: white;
    box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
  }
  
  .pagination .page-item.disabled .page-link {
    background: rgba(255, 255, 255, 0.5);
    color: #6c757d;
    cursor: not-allowed;
  }
  
      /* Pagination mobile */
    .pagination-container {
      margin-top: 2rem;
      padding: 1rem 0;
    }
    
    .pagination {
      margin-top: 1rem;
    }
    
    .pagination .page-link {
      padding: 0.5rem 0.75rem;
      font-size: 0.85rem;
      margin: 0 0.1rem;
    }
    
    /* Masquer certaines pages sur mobile pour économiser l'espace */
    @media (max-width: 576px) {
      .pagination .page-item:not(.active):not(:first-child):not(:last-child):not(:nth-child(2)):not(:nth-last-child(2)) {
        display: none;
      }
    }
    
    /* Filtres mobile */
    .filter-btn {
      width: 100%;
      margin-top: 1rem;
      font-size: 0.9rem;
      padding: 0.75rem 1rem;
    }
    
    /* Grille mobile optimisée */
    .col-md-6.col-lg-4 {
      padding: 0 0.5rem;
    }
    
    /* Espacement amélioré */
    .mb-4 {
      margin-bottom: 1rem !important;
    }
    
    /* Réduction de la hauteur des cartes */
    .player-card {
      min-height: auto;
    }
    
    /* Optimisation des statistiques */
    .stat-item {
      padding: 0.5rem;
      margin: 0.25rem;
      font-size: 0.75rem;
    }
    
    .stat-item .stat-value {
      font-size: 0.9rem;
    }
    
    .stat-item .stat-label {
      font-size: 0.65rem;
    }
  }
  
  /* Optimisations pour très petits écrans */
  @media (max-width: 480px) {
    .search-content {
      padding: 0.75rem;
      margin: 0 0.5rem;
    }
    
    .search-header h2 {
      font-size: 1.4rem;
    }
    
    .player-card .card-header {
      padding: 0.5rem;
    }
    
    .avatar-default {
      width: 35px;
      height: 35px;
    }
    
    .avatar-default i {
      font-size: 1rem;
    }
    
    .player-details h5 {
      font-size: 0.9rem;
    }
    
    .player-card .card-body {
      padding: 0.75rem;
    }
    
    /* Layout mobile optimisé pour petits écrans */
    .player-card .card-body .mobile-layout {
      gap: 0.75rem;
    }
    
    .player-card .card-body .mobile-info .row {
      margin-bottom: 0.5rem;
    }
    
    .player-card .card-body .mobile-info .col-6 {
      margin-bottom: 0.25rem;
    }
    
    .player-card .card-body .mobile-info small {
      font-size: 0.7rem;
    }
    
    .player-card .card-body .mobile-info strong {
      font-size: 0.8rem;
    }
    
    .btn-view {
      padding: 0.4rem 0.8rem;
      font-size: 0.75rem;
    }
    
    /* Grille optimisée */
    .col-md-6.col-lg-4 {
      padding: 0 0.25rem;
    }
    
    .mb-4 {
      margin-bottom: 0.75rem !important;
    }
    
    /* Espacement des filtres */
    .filters-container {
      padding: 0.75rem;
      margin-bottom: 1.5rem;
    }
    
    .filter-btn {
      font-size: 0.85rem;
      padding: 0.6rem 1rem;
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

  // Liste des pays pour la liste déroulante (même que l'inscription)
  const paysList = getAllCountries();
  
  // Filtres avancés
  const [filters, setFilters] = useState({
    pseudo: '',
    pseudoPlateforme: '',
    pays: '',
    plateforme: '',
    position: '',

    disponibilite: '',
    ageMin: '',
    ageMax: '',
    experienceMin: '',
    experienceMax: '',
    matchsMin: '',
    winRateMin: '',
    langue: ''
  });
  
  const [sortBy, setSortBy] = useState('pseudo');
  const [sortOrder, setSortOrder] = useState('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTrigger, setSearchTrigger] = useState(0);

  useEffect(() => {
    const fetchPlayers = async () => {
      try {
        setLoading(true);
        const params = new URLSearchParams({
          page: currentPage,
          limit: 9,
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

    // Charger les joueurs au montage du composant et quand searchTrigger change
    fetchPlayers();
  }, [searchTrigger, sortBy, sortOrder, currentPage, filters]);

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({ ...prev, [field]: value }));
    // Ne pas déclencher la recherche automatiquement
  };

  const handleSearch = () => {
    setCurrentPage(1);
    setSearchTrigger(prev => prev + 1);
  };

  const handleSortChange = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
    setCurrentPage(1);
  };



  const getDisponibiliteColor = (disponibilite) => {
    const colors = {
      'Disponible': 'success',
      'Indisponible': 'danger'
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
              <div className="col-md-4 col-12">
                <label className="form-label">Pseudo</label>
                <input
                  type="text"
                  className="form-control"
                  value={filters.pseudo}
                  onChange={(e) => handleFilterChange('pseudo', e.target.value)}
                  placeholder="Rechercher par pseudo..."
                />
              </div>
              <div className="col-md-4 col-12">
                <label className="form-label">Pseudo de plateforme</label>
                <input
                  type="text"
                  className="form-control"
                  value={filters.pseudoPlateforme}
                  onChange={(e) => handleFilterChange('pseudoPlateforme', e.target.value)}
                  placeholder="Rechercher par pseudo de plateforme..."
                />
              </div>
              <div className="col-md-4 col-12">
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
                  <div className="col-md-3 col-6">
                    <label className="form-label">Pays</label>
                    <select
                      className="form-select"
                      value={filters.pays}
                      onChange={(e) => handleFilterChange('pays', e.target.value)}
                    >
                      <option value="">Tous les pays</option>
                      {paysList.map((pays, index) => (
                        <option key={index} value={pays.name}>
                          {pays.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="col-md-3 col-6">
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

                  <div className="col-md-3 col-6">
                    <label className="form-label">Disponibilité</label>
                    <select
                      className="form-select"
                      value={filters.disponibilite}
                      onChange={(e) => handleFilterChange('disponibilite', e.target.value)}
                    >
                      <option value="">Toutes</option>
                      <option value="Disponible">Disponible</option>
                      <option value="Indisponible">Indisponible</option>
                    </select>
                  </div>
                </div>
              </div>
            )}
            

          </div>

          {/* Options de tri */}
          <div className="row mb-4">
            <div className="col-12">
              <div className="d-flex justify-content-between align-items-center">
                <h6 className="mb-0">
                  <i className="fas fa-sort me-2"></i>
                  Trier par :
                </h6>
                <div className="btn-group" role="group">
                  <button
                    type="button"
                    className={`btn btn-sm ${sortBy === 'pseudo' ? 'btn-primary' : 'btn-outline-primary'}`}
                    onClick={() => handleSortChange('pseudo')}
                  >
                    <i className="fas fa-user me-1"></i>
                    Nom
                    {sortBy === 'pseudo' && (
                      <i className={`fas fa-sort-${sortOrder === 'asc' ? 'up' : 'down'} ms-1`}></i>
                    )}
                  </button>
                  <button
                    type="button"
                    className={`btn btn-sm ${sortBy === 'derniereActivite' ? 'btn-primary' : 'btn-outline-primary'}`}
                    onClick={() => handleSortChange('derniereActivite')}
                  >
                    <i className="fas fa-clock me-1"></i>
                    Activité
                    {sortBy === 'derniereActivite' && (
                      <i className={`fas fa-sort-${sortOrder === 'asc' ? 'up' : 'down'} ms-1`}></i>
                    )}
                  </button>

                </div>
              </div>
            </div>
          </div>

          {/* Bouton de recherche */}
          <div className="row mb-4">
            <div className="col text-center">
              <button
                type="button"
                className="btn btn-primary"
                onClick={handleSearch}
                disabled={loading}
                style={{
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  border: 'none',
                  borderRadius: '25px',
                  padding: '0.75rem 1.5rem',
                  fontWeight: '600',
                  transition: 'all 0.3s ease',
                  boxShadow: '0 4px 15px rgba(102, 126, 234, 0.3)',
                  fontSize: '1rem'
                }}
              >
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    Recherche en cours...
                  </>
                ) : (
                  <>
                    <i className="fas fa-search me-2"></i>
                    Rechercher
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Liste des joueurs */}
          <div className="row">
            {players.map((player) => (
              <div key={player._id} className="col-lg-6 col-xl-4">
                <div className="club-card">
                  <div className="club-header">
                    <Avatar 
                      src={player.photoProfil}
                      name={player.pseudo}
                      size="md"
                      className="club-avatar"
                    />
                    <div className="club-info">
                      <h5>
                        <Link to={`/player/${player._id}`}>
                          {player.pseudo}
                        </Link>
                      </h5>
                      <div className="club-badges">
                        <span className={`badge bg-${getDisponibiliteColor(player.disponibilite)}`}>
                          {player.disponibilite}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Layout desktop */}
                  <div className="d-none d-md-block">
                    <div className="club-details mb-2">
                      <div><strong>Position :</strong> {player.position || 'Non renseigné'}</div>
                      <div><strong>Plateforme :</strong> {player.plateforme}</div>
                      <div><strong>Localisation :</strong> {player.pays || 'Non renseigné'}{player.ville && `, ${player.ville}`}</div>
                    </div>
                    <div className="club-actions">
                      <Link 
                        to={`/player/${player._id}`} 
                        className="btn-view"
                      >
                        <i className="fas fa-eye me-2"></i>
                        Voir le profil
                      </Link>
                    </div>
                  </div>

                  {/* Layout mobile */}
                  <div className="d-md-none">
                    <div className="club-details mb-2">
                      <div><strong>Position :</strong> {player.position || 'Non renseigné'}</div>
                      <div><strong>Plateforme :</strong> {player.plateforme}</div>
                      <div><strong>Localisation :</strong> {player.pays || 'Non renseigné'}{player.ville && `, ${player.ville}`}</div>
                    </div>
                    <div className="club-actions">
                      <Link 
                        to={`/player/${player._id}`} 
                        className="btn-view"
                      >
                        <i className="fas fa-eye me-2"></i>
                        Voir le profil
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination améliorée */}
          {pagination.totalPages > 1 && (
            <div className="pagination-container">
              {/* Informations sur la pagination */}
              <div className="text-center mb-3">
                <small className="text-muted">
                  Affichage de {((currentPage - 1) * 9) + 1} à {Math.min(currentPage * 9, pagination.totalDocs)} 
                  sur {pagination.totalDocs} joueurs
                </small>
              </div>
              
              <nav aria-label="Pagination des joueurs">
                <ul className="pagination justify-content-center">
                  {/* Bouton Précédent */}
                  <li className={`page-item ${!pagination.hasPrev ? 'disabled' : ''}`}>
                    <button
                      className="page-link"
                      onClick={() => setCurrentPage(currentPage - 1)}
                      disabled={!pagination.hasPrev}
                    >
                      <i className="fas fa-chevron-left"></i>
                      Précédent
                    </button>
                  </li>
                  
                  {/* Première page */}
                  {currentPage > 3 && (
                    <li className="page-item">
                      <button
                        className="page-link"
                        onClick={() => setCurrentPage(1)}
                      >
                        1
                      </button>
                    </li>
                  )}
                  
                  {/* Ellipsis si nécessaire */}
                  {currentPage > 4 && (
                    <li className="page-item disabled">
                      <span className="page-link">...</span>
                    </li>
                  )}
                  
                  {/* Pages autour de la page courante */}
                  {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                    let page;
                    if (pagination.totalPages <= 5) {
                      page = i + 1;
                    } else if (currentPage <= 3) {
                      page = i + 1;
                    } else if (currentPage >= pagination.totalPages - 2) {
                      page = pagination.totalPages - 4 + i;
                    } else {
                      page = currentPage - 2 + i;
                    }
                    
                    if (page > 0 && page <= pagination.totalPages) {
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
                    }
                    return null;
                  })}
                  
                  {/* Ellipsis si nécessaire */}
                  {currentPage < pagination.totalPages - 3 && (
                    <li className="page-item disabled">
                      <span className="page-link">...</span>
                    </li>
                  )}
                  
                  {/* Dernière page */}
                  {currentPage < pagination.totalPages - 2 && (
                    <li className="page-item">
                      <button
                        className="page-link"
                        onClick={() => setCurrentPage(pagination.totalPages)}
                      >
                        {pagination.totalPages}
                      </button>
                    </li>
                  )}
                  
                  {/* Bouton Suivant */}
                  <li className={`page-item ${!pagination.hasNext ? 'disabled' : ''}`}>
                    <button
                      className="page-link"
                      onClick={() => setCurrentPage(currentPage + 1)}
                      disabled={!pagination.hasNext}
                    >
                      Suivant
                      <i className="fas fa-chevron-right"></i>
                    </button>
                  </li>
                </ul>
              </nav>
            </div>
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