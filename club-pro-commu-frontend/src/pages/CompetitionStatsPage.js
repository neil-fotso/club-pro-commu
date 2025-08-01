import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { competitionAPI } from '../services/api';

const CompetitionStatsPage = () => {
  const { id } = useParams();
  const [competition, setCompetition] = useState(null);
  const [classement, setClassement] = useState([]);
  const [statistiques, setStatistiques] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('classement');

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [competitionData, classementData, statsData] = await Promise.all([
        competitionAPI.getCompetition(id),
        competitionAPI.getClassement(id),
        competitionAPI.getStatistiques(id)
      ]);
      
      setCompetition(competitionData);
      setClassement(classementData);
      setStatistiques(statsData);
    } catch (error) {
      console.error('Erreur récupération données:', error);
      setError('Erreur lors du chargement des données');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const getPositionBadge = (position) => {
    if (position === 1) return 'bg-warning'; // Or
    if (position === 2) return 'bg-secondary'; // Argent
    if (position === 3) return 'bg-danger'; // Bronze
    return 'bg-light';
  };

  const getPositionIcon = (position) => {
    if (position === 1) return '🥇';
    if (position === 2) return '🥈';
    if (position === 3) return '🥉';
    return position;
  };

  if (loading) {
    return (
      <div className="container py-5">
        <div className="text-center">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Chargement...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container py-5">
        <div className="alert alert-danger">
          <i className="fas fa-exclamation-triangle me-2"></i>
          {error}
        </div>
      </div>
    );
  }

  if (!competition) {
    return (
      <div className="container py-5">
        <div className="alert alert-danger">
          <i className="fas fa-exclamation-triangle me-2"></i>
          Compétition non trouvée
        </div>
      </div>
    );
  }

  return (
    <div className="container py-5">
      {/* Header */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="d-flex align-items-center justify-content-between">
            <div>
              <Link to={`/competition/${id}`} className="btn btn-outline-secondary me-3">
                <i className="fas fa-arrow-left me-2"></i>
                Retour à la compétition
              </Link>
              <h1 className="d-inline-block mb-0">
                <i className="fas fa-chart-bar me-2"></i>
                Statistiques - {competition.nom}
              </h1>
            </div>
            <div>
              <span className={`badge ${competition.statut === 'Terminé' ? 'bg-success' : 'bg-warning'}`}>
                {competition.statut}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Onglets */}
      <div className="row mb-4">
        <div className="col-12">
          <ul className="nav nav-tabs">
            <li className="nav-item">
              <button 
                className={`nav-link ${activeTab === 'classement' ? 'active' : ''}`}
                onClick={() => setActiveTab('classement')}
              >
                <i className="fas fa-trophy me-2"></i>
                Classement
              </button>
            </li>
            <li className="nav-item">
              <button 
                className={`nav-link ${activeTab === 'stats' ? 'active' : ''}`}
                onClick={() => setActiveTab('stats')}
              >
                <i className="fas fa-chart-line me-2"></i>
                Statistiques
              </button>
            </li>
            <li className="nav-item">
              <button 
                className={`nav-link ${activeTab === 'recompenses' ? 'active' : ''}`}
                onClick={() => setActiveTab('recompenses')}
              >
                <i className="fas fa-medal me-2"></i>
                Récompenses
              </button>
            </li>
          </ul>
        </div>
      </div>

      {/* Contenu des onglets */}
      <div className="row">
        <div className="col-12">
          {/* Classement */}
          {activeTab === 'classement' && (
            <div className="card">
              <div className="card-header">
                <h5 className="mb-0">
                  <i className="fas fa-trophy me-2"></i>
                  Classement final
                </h5>
              </div>
              <div className="card-body">
                {classement.length > 0 ? (
                  <div className="table-responsive">
                    <table className="table table-hover">
                      <thead>
                        <tr>
                          <th>Position</th>
                          <th>Équipe</th>
                          <th>Matchs</th>
                          <th>Victoires</th>
                          <th>Nuls</th>
                          <th>Défaites</th>
                          <th>Buts pour</th>
                          <th>Buts contre</th>
                          <th>Différence</th>
                          <th>Points</th>
                        </tr>
                      </thead>
                      <tbody>
                        {classement.map((equipe, index) => (
                          <tr key={equipe.clubId._id}>
                            <td>
                              <span className={`badge ${getPositionBadge(index + 1)} me-2`}>
                                {getPositionIcon(index + 1)}
                              </span>
                              {index + 1}
                            </td>
                            <td>
                              <div className="d-flex align-items-center">
                                {equipe.clubId.logo && (
                                  <img 
                                    src={equipe.clubId.logo} 
                                    alt="Logo" 
                                    className="me-2" 
                                    style={{ width: '30px', height: '30px', objectFit: 'cover' }}
                                  />
                                )}
                                <strong>{equipe.clubId.nom}</strong>
                              </div>
                            </td>
                            <td>{equipe.matchsJoues}</td>
                            <td className="text-success">{equipe.victoires}</td>
                            <td className="text-warning">{equipe.nuls}</td>
                            <td className="text-danger">{equipe.defaites}</td>
                            <td className="text-success">{equipe.butsPour}</td>
                            <td className="text-danger">{equipe.butsContre}</td>
                            <td className={equipe.differenceButs >= 0 ? 'text-success' : 'text-danger'}>
                              {equipe.differenceButs >= 0 ? '+' : ''}{equipe.differenceButs}
                            </td>
                            <td>
                              <strong className="text-primary">{equipe.points}</strong>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-muted">Aucun classement disponible pour le moment.</p>
                )}
              </div>
            </div>
          )}

          {/* Statistiques */}
          {activeTab === 'stats' && (
            <div className="row">
              <div className="col-md-6 mb-4">
                <div className="card">
                  <div className="card-header">
                    <h5 className="mb-0">
                      <i className="fas fa-futbol me-2"></i>
                      Meilleurs buteurs
                    </h5>
                  </div>
                  <div className="card-body">
                    {statistiques?.meilleurButeur ? (
                      <div className="text-center">
                        <h3 className="text-success mb-2">
                          <i className="fas fa-crown me-2"></i>
                          {statistiques.meilleurButeur.joueur}
                        </h3>
                        <p className="mb-1">
                          <strong>{statistiques.meilleurButeur.buts} buts</strong>
                        </p>
                        <small className="text-muted">
                          {statistiques.meilleurButeur.club?.nom}
                        </small>
                      </div>
                    ) : (
                      <p className="text-muted">Aucune statistique disponible.</p>
                    )}
                  </div>
                </div>
              </div>

              <div className="col-md-6 mb-4">
                <div className="card">
                  <div className="card-header">
                    <h5 className="mb-0">
                      <i className="fas fa-hands-helping me-2"></i>
                      Meilleurs passeurs
                    </h5>
                  </div>
                  <div className="card-body">
                    {statistiques?.meilleurPasseur ? (
                      <div className="text-center">
                        <h3 className="text-info mb-2">
                          <i className="fas fa-star me-2"></i>
                          {statistiques.meilleurPasseur.joueur}
                        </h3>
                        <p className="mb-1">
                          <strong>{statistiques.meilleurPasseur.passes} passes</strong>
                        </p>
                        <small className="text-muted">
                          {statistiques.meilleurPasseur.club?.nom}
                        </small>
                      </div>
                    ) : (
                      <p className="text-muted">Aucune statistique disponible.</p>
                    )}
                  </div>
                </div>
              </div>

              <div className="col-md-6 mb-4">
                <div className="card">
                  <div className="card-header">
                    <h5 className="mb-0">
                      <i className="fas fa-user me-2"></i>
                      Meilleur joueur
                    </h5>
                  </div>
                  <div className="card-body">
                    {statistiques?.meilleurJoueur ? (
                      <div className="text-center">
                        <h3 className="text-warning mb-2">
                          <i className="fas fa-medal me-2"></i>
                          {statistiques.meilleurJoueur.joueur}
                        </h3>
                        <small className="text-muted">
                          {statistiques.meilleurJoueur.club?.nom}
                        </small>
                      </div>
                    ) : (
                      <p className="text-muted">Aucune statistique disponible.</p>
                    )}
                  </div>
                </div>
              </div>

              <div className="col-md-6 mb-4">
                <div className="card">
                  <div className="card-header">
                    <h5 className="mb-0">
                      <i className="fas fa-chart-pie me-2"></i>
                      Statistiques générales
                    </h5>
                  </div>
                  <div className="card-body">
                    <div className="row text-center">
                      <div className="col-6">
                        <h4 className="text-primary">{statistiques?.totalMatchs || 0}</h4>
                        <small>Matchs joués</small>
                      </div>
                      <div className="col-6">
                        <h4 className="text-success">{statistiques?.totalButs || 0}</h4>
                        <small>Buts marqués</small>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Récompenses */}
          {activeTab === 'recompenses' && (
            <div className="row">
              <div className="col-md-4 mb-4">
                <div className="card text-center">
                  <div className="card-body">
                    <h1 className="text-warning mb-3">🥇</h1>
                    <h5 className="card-title">Champion</h5>
                    {competition.gagnant ? (
                      <p className="card-text">
                        <strong>{competition.gagnant.nom}</strong>
                      </p>
                    ) : (
                      <p className="text-muted">À déterminer</p>
                    )}
                  </div>
                </div>
              </div>

              <div className="col-md-4 mb-4">
                <div className="card text-center">
                  <div className="card-body">
                    <h1 className="text-secondary mb-3">🥈</h1>
                    <h5 className="card-title">Finaliste</h5>
                    {competition.finaliste ? (
                      <p className="card-text">
                        <strong>{competition.finaliste.nom}</strong>
                      </p>
                    ) : (
                      <p className="text-muted">À déterminer</p>
                    )}
                  </div>
                </div>
              </div>

              <div className="col-md-4 mb-4">
                <div className="card text-center">
                  <div className="card-body">
                    <h1 className="text-danger mb-3">🥉</h1>
                    <h5 className="card-title">3ème place</h5>
                    {competition.troisieme ? (
                      <p className="card-text">
                        <strong>{competition.troisieme.nom}</strong>
                      </p>
                    ) : (
                      <p className="text-muted">À déterminer</p>
                    )}
                  </div>
                </div>
              </div>

              <div className="col-12">
                <div className="card">
                  <div className="card-header">
                    <h5 className="mb-0">
                      <i className="fas fa-medal me-2"></i>
                      Récompenses individuelles
                    </h5>
                  </div>
                  <div className="card-body">
                    <div className="row">
                      <div className="col-md-6">
                        <h6>🎯 Meilleur buteur</h6>
                        {statistiques?.meilleurButeur ? (
                          <p>
                            <strong>{statistiques.meilleurButeur.joueur}</strong>
                            <br />
                            <small className="text-muted">
                              {statistiques.meilleurButeur.buts} buts - {statistiques.meilleurButeur.club?.nom}
                            </small>
                          </p>
                        ) : (
                          <p className="text-muted">À déterminer</p>
                        )}
                      </div>
                      <div className="col-md-6">
                        <h6>🎖️ Meilleur joueur</h6>
                        {statistiques?.meilleurJoueur ? (
                          <p>
                            <strong>{statistiques.meilleurJoueur.joueur}</strong>
                            <br />
                            <small className="text-muted">
                              {statistiques.meilleurJoueur.club?.nom}
                            </small>
                          </p>
                        ) : (
                          <p className="text-muted">À déterminer</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CompetitionStatsPage; 