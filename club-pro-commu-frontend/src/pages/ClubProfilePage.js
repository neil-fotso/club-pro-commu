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
  const [isAdmin, setIsAdmin] = useState(false);
  const [showMemberModal, setShowMemberModal] = useState(false);

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

  const checkAdminStatus = useCallback(() => {
    if (!club || !user) return;
    
    const currentMember = club.membres.find(m => m.userId._id === user._id);
    setIsAdmin(currentMember?.role === 'Admin');
  }, [club, user]);

  useEffect(() => {
    loadClub();
    loadUserClub();
  }, [loadClub, loadUserClub]);

  useEffect(() => {
    checkAdminStatus();
  }, [checkAdminStatus]);

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

  const handlePromoteMember = async (memberId) => {
    if (!window.confirm('Promouvoir ce membre au rang d\'Admin ?')) return;
    
    try {
      await clubAPI.promoteMember(club._id, memberId);
      loadClub(); // Recharger les données du club
      alert('Membre promu avec succès !');
    } catch (err) {
      alert(err.message || 'Erreur lors de la promotion');
    }
  };

  const handleExcludeMember = async (memberId) => {
    if (!window.confirm('Exclure ce membre du club ?')) return;
    
    try {
      await clubAPI.excludeMember(club._id, memberId);
      loadClub(); // Recharger les données du club
      alert('Membre exclu avec succès !');
    } catch (err) {
      alert(err.message || 'Erreur lors de l\'exclusion');
    }
  };

  const getRoleBadge = (role) => {
    const badges = {
      'Admin': 'badge bg-danger',
      'Capitaine': 'badge bg-warning',
      'Joueur': 'badge bg-primary'
    };
    return badges[role] || 'badge bg-secondary';
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
            <div className="card-header text-white" style={{background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'}}>
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
                    {isAdmin && (
                      <button 
                        className="btn btn-sm btn-outline-primary ms-2"
                        onClick={() => setShowMemberModal(true)}
                      >
                        <i className="fas fa-cog me-1"></i>
                        Gérer
                      </button>
                    )}
                  </h5>
                  <div className="row">
                    {club.membres.slice(0, 6).map((membre, index) => (
                      <div key={index} className="col-md-2 col-sm-3 col-4 mb-2">
                        <div className="text-center">
                          <Avatar
                            src={membre.userId?.photoProfil}
                            name={membre.userId?.pseudo}
                            size="sm"
                            type="player"
                          />
                          <small className="d-block text-muted mt-1">
                            {membre.userId?.pseudo}
                          </small>
                          <span className={getRoleBadge(membre.role)}>
                            {membre.role}
                          </span>
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

      {/* Modal de gestion des membres */}
      {showMemberModal && (
        <div className="modal fade show" style={{display: 'block'}} tabIndex="-1">
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  <i className="fas fa-users me-2"></i>
                  Gestion des membres - {club?.nom}
                </h5>
                <button 
                  type="button" 
                  className="btn-close" 
                  onClick={() => setShowMemberModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                <div className="table-responsive">
                  <table className="table table-hover">
                    <thead>
                      <tr>
                        <th>Membre</th>
                        <th>Rôle</th>
                        <th>Date d'adhésion</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {club?.membres.map((membre, index) => (
                        <tr key={index}>
                          <td>
                            <div className="d-flex align-items-center">
                              <Avatar
                                src={membre.userId?.photoProfil}
                                name={membre.userId?.pseudo}
                                size="sm"
                                type="player"
                                className="me-2"
                              />
                              <span>{membre.userId?.pseudo}</span>
                            </div>
                          </td>
                          <td>
                            <span className={getRoleBadge(membre.role)}>
                              {membre.role}
                            </span>
                          </td>
                          <td>
                            <small className="text-muted">
                              {new Date(membre.dateAdhesion).toLocaleDateString()}
                            </small>
                          </td>
                          <td>
                            {membre.role !== 'Admin' && (
                              <div className="btn-group btn-group-sm">
                                <button
                                  className="btn btn-outline-warning btn-sm"
                                  onClick={() => handlePromoteMember(membre.userId._id)}
                                  title="Promouvoir en admin"
                                >
                                  <i className="fas fa-crown"></i>
                                </button>
                                <button
                                  className="btn btn-outline-danger btn-sm"
                                  onClick={() => handleExcludeMember(membre.userId._id)}
                                  title="Exclure du club"
                                >
                                  <i className="fas fa-user-times"></i>
                                </button>
                              </div>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
              <div className="modal-footer">
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  onClick={() => setShowMemberModal(false)}
                >
                  Fermer
                </button>
              </div>
            </div>
          </div>
          <div className="modal-backdrop fade show"></div>
        </div>
      )}
    </div>
  );
} 