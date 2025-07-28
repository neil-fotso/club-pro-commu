import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { playerAPI } from '../services/api';
import Avatar from '../components/Avatar';

const PlayerSearchPage = () => {
  // const { user: authUser } = useAuth(); // Variable non utilisée pour le moment
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
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
  
  const [sortBy, setSortBy] = useState('derniereActivite');
  const [sortOrder, setSortOrder] = useState('desc');
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

  const clearFilters = () => {
    setFilters({
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
    setCurrentPage(1);
  };

  const getNiveauColor = (niveau) => {
    const colors = {
      'Débutant': 'success',
      'Intermédiaire': 'info',
      'Avancé': 'warning',
      'Expert': 'danger',
      'Pro': 'dark'
    };
    return colors[niveau] || 'secondary';
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
      <div className="container mt-4">
        <div className="text-center">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Chargement...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mt-4">
      {/* Header avec titre */}
      <div className="row mb-4">
        <div className="col">
          <h2 className="text-primary mb-0">
            <i className="fas fa-users me-2"></i>
            Recherche de Joueurs
          </h2>
          <p className="text-muted">Trouve des joueurs pour rejoindre ton équipe</p>
        </div>
      </div>

      {/* Filtres simplifiés */}
      <div className="card mb-4">
        <div className="card-header bg-light">
          <h5 className="mb-0">
            <i className="fas fa-filter me-2"></i>
            Critères de recherche
          </h5>
        </div>
        <div className="card-body">
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
                <option value="Switch">Switch</option>
                <option value="Mobile">Mobile</option>
              </select>
            </div>
          </div>

          {/* Bouton pour afficher/masquer les critères avancés */}
          <div className="row mt-3">
            <div className="col">
              <button
                type="button"
                className="btn btn-outline-secondary"
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

                <div className="col-md-2">
                  <label className="form-label">Âge min</label>
                  <input
                    type="number"
                    className="form-control"
                    value={filters.ageMin}
                    onChange={(e) => handleFilterChange('ageMin', e.target.value)}
                    placeholder="13"
                    min="13"
                    max="100"
                  />
                </div>

                <div className="col-md-2">
                  <label className="form-label">Âge max</label>
                  <input
                    type="number"
                    className="form-control"
                    value={filters.ageMax}
                    onChange={(e) => handleFilterChange('ageMax', e.target.value)}
                    placeholder="100"
                    min="13"
                    max="100"
                  />
                </div>

                <div className="col-md-2">
                  <label className="form-label">Matchs min</label>
                  <input
                    type="number"
                    className="form-control"
                    value={filters.matchsMin}
                    onChange={(e) => handleFilterChange('matchsMin', e.target.value)}
                    placeholder="0"
                    min="0"
                  />
                </div>

                <div className="col-md-2">
                  <label className="form-label">Win Rate min (%)</label>
                  <input
                    type="number"
                    className="form-control"
                    value={filters.winRateMin}
                    onChange={(e) => handleFilterChange('winRateMin', e.target.value)}
                    placeholder="0"
                    min="0"
                    max="100"
                  />
                </div>
              </div>

              {/* Boutons d'action pour les critères avancés */}
              <div className="row mt-3">
                <div className="col">
                  <button
                    className="btn btn-outline-danger"
                    onClick={clearFilters}
                  >
                    <i className="fas fa-times me-2"></i>
                    Effacer tous les filtres
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Tri et résultats */}
      <div className="row mb-3">
        <div className="col-md-6">
          <div className="d-flex align-items-center">
            <label className="me-2">Trier par:</label>
            <select
              className="form-select me-2"
              style={{ width: 'auto' }}
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="derniereActivite">Dernière activité</option>
              <option value="pseudo">Pseudo</option>
              <option value="niveau">Niveau</option>
              <option value="experience">Expérience</option>
              <option value="matchsJoues">Matchs joués</option>
              <option value="winRate">Win Rate</option>
            </select>
            <button
              className="btn btn-outline-secondary"
              onClick={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}
            >
              <i className={`fas fa-sort-${sortOrder === 'desc' ? 'down' : 'up'}`}></i>
            </button>
          </div>
        </div>
        <div className="col-md-6 text-end">
          <span className="text-muted">
            {pagination.totalPlayers || 0} joueur(s) trouvé(s)
          </span>
        </div>
      </div>

      {/* Liste des joueurs */}
      {error && (
        <div className="alert alert-danger" role="alert">
          <i className="fas fa-exclamation-triangle me-2"></i>
          {error}
        </div>
      )}

      <div className="row">
        {players.map((player) => (
          <div key={player._id} className="col-md-6 col-lg-4 mb-4">
            <div className="card h-100 shadow-sm">
              <div className="card-body">
                <div className="d-flex align-items-center mb-3">
                  <Avatar 
                    src={player.photoProfil} 
                    alt={player.pseudo}
                    size="md"
                    className="me-3"
                  />
                  <div className="flex-grow-1">
                    <h5 className="card-title mb-1">
                      <Link to={`/player/${player._id}`} className="text-decoration-none">
                        {player.pseudo}
                      </Link>
                    </h5>
                    <div className="d-flex gap-2 mb-2">
                      <span className={`badge bg-${getNiveauColor(player.niveau)}`}>
                        {player.niveau}
                      </span>
                      <span className={`badge bg-${getDisponibiliteColor(player.disponibilite)}`}>
                        {player.disponibilite}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="row mb-3">
                  <div className="col-6">
                    <small className="text-muted d-block">Position</small>
                    <strong>{player.position}</strong>
                  </div>
                  <div className="col-6">
                    <small className="text-muted d-block">Plateforme</small>
                    <strong>{player.plateforme}</strong>
                  </div>
                </div>

                {player.statistiques && (
                  <div className="mb-3">
                    <small className="text-muted d-block mb-2">Statistiques</small>
                    <div className="row text-center">
                      <div className="col-4">
                        <div className="small text-muted">Matchs</div>
                        <div className="fw-bold">{player.statistiques.matchsJoues}</div>
                      </div>
                      <div className="col-4">
                        <div className="small text-muted">Win Rate</div>
                        <div className="fw-bold">{player.winRate || 0}%</div>
                      </div>
                      <div className="col-4">
                        <div className="small text-muted">Buts/Match</div>
                        <div className="fw-bold">{player.goalsPerMatch || 0}</div>
                      </div>
                    </div>
                  </div>
                )}

                <div className="d-flex justify-content-between align-items-center">
                  <small className="text-muted">
                    <i className="fas fa-map-marker-alt me-1"></i>
                    {player.pays}
                    {player.ville && `, ${player.ville}`}
                  </small>
                  <Link 
                    to={`/player/${player._id}`}
                    className="btn btn-primary btn-sm"
                  >
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
  );
};

export default PlayerSearchPage; 