import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { clubAPI } from '../services/api';

// Styles améliorés pour la page de recherche de clubs
const clubSearchStyles = `
  .club-search-container {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    min-height: 100vh;
    padding: 2rem 0;
  }
  
  .club-search-content {
    background: rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(10px);
    border-radius: 20px;
    padding: 2rem;
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
    animation: fadeInUp 0.8s ease-out;
  }
  
  @keyframes fadeInUp {
    0% {
      opacity: 0;
      transform: translateY(30px);
    }
    100% {
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  .search-header {
    text-align: center;
    margin-bottom: 3rem;
    animation: slideInDown 0.8s ease-out;
  }
  
  @keyframes slideInDown {
    0% {
      opacity: 0;
      transform: translateY(-30px);
    }
    100% {
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  .search-header h1 {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    font-size: 3rem;
    font-weight: 700;
    margin-bottom: 1rem;
  }
  
  .search-header p {
    color: #6c757d;
    font-size: 1.1rem;
    margin-bottom: 2rem;
  }
  
  .search-filters {
    background: rgba(255, 255, 255, 0.8);
    border-radius: 15px;
    padding: 1.5rem;
    margin-bottom: 2rem;
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
    border: 2px solid transparent;
    transition: all 0.3s ease;
  }
  
  .search-filters:hover {
    border-color: #667eea;
    box-shadow: 0 12px 35px rgba(102, 126, 234, 0.15);
  }
  
  .filter-row {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 1rem;
    margin-bottom: 1rem;
  }
  
  .filter-group {
    position: relative;
  }
  
  .filter-group label {
    font-weight: 600;
    color: #495057;
    margin-bottom: 0.5rem;
    display: flex;
    align-items: center;
  }
  
  .filter-group label i {
    margin-right: 0.5rem;
    color: #667eea;
  }
  
  .form-control, .form-select {
    border: 2px solid transparent;
    border-radius: 12px;
    padding: 0.75rem 1rem;
    font-size: 1rem;
    transition: all 0.3s ease;
    background: rgba(255, 255, 255, 0.9);
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  }
  
  .form-control:focus, .form-select:focus {
    border-color: #667eea;
    box-shadow: 0 0 0 0.2rem rgba(102, 126, 234, 0.25);
    transform: translateY(-2px);
    background: white;
  }
  
  .filter-actions {
    display: flex;
    gap: 1rem;
    justify-content: center;
    flex-wrap: wrap;
  }
  
  .btn-filter {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border: none;
    color: white;
    border-radius: 25px;
    padding: 0.75rem 2rem;
    font-weight: 600;
    transition: all 0.3s ease;
    box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
  }
  
  .btn-filter:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(102, 126, 234, 0.4);
  }
  
  .btn-clear {
    background: linear-gradient(135deg, #dc3545 0%, #c82333 100%);
    border: none;
    color: white;
    border-radius: 25px;
    padding: 0.75rem 2rem;
    font-weight: 600;
    transition: all 0.3s ease;
    box-shadow: 0 4px 15px rgba(220, 53, 69, 0.3);
  }
  
  .btn-clear:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(220, 53, 69, 0.4);
  }
  
  .club-card {
    background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
    border-radius: 20px;
    padding: 1.5rem;
    margin-bottom: 1.5rem;
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
    transition: all 0.3s ease;
    border: 2px solid transparent;
    position: relative;
    overflow: hidden;
  }
  
  .club-card::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(102, 126, 234, 0.05), transparent);
    transition: left 0.5s ease;
  }
  
  .club-card:hover::before {
    left: 100%;
  }
  
  .club-card:hover {
    transform: translateY(-8px) scale(1.02);
    box-shadow: 0 15px 40px rgba(102, 126, 234, 0.15);
    border-color: #667eea;
  }
  
  .club-header {
    display: flex;
    align-items: center;
    margin-bottom: 1rem;
  }
  
  .club-avatar {
    width: 60px;
    height: 60px;
    border-radius: 50%;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    margin-right: 1rem;
    box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
    border: 3px solid rgba(255, 255, 255, 0.3);
  }
  
  .club-avatar i {
    font-size: 1.5rem;
    color: white;
  }
  
  .club-info h5 {
    margin: 0;
    font-weight: 700;
    color: #495057;
    font-size: 1.2rem;
  }
  
  .club-info h5 a {
    color: inherit;
    text-decoration: none;
    transition: color 0.3s ease;
  }
  
  .club-info h5 a:hover {
    color: #667eea;
  }
  
  .club-stats {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
    gap: 1rem;
    margin: 1rem 0;
  }
  
  .stat-item {
    text-align: center;
    padding: 0.5rem;
    background: rgba(102, 126, 234, 0.1);
    border-radius: 10px;
    transition: all 0.3s ease;
  }
  
  .stat-item:hover {
    background: rgba(102, 126, 234, 0.15);
    transform: translateY(-2px);
  }
  
  .stat-label {
    font-size: 0.8rem;
    color: #6c757d;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }
  
  .stat-value {
    font-size: 1.1rem;
    font-weight: 700;
    color: #495057;
    margin-top: 0.25rem;
  }
  
  .club-badges {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    margin: 1rem 0;
  }
  
  .badge {
    border-radius: 20px;
    padding: 0.5rem 1rem;
    font-weight: 600;
    font-size: 0.85rem;
    transition: all 0.3s ease;
  }
  
  .badge:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }
  
  .club-actions {
    display: flex;
    gap: 1rem;
    margin-top: 1rem;
    flex-wrap: wrap;
  }
  
  .btn-join {
    background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
    border: none;
    color: white;
    border-radius: 25px;
    padding: 0.75rem 2rem;
    font-weight: 600;
    transition: all 0.3s ease;
    box-shadow: 0 4px 15px rgba(40, 167, 69, 0.3);
    text-decoration: none;
    display: inline-flex;
    align-items: center;
  }
  
  .btn-join:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(40, 167, 69, 0.4);
    color: white;
    text-decoration: none;
  }
  
  .btn-view {
    background: linear-gradient(135deg, #6c757d 0%, #495057 100%);
    border: none;
    color: white;
    border-radius: 25px;
    padding: 0.75rem 2rem;
    font-weight: 600;
    transition: all 0.3s ease;
    box-shadow: 0 4px 15px rgba(108, 117, 125, 0.3);
    text-decoration: none;
    display: inline-flex;
    align-items: center;
  }
  
  .btn-view:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(108, 117, 125, 0.4);
    color: white;
    text-decoration: none;
  }
  
  .loading-container {
    text-align: center;
    padding: 3rem;
  }
  
  .spinner {
    width: 3rem;
    height: 3rem;
    border: 4px solid rgba(102, 126, 234, 0.3);
    border-top: 4px solid #667eea;
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
  
  .error-container {
    text-align: center;
    padding: 3rem;
    color: #dc3545;
  }
  
  .no-results {
    text-align: center;
    padding: 3rem;
    color: #6c757d;
  }
  
  .no-results i {
    font-size: 4rem;
    margin-bottom: 1rem;
    opacity: 0.5;
  }
  
  .results-count {
    text-align: center;
    margin-bottom: 2rem;
    color: #6c757d;
    font-weight: 600;
  }
  
  @media (max-width: 768px) {
    .club-search-content {
      padding: 1rem;
      margin: 1rem;
    }
    
    .search-header h1 {
      font-size: 2rem;
    }
    
    .filter-row {
      grid-template-columns: 1fr;
    }
    
    .club-actions {
      flex-direction: column;
    }
    
    .btn-join, .btn-view {
      justify-content: center;
    }
  }
`;

