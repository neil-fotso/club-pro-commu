import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { competitionAPI, clubAPI } from '../services/api';

export default function CompetitionDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const [competition, setCompetition] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userClubs, setUserClubs] = useState([]);
  const [selectedClub, setSelectedClub] = useState('');
  const [inscriptionLoading, setInscriptionLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchCompetition = useCallback(async () => {
    try {
      setLoading(true);
      const data = await competitionAPI.getCompetition(id);
      setCompetition(data);
    } catch (error) {
      console.error('Erreur récupération compétition:', error);
      setError('Compétition non trouvée');
    } finally {
      setLoading(false);
    }
  }, [id]);

  const fetchUserClubs = useCallback(async () => {
    try {
      const data = await clubAPI.getMyClubs(user?.token);
      setUserClubs(data);
    } catch (error) {
      console.error('Erreur récupération clubs:', error);
    }
  }, [user?.token]);

  useEffect(() => {
    fetchCompetition();
    if (user) {
      fetchUserClubs();
    }
  }, [fetchCompetition, fetchUserClubs, user]);

  const handleInscription = async () => {
    if (!selectedClub) {
      setError('Veuillez sélectionner un club');
      return;
    }

    try {
      setInscriptionLoading(true);
      setError('');
      
      await competitionAPI.registerClub(id, selectedClub, user?.token);

      // Recharger la compétition pour mettre à jour les inscriptions
      await fetchCompetition();
      setSelectedClub('');
      
      // Afficher un message de succès
      alert('Inscription réussie !');
    } catch (error) {
      console.error('Erreur inscription:', error);
      setError(error.response?.data?.message || 'Erreur lors de l\'inscription');
    } finally {
      setInscriptionLoading(false);
    }
  };

  const handleDesinscription = async (clubId) => {
    if (!window.confirm('Êtes-vous sûr de vouloir vous désinscrire ?')) {
      return;
    }

    try {
      await competitionAPI.unregisterClub(id, clubId, user?.token);

      await fetchCompetition();
      alert('Désinscription réussie !');
    } catch (error) {
      console.error('Erreur désinscription:', error);
      setError(error.response?.data?.message || 'Erreur lors de la désinscription');
    }
  };

  const isClubInscrit = (clubId) => {
    return competition?.equipesInscrites.some(
      equipe => equipe.clubId._id === clubId
    );
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
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="container py-5">
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Chargement...</span>
          </div>
          <p className="mt-3">Chargement de la compétition...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container py-5">
        <div className="text-center">
          <i className="fas fa-exclamation-triangle fa-4x text-warning mb-3"></i>
          <h3 className="text-warning">{error}</h3>
          <Link to="/competitions" className="btn btn-primary">
            <i className="fas fa-arrow-left me-2"></i>
            Retour aux compétitions
          </Link>
        </div>
      </div>
    );
  }

  if (!competition) {
    return null;
  }

  return (
    <div className="container py-5">
      {/* Header */}
      <div className="row mb-5">
        <div className="col-lg-8">
          <nav aria-label="breadcrumb">
            <ol className="breadcrumb">
              <li className="breadcrumb-item">
                <Link to="/competitions">Compétitions</Link>
              </li>
              <li className="breadcrumb-item active">{competition.nom}</li>
            </ol>
          </nav>
          
          <div className="d-flex align-items-center mb-3">
            <i className={`${getTypeIcon(competition.type)} fa-3x text-primary me-3`}></i>
            <div>
              <h1 className="display-5 fw-bold mb-2">{competition.nom}</h1>
              <div className="d-flex gap-2">
                <span className={`badge bg-${getStatutBadge(competition.statut)} fs-6`}>
                  {competition.statut}
                </span>
                <span className="badge bg-secondary fs-6">
                  {competition.plateforme}
                </span>
                <span className="badge bg-info fs-6">
                  {competition.niveau}
                </span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="col-lg-4 text-end">
          {user && competition.statut === 'Ouvert' && (
            <div className="d-flex flex-column gap-2">
              <select 
                className="form-select"
                value={selectedClub}
                onChange={(e) => setSelectedClub(e.target.value)}
              >
                <option value="">Sélectionner un club</option>
                {userClubs.map(club => (
                  <option key={club._id} value={club._id}>
                    {club.nom}
                  </option>
                ))}
              </select>
              
              {selectedClub && !isClubInscrit(selectedClub) && (
                <button 
                  className="btn btn-success"
                  onClick={handleInscription}
                  disabled={inscriptionLoading}
                >
                  {inscriptionLoading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2"></span>
                      Inscription...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-plus me-2"></i>
                      S'inscrire
                    </>
                  )}
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {error && (
        <div className="alert alert-danger mb-4">
          <i className="fas fa-exclamation-triangle me-2"></i>
          {error}
        </div>
      )}

      <div className="row">
        {/* Informations principales */}
        <div className="col-lg-8">
          <div className="card mb-4">
            <div className="card-header">
              <h5 className="mb-0">
                <i className="fas fa-info-circle me-2"></i>
                Informations
              </h5>
            </div>
            <div className="card-body">
              {competition.description && (
                <p className="lead mb-4">{competition.description}</p>
              )}

              <div className="row">
                <div className="col-md-6">
                  <h6>Dates</h6>
                  <ul className="list-unstyled">
                    <li><strong>Début:</strong> {formatDate(competition.dateDebut)}</li>
                    {competition.dateFin && (
                      <li><strong>Fin:</strong> {formatDate(competition.dateFin)}</li>
                    )}
                  </ul>
                </div>
                <div className="col-md-6">
                  <h6>Détails</h6>
                  <ul className="list-unstyled">
                    <li><strong>Type:</strong> {competition.type}</li>
                    <li><strong>Équipes:</strong> {competition.equipesInscrites.length}/{competition.nombreEquipes}</li>
                    <li><strong>Inscription:</strong> {competition.inscriptionGratuite ? 'Gratuite' : `${competition.montantInscription}€`}</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Règlement */}
          {competition.reglement && (
            <div className="card mb-4">
              <div className="card-header">
                <h5 className="mb-0">
                  <i className="fas fa-book me-2"></i>
                  Règlement
                </h5>
              </div>
              <div className="card-body">
                <div className="whitespace-pre-wrap">{competition.reglement}</div>
              </div>
            </div>
          )}

          {/* Récompenses */}
          {competition.recompense && (
            <div className="card mb-4">
              <div className="card-header">
                <h5 className="mb-0">
                  <i className="fas fa-gift me-2"></i>
                  Récompenses
                </h5>
              </div>
              <div className="card-body">
                <div className="whitespace-pre-wrap">{competition.recompense}</div>
              </div>
            </div>
          )}

          {/* Matchs */}
          {competition.matchs && competition.matchs.length > 0 && (
            <div className="card mb-4">
              <div className="card-header">
                <h5 className="mb-0">
                  <i className="fas fa-gamepad me-2"></i>
                  Matchs
                </h5>
              </div>
              <div className="card-body">
                <div className="table-responsive">
                  <table className="table table-hover">
                    <thead>
                      <tr>
                        <th>Phase</th>
                        <th>Équipe 1</th>
                        <th>Score</th>
                        <th>Équipe 2</th>
                        <th>Statut</th>
                        <th>Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {competition.matchs.map((match, index) => (
                        <tr key={index}>
                          <td>
                            <span className="badge bg-secondary">{match.phase}</span>
                          </td>
                          <td>{match.equipe1?.nom || 'TBD'}</td>
                          <td>
                            {match.statut === 'Terminé' ? (
                              <strong>{match.score1} - {match.score2}</strong>
                            ) : (
                              <span className="text-muted">-</span>
                            )}
                          </td>
                          <td>{match.equipe2?.nom || 'TBD'}</td>
                          <td>
                            <span className={`badge bg-${match.statut === 'Terminé' ? 'success' : 'warning'}`}>
                              {match.statut}
                            </span>
                          </td>
                          <td>
                            {match.dateMatch ? formatDate(match.dateMatch) : '-'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="col-lg-4">
          {/* Équipes inscrites */}
          <div className="card mb-4">
            <div className="card-header">
              <h5 className="mb-0">
                <i className="fas fa-users me-2"></i>
                Équipes inscrites ({competition.equipesInscrites.length}/{competition.nombreEquipes})
              </h5>
            </div>
            <div className="card-body">
              {competition.equipesInscrites.length === 0 ? (
                <p className="text-muted text-center">Aucune équipe inscrite</p>
              ) : (
                <div className="list-group list-group-flush">
                  {competition.equipesInscrites.map((equipe, index) => (
                    <div key={index} className="list-group-item d-flex justify-content-between align-items-center">
                      <div>
                        <strong>{equipe.clubId.nom}</strong>
                        <br />
                        <small className="text-muted">
                          Inscrit le {formatDate(equipe.dateInscription)}
                        </small>
                      </div>
                      <div className="d-flex gap-2">
                        <span className={`badge bg-${equipe.statut === 'Gagnant' ? 'success' : 'primary'}`}>
                          {equipe.statut}
                        </span>
                        {user && isClubInscrit(equipe.clubId._id) && competition.statut === 'Ouvert' && (
                          <button 
                            className="btn btn-outline-danger btn-sm"
                            onClick={() => handleDesinscription(equipe.clubId._id)}
                            title="Se désinscrire"
                          >
                            <i className="fas fa-times"></i>
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Informations créateur */}
          <div className="card mb-4">
            <div className="card-header">
              <h5 className="mb-0">
                <i className="fas fa-user me-2"></i>
                Organisateur
              </h5>
            </div>
            <div className="card-body text-center">
              <i className="fas fa-user-circle fa-3x text-primary mb-3"></i>
              <h6>{competition.createurId?.pseudo}</h6>
              <small className="text-muted">
                Créé le {formatDate(competition.dateCreation)}
              </small>
            </div>
          </div>

          {/* Actions */}
          {user && competition.createurId?._id === user.id && (
            <div className="card">
              <div className="card-header">
                <h5 className="mb-0">
                  <i className="fas fa-cog me-2"></i>
                  Actions
                </h5>
              </div>
              <div className="card-body">
                <div className="d-grid gap-2">
                  <button className="btn btn-outline-primary">
                    <i className="fas fa-edit me-2"></i>
                    Modifier
                  </button>
                  <button className="btn btn-outline-danger">
                    <i className="fas fa-trash me-2"></i>
                    Supprimer
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 