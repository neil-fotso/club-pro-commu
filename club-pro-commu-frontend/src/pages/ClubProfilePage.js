import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { clubAPI } from '../services/api';
import Avatar from '../components/Avatar';

export default function ClubProfilePage() {
  const { id } = useParams();
  const { user } = useAuth();
  const [club, setClub] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [joining, setJoining] = useState(false);
  const [userClub, setUserClub] = useState(null);

  const loadClub = useCallback(async () => {
    try {
      setLoading(true);
      const data = await clubAPI.getClub(id);
      setClub(data);
      setError('');
    } catch (err) {
      setError('Erreur lors du chargement du club');
      console.error('Erreur chargement club:', err);
    } finally {
      setLoading(false);
    }
  }, [id]);

  const loadUserClub = useCallback(async () => {
    if (!user) return;
    
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      
      const userClubs = await clubAPI.getMyClubs(token);
      if (userClubs.length > 0) {
        setUserClub(userClubs[0]); // L'utilisateur ne peut avoir qu'un seul club
      }
    } catch (err) {
      console.error('Erreur chargement club utilisateur:', err);
    }
  }, [user]);

  useEffect(() => {
    loadClub();
    loadUserClub();
  }, [loadClub, loadUserClub]);

  const handleJoinRequest = async () => {
    if (!user) {
      alert('Vous devez être connecté pour rejoindre un club');
      return;
    }

    if (userClub) {
      alert('Vous êtes déjà membre d\'un club. Vous devez le quitter avant de rejoindre un autre club.');
      return;
    }

    try {
      setJoining(true);
      const token = localStorage.getItem('token');
      await clubAPI.joinClub(club._id, token);
      alert('Demande d\'adhésion envoyée au club !');
      loadUserClub(); // Recharger le club de l'utilisateur
    } catch (err) {
      alert(err.message || 'Erreur lors de la demande d\'adhésion');
    } finally {
      setJoining(false);
    }
  };

  const getPlatformIcon = (platform) => {
    switch(platform) {
      case 'PS5': return '🎮';
      case 'Xbox': return '🎮';
      case 'PC': return '💻';
      default: return '🎮';
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      'Actif': 'bg-success',
      'Inactif': 'bg-secondary',
      'En construction': 'bg-warning'
    };
    return badges[status] || 'bg-secondary';
  };

  if (loading) {
    return (
      <div className="container mt-4 text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Chargement...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mt-4">
        <div className="alert alert-danger">
          <h4>Erreur</h4>
          <p>{error}</p>
          <Link to="/clubs" className="btn btn-primary">Retour à la recherche</Link>
        </div>
      </div>
    );
  }

  if (!club) {
    return (
      <div className="container mt-4">
        <div className="alert alert-warning">
          <h4>Club non trouvé</h4>
          <p>Le club demandé n'existe pas.</p>
          <Link to="/clubs" className="btn btn-primary">Retour à la recherche</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mt-4">
      <div className="row">
        <div className="col-lg-8">
          <div className="card shadow-lg border-0">
            <div className="card-header bg-gradient-primary text-white">
              <div className="d-flex align-items-center">
                <Avatar
                  src={club.photoProfil}
                  name={club.nom}
                  size="lg"
                  type="club"
                  className="me-3"
                />
                <div>
                  <h2 className="mb-0">{club.nom}</h2>
                  <small className="text-light">
                    {club.pays} • {getPlatformIcon(club.plateforme)} {club.plateforme}
                  </small>
                </div>
              </div>
            </div>
            
            <div className="card-body p-4">
              <div className="row">
                <div className="col-md-6">
                  <h5 className="text-primary mb-3">
                    <i className="fas fa-info-circle me-2"></i>
                    Informations générales
                  </h5>
                  <ul className="list-unstyled">
                    <li className="mb-2">
                      <strong>Nom:</strong> 
                      <span className="badge bg-primary ms-2">{club.nom}</span>
                    </li>
                    <li className="mb-2">
                      <strong>Pays:</strong> 
                      <span className="badge bg-info ms-2">{club.pays}</span>
                    </li>
                    <li className="mb-2">
                      <strong>Plateforme:</strong> 
                      <span className="badge bg-dark ms-2">
                        {getPlatformIcon(club.plateforme)} {club.plateforme}
                      </span>
                    </li>
                    <li className="mb-2">
                      <strong>Statut:</strong> 
                      <span className={`badge ${getStatusBadge(club.statut)} ms-2`}>
                        {club.statut}
                      </span>
                    </li>
                    <li className="mb-2">
                      <strong>Effectif:</strong> 
                      <span className="badge bg-success ms-2">
                        {club.membres?.length || 0}/{club.effectifMax} membres
                      </span>
                    </li>
                    <li className="mb-2">
                      <strong>Recrutement:</strong> 
                      {club.recrute ? (
                        <span className="badge bg-success ms-2">✅ Ouvert</span>
                      ) : (
                        <span className="badge bg-secondary ms-2">❌ Fermé</span>
                      )}
                    </li>
                  </ul>
                </div>
                
                <div className="col-md-6">
                  <h5 className="text-primary mb-3">
                    <i className="fas fa-users me-2"></i>
                    Détails du club
                  </h5>
                  <ul className="list-unstyled">
                    <li className="mb-2">
                      <strong>Niveau:</strong> 
                      <span className="badge bg-warning ms-2">{club.niveau || 'Non spécifié'}</span>
                    </li>
                    <li className="mb-2">
                      <strong>Langues:</strong> 
                      <div className="mt-1">
                        {club.langues?.map((langue, index) => (
                          <span key={index} className="badge bg-info me-1">
                            {langue}
                          </span>
                        )) || <span className="text-muted">Non spécifié</span>}
                      </div>
                    </li>
                    <li className="mb-2">
                      <strong>Créé le:</strong> 
                      <span className="badge bg-secondary ms-2">
                        {new Date(club.dateCreation).toLocaleDateString()}
                      </span>
                    </li>
                  </ul>
                </div>
              </div>
              
              {club.description && (
                <div className="mt-4">
                  <h5 className="text-primary mb-3">
                    <i className="fas fa-comment me-2"></i>
                    Description
                  </h5>
                  <div className="card bg-light">
                    <div className="card-body">
                      <p className="mb-0">{club.description}</p>
                    </div>
                  </div>
                </div>
              )}
              
              {club.membres && club.membres.length > 0 && (
                <div className="mt-4">
                  <h5 className="text-primary mb-3">
                    <i className="fas fa-users me-2"></i>
                    Membres ({club.membres.length})
                  </h5>
                  <div className="row">
                    {club.membres.slice(0, 6).map((membre, index) => (
                      <div key={index} className="col-md-2 col-sm-3 col-4 mb-2">
                        <div className="text-center">
                          <Avatar
                            src={membre.photoProfil}
                            name={membre.pseudo}
                            size="sm"
                            type="player"
                          />
                          <small className="d-block text-muted mt-1">
                            {membre.pseudo}
                          </small>
                        </div>
                      </div>
                    ))}
                    {club.membres.length > 6 && (
                      <div className="col-md-2 col-sm-3 col-4 mb-2">
                        <div className="text-center">
                          <div className="w-8 h-8 rounded-full bg-secondary d-flex align-items-center justify-content-center mx-auto">
                            <small className="text-white">+{club.membres.length - 6}</small>
                          </div>
                          <small className="d-block text-muted mt-1">
                            Autres
                          </small>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        
        <div className="col-lg-4">
          <div className="card shadow-lg border-0 mb-4">
            <div className="card-header bg-gradient-success text-white">
              <h5 className="mb-0">
                <i className="fas fa-chart-line me-2"></i>
                Actions
              </h5>
            </div>
            <div className="card-body">
              {userClub ? (
                <div className="alert alert-info">
                  <i className="fas fa-info-circle me-2"></i>
                  Vous êtes déjà membre du club <strong>{userClub.nom}</strong>
                </div>
              ) : (
                <button 
                  className="btn btn-primary w-100 mb-2"
                  onClick={handleJoinRequest}
                  disabled={joining}
                >
                  {joining ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                      Envoi en cours...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-user-plus me-1"></i>
                      Demander à rejoindre
                    </>
                  )}
                </button>
              )}
              
              <Link to="/clubs" className="btn btn-outline-secondary w-100">
                <i className="fas fa-arrow-left me-1"></i>
                Retour à la recherche
              </Link>
            </div>
          </div>

          <div className="card shadow-lg border-0">
            <div className="card-header bg-gradient-info text-white">
              <h5 className="mb-0">
                <i className="fas fa-chart-bar me-2"></i>
                Statistiques
              </h5>
            </div>
            <div className="card-body">
              <div className="row text-center">
                <div className="col-6">
                  <div className="stat-item">
                    <h3 className="text-primary mb-0">{club.membres?.length || 0}</h3>
                    <small className="text-muted">Membres</small>
                  </div>
                </div>
                <div className="col-6">
                  <div className="stat-item">
                    <h3 className="text-success mb-0">{club.effectifMax}</h3>
                    <small className="text-muted">Effectif max</small>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 