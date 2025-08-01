import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { competitionAPI, clubAPI } from '../services/api';

const CompetitionMatchesPage = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [competition, setCompetition] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [showScoreModal, setShowScoreModal] = useState(false);
  const [scoreData, setScoreData] = useState({
    score1: '',
    score2: '',
    buteurs: [],
    passeurs: [],
    cartonsJaunes: [],
    cartonsRouges: [],
    captureEcran: ''
  });
  const [showDateModal, setShowDateModal] = useState(false);
  const [selectedMatchForDate, setSelectedMatchForDate] = useState(null);
  const [matchDate, setMatchDate] = useState('');
  const [userClubs, setUserClubs] = useState([]);
  const [showJoueurModal, setShowJoueurModal] = useState(false);
  const [joueurModalType, setJoueurModalType] = useState('');
  const [selectedJoueur, setSelectedJoueur] = useState('');
  const [joueurQuantite, setJoueurQuantite] = useState(1);

  const fetchCompetition = useCallback(async () => {
    try {
      setLoading(true);
      const data = await competitionAPI.getCompetition(id);
      setCompetition(data);
    } catch (error) {
      console.error('Erreur récupération compétition:', error);
      setError('Erreur lors du chargement de la compétition');
    } finally {
      setLoading(false);
    }
  }, [id]);

  const fetchUserClubs = useCallback(async () => {
    if (user) {
      try {
        const clubs = await clubAPI.getMyClubs(user.token);
        setUserClubs(clubs);
      } catch (error) {
        console.error('Erreur récupération clubs:', error);
        setUserClubs([]);
      }
    } else {
      setUserClubs([]);
    }
  }, [user]);

  useEffect(() => {
    fetchCompetition();
    fetchUserClubs();
  }, [fetchCompetition, fetchUserClubs]);

  const handleScoreSubmit = async () => {
    try {
      await competitionAPI.mettreAJourScore(id, selectedMatch._id, scoreData, user.token);
      setShowScoreModal(false);
      setSelectedMatch(null);
      setScoreData({
        score1: '',
        score2: '',
        buteurs: [],
        passeurs: [],
        cartonsJaunes: [],
        cartonsRouges: [],
        captureEcran: ''
      });
      fetchCompetition(); // Recharger les données
      alert('Score mis à jour avec succès');
    } catch (error) {
      console.error('Erreur mise à jour score:', error);
      alert('Erreur lors de la mise à jour du score');
    }
  };

  const openScoreModal = (match) => {
    setSelectedMatch(match);
    setScoreData({
      score1: match.score1 || '',
      score2: match.score2 || '',
      buteurs: match.stats?.buteurs || [],
      passeurs: match.stats?.passeurs || [],
      cartonsJaunes: match.stats?.cartonsJaunes || [],
      cartonsRouges: match.stats?.cartonsRouges || [],
      captureEcran: match.captureEcran || ''
    });
    setShowScoreModal(true);
  };

  // Fonction pour obtenir tous les membres des deux équipes
  const getJoueursEquipes = (match) => {
    const joueurs = [];
    
    // Essayer d'abord avec les équipes du match
    if (match.equipe1 && match.equipe1.membres) {
      joueurs.push(...match.equipe1.membres
        .filter(membre => membre.userId) // Filtrer les membres avec un userId
        .map(membre => ({ 
          pseudo: membre.userId.pseudo, 
          equipe: match.equipe1.nom,
          role: membre.role
        }))
      );
    }
    
    if (match.equipe2 && match.equipe2.membres) {
      joueurs.push(...match.equipe2.membres
        .filter(membre => membre.userId) // Filtrer les membres avec un userId
        .map(membre => ({ 
          pseudo: membre.userId.pseudo, 
          equipe: match.equipe2.nom,
          role: membre.role
        }))
      );
    }
    
    // Si pas de joueurs trouvés, essayer avec les clubs inscrits
    if (joueurs.length === 0 && competition && competition.equipesInscrites) {
      competition.equipesInscrites.forEach(equipe => {
        if (equipe.clubId && equipe.clubId.membres) {
          joueurs.push(...equipe.clubId.membres
            .filter(membre => membre.userId)
            .map(membre => ({ 
              pseudo: membre.userId.pseudo, 
              equipe: equipe.clubId.nom,
              role: membre.role
            }))
          );
        }
      });
    }
    
    return joueurs;
  };

  // Fonction pour ouvrir la modale de sélection de joueur
  const openJoueurModal = (type) => {
    setJoueurModalType(type);
    setSelectedJoueur('');
    setJoueurQuantite(1);
    setShowJoueurModal(true);
  };

  // Fonction pour ajouter un joueur via la modale
  const handleJoueurSubmit = () => {
    if (!selectedJoueur) return;

    const joueurs = getJoueursEquipes(selectedMatch);
    const joueur = joueurs.find(j => j.pseudo === selectedJoueur);
    
    if (joueur) {
      if (joueurModalType === 'buteur') {
        setScoreData(prev => ({
          ...prev,
          buteurs: [...prev.buteurs, { joueur: selectedJoueur, buts: joueurQuantite }]
        }));
      } else if (joueurModalType === 'passeur') {
        setScoreData(prev => ({
          ...prev,
          passeurs: [...prev.passeurs, { joueur: selectedJoueur, passes: joueurQuantite }]
        }));
      } else if (joueurModalType === 'carton') {
        const cartonType = joueurModalType === 'cartonJaune' ? 'cartonsJaunes' : 'cartonsRouges';
        setScoreData(prev => ({
          ...prev,
          [cartonType]: [...prev[cartonType], selectedJoueur]
        }));
      }
    }
    
    setShowJoueurModal(false);
  };

  const addButeur = () => {
    if (!selectedMatch) return;
    openJoueurModal('buteur');
  };

  const addPasseur = () => {
    if (!selectedMatch) return;
    openJoueurModal('passeur');
  };

  const addCarton = (type) => {
    if (!selectedMatch) return;
    openJoueurModal(type === 'jaune' ? 'cartonJaune' : 'cartonRouge');
  };

  const openDateModal = (match) => {
    setSelectedMatchForDate(match);
    setMatchDate(match.dateMatch ? new Date(match.dateMatch).toISOString().slice(0, 16) : '');
    setShowDateModal(true);
  };

  const handleDateSubmit = async () => {
    try {
      await competitionAPI.programmerMatch(id, selectedMatchForDate._id, matchDate, user.token);
      setShowDateModal(false);
      setSelectedMatchForDate(null);
      setMatchDate('');
      fetchCompetition(); // Recharger les données
      alert('Date programmée avec succès');
    } catch (error) {
      console.error('Erreur programmation date:', error);
      alert('Erreur lors de la programmation de la date');
    }
  };

  const getMatchStatus = (match) => {
    if (match.statut === 'Terminé') return 'bg-success';
    if (match.statut === 'En cours') return 'bg-warning';
    if (match.statut === 'Annulé') return 'bg-danger';
    return 'bg-secondary';
  };

  const getMatchStatusText = (match) => {
    if (match.statut === 'Terminé') return 'Terminé';
    if (match.statut === 'En cours') return 'En cours';
    if (match.statut === 'Annulé') return 'Annulé';
    return 'Programmé';
  };

  const getPhaseText = (phase, totalEquipes) => {
    if (totalEquipes <= 2) return 'Finale';
    if (totalEquipes <= 4) return phase === 'finale' ? 'Finale' : 'Demi-finale';
    if (totalEquipes <= 8) return phase === 'finale' ? 'Finale' : phase === 'demi_finale' ? 'Demi-finale' : 'Quart de finale';
    if (totalEquipes <= 16) {
      if (phase === 'finale') return 'Finale';
      if (phase === 'demi_finale') return 'Demi-finale';
      if (phase === 'quart_finale') return 'Quart de finale';
      return 'Huitième de finale';
    }
    return phase;
  };

  // Fonction helper pour comparer les IDs utilisateur
  const compareUserIds = (userId1, userId2) => {
    const id1 = typeof userId1 === 'object' ? userId1._id : userId1;
    const id2 = typeof userId2 === 'object' ? userId2._id : userId2;
    return id1 === id2;
  };

  // Fonction helper pour comparer les IDs de clubs
  const compareClubIds = (clubId1, clubId2) => {
    const id1 = typeof clubId1 === 'object' ? clubId1._id : clubId1;
    const id2 = typeof clubId2 === 'object' ? clubId2._id : clubId2;
    return id1 === id2;
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
                <i className="fas fa-calendar-alt me-2"></i>
                Calendrier - {competition.nom}
              </h1>
            </div>
            <div>
              <span className={`badge ${getMatchStatusText(competition.statut) === 'Terminé' ? 'bg-success' : 'bg-warning'}`}>
                {competition.statut}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Statistiques générales */}
      <div className="row mb-4">
        <div className="col-md-3">
          <div className="card text-center">
            <div className="card-body">
              <h5 className="card-title">
                <i className="fas fa-users text-primary"></i>
              </h5>
              <h3 className="text-primary">{competition.equipesInscrites?.length || 0}</h3>
              <p className="card-text">Équipes inscrites</p>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card text-center">
            <div className="card-body">
              <h5 className="card-title">
                <i className="fas fa-futbol text-success"></i>
              </h5>
              <h3 className="text-success">
                {competition.poules?.reduce((total, poule) => total + (poule.matchs?.length || 0), 0) + 
                 (competition.matchsElimination?.length || 0)}
              </h3>
              <p className="card-text">Matchs programmés</p>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card text-center">
            <div className="card-body">
              <h5 className="card-title">
                <i className="fas fa-trophy text-warning"></i>
              </h5>
              <h3 className="text-warning">
                {competition.poules?.reduce((total, poule) => 
                  total + (poule.matchs?.filter(m => m.statut === 'Terminé').length || 0), 0) + 
                 (competition.matchsElimination?.filter(m => m.statut === 'Terminé').length || 0)}
              </h3>
              <p className="card-text">Matchs terminés</p>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card text-center">
            <div className="card-body">
              <h5 className="card-title">
                <i className="fas fa-chart-line text-info"></i>
              </h5>
              <h3 className="text-info">{competition.statistiques?.totalButs || 0}</h3>
              <p className="card-text">Buts marqués</p>
            </div>
          </div>
        </div>
      </div>

      {/* Poules (si compétition avec phases de poules) */}
      {competition.poules && competition.poules.length > 0 && (
        <div className="row mb-4">
          <div className="col-12">
            <h3>
              <i className="fas fa-layer-group me-2"></i>
              Phases de poules
            </h3>
            {competition.poules.map((poule, pouleIndex) => (
              <div key={pouleIndex} className="card mb-3">
                <div className="card-header">
                  <h5 className="mb-0">
                    <i className="fas fa-users me-2"></i>
                    {poule.nom}
                  </h5>
                </div>
                <div className="card-body">
                  {poule.matchs && poule.matchs.length > 0 ? (
                    <div className="table-responsive">
                      <table className="table table-hover">
                        <thead>
                          <tr>
                            <th>Date</th>
                            <th>Équipe 1</th>
                            <th>Score</th>
                            <th>Équipe 2</th>
                            <th>Statut</th>
                            <th>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {poule.matchs.map((match, matchIndex) => (
                            <tr key={matchIndex}>
                              <td>
                                {match.dateMatch ? 
                                  new Date(match.dateMatch).toLocaleDateString('fr-FR') : 
                                  'À programmer'
                                }
                              </td>
                              <td>
                                <strong>{match.equipe1?.nom || 'TBD'}</strong>
                              </td>
                              <td>
                                {match.statut === 'Terminé' ? (
                                  <span className="badge bg-success">
                                    {match.score1} - {match.score2}
                                  </span>
                                ) : (
                                  <span className="text-muted">-</span>
                                )}
                              </td>
                              <td>
                                <strong>{match.equipe2?.nom || 'TBD'}</strong>
                              </td>
                              <td>
                                <span className={`badge ${getMatchStatus(match)}`}>
                                  {getMatchStatusText(match)}
                                </span>
                              </td>
                              <td>
                                <div className="btn-group" role="group">
                                  {!match.dateMatch && (user?.isAdmin || 
                                    userClubs.some(club => 
                                      (compareClubIds(club._id, match.equipe1) || compareClubIds(club._id, match.equipe2)) &&
                                      club.membres.some(m => compareUserIds(m.userId, user) && m.role === 'Admin')
                                    )) && (
                                    <button 
                                      className="btn btn-sm btn-outline-secondary"
                                      onClick={() => openDateModal(match)}
                                      title="Programmer une date"
                                    >
                                      <i className="fas fa-calendar-plus me-1"></i>
                                      Programmer
                                    </button>
                                  )}
                                  {match.statut === 'Programmé' && (
                                    <button 
                                      className="btn btn-sm btn-primary"
                                      onClick={() => openScoreModal(match)}
                                    >
                                      <i className="fas fa-edit me-1"></i>
                                      Saisir score
                                    </button>
                                  )}
                                  {match.statut === 'Terminé' && (
                                    <button 
                                      className="btn btn-sm btn-outline-primary"
                                      onClick={() => openScoreModal(match)}
                                    >
                                      <i className="fas fa-eye me-1"></i>
                                      Voir détails
                                    </button>
                                  )}
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <p className="text-muted">Aucun match programmé dans cette poule.</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Matchs d'élimination directe */}
      {competition.matchsElimination && competition.matchsElimination.length > 0 && (
        <div className="row mb-4">
          <div className="col-12">
            <h3>
              <i className="fas fa-sitemap me-2"></i>
              Phase d'élimination directe
            </h3>
            <div className="table-responsive">
              <table className="table table-hover">
                <thead>
                  <tr>
                    <th>Phase</th>
                    <th>Date</th>
                    <th>Équipe 1</th>
                    <th>Score</th>
                    <th>Équipe 2</th>
                    <th>Statut</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {competition.matchsElimination.map((match, index) => (
                    <tr key={index}>
                      <td>
                        <span className="badge bg-info">
                          {getPhaseText(match.phase, competition.equipesInscrites?.length || 0)}
                        </span>
                      </td>
                      <td>
                        {match.dateMatch ? 
                          new Date(match.dateMatch).toLocaleDateString('fr-FR') : 
                          'À programmer'
                        }
                      </td>
                      <td>
                        <strong>{match.equipe1?.nom || 'TBD'}</strong>
                      </td>
                      <td>
                        {match.statut === 'Terminé' ? (
                          <span className="badge bg-success">
                            {match.score1} - {match.score2}
                          </span>
                        ) : (
                          <span className="text-muted">-</span>
                        )}
                      </td>
                      <td>
                        <strong>{match.equipe2?.nom || 'TBD'}</strong>
                      </td>
                      <td>
                        <span className={`badge ${getMatchStatus(match)}`}>
                          {getMatchStatusText(match)}
                        </span>
                      </td>
                      <td>
                        <div className="btn-group" role="group">
                          {!match.dateMatch && (user?.isAdmin || 
                            userClubs.some(club => 
                              (compareClubIds(club._id, match.equipe1) || compareClubIds(club._id, match.equipe2)) &&
                              club.membres.some(m => compareUserIds(m.userId, user) && m.role === 'Admin')
                            )) && (
                            <button 
                              className="btn btn-sm btn-outline-secondary"
                              onClick={() => openDateModal(match)}
                              title="Programmer une date"
                            >
                              <i className="fas fa-calendar-plus me-1"></i>
                              Programmer
                            </button>
                          )}
                          {match.statut === 'Programmé' && (
                            <button 
                              className="btn btn-sm btn-primary"
                              onClick={() => openScoreModal(match)}
                            >
                              <i className="fas fa-edit me-1"></i>
                              Saisir score
                            </button>
                          )}
                          {match.statut === 'Terminé' && (
                            <button 
                              className="btn btn-sm btn-outline-primary"
                              onClick={() => openScoreModal(match)}
                            >
                              <i className="fas fa-eye me-1"></i>
                              Voir détails
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Modal de saisie de score */}
      {showScoreModal && selectedMatch && (
        <div className="modal fade show" style={{ display: 'block' }} tabIndex="-1">
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  <i className="fas fa-edit me-2"></i>
                  Saisie de score - {selectedMatch.equipe1?.nom} vs {selectedMatch.equipe2?.nom}
                </h5>
                <button 
                  type="button" 
                  className="btn-close" 
                  onClick={() => setShowScoreModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                <div className="row">
                  <div className="col-md-6">
                    <div className="mb-3">
                      <label className="form-label">
                        <strong>Score {selectedMatch.equipe1?.nom}</strong>
                      </label>
                      <input
                        type="number"
                        className="form-control"
                        value={scoreData.score1}
                        onChange={(e) => setScoreData(prev => ({ ...prev, score1: e.target.value }))}
                        min="0"
                      />
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="mb-3">
                      <label className="form-label">
                        <strong>Score {selectedMatch.equipe2?.nom}</strong>
                      </label>
                      <input
                        type="number"
                        className="form-control"
                        value={scoreData.score2}
                        onChange={(e) => setScoreData(prev => ({ ...prev, score2: e.target.value }))}
                        min="0"
                      />
                    </div>
                  </div>
                </div>

                <hr />

                <h6>Statistiques détaillées</h6>
                
                {/* Buteurs */}
                <div className="mb-3">
                  <label className="form-label">Buteurs</label>
                  <div className="d-flex gap-2 mb-2">
                    <button 
                      type="button" 
                      className="btn btn-sm btn-outline-primary"
                      onClick={addButeur}
                    >
                      <i className="fas fa-plus me-1"></i>
                      Ajouter buteur
                    </button>
                  </div>
                  {scoreData.buteurs.map((buteur, index) => (
                    <div key={index} className="badge bg-success me-2 mb-2">
                      {buteur.joueur} ({buteur.buts} buts)
                    </div>
                  ))}
                </div>

                {/* Passeurs */}
                <div className="mb-3">
                  <label className="form-label">Passeurs</label>
                  <div className="d-flex gap-2 mb-2">
                    <button 
                      type="button" 
                      className="btn btn-sm btn-outline-info"
                      onClick={addPasseur}
                    >
                      <i className="fas fa-plus me-1"></i>
                      Ajouter passeur
                    </button>
                  </div>
                  {scoreData.passeurs.map((passeur, index) => (
                    <div key={index} className="badge bg-info me-2 mb-2">
                      {passeur.joueur} ({passeur.passes} passes)
                    </div>
                  ))}
                </div>

                {/* Cartons */}
                <div className="row">
                  <div className="col-md-6">
                    <label className="form-label">Cartons jaunes</label>
                    <div className="d-flex gap-2 mb-2">
                      <button 
                        type="button" 
                        className="btn btn-sm btn-outline-warning"
                        onClick={() => addCarton('jaune')}
                      >
                        <i className="fas fa-plus me-1"></i>
                        Ajouter
                      </button>
                    </div>
                    {scoreData.cartonsJaunes.map((joueur, index) => (
                      <div key={index} className="badge bg-warning me-2 mb-2">
                        {joueur}
                      </div>
                    ))}
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Cartons rouges</label>
                    <div className="d-flex gap-2 mb-2">
                      <button 
                        type="button" 
                        className="btn btn-sm btn-outline-danger"
                        onClick={() => addCarton('rouge')}
                      >
                        <i className="fas fa-plus me-1"></i>
                        Ajouter
                      </button>
                    </div>
                    {scoreData.cartonsRouges.map((joueur, index) => (
                      <div key={index} className="badge bg-danger me-2 mb-2">
                        {joueur}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Capture d'écran */}
                <div className="mb-3">
                  <label className="form-label">URL capture d'écran (optionnel)</label>
                  <input
                    type="url"
                    className="form-control"
                    value={scoreData.captureEcran}
                    onChange={(e) => setScoreData(prev => ({ ...prev, captureEcran: e.target.value }))}
                    placeholder="https://..."
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  onClick={() => setShowScoreModal(false)}
                >
                  Annuler
                </button>
                <button 
                  type="button" 
                  className="btn btn-primary" 
                  onClick={handleScoreSubmit}
                >
                  <i className="fas fa-save me-2"></i>
                  Enregistrer le score
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de programmation de date */}
      {showDateModal && selectedMatchForDate && (
        <div className="modal fade show" style={{ display: 'block' }} tabIndex="-1">
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  <i className="fas fa-calendar-plus me-2"></i>
                  Programmer une date - {selectedMatchForDate.equipe1?.nom} vs {selectedMatchForDate.equipe2?.nom}
                </h5>
                <button 
                  type="button" 
                  className="btn-close" 
                  onClick={() => setShowDateModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                <div className="mb-3">
                  <label className="form-label">
                    <strong>Date et heure du match</strong>
                  </label>
                  <input
                    type="datetime-local"
                    className="form-control"
                    value={matchDate}
                    onChange={(e) => setMatchDate(e.target.value)}
                    min={new Date().toISOString().slice(0, 16)}
                  />
                  <small className="text-muted">
                    Sélectionnez la date et l'heure du match
                  </small>
                </div>
              </div>
              <div className="modal-footer">
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  onClick={() => setShowDateModal(false)}
                >
                  Annuler
                </button>
                <button 
                  type="button" 
                  className="btn btn-primary" 
                  onClick={handleDateSubmit}
                  disabled={!matchDate}
                >
                  <i className="fas fa-save me-2"></i>
                  Programmer le match
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de sélection de joueur */}
      {showJoueurModal && selectedMatch && (
        <div className="modal fade show" style={{ display: 'block' }} tabIndex="-1">
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  <i className="fas fa-user-plus me-2"></i>
                  {joueurModalType === 'buteur' && 'Ajouter un buteur'}
                  {joueurModalType === 'passeur' && 'Ajouter un passeur'}
                  {joueurModalType === 'cartonJaune' && 'Ajouter un carton jaune'}
                  {joueurModalType === 'cartonRouge' && 'Ajouter un carton rouge'}
                </h5>
                <button 
                  type="button" 
                  className="btn-close" 
                  onClick={() => setShowJoueurModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                <div className="mb-3">
                  <label className="form-label">
                    <strong>Sélectionner un joueur</strong>
                  </label>
                  <select
                    className="form-select"
                    value={selectedJoueur}
                    onChange={(e) => setSelectedJoueur(e.target.value)}
                  >
                    <option value="">Choisir un joueur...</option>
                    {getJoueursEquipes(selectedMatch).map((joueur, index) => (
                      <option key={index} value={joueur.pseudo}>
                        {joueur.pseudo} ({joueur.equipe}) - {joueur.role}
                      </option>
                    ))}
                  </select>
                </div>
                
                {(joueurModalType === 'buteur' || joueurModalType === 'passeur') && (
                  <div className="mb-3">
                    <label className="form-label">
                      <strong>
                        {joueurModalType === 'buteur' ? 'Nombre de buts' : 'Nombre de passes'}
                      </strong>
                    </label>
                    <input
                      type="number"
                      className="form-control"
                      value={joueurQuantite}
                      onChange={(e) => setJoueurQuantite(parseInt(e.target.value) || 1)}
                      min="1"
                      max="10"
                    />
                  </div>
                )}
              </div>
              <div className="modal-footer">
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  onClick={() => setShowJoueurModal(false)}
                >
                  Annuler
                </button>
                <button 
                  type="button" 
                  className="btn btn-primary" 
                  onClick={handleJoueurSubmit}
                  disabled={!selectedJoueur}
                >
                  <i className="fas fa-plus me-2"></i>
                  Ajouter
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Overlay pour les modals */}
      {(showScoreModal || showDateModal || showJoueurModal) && (
        <div className="modal-backdrop fade show"></div>
      )}
    </div>
  );
};

export default CompetitionMatchesPage; 