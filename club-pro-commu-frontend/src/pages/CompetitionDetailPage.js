import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { competitionAPI, clubAPI } from '../services/api';

export default function CompetitionDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [competition, setCompetition] = useState(null);
  const [userClubs, setUserClubs] = useState([]);
  const [selectedClub, setSelectedClub] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [inscribing, setInscribing] = useState(false);
  const [showInscriptionModal, setShowInscriptionModal] = useState(false);

  const userClubsAdministres = userClubs.filter(club => {
    const isCreator = club.createurId === user?.id || club.createurId?._id === user?.id || club.createurId === user?._id || club.createurId?._id === user?._id;
    const isAdminOrCapitaine = club.membres?.some(m => {
      const mId = typeof m.userId === 'object' ? m.userId._id : m.userId;
      const uId = user?.id || user?._id;
      return mId?.toString() === uId?.toString() && (m.role === 'Admin' || m.role === 'Capitaine');
    });
    return isCreator || isAdminOrCapitaine;
  });
  const [inscriptionMessage, setInscriptionMessage] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [competitionData, clubsData] = await Promise.all([
          competitionAPI.getCompetition(id),
          user ? clubAPI.getMyClubs(user.token) : Promise.resolve([])
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

    if ((competition.equipesInscrites?.length || 0) >= competition.nombreEquipes) {
      alert('Cette compétition a atteint son maximum d\'équipes');
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

  const handleSupprimerCompetition = async () => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cette compétition ? Cette action supprimera définitivement le tournoi.')) {
      return;
    }

    try {
      await competitionAPI.deleteCompetition(id, user.token);
      alert('Compétition supprimée avec succès !');
      navigate('/competitions');
    } catch (error) {
      console.error('Erreur suppression:', error);
      alert('Erreur lors de la suppression: ' + (error.message || 'Erreur inconnue'));
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

  const handleQuitterCompetition = async (clubId = null) => {
    console.log('Debug - userClubs:', userClubs);
    console.log('Debug - competition.equipesInscrites:', competition.equipesInscrites);
    console.log('Debug - clubInscrit:', clubInscrit);
    console.log('Debug - clubId parameter:', clubId);
    
    const clubToQuit = clubId ? userClubs.find(club => compareClubIds(club._id, clubId)) : clubInscrit;
    
    console.log('Debug - clubToQuit:', clubToQuit);
    
    if (!clubToQuit) {
      alert('Aucun club inscrit trouvé');
      return;
    }

    if (!window.confirm(`Êtes-vous sûr de vouloir quitter la compétition "${competition.nom}" avec le club "${clubToQuit.nom}" ?`)) {
      return;
    }

    try {
      await competitionAPI.quitterCompetition(id, clubToQuit._id, user.token);
      
      // Recharger la compétition
      const updatedCompetition = await competitionAPI.getCompetition(id);
      setCompetition(updatedCompetition);
      
      alert('Club retiré de la compétition avec succès !');
    } catch (error) {
      console.error('Erreur désinscription:', error);
      alert('Erreur lors de la désinscription: ' + (error.message || 'Erreur inconnue'));
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

  if (!user) {
    return (
      <div className="container py-5">
        <div className="alert alert-info">
          <i className="fas fa-info-circle me-2"></i>
          Veuillez vous connecter pour voir les détails de cette compétition.
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

  // Fonction helper pour comparer les IDs utilisateur
  const compareUserIds = (userId1, userId2) => {
    if (!userId1 || !userId2) return false;
    const id1 = typeof userId1 === 'object' ? (userId1._id || userId1.id) : userId1;
    const id2 = typeof userId2 === 'object' ? (userId2._id || userId2.id) : userId2;
    return id1?.toString() === id2?.toString();
  };
  
  const isCreator = user && competition.createurId && compareUserIds(competition.createurId, user);
  

  
  // Fonction helper pour comparer les IDs de clubs
  const compareClubIds = (clubId1, clubId2) => {
    if (!clubId1 || !clubId2) return false;
    const id1 = typeof clubId1 === 'object' ? (clubId1._id || clubId1.id) : clubId1;
    const id2 = typeof clubId2 === 'object' ? (clubId2._id || clubId2.id) : clubId2;
    return id1?.toString() === id2?.toString();
  };
  
  const isInscrit = (user && competition.equipesInscrites?.some(e => 
    userClubs.some(club => compareClubIds(club._id, e.clubId))
  )) || false;
  
  // Trouver le club inscrit de l'utilisateur
  const clubInscrit = user ? (userClubs.find(club => 
    competition.equipesInscrites?.some(e => compareClubIds(club._id, e.clubId))
  )) : null;

  const getEquipeInscriteDetails = () => {
    if (!user || !clubInscrit) return null;
    return competition.equipesInscrites?.find(e => compareClubIds(clubInscrit._id, e.clubId));
  };
  const equipeDetails = getEquipeInscriteDetails();

  return (
    <div className="container py-4 px-4 px-md-5 animate-fade-in">
      {/* Header en style Gaming */}
      <div className="gaming-header">
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-4">
          <div>
            <div className="d-flex flex-wrap gap-2 mb-3">
              <Link to="/competitions" className="btn btn-sm btn-outline-secondary">
                <i className="fas fa-arrow-left me-1"></i>
                Retour
              </Link>
              {(competition.statut === 'En cours' || competition.statut === 'Terminé') && (
                <>
                  <Link to={`/competition/${competition._id}/matchs`} className="btn btn-sm btn-outline-info">
                    <i className="fas fa-calendar-alt me-1"></i>
                    Calendrier
                  </Link>
                  <Link to={`/competition/${competition._id}/mes-matchs`} className="btn btn-sm btn-primary">
                    <i className="fas fa-futbol me-1"></i>
                    Matchs
                  </Link>
                </>
              )}

            </div>
            
            <h1 className="gaming-title mb-2" style={{fontSize: '2rem'}}>{competition.nom}</h1>
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
          
          <div className="d-flex flex-wrap gap-2 text-md-end justify-content-start justify-content-md-end">
            {user && (isCreator || user.isAdmin) && (
              <button 
                className="btn btn-outline-danger"
                onClick={handleSupprimerCompetition}
              >
                <i className="fas fa-trash me-2"></i>
                Supprimer
              </button>
            )}

            {isCreator && (competition.statut === 'Ouvert' || competition.statut === 'Brouillon') && (
              <button 
                className="btn btn-success"
                onClick={handleLancerCompetition}
              >
                <i className="fas fa-play me-2"></i>
                Lancer la compétition
              </button>
            )}
            
            {user && !isInscrit && (
              <button 
                className="btn btn-primary"
                onClick={() => setShowInscriptionModal(true)}
              >
                <i className="fas fa-user-plus me-2"></i>
                S'inscrire
              </button>
            )}
            
            {user && isInscrit && competition.statut === 'Ouvert' && (
              <button 
                className="btn btn-danger"
                onClick={handleQuitterCompetition}
              >
                <i className="fas fa-sign-out-alt me-2"></i>
                Quitter
              </button>
            )}
          </div>
        </div>
      </div>

      {isInscrit && equipeDetails && equipeDetails.statutPaiement === 'En attente' && (
        <div className="alert alert-warning border-0 bg-warning bg-opacity-10 d-flex justify-content-between align-items-center mb-4 text-white" style={{ borderRadius: '12px', border: '1px solid rgba(255,193,7,0.2)' }}>
          <div>
            <i className="fas fa-exclamation-triangle text-warning me-2" style={{ fontSize: '1.2rem' }}></i>
            <strong>Paiement Requis</strong> : Votre club <strong>{clubInscrit.nom}</strong> est pré-inscrit, mais l'inscription n'est pas confirmée. Veuillez régler les frais de participation.
          </div>
          <Link to={`/competition/${competition._id}/paiement/${clubInscrit._id}`} className="btn btn-warning text-dark fw-bold btn-sm ms-3">
            <i className="fas fa-credit-card me-1"></i> Réglér les frais ({competition.montantInscription}€)
          </Link>
        </div>
      )}

      <div className="row">
        {/* Informations principales */}
        <div className="col-lg-8">
          <div className="card mb-4">
            <div className="card-header d-flex align-items-center py-3" style={{borderBottom: '1px solid var(--border-glass)'}}>
              <div className="bg-primary rounded-pill me-2" style={{width: '4px', height: '18px', background: 'var(--gradient-esports) !important'}}></div>
              <h5 className="mb-0 text-uppercase text-white fw-bold font-rajdhani" style={{letterSpacing: '0.5px'}}>
                <i className="fas fa-info-circle me-2 text-primary"></i>
                Informations
              </h5>
            </div>
            <div className="card-body">
              {competition.description && (
                <div className="p-3 rounded mb-4" style={{background: 'rgba(0,0,0,0.15)', borderLeft: '3px solid var(--neon-purple)', borderRadius: '8px'}}>
                  <strong className="d-block text-uppercase text-muted mb-1" style={{fontSize: '0.7rem', letterSpacing: '0.5px'}}>Description</strong>
                  <p className="mb-0 text-silver">{competition.description}</p>
                </div>
              )}

              <div className="row g-3">
                <div className="col-md-6 col-lg-4">
                  <div className="d-flex align-items-center gap-3 p-3 rounded" style={{background: 'rgba(255,255,255,0.01)', border: '1px solid var(--border-glass)'}}>
                    <div className="p-3 rounded bg-dark-navbar text-primary d-flex align-items-center justify-content-center" style={{width: '48px', height: '48px', border: '1px solid var(--border-glass)'}}>
                      <i className="fas fa-calendar-alt text-gradient" style={{fontSize: '1.1rem'}}></i>
                    </div>
                    <div>
                      <small className="text-uppercase text-muted d-block" style={{fontSize: '0.65rem', letterSpacing: '0.5px'}}>Date de début</small>
                      <span className="fw-bold text-white font-rajdhani" style={{fontSize: '1rem'}}>{new Date(competition.dateDebut).toLocaleDateString('fr-FR')}</span>
                    </div>
                  </div>
                </div>

                {competition.dateFin && (
                  <div className="col-md-6 col-lg-4">
                    <div className="d-flex align-items-center gap-3 p-3 rounded" style={{background: 'rgba(255,255,255,0.01)', border: '1px solid var(--border-glass)'}}>
                      <div className="p-3 rounded bg-dark-navbar text-primary d-flex align-items-center justify-content-center" style={{width: '48px', height: '48px', border: '1px solid var(--border-glass)'}}>
                        <i className="fas fa-calendar-check text-gradient" style={{fontSize: '1.1rem'}}></i>
                      </div>
                      <div>
                        <small className="text-uppercase text-muted d-block" style={{fontSize: '0.65rem', letterSpacing: '0.5px'}}>Date de fin</small>
                        <span className="fw-bold text-white font-rajdhani" style={{fontSize: '1rem'}}>{new Date(competition.dateFin).toLocaleDateString('fr-FR')}</span>
                      </div>
                    </div>
                  </div>
                )}

                <div className="col-md-6 col-lg-4">
                  <div className="d-flex align-items-center gap-3 p-3 rounded" style={{background: 'rgba(255,255,255,0.01)', border: '1px solid var(--border-glass)'}}>
                    <div className="p-3 rounded bg-dark-navbar text-primary d-flex align-items-center justify-content-center" style={{width: '48px', height: '48px', border: '1px solid var(--border-glass)'}}>
                      <i className="fas fa-users text-gradient" style={{fontSize: '1.1rem'}}></i>
                    </div>
                    <div>
                      <small className="text-uppercase text-muted d-block" style={{fontSize: '0.65rem', letterSpacing: '0.5px'}}>Clubs Inscrits</small>
                      <span className="fw-bold text-white font-rajdhani" style={{fontSize: '1rem'}}>{competition.equipesInscrites?.length || 0} / {competition.nombreEquipes || 8}</span>
                    </div>
                  </div>
                </div>

                <div className="col-md-6 col-lg-4">
                  <div className="d-flex align-items-center gap-3 p-3 rounded" style={{background: 'rgba(255,255,255,0.01)', border: '1px solid var(--border-glass)'}}>
                    <div className="p-3 rounded bg-dark-navbar text-primary d-flex align-items-center justify-content-center" style={{width: '48px', height: '48px', border: '1px solid var(--border-glass)'}}>
                      <i className="fas fa-gamepad text-gradient" style={{fontSize: '1.1rem'}}></i>
                    </div>
                    <div>
                      <small className="text-uppercase text-muted d-block" style={{fontSize: '0.65rem', letterSpacing: '0.5px'}}>Plateforme</small>
                      <span className="fw-bold text-white font-rajdhani" style={{fontSize: '1rem'}}>{competition.plateforme}</span>
                    </div>
                  </div>
                </div>

                <div className="col-md-6 col-lg-4">
                  <div className="d-flex align-items-center gap-3 p-3 rounded" style={{background: 'rgba(255,255,255,0.01)', border: '1px solid var(--border-glass)'}}>
                    <div className="p-3 rounded bg-dark-navbar text-primary d-flex align-items-center justify-content-center" style={{width: '48px', height: '48px', border: '1px solid var(--border-glass)'}}>
                      <i className="fas fa-ticket-alt text-gradient" style={{fontSize: '1.1rem'}}></i>
                    </div>
                    <div>
                      <small className="text-uppercase text-muted d-block" style={{fontSize: '0.65rem', letterSpacing: '0.5px'}}>Frais Inscription</small>
                      <span className="fw-bold text-white font-rajdhani" style={{fontSize: '1rem'}}>{competition.inscriptionGratuite ? 'Gratuit' : `${competition.montantInscription || 0} €`}</span>
                    </div>
                  </div>
                </div>

                {!competition.inscriptionGratuite && (
                  <div className="col-md-6 col-lg-4">
                    <div className="d-flex align-items-center gap-3 p-3 rounded" style={{background: 'rgba(255,255,255,0.01)', border: '1px solid var(--border-glass)'}}>
                      <div className="p-3 rounded bg-dark-navbar text-primary d-flex align-items-center justify-content-center" style={{width: '48px', height: '48px', border: '1px solid var(--border-glass)'}}>
                        <i className="fas fa-award text-gradient" style={{fontSize: '1.1rem'}}></i>
                      </div>
                      <div>
                        <small className="text-uppercase text-muted d-block" style={{fontSize: '0.65rem', letterSpacing: '0.5px'}}>Cashprize (Cagnotte)</small>
                        <span className="fw-bold text-gradient font-rajdhani" style={{fontSize: '1rem'}}>{competition.cashprizeFinal || 0} €</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="d-flex align-items-center justify-content-between p-3 rounded mt-4" style={{background: 'linear-gradient(135deg, rgba(0, 240, 255, 0.04) 0%, rgba(139, 92, 246, 0.04) 100%)', border: '1px solid var(--border-glass)'}}>
                <div className="d-flex align-items-center">
                  <i className="fas fa-gavel text-info me-3" style={{ fontSize: '1.35rem', textShadow: '0 0 8px var(--neon-cyan-glow)' }}></i>
                  <div>
                    <h6 className="mb-0 fw-bold text-white font-rajdhani text-uppercase">Règlement Officiel de la Compétition</h6>
                    <small className="text-silver" style={{fontSize: '0.8rem'}}>Effectifs, tailles DC/postes, règles de déconnexion, litiges mi-temps...</small>
                  </div>
                </div>
                <Link to="/reglement" className="btn btn-sm btn-outline-info rounded-pill px-3">
                  <i className="fas fa-eye me-1"></i> Lire
                </Link>
              </div>

              {competition.reglement && (
                <div className="mt-4 p-3 rounded" style={{background: 'rgba(0,0,0,0.15)', borderLeft: '3px solid var(--neon-cyan)', borderRadius: '8px'}}>
                  <strong className="d-block text-uppercase text-muted mb-1" style={{fontSize: '0.7rem', letterSpacing: '0.5px'}}>Notes de l'organisateur</strong>
                  <p className="mb-0 text-silver small">{competition.reglement}</p>
                </div>
              )}

              {competition.recompense && (
                <div className="mt-4 p-3 rounded" style={{background: 'rgba(0,0,0,0.15)', borderLeft: '3px solid #fbbf24', borderRadius: '8px'}}>
                  <strong className="d-block text-uppercase text-muted mb-1" style={{fontSize: '0.7rem', letterSpacing: '0.5px'}}>Récompenses additionnelles</strong>
                  <p className="mb-0 text-silver small">{competition.recompense}</p>
                </div>
              )}
            </div>
          </div>

          {/* Équipes inscrites */}
          <div className="card mb-4">
            <div className="card-header d-flex align-items-center py-3" style={{borderBottom: '1px solid var(--border-glass)'}}>
              <div className="bg-primary rounded-pill me-2" style={{width: '4px', height: '18px', background: 'var(--gradient-esports) !important'}}></div>
              <h5 className="mb-0 text-uppercase text-white fw-bold font-rajdhani" style={{letterSpacing: '0.5px'}}>
                <i className="fas fa-users me-2 text-primary"></i>
                Équipes inscrites ({competition.equipesInscrites?.length || 0})
              </h5>
            </div>
            <div className="card-body">
              {(competition.equipesInscrites?.length || 0) === 0 ? (
                <p className="text-muted">Aucune équipe inscrite pour le moment.</p>
              ) : (
                <div className="row">
                  {competition.equipesInscrites.map((equipe, index) => {
                    const isAdminDeCeClub = userClubs.some(club => 
                      compareClubIds(club._id, equipe.clubId) && 
                      club.membres.some(m => compareUserIds(m.userId, user) && m.role === 'Admin')
                    );
                    
                    return (
                      <div key={index} className="col-md-6 mb-3">
                        <div className="d-flex align-items-center p-3 rounded" style={{background: 'rgba(255, 255, 255, 0.01)', border: '1px solid var(--border-glass)'}}>
                          <div className="flex-grow-1">
                            <h6 className="mb-1 text-white font-rajdhani">{equipe.clubId.nom}</h6>
                            <small className="text-muted" style={{fontSize: '0.75rem'}}>
                              Inscrit le {new Date(equipe.dateInscription).toLocaleDateString('fr-FR')}
                            </small>
                          </div>
                          <div className="d-flex align-items-center gap-2">
                            <span className={`badge ${
                              equipe.statut === 'Confirmé' || equipe.statut === 'Gagnant' ? 'bg-success' :
                              equipe.statut === 'Inscrit' ? 'bg-secondary' : 'bg-warning'
                            }`}>
                              {equipe.statut}
                            </span>
                            {!competition.inscriptionGratuite && (
                              <span className={`badge ${
                                equipe.statutPaiement === 'Payé' ? 'bg-success' : 'bg-warning'
                              }`}>
                                {equipe.statutPaiement === 'Payé' ? 'Payé' : 'En attente'}
                              </span>
                            )}
                            {isAdminDeCeClub && competition.statut === 'Ouvert' && (
                              <button
                                className="btn btn-outline-danger btn-sm"
                                onClick={() => handleQuitterCompetition(typeof equipe.clubId === 'object' ? equipe.clubId._id : equipe.clubId)}
                                title="Quitter cette compétition"
                              >
                                <i className="fas fa-times"></i>
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Demandes d'inscription (pour les compétitions privées) */}
          {isCreator && competition.visibilite === 'privee' && (competition.demandesInscription?.length || 0) > 0 && (
            <div className="card mb-4">
              <div className="card-header d-flex align-items-center py-3" style={{borderBottom: '1px solid var(--border-glass)'}}>
                <div className="bg-primary rounded-pill me-2" style={{width: '4px', height: '18px', background: 'var(--gradient-esports) !important'}}></div>
                <h5 className="mb-0 text-uppercase text-white fw-bold font-rajdhani" style={{letterSpacing: '0.5px'}}>
                  <i className="fas fa-clock me-2 text-primary"></i>
                  Demandes d'inscription ({(competition.demandesInscription?.filter(d => d.statut === 'En attente') || []).length})
                </h5>
              </div>
              <div className="card-body">
                {competition.demandesInscription
                  .filter(demande => demande.statut === 'En attente')
                  .map((demande, index) => (
                    <div key={index} className="border rounded p-3 mb-3" style={{background: 'rgba(255,255,255,0.01)', border: '1px solid var(--border-glass)'}}>
                      <div className="d-flex justify-content-between align-items-start">
                        <div>
                          <h6 className="mb-1 text-white font-rajdhani">{demande.clubId.nom}</h6>
                          <small className="text-muted" style={{fontSize: '0.75rem'}}>
                            Demande du {new Date(demande.dateDemande).toLocaleDateString('fr-FR')}
                          </small>
                          {demande.message && (
                            <p className="mb-2 mt-2 text-silver small">{demande.message}</p>
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
          {competition.statut === 'En cours' && (competition.matchs?.length || 0) > 0 && (
            <div className="card">
              <div className="card-header d-flex align-items-center py-3" style={{borderBottom: '1px solid var(--border-glass)'}}>
                <div className="bg-primary rounded-pill me-2" style={{width: '4px', height: '18px', background: 'var(--gradient-esports) !important'}}></div>
                <h5 className="mb-0 text-uppercase text-white fw-bold font-rajdhani" style={{letterSpacing: '0.5px'}}>
                  <i className="fas fa-futbol me-2 text-primary"></i>
                  Matchs
                </h5>
              </div>
              <div className="card-body">
                {competition.matchs.map((match, index) => (
                  <Link
                    key={index}
                    to={`/competition/${competition._id}/match/${match._id}`}
                    style={{ textDecoration: 'none', display: 'block' }}
                  >
                    <div className="border rounded p-3 mb-3" style={{background: 'rgba(255,255,255,0.01)', border: '1px solid var(--border-glass)', cursor: 'pointer', transition: 'border-color 0.2s'}}
                      onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--primary)'}
                      onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border-glass)'}
                    >
                      <div className="d-flex justify-content-between align-items-center">
                        <div className="flex-grow-1">
                          <div className="d-flex align-items-center">
                            <span className="fw-bold text-white font-rajdhani">{match.equipe1.nom}</span>
                            <span className="mx-3 text-silver">
                              {match.statut === 'Terminé' ? `${match.score1} - ${match.score2}` : 'vs'}
                            </span>
                            <span className="fw-bold text-white font-rajdhani">{match.equipe2.nom}</span>
                          </div>
                          <small className="text-muted" style={{fontSize: '0.75rem'}}>
                            {match.phase} • {match.statut}
                          </small>
                        </div>
                        <div className="d-flex align-items-center gap-2">
                          <span className={`badge ${match.statut === 'Terminé' ? 'bg-success' : 'bg-warning'}`}>
                            {match.statut}
                          </span>
                          <i className="fas fa-chevron-right text-muted" style={{fontSize: '0.75rem'}}></i>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="col-lg-4">
          <div className="card mb-4">
            <div className="card-header d-flex align-items-center py-3" style={{borderBottom: '1px solid var(--border-glass)'}}>
              <div className="bg-primary rounded-pill me-2" style={{width: '4px', height: '18px', background: 'var(--gradient-esports) !important'}}></div>
              <h5 className="mb-0 text-uppercase text-white fw-bold font-rajdhani" style={{letterSpacing: '0.5px'}}>
                <i className="fas fa-user me-2 text-primary"></i>
                Organisateur
              </h5>
            </div>
            <div className="card-body">
              <p className="mb-0 text-white fw-bold font-rajdhani">{competition.createurId.pseudo}</p>
            </div>
          </div>

          {competition.gagnant && (
            <div className="card mb-4">
              <div className="card-header d-flex align-items-center py-3" style={{borderBottom: '1px solid var(--border-glass)'}}>
                <div className="bg-primary rounded-pill me-2" style={{width: '4px', height: '18px', background: 'var(--gradient-esports) !important'}}></div>
                <h5 className="mb-0 text-uppercase text-white fw-bold font-rajdhani" style={{letterSpacing: '0.5px'}}>
                  <i className="fas fa-trophy me-2 text-primary"></i>
                  Gagnant
                </h5>
              </div>
              <div className="card-body text-center py-4">
                <i className="fas fa-crown text-warning fa-3x mb-3 animate-pulse"></i>
                <h4 className="mb-0 text-gradient font-rajdhani fw-bold text-uppercase">{competition.gagnant.nom}</h4>
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
                {userClubsAdministres.length === 0 ? (
                  <div className="alert alert-warning mb-0">
                    <i className="fas fa-exclamation-triangle me-2"></i>
                    <strong>Droits insuffisants</strong>
                    <br />
                    Vous devez être le créateur, l'administrateur ou le capitaine d'un club pour pouvoir l'inscrire à une compétition.
                    <div className="mt-3">
                      <Link to="/clubs" onClick={() => setShowInscriptionModal(false)} className="btn btn-sm btn-warning text-dark fw-bold">
                        <i className="fas fa-users me-1"></i> Créer ou Rejoindre un Club
                      </Link>
                    </div>
                  </div>
                ) : (
                  <div className="mb-3">
                    <label className="form-label">Sélectionner un club</label>
                    <select 
                      className="form-select"
                      value={selectedClub}
                      onChange={(e) => setSelectedClub(e.target.value)}
                    >
                      <option value="">Choisir un club...</option>
                      {userClubsAdministres.map(club => (
                        <option key={club._id} value={club._id}>
                          {club.nom}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
                
                {competition.visibilite === 'privee' && userClubsAdministres.length > 0 && (
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
                  disabled={inscribing || !selectedClub || userClubsAdministres.length === 0}
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
