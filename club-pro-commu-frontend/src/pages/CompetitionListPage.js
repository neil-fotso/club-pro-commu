import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { competitionAPI } from '../services/api';
import CompetitionCountdown from '../components/CompetitionCountdown';

export default function CompetitionListPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [competitions, setCompetitions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters] = useState({
    statut: '',
    plateforme: '',
    type: 'elimination_directe'
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

  const handleCardClick = (competitionId) => {
    navigate(`/competition/${competitionId}`);
  };

  if (loading) {
    return (
      <div className="container py-5">
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Chargement...</span>
          </div>
          <p className="mt-3 text-muted">Chargement des compétitions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-4 px-4 px-md-5 animate-fade-in">
      {/* En-tête */}
      <div className="gaming-header d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">
        <div>
          <h1 className="gaming-title mb-2">
            <i className="fas fa-trophy text-gradient me-3"></i>
            Compétitions
          </h1>
          <p className="gaming-subtitle">Découvrez et rejoignez les compétitions et championnats officiels</p>
        </div>
        <div>
          {user && user.isAdmin && (
            <Link to="/competitions/creer" className="btn btn-primary">
              <i className="fas fa-plus me-2"></i>
              Créer une compétition
            </Link>
          )}
        </div>
      </div>

      {/* Filtres masqués temporairement car format unique
      <div className="card mb-4">
        <div className="card-body">
          <h5 className="card-title mb-3">
            <i className="fas fa-filter me-2"></i>
            Filtres
          </h5>
          <div className="row g-3">
            <div className="col-md-3">
              <label htmlFor="filterStatut" className="form-label">Statut</label>
              <select
                id="filterStatut"
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
              <label htmlFor="filterPlateforme" className="form-label">Plateforme</label>
              <select
                id="filterPlateforme"
                className="form-select"
                value={filters.plateforme}
                onChange={(e) => handleFilterChange('plateforme', e.target.value)}
              >
                <option value="">Toutes les plateformes</option>
                <option value="PS5">PlayStation 5</option>
                <option value="Xbox">Xbox Series</option>
                <option value="PC">PC</option>
              </select>
            </div>
            <div className="col-md-3">
              <label htmlFor="filterType" className="form-label">Type</label>
              <select
                id="filterType"
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
                  setFilters({ statut: '', plateforme: '', type: 'elimination_directe' });
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
      */}

      {/* Statistiques */}
      <div className="row mb-4 g-3">
        <div className="col-md-3 col-6">
          <div className="card gaming-stat-card purple mb-0 h-100">
            <div className="card-body text-center py-3">
              <i className="fas fa-trophy text-gradient mb-2" style={{fontSize: '1.5rem'}}></i>
              <h4>{pagination.total}</h4>
              <p className="mb-0 text-muted">Compétitions</p>
            </div>
          </div>
        </div>
        <div className="col-md-3 col-6">
          <div className="card gaming-stat-card cyan mb-0 h-100">
            <div className="card-body text-center py-3">
              <i className="fas fa-door-open text-info mb-2" style={{fontSize: '1.5rem'}}></i>
              <h4>{competitions.filter(c => c.statut === 'Ouvert').length}</h4>
              <p className="mb-0 text-muted">Ouvertes</p>
            </div>
          </div>
        </div>
        <div className="col-md-3 col-6">
          <div className="card gaming-stat-card pink mb-0 h-100">
            <div className="card-body text-center py-3">
              <i className="fas fa-play text-danger mb-2" style={{fontSize: '1.5rem'}}></i>
              <h4>{competitions.filter(c => c.statut === 'En cours').length}</h4>
              <p className="mb-0 text-muted">En cours</p>
            </div>
          </div>
        </div>
        <div className="col-md-3 col-6">
          <div className="card gaming-stat-card yellow mb-0 h-100">
            <div className="card-body text-center py-3">
              <i className="fas fa-check-circle text-warning mb-2" style={{fontSize: '1.5rem'}}></i>
              <h4>{competitions.filter(c => c.statut === 'Terminé').length}</h4>
              <p className="mb-0 text-muted">Terminées</p>
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
          {user && user.isAdmin && (
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
              <div 
                className="card h-100 hover-shadow competition-card"
                onClick={() => handleCardClick(competition._id)}
                style={{ cursor: 'pointer' }}
              >
                <div className="card-body">
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <div className="d-flex gap-2">
                      <span className={`badge ${
                        competition.statut === 'Terminé' ? 'bg-success text-white' :
                        competition.statut === 'En cours' ? 'bg-primary text-white' :
                        competition.statut === 'Ouvert' ? 'bg-warning text-dark' : 'bg-secondary text-white'
                      }`}>
                        {competition.statut}
                      </span>
                      {competition.type === 'championnat' && (
                        <span className="badge bg-secondary text-uppercase" style={{fontSize: '0.7rem'}}>
                          Championnat
                        </span>
                      )}
                    </div>
                    <div className="p-2 rounded bg-dark-navbar text-primary d-flex align-items-center justify-content-center" style={{width: '36px', height: '36px', border: '1px solid var(--border-glass)'}}>
                      <i className={`${getTypeIcon(competition.type)} text-gradient`} style={{fontSize: '1rem'}}></i>
                    </div>
                  </div>

                  <h5 className="card-title mb-2 text-truncate text-white font-rajdhani text-uppercase fw-bold" style={{letterSpacing: '0.5px'}} title={competition.nom}>
                    {competition.nom}
                  </h5>
                  
                  {competition.description && (
                    <p className="card-text text-silver small mb-3" style={{ height: '48px', overflow: 'hidden', fontSize: '0.85rem' }}>
                      {competition.description.length > 80 
                        ? `${competition.description.substring(0, 80)}...` 
                        : competition.description}
                    </p>
                  )}

                  <CompetitionCountdown dateDebut={competition.dateDebut} statut={competition.statut} />

                  <div className="row g-0 text-center mb-3 rounded mt-3" style={{background: 'rgba(0,0,0,0.15)', border: '1px solid var(--border-glass)', padding: '0.75rem 0'}}>
                    <div className="col-4 border-end" style={{borderColor: 'rgba(255,255,255,0.08)'}}>
                      <small className="text-uppercase text-muted d-block" style={{fontSize: '0.6rem', letterSpacing: '0.5px'}}>Équipes</small>
                      <strong className="text-white font-rajdhani" style={{fontSize: '0.95rem'}}>
                        {competition.equipesInscrites?.length || 0} / {competition.nombreEquipes || 8}
                      </strong>
                    </div>
                    <div className="col-4 border-end" style={{borderColor: 'rgba(255,255,255,0.08)'}}>
                      <small className="text-uppercase text-muted d-block" style={{fontSize: '0.6rem', letterSpacing: '0.5px'}}>Début</small>
                      <span className="text-white font-rajdhani fw-bold" style={{fontSize: '0.85rem'}}>{formatDate(competition.dateDebut)}</span>
                    </div>
                    <div className="col-4">
                      <small className="text-uppercase text-muted d-block" style={{fontSize: '0.6rem', letterSpacing: '0.5px'}}>Dotation</small>
                      <strong className="text-gradient font-rajdhani" style={{fontSize: '0.95rem'}}>
                        {competition.cashprizeFinal ? `${competition.cashprizeFinal}€` : '0€'}
                      </strong>
                    </div>
                  </div>

                  <div className="d-flex justify-content-between align-items-center mt-3 pt-2" style={{borderTop: '1px solid var(--border-glass)'}}>
                    <small className="text-muted">
                      <i className="fas fa-user-edit me-1 text-primary"></i>
                      {competition.createurId?.pseudo || 'Anonyme'}
                    </small>
                    <span className="text-primary font-rajdhani fw-bold text-uppercase" style={{fontSize: '0.75rem'}}>
                      Rejoindre <i className="fas fa-chevron-right ms-1" style={{fontSize: '0.7rem'}}></i>
                    </span>
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