export default function ClubSearchPage() {
  const { user } = useAuth();
  const [clubs, setClubs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [userClub, setUserClub] = useState(null);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [userRequests, setUserRequests] = useState({});
  const [loadingRequests, setLoadingRequests] = useState({});
  const [joining, setJoining] = useState(false);
  const [filters, setFilters] = useState({
    nom: '',
    pays: '',
    plateforme: '',
    niveau: '',
    recrute: ''
  });

  const loadClubs = useCallback(async () => {
    try {
      setLoading(true);
      const data = await clubAPI.getClubs(filters);
      setClubs(data);
      setError('');
    } catch (err) {
      setError('Erreur lors du chargement des clubs');
      console.error('Erreur chargement clubs:', err);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  const loadUserClub = useCallback(async () => {
    if (!user) return;
    
    try {
      const userClubs = await clubAPI.getMyClubs();
      if (userClubs.length > 0) {
        setUserClub(userClubs[0]); // L'utilisateur ne peut avoir qu'un seul club
      }
    } catch (err) {
      console.error('Erreur chargement club utilisateur:', err);
    }
  }, [user]);

  const checkUserRequest = useCallback(async (clubId) => {
    if (!user) return;
    
    try {
      setLoadingRequests(prev => ({ ...prev, [clubId]: true }));
      const data = await clubAPI.checkUserRequest(clubId);
      setUserRequests(prev => ({
        ...prev,
        [clubId]: data.hasPendingRequest ? data.demande : null
      }));
    } catch (err) {
      console.error('Erreur vérification demande utilisateur:', err);
    } finally {
      setLoadingRequests(prev => ({ ...prev, [clubId]: false }));
    }
  }, [user]);

  const handleCancelRequest = async (clubId) => {
    if (!window.confirm('Êtes-vous sûr de vouloir annuler votre demande d\'adhésion ?')) return;
    
    try {
      await clubAPI.cancelUserRequest(clubId);
      alert('Demande d\'adhésion annulée avec succès !');
      // Réinitialiser l'état local pour ce club
      setUserRequests(prev => ({
        ...prev,
        [clubId]: null
      }));
    } catch (err) {
      alert(err.message || 'Erreur lors de l\'annulation de la demande');
    }
  };

  useEffect(() => {
    loadClubs();
    loadUserClub();
  }, [loadClubs, loadUserClub]);

  // Vérifier les demandes d'adhésion pour tous les clubs
  useEffect(() => {
    if (clubs.length > 0 && user) {
      clubs.forEach(club => {
        checkUserRequest(club._id);
      });
    }
  }, [clubs, user, checkUserRequest]);

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const clearFilters = () => {
    setFilters({
      nom: '',
      pays: '',
      plateforme: '',
      niveau: '',
      recrute: ''
    });
  };

  const handleJoinRequest = async (clubId, clubName) => {
    if (!user) {
      alert('Vous devez être connecté pour rejoindre un club');
      return;
    }

    if (userClub) {
      alert('Vous êtes déjà membre d\'un club. Vous devez le quitter avant de rejoindre un autre club.');
      return;
    }

    const message = prompt('Message optionnel pour votre demande d\'adhésion (laissez vide si aucun) :');
    if (message === null) return; // Annulé par l'utilisateur

    try {
      setJoining(true);
      await clubAPI.joinClub(clubId, message);
      alert(`Demande d'adhésion envoyée au club ${clubName} ! Les administrateurs vont l'examiner.`);
      loadUserClub(); // Recharger le club de l'utilisateur
      // Recharger les demandes pour ce club
      checkUserRequest(clubId);
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

  const getRecruteBadge = (recrute) => {
    return recrute ? 'badge bg-success' : 'badge bg-secondary';
  };

  if (loading) {
    return (
      <div className="club-search-container">
        <style>{clubSearchStyles}</style>
        <div className="container">
          <div className="club-search-content">
            <div className="loading-container">
              <div className="spinner"></div>
              <p className="mt-3">Recherche de clubs en cours...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="club-search-container">
        <style>{clubSearchStyles}</style>
        <div className="container">
          <div className="club-search-content">
            <div className="error-container">
              <i className="fas fa-exclamation-triangle fa-3x mb-3"></i>
              <h3>Erreur</h3>
              <p>{error}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="club-search-container">
      <style>{clubSearchStyles}</style>
      <div className="container">
        <div className="club-search-content">
          {/* Header */}
          <div className="search-header">
            <h1>🏆 Rechercher un Club</h1>
            <p>Trouvez le club parfait pour votre équipe et commencez à jouer ensemble !</p>
          </div>

                     {/* Filtres de recherche */}
           <div className="search-filters">
             <div className="filter-row">
               <div className="filter-group">
                 <label>
                   <i className="fas fa-search"></i>
                   Nom du club
                 </label>
                 <input
                   type="text"
                   className="form-control"
                   value={filters.nom}
                   onChange={(e) => handleFilterChange('nom', e.target.value)}
                   placeholder="Rechercher un club..."
                 />
               </div>
               
               <div className="filter-group">
                 <label>
                   <i className="fas fa-gamepad"></i>
                   Plateforme
                 </label>
                 <select
                   className="form-select"
                   value={filters.plateforme}
                   onChange={(e) => handleFilterChange('plateforme', e.target.value)}
                 >
                   <option value="">Toutes les plateformes</option>
                   <option value="PS5">🎮 PS5</option>
                   <option value="Xbox">🎮 Xbox</option>
                   <option value="PC">💻 PC</option>
                 </select>
               </div>
             </div>

             {/* Filtres avancés */}
             {showAdvancedFilters && (
               <div className="advanced-filters" style={{marginTop: '1rem', paddingTop: '1rem', borderTop: '2px solid rgba(102, 126, 234, 0.2)'}}>
                 <div className="filter-row">
                   <div className="filter-group">
                     <label>
                       <i className="fas fa-flag"></i>
                       Pays
                     </label>
                     <input
                       type="text"
                       className="form-control"
                       value={filters.pays}
                       onChange={(e) => handleFilterChange('pays', e.target.value)}
                       placeholder="France, Belgique..."
                     />
                   </div>
                   
                   <div className="filter-group">
                     <label>
                       <i className="fas fa-users"></i>
                       Recrutement
                     </label>
                     <select
                       className="form-select"
                       value={filters.recrute}
                       onChange={(e) => handleFilterChange('recrute', e.target.value)}
                     >
                       <option value="">Tous les clubs</option>
                       <option value="true">Recrute</option>
                       <option value="false">Ne recrute pas</option>
                     </select>
                   </div>
                   
                   <div className="filter-group">
                     <label>
                       <i className="fas fa-star"></i>
                       Niveau
                     </label>
                     <select
                       className="form-select"
                       value={filters.niveau}
                       onChange={(e) => handleFilterChange('niveau', e.target.value)}
                     >
                       <option value="">Tous les niveaux</option>
                       <option value="Débutant">Débutant</option>
                       <option value="Intermédiaire">Intermédiaire</option>
                       <option value="Avancé">Avancé</option>
                       <option value="Expert">Expert</option>
                       <option value="Pro">Pro</option>
                     </select>
                   </div>
                 </div>
               </div>
             )}

             <div className="filter-actions">
               <button
                 className="btn btn-filter"
                 onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
               >
                 <i className={`fas fa-${showAdvancedFilters ? 'minus' : 'plus'} me-2`}></i>
                 {showAdvancedFilters ? 'Masquer' : 'Afficher'} les filtres avancés
               </button>
               
               <button
                 className="btn btn-clear"
                 onClick={clearFilters}
               >
                 <i className="fas fa-times me-2"></i>
                 Effacer tous les filtres
               </button>
             </div>
           </div>

          {/* Résultats */}
          <div className="results-count">
            {clubs.length} club{clubs.length !== 1 ? 's' : ''} trouvé{clubs.length !== 1 ? 's' : ''}
          </div>

          {clubs.length === 0 ? (
            <div className="no-results">
              <i className="fas fa-search"></i>
              <h3>Aucun club trouvé</h3>
              <p>Essayez de modifier vos critères de recherche</p>
            </div>
          ) : (
            <div className="row">
              {clubs.map((club) => (
                <div key={club._id} className="col-lg-6 col-xl-4">
                  <div className="club-card">
                    <div className="club-header">
                      <div className="club-avatar">
                        <i className="fas fa-shield-alt"></i>
                      </div>
                      <div className="club-info">
                        <h5>
                          <Link to={`/club/${club._id}`}>
                            {club.nom}
                          </Link>
                        </h5>
                        <div className="club-badges">
                          <span className={`badge ${getRecruteBadge(club.recrute)}`}>
                            {club.recrute ? 'Recrute' : 'Fermé'}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="club-stats">
                      <div className="stat-item">
                        <div className="stat-label">Membres</div>
                        <div className="stat-value">{club.membres?.length || 0}/{club.effectifMax}</div>
                      </div>
                      
                      <div className="stat-item">
                        <div className="stat-label">Pays</div>
                        <div className="stat-value">{club.pays}</div>
                      </div>
                      
                      <div className="stat-item">
                        <div className="stat-label">Créé le</div>
                        <div className="stat-value">
                          {new Date(club.dateCreation).toLocaleDateString()}
                        </div>
                      </div>
                    </div>

                    <div className="club-badges">
                      {club.plateformes?.map(platform => (
                        <span key={platform} className="badge bg-dark">
                          {getPlatformIcon(platform)} {platform}
                        </span>
                      ))}
                      {club.langues?.map((langue, index) => (
                        <span key={index} className="badge bg-info">
                          {langue}
                        </span>
                      ))}
                    </div>

                    {club.description && (
                      <p className="text-muted mb-3" style={{fontSize: '0.9rem'}}>
                        {club.description.length > 100 
                          ? club.description.substring(0, 100) + '...' 
                          : club.description}
                      </p>
                    )}

                    <div className="club-actions">
                      <Link 
                        to={`/club/${club._id}`} 
                        className="btn-view"
                      >
                        <i className="fas fa-eye me-2"></i>
                        Voir le club
                      </Link>
                      
                      {club.recrute && !userClub && (
                        <div>
                          {loadingRequests[club._id] ? (
                            <button className="btn-join" disabled>
                              <span className="spinner-border spinner-border-sm me-2"></span>
                              Vérification...
                            </button>
                          ) : userRequests[club._id] ? (
                            <div className="alert alert-warning mb-0 p-2">
                              <i className="fas fa-clock me-2"></i>
                              <strong>Demande en attente</strong>
                              <br />
                              <small className="text-muted">
                                Envoyée le {new Date(userRequests[club._id].dateDemande).toLocaleDateString()}
                              </small>
                              <div className="mt-2">
                                <button
                                  className="btn btn-sm btn-outline-danger"
                                  onClick={() => handleCancelRequest(club._id)}
                                >
                                  <i className="fas fa-times me-1"></i>
                                  Annuler
                                </button>
                              </div>
                            </div>
                          ) : (
                            <button
                              className="btn-join"
                              onClick={() => handleJoinRequest(club._id, club.nom)}
                              disabled={joining}
                            >
                              {joining ? (
                                <>
                                  <span className="spinner-border spinner-border-sm me-2"></span>
                                  Demande en cours...
                                </>
                              ) : (
                                <>
                                  <i className="fas fa-user-plus me-2"></i>
                                  Demander à rejoindre
                                </>
                              )}
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 