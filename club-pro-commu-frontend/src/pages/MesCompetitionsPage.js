import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { competitionAPI } from '../services/api';

export default function MesCompetitionsPage() {
  const { user } = useAuth();
  const [competitions, setCompetitions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('crees');

  const fetchMesCompetitions = useCallback(async () => {
    try {
      setLoading(true);
      const data = await competitionAPI.getMyCompetitions(user?.token);
      setCompetitions(data);
    } catch (error) {
      console.error('Erreur récupération mes compétitions:', error);
    } finally {
      setLoading(false);
    }
  }, [user?.token]);

  useEffect(() => {
    if (user) {
      fetchMesCompetitions();
    }
  }, [user, fetchMesCompetitions]);

  const handleDeleteCompetition = async (competitionId) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cette compétition ?')) {
      return;
    }

    try {
      await competitionAPI.deleteCompetition(competitionId, user?.token);
      await fetchMesCompetitions();
      alert('Compétition supprimée avec succès !');
    } catch (error) {
      console.error('Erreur suppression compétition:', error);
      alert(error.response?.data?.message || 'Erreur lors de la suppression');
    }
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

  if (!user) {
    return (
      <div className="container py-5">
        <div className="text-center">
          <i className="fas fa-lock fa-4x text-warning mb-3"></i>
          <h3>Accès restreint</h3>
          <p className="text-muted">Connectez-vous pour voir vos compétitions</p>
          <Link to="/login" className="btn btn-primary">
            <i className="fas fa-sign-in-alt me-2"></i>
            Se connecter
          </Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="container py-5">
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Chargement...</span>
          </div>
          <p className="mt-3">Chargement de vos compétitions...</p>
        </div>
      </div>
    );
  }

  const competitionsCrees = competitions.filter(c => c.createurId?._id === user?._id);
  const competitionsInscrites = competitions.filter(c => 
    c.equipesInscrites.some(equipe => 
      equipe.clubId && user.clubs && user.clubs.includes(equipe.clubId._id)
    )
  );

  return (
    <div className="container py-5">
      {/* Header */}
      <div className="row mb-5">
        <div className="col-lg-8">
          <h1 className="display-5 fw-bold text-gradient mb-3">
            <i className="fas fa-trophy me-3"></i>
            Mes Compétitions
          </h1>
          <p className="lead text-muted">
            Gérez vos compétitions créées et suivez vos participations
          </p>
        </div>
        <div className="col-lg-4 text-end">
          <Link to="/competitions/creer" className="btn btn-primary btn-lg">
            <i className="fas fa-plus me-2"></i>
            Créer une compétition
          </Link>
        </div>
      </div>

      {/* Onglets */}
      <ul className="nav nav-tabs mb-4" id="competitionsTabs" role="tablist">
        <li className="nav-item" role="presentation">
          <button 
            className={`nav-link ${activeTab === 'crees' ? 'active' : ''}`}
            onClick={() => setActiveTab('crees')}
          >
            <i className="fas fa-crown me-2"></i>
            Compétitions créées ({competitionsCrees.length})
          </button>
        </li>
        <li className="nav-item" role="presentation">
          <button 
            className={`nav-link ${activeTab === 'inscrites' ? 'active' : ''}`}
            onClick={() => setActiveTab('inscrites')}
          >
            <i className="fas fa-users me-2"></i>
            Compétitions inscrites ({competitionsInscrites.length})
          </button>
        </li>
      </ul>

      {/* Contenu des onglets */}
      <div className="tab-content" id="competitionsTabContent">
        {/* Compétitions créées */}
        <div className={`tab-pane fade ${activeTab === 'crees' ? 'show active' : ''}`}>
          {competitionsCrees.length === 0 ? (
            <div className="text-center py-5">
              <i className="fas fa-trophy fa-4x text-muted mb-3"></i>
              <h3 className="text-muted">Aucune compétition créée</h3>
              <p className="text-muted">Vous n'avez pas encore créé de compétition.</p>
              <Link to="/competitions/creer" className="btn btn-primary">
                <i className="fas fa-plus me-2"></i>
                Créer votre première compétition
              </Link>
            </div>
          ) : (
            <div className="row g-4">
              {competitionsCrees.map(competition => (
                <div key={competition._id} className="col-lg-6">
                  <div className="card h-100 shadow-sm">
                    <div className="card-header d-flex justify-content-between align-items-center">
                      <div>
                        <span className={`badge bg-${getStatutBadge(competition.statut)} me-2`}>
                          {competition.statut}
                        </span>
                        <span className="badge bg-secondary">
                          {competition.plateforme}
                        </span>
                      </div>
                      <div className="dropdown">
                        <button className="btn btn-outline-secondary btn-sm dropdown-toggle" type="button" data-bs-toggle="dropdown">
                          <i className="fas fa-ellipsis-v"></i>
                        </button>
                        <ul className="dropdown-menu">
                          <li>
                            <Link className="dropdown-item" to={`/competitions/${competition._id}`}>
                              <i className="fas fa-eye me-2"></i>
                              Voir détails
                            </Link>
                          </li>
                          {competition.statut === 'Ouvert' && (
                            <li>
                              <Link className="dropdown-item" to={`/competitions/${competition._id}/modifier`}>
                                <i className="fas fa-edit me-2"></i>
                                Modifier
                              </Link>
                            </li>
                          )}
                          {competition.equipesInscrites.length === 0 && (
                            <li>
                              <button 
                                className="dropdown-item text-danger"
                                onClick={() => handleDeleteCompetition(competition._id)}
                              >
                                <i className="fas fa-trash me-2"></i>
                                Supprimer
                              </button>
                            </li>
                          )}
                        </ul>
                      </div>
                    </div>
                    <div className="card-body">
                      <div className="d-flex align-items-center mb-3">
                        <i className={`${getTypeIcon(competition.type)} fa-2x text-primary me-3`}></i>
                        <div>
                          <h5 className="card-title mb-1">{competition.nom}</h5>
                          <small className="text-muted">
                            Créé le {formatDate(competition.dateCreation)}
                          </small>
                        </div>
                      </div>

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

                      <div className="d-grid">
                        <Link 
                          to={`/competitions/${competition._id}`}
                          className="btn btn-outline-primary"
                        >
                          <i className="fas fa-eye me-2"></i>
                          Gérer la compétition
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Compétitions inscrites */}
        <div className={`tab-pane fade ${activeTab === 'inscrites' ? 'show active' : ''}`}>
          {competitionsInscrites.length === 0 ? (
            <div className="text-center py-5">
              <i className="fas fa-users fa-4x text-muted mb-3"></i>
              <h3 className="text-muted">Aucune inscription</h3>
              <p className="text-muted">Vous n'êtes inscrit à aucune compétition.</p>
              <Link to="/competitions" className="btn btn-primary">
                <i className="fas fa-search me-2"></i>
                Découvrir des compétitions
              </Link>
            </div>
          ) : (
            <div className="row g-4">
              {competitionsInscrites.map(competition => {
                const monClub = competition.equipesInscrites.find(equipe => 
                  equipe.clubId && user.clubs && user.clubs.includes(equipe.clubId._id)
                );

                return (
                  <div key={competition._id} className="col-lg-6">
                    <div className="card h-100 shadow-sm">
                      <div className="card-header d-flex justify-content-between align-items-center">
                        <div>
                          <span className={`badge bg-${getStatutBadge(competition.statut)} me-2`}>
                            {competition.statut}
                          </span>
                          <span className="badge bg-secondary">
                            {competition.plateforme}
                          </span>
                        </div>
                        <span className={`badge bg-${monClub?.statut === 'Gagnant' ? 'success' : 'primary'}`}>
                          {monClub?.statut || 'Inscrit'}
                        </span>
                      </div>
                      <div className="card-body">
                        <div className="d-flex align-items-center mb-3">
                          <i className={`${getTypeIcon(competition.type)} fa-2x text-primary me-3`}></i>
                          <div>
                            <h5 className="card-title mb-1">{competition.nom}</h5>
                            <small className="text-muted">
                              Organisé par {competition.createurId?.pseudo}
                            </small>
                          </div>
                        </div>

                        {competition.description && (
                          <p className="card-text text-muted small mb-3">
                            {competition.description.length > 100 
                              ? `${competition.description.substring(0, 100)}...` 
                              : competition.description}
                          </p>
                        )}

                        <div className="row text-center mb-3">
                          <div className="col-4">
                            <small className="text-muted d-block">Mon club</small>
                            <strong>{monClub?.clubId?.nom}</strong>
                          </div>
                          <div className="col-4">
                            <small className="text-muted d-block">Équipes</small>
                            <strong>{competition.equipesInscrites.length}/{competition.nombreEquipes}</strong>
                          </div>
                          <div className="col-4">
                            <small className="text-muted d-block">Début</small>
                            <strong>{formatDate(competition.dateDebut)}</strong>
                          </div>
                        </div>

                        <div className="d-grid">
                          <Link 
                            to={`/competitions/${competition._id}`}
                            className="btn btn-outline-primary"
                          >
                            <i className="fas fa-eye me-2"></i>
                            Voir la compétition
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 