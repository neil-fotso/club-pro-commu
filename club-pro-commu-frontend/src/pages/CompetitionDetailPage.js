import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { competitionAPI, clubAPI } from '../services/api';

export default function CompetitionDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const [competition, setCompetition] = useState(null);
  const [userClubs, setUserClubs] = useState([]);
  const [selectedClub, setSelectedClub] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [inscribing, setInscribing] = useState(false);
  const [showInscriptionModal, setShowInscriptionModal] = useState(false);
  const [inscriptionMessage, setInscriptionMessage] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [competitionData, clubsData] = await Promise.all([
          competitionAPI.getCompetition(id),
          user ? clubAPI.getMyClubs() : Promise.resolve([])
        ]);
        
        setCompetition(competitionData);
        setUserClubs(clubsData);
        setError(null);
      } catch (err) {
        setError('Erreur lors du chargement de la compétition');
        console.error('Erreur chargement compétition:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, user]);

  const handleInscription = async () => {
    if (!selectedClub) {
      alert('Veuillez sélectionner un club');
      return;
    }

    try {
      setInscribing(true);
      await competitionAPI.inscrireClub(id, selectedClub, inscriptionMessage, user.token);
      
      // Recharger la compétition pour voir les changements
      const updatedCompetition = await competitionAPI.getCompetition(id);
      setCompetition(updatedCompetition);
      
      setShowInscriptionModal(false);
      setSelectedClub('');
      setInscriptionMessage('');
      alert(competition.visibilite === 'publique' ? 'Inscription réussie !' : 'Demande d\'inscription envoyée !');
    } catch (error) {
      console.error('Erreur inscription:', error);
      alert('Erreur lors de l\'inscription: ' + (error.message || 'Erreur inconnue'));
    } finally {
      setInscribing(false);
    }
  };

  const handleLancerCompetition = async () => {
    if (!window.confirm('Êtes-vous sûr de vouloir lancer cette compétition ? Cette action est irréversible.')) {
      return;
    }

    try {
      await competitionAPI.lancerCompetition(id, user.token);
      
      // Recharger la compétition
      const updatedCompetition = await competitionAPI.getCompetition(id);
      setCompetition(updatedCompetition);
      
      alert('Compétition lancée avec succès !');
    } catch (error) {
      console.error('Erreur lancement:', error);
      alert('Erreur lors du lancement: ' + (error.message || 'Erreur inconnue'));
    }
  };

  const handleTraiterDemande = async (demandeId, action) => {
    try {
      await competitionAPI.traiterDemandeInscription(id, demandeId, action, user.token);
      
      // Recharger la compétition
      const updatedCompetition = await competitionAPI.getCompetition(id);
      setCompetition(updatedCompetition);
      
      alert(`Demande ${action === 'accepter' ? 'acceptée' : 'refusée'} avec succès !`);
    } catch (error) {
      console.error('Erreur traitement demande:', error);
      alert('Erreur lors du traitement: ' + (error.message || 'Erreur inconnue'));
    }
  };

  const getStatutBadge = (statut) => {
    const badges = {
      'Ouvert': 'bg-success',
      'Fermé': 'bg-secondary',
      'En cours': 'bg-warning',
      'Terminé': 'bg-info'
    };
    return badges[statut] || 'bg-secondary';
  };

  const getTypeBadge = (type) => {
    return type === 'championnat' ? 'bg-primary' : 'bg-danger';
  };

  const getVisibiliteBadge = (visibilite) => {
    return visibilite === 'publique' ? 'bg-success' : 'bg-warning';
  };

  if (loading) {
    return (
      <div className="container py-5">
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Chargement...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error || !competition) {
    return (
      <div className="container py-5">
        <div className="alert alert-danger">
          <i className="fas fa-exclamation-triangle me-2"></i>
          {error || 'Compétition non trouvée'}
        </div>
      </div>
    );
  }

  const isCreator = user && competition.createurId._id === user.id;
  const isInscrit = competition.equipesInscrites.some(e => 
    userClubs.some(club => club._id === e.clubId._id)
  );

  return (
    <div className="container py-5">
      {/* Header */}
      <div className="row">
        <div className="col-lg-8">
          <div className="d-flex align-items-center mb-4">
            <Link to="/competitions" className="btn btn-outline-secondary me-3">
              <i className="fas fa-arrow-left me-2"></i>
              Retour
            </Link>
            <div>
              <h1 className="mb-2">{competition.nom}</h1>
              <div className="d-flex gap-2 flex-wrap">
                <span className={`badge ${getTypeBadge(competition.type)}`}>
                  {competition.type === 'championnat' ? 'Championnat' : 'Coupe'}
                </span>
                <span className={`badge ${getStatutBadge(competition.statut)}`}>
                  {competition.statut}
                </span>
                <span className={`badge ${getVisibiliteBadge(competition.visibilite)}`}>
                  {competition.visibilite === 'publique' ? 'Publique' : 'Privée'}
                </span>
                {competition.type === 'coupe' && (
                  <span className="badge bg-info">
                    {competition.formatCoupe === 'elimination_directe' ? 'Élimination directe' : 'Poules + Élimination'}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
        
        <div className="col-lg-4 text-end">
          {isCreator && competition.statut === 'Ouvert' && (
            <button 
              className="btn btn-success btn-lg"
              onClick={handleLancerCompetition}
            >
              <i className="fas fa-play me-2"></i>
              Lancer la compétition
            </button>
          )}
          
          {!isCreator && user && !isInscrit && (
            <button 
              className="btn btn-primary btn-lg"
              onClick={() => setShowInscriptionModal(true)}
            >
              <i className="fas fa-user-plus me-2"></i>
              S'inscrire
            </button>
          )}
        </div>
      </div>

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
                <div className="mb-3">
                  <strong>Description:</strong>
                  <p className="mb-0">{competition.description}</p>
                </div>
              )}

              <div className="row">
                <div className="col-md-6">
                  <strong>Date de début:</strong>
                  <p>{new Date(competition.dateDebut).toLocaleDateString('fr-FR')}</p>
                </div>
                {competition.dateFin && (
                  <div className="col-md-6">
                    <strong>Date de fin:</strong>
                    <p>{new Date(competition.dateFin).toLocaleDateString('fr-FR')}</p>
                  </div>
                )}
                <div className="col-md-6">
                  <strong>Nombre d'équipes:</strong>
                  <p>{competition.nombreEquipes}</p>
                </div>
                <div className="col-md-6">
                  <strong>Plateforme:</strong>
                  <p>{competition.plateforme}</p>
                </div>
                <div className="col-md-6">
                  <strong>Niveau:</strong>
                  <p>{competition.niveau}</p>
                </div>
                <div className="col-md-6">
                  <strong>Inscription:</strong>
                  <p>{competition.inscriptionGratuite ? 'Gratuite' : `${competition.montantInscription}€`}</p>
                </div>
              </div>

              {competition.reglement && (
                <div className="mt-3">
                  <strong>Règlement:</strong>
                  <p className="mb-0">{competition.reglement}</p>
                </div>
              )}

              {competition.recompense && (
                <div className="mt-3">
                  <strong>Récompenses:</strong>
                  <p className="mb-0">{competition.recompense}</p>
                </div>
              )}
            </div>
          </div>

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
                <p className="text-muted">Aucune équipe inscrite pour le moment.</p>
              ) : (
                <div className="row">
                  {competition.equipesInscrites.map((equipe, index) => (
                    <div key={index} className="col-md-6 mb-3">
                      <div className="d-flex align-items-center p-3 border rounded">
                        <div className="flex-grow-1">
                          <h6 className="mb-1">{equipe.clubId.nom}</h6>
                          <small className="text-muted">
                            Inscrit le {new Date(equipe.dateInscription).toLocaleDateString('fr-FR')}
                          </small>
                        </div>
                        <span className={`badge ${equipe.statut === 'Inscrit' ? 'bg-success' : 'bg-warning'}`}>
                          {equipe.statut}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Demandes d'inscription (pour les compétitions privées) */}
          {isCreator && competition.visibilite === 'privee' && competition.demandesInscription.length > 0 && (
            <div className="card mb-4">
              <div className="card-header">
                <h5 className="mb-0">
                  <i className="fas fa-clock me-2"></i>
                  Demandes d'inscription ({competition.demandesInscription.filter(d => d.statut === 'En attente').length})
                </h5>
              </div>
              <div className="card-body">
                {competition.demandesInscription
                  .filter(demande => demande.statut === 'En attente')
                  .map((demande, index) => (
                    <div key={index} className="border rounded p-3 mb-3">
                      <div className="d-flex justify-content-between align-items-start">
                        <div>
                          <h6 className="mb-1">{demande.clubId.nom}</h6>
                          <small className="text-muted">
                            Demande du {new Date(demande.dateDemande).toLocaleDateString('fr-FR')}
                          </small>
                          {demande.message && (
                            <p className="mb-2 mt-2">{demande.message}</p>
                          )}
                        </div>
                        <div className="d-flex gap-2">
                          <button
                            className="btn btn-success btn-sm"
                            onClick={() => handleTraiterDemande(demande._id, 'accepter')}
                          >
                            <i className="fas fa-check me-1"></i>
                            Accepter
                          </button>
                          <button
                            className="btn btn-danger btn-sm"
                            onClick={() => handleTraiterDemande(demande._id, 'refuser')}
                          >
                            <i className="fas fa-times me-1"></i>
                            Refuser
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* Matchs (si la compétition est lancée) */}
          {competition.statut === 'En cours' && competition.matchs.length > 0 && (
            <div className="card">
              <div className="card-header">
                <h5 className="mb-0">
                  <i className="fas fa-futbol me-2"></i>
                  Matchs
                </h5>
              </div>
              <div className="card-body">
                {competition.matchs.map((match, index) => (
                  <div key={index} className="border rounded p-3 mb-3">
                    <div className="d-flex justify-content-between align-items-center">
                      <div className="flex-grow-1">
                        <div className="d-flex align-items-center">
                          <span className="fw-bold">{match.equipe1.nom}</span>
                          <span className="mx-3">
                            {match.statut === 'Terminé' ? `${match.score1} - ${match.score2}` : 'vs'}
                          </span>
                          <span className="fw-bold">{match.equipe2.nom}</span>
                        </div>
                        <small className="text-muted">
                          {match.phase} • {match.statut}
                        </small>
                      </div>
                      <div>
                        <span className={`badge ${match.statut === 'Terminé' ? 'bg-success' : 'bg-warning'}`}>
                          {match.statut}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="col-lg-4">
          <div className="card mb-4">
            <div className="card-header">
              <h5 className="mb-0">
                <i className="fas fa-user me-2"></i>
                Organisateur
              </h5>
            </div>
            <div className="card-body">
              <p className="mb-0">{competition.createurId.pseudo}</p>
            </div>
          </div>

          {competition.gagnant && (
            <div className="card mb-4">
              <div className="card-header">
                <h5 className="mb-0">
                  <i className="fas fa-trophy me-2"></i>
                  Gagnant
                </h5>
              </div>
              <div className="card-body">
                <p className="mb-0">{competition.gagnant.nom}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal d'inscription */}
      {showInscriptionModal && (
        <div className="modal fade show" style={{display: 'block'}}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">S'inscrire à la compétition</h5>
                <button 
                  type="button" 
                  className="btn-close" 
                  onClick={() => setShowInscriptionModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                <div className="mb-3">
                  <label className="form-label">Sélectionner un club</label>
                  <select 
                    className="form-select"
                    value={selectedClub}
                    onChange={(e) => setSelectedClub(e.target.value)}
                  >
                    <option value="">Choisir un club...</option>
                    {userClubs.map(club => (
                      <option key={club._id} value={club._id}>
                        {club.nom}
                      </option>
                    ))}
                  </select>
                </div>
                
                {competition.visibilite === 'privee' && (
                  <div className="mb-3">
                    <label className="form-label">Message (optionnel)</label>
                    <textarea 
                      className="form-control"
                      rows="3"
                      value={inscriptionMessage}
                      onChange={(e) => setInscriptionMessage(e.target.value)}
                      placeholder="Message pour l'organisateur..."
                    ></textarea>
                  </div>
                )}
              </div>
              <div className="modal-footer">
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  onClick={() => setShowInscriptionModal(false)}
                >
                  Annuler
                </button>
                <button 
                  type="button" 
                  className="btn btn-primary"
                  onClick={handleInscription}
                  disabled={inscribing || !selectedClub}
                >
                  {inscribing ? 'Inscription...' : 'S\'inscrire'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 