import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { competitionAPI } from '../services/api';

export default function CompetitionListPage() {
  const { user } = useAuth();
  const [competitions, setCompetitions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    statut: '',
    plateforme: '',
    type: ''
  });
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    total: 0
  });

  const fetchCompetitions = useCallback(async () => {
    try {
      setLoading(true);

      const data = await competitionAPI.getCompetitions(filters);
      setCompetitions(data.competitions || []);
      setPagination({
        currentPage: data.currentPage || 1,
        totalPages: data.totalPages || 1,
        total: data.total || 0
      });
    } catch (error) {
      console.error('Erreur récupération compétitions:', error);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchCompetitions();
  }, [fetchCompetitions]);

  const handleFilterChange = (name, value) => {
    setFilters(prev => ({ ...prev, [name]: value }));
    setPagination(prev => ({ ...prev, currentPage: 1 }));
  };

  const getStatutBadge = (statut) => {
    const badges = {
      'Ouvert': 'success',
      'Fermé': 'secondary',
      'En cours': 'warning',
      'Terminé': 'info'
    };
    return badges[statut] || 'secondary';
  };

  const getTypeIcon = (type) => {
    const icons = {
      'tournoi': 'fas fa-trophy',
      'championnat': 'fas fa-medal',
      'coupe': 'fas fa-crown',
      'friendly': 'fas fa-handshake'
    };
    return icons[type] || 'fas fa-gamepad';
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="container py-5">
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Chargement...</span>
          </div>
          <p className="mt-3">Chargement des compétitions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-5">
      {/* Header */}
      <div className="row mb-5">
        <div className="col-lg-8">
          <h1 className="display-5 fw-bold text-gradient mb-3">
            <i className="fas fa-trophy me-3"></i>
            Compétitions
          </h1>
          <p className="lead text-muted">
            Découvrez et participez aux meilleures compétitions EA Sports FC Pro Clubs
          </p>
        </div>
        <div className="col-lg-4 text-end">
          {user && (
            <Link to="/competitions/creer" className="btn btn-primary btn-lg">
              <i className="fas fa-plus me-2"></i>
              Créer une compétition
            </Link>
          )}
        </div>
      </div>

      {/* Filtres */}
      <div className="card mb-4">
        <div className="card-body">
          <div className="row g-3">
            <div className="col-md-3">
              <label className="form-label">Statut</label>
              <select 
                className="form-select"
                value={filters.statut}
                onChange={(e) => handleFilterChange('statut', e.target.value)}
              >
                <option value="">Tous les statuts</option>
                <option value="Ouvert">Ouvert</option>
                <option value="Fermé">Fermé</option>
                <option value="En cours">En cours</option>
                <option value="Terminé">Terminé</option>
              </select>
            </div>
            <div className="col-md-3">
              <label className="form-label">Plateforme</label>
              <select 
                className="form-select"
                value={filters.plateforme}
                onChange={(e) => handleFilterChange('plateforme', e.target.value)}
              >
                <option value="">Toutes les plateformes</option>
                <option value="PS5">PlayStation 5</option>
                <option value="PS4">PlayStation 4</option>
                <option value="Xbox">Xbox</option>
                <option value="PC">PC</option>
                <option value="Cross-Platform">Cross-Platform</option>
              </select>
            </div>
            <div className="col-md-3">
              <label className="form-label">Type</label>
              <select 
                className="form-select"
                value={filters.type}
                onChange={(e) => handleFilterChange('type', e.target.value)}
              >
                <option value="">Tous les types</option>
                <option value="tournoi">Tournoi</option>
                <option value="championnat">Championnat</option>
                <option value="coupe">Coupe</option>
                <option value="friendly">Match amical</option>
              </select>
            </div>
            <div className="col-md-3 d-flex align-items-end">
              <button 
                className="btn btn-outline-secondary w-100"
                onClick={() => {
                  setFilters({ statut: '', plateforme: '', type: '' });
                  setPagination(prev => ({ ...prev, currentPage: 1 }));
                }}
              >
                <i className="fas fa-times me-2"></i>
                Réinitialiser
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Statistiques */}
      <div className="row mb-4">
        <div className="col-md-3">
          <div className="card bg-primary text-white">
            <div className="card-body text-center">
              <i className="fas fa-trophy fa-2x mb-2"></i>
              <h4>{pagination.total}</h4>
              <p className="mb-0">Compétitions</p>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card bg-success text-white">
            <div className="card-body text-center">
              <i className="fas fa-door-open fa-2x mb-2"></i>
              <h4>{competitions.filter(c => c.statut === 'Ouvert').length}</h4>
              <p className="mb-0">Ouvertes</p>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card bg-warning text-white">
            <div className="card-body text-center">
              <i className="fas fa-play fa-2x mb-2"></i>
              <h4>{competitions.filter(c => c.statut === 'En cours').length}</h4>
              <p className="mb-0">En cours</p>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card bg-info text-white">
            <div className="card-body text-center">
              <i className="fas fa-check-circle fa-2x mb-2"></i>
              <h4>{competitions.filter(c => c.statut === 'Terminé').length}</h4>
              <p className="mb-0">Terminées</p>
            </div>
          </div>
        </div>
      </div>

      {/* Liste des compétitions */}
      {competitions.length === 0 ? (
        <div className="text-center py-5">
          <i className="fas fa-trophy fa-4x text-muted mb-3"></i>
          <h3 className="text-muted">Aucune compétition trouvée</h3>
          <p className="text-muted">Aucune compétition ne correspond à vos critères de recherche.</p>
          {user && (
            <Link to="/competitions/creer" className="btn btn-primary">
              <i className="fas fa-plus me-2"></i>
              Créer la première compétition
            </Link>
          )}
        </div>
      ) : (
        <div className="row g-4">
          {competitions.map(competition => (
            <div key={competition._id} className="col-lg-4 col-md-6">
              <div className="card h-100 shadow-sm hover-shadow">
                <div className="card-body">
                  <div className="d-flex justify-content-between align-items-start mb-3">
                    <div>
                      <span className={`badge bg-${getStatutBadge(competition.statut)} me-2`}>
                        {competition.statut}
                      </span>
                      <span className="badge bg-secondary">
                        {competition.plateforme}
                      </span>
                    </div>
                    <i className={`${getTypeIcon(competition.type)} fa-2x text-primary`}></i>
                  </div>

                  <h5 className="card-title mb-2">{competition.nom}</h5>
                  
                  {competition.description && (
                    <p className="card-text text-muted small mb-3">
                      {competition.description.length > 100 
                        ? `${competition.description.substring(0, 100)}...` 
                        : competition.description}
                    </p>
                  )}

                  <div className="row text-center mb-3">
                    <div className="col-4">
                      <small className="text-muted d-block">Équipes</small>
                      <strong>{competition.equipesInscrites.length}/{competition.nombreEquipes}</strong>
                    </div>
                    <div className="col-4">
                      <small className="text-muted d-block">Début</small>
                      <strong>{formatDate(competition.dateDebut)}</strong>
                    </div>
                    <div className="col-4">
                      <small className="text-muted d-block">Niveau</small>
                      <strong>{competition.niveau}</strong>
                    </div>
                  </div>

                  <div className="d-flex justify-content-between align-items-center">
                    <small className="text-muted">
                      <i className="fas fa-user me-1"></i>
                      {competition.createurId?.pseudo}
                    </small>
                    <Link 
                      to={`/competition/${competition._id}`}
                      className="btn btn-outline-primary btn-sm"
                    >
                      Voir détails
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <nav className="mt-5">
          <ul className="pagination justify-content-center">
            <li className={`page-item ${pagination.currentPage === 1 ? 'disabled' : ''}`}>
              <button 
                className="page-link"
                onClick={() => setPagination(prev => ({ ...prev, currentPage: prev.currentPage - 1 }))}
                disabled={pagination.currentPage === 1}
              >
                Précédent
              </button>
            </li>
            
            {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map(page => (
              <li key={page} className={`page-item ${pagination.currentPage === page ? 'active' : ''}`}>
                <button 
                  className="page-link"
                  onClick={() => setPagination(prev => ({ ...prev, currentPage: page }))}
                >
                  {page}
                </button>
              </li>
            ))}
            
            <li className={`page-item ${pagination.currentPage === pagination.totalPages ? 'disabled' : ''}`}>
              <button 
                className="page-link"
                onClick={() => setPagination(prev => ({ ...prev, currentPage: prev.currentPage + 1 }))}
                disabled={pagination.currentPage === pagination.totalPages}
              >
                Suivant
              </button>
            </li>
          </ul>
        </nav>
      )}
    </div>
  );
} 