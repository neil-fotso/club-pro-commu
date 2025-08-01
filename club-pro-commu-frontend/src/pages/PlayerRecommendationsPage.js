import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { playerAPI } from '../services/api';
import Avatar from '../components/Avatar';

// Styles améliorés pour la page de recommandations
const recommendationsStyles = `
  .recommendations-container {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    min-height: 100vh;
    padding: 2rem 0;
  }
  
  .recommendations-content {
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
  
  .recommendations-header {
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
  
  .recommendations-header h2 {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    font-size: 2.5rem;
    font-weight: 700;
    margin-bottom: 0.5rem;
  }
  
  .recommendation-card {
    transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    border-radius: 20px;
    border: 2px solid transparent;
    background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
    overflow: hidden;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
    animation: cardEntrance 0.8s cubic-bezier(0.4, 0, 0.2, 1);
    position: relative;
  }
  
  .recommendation-card::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
    transform: scaleX(0);
    transition: transform 0.3s ease;
  }
  
  .recommendation-card:hover::before {
    transform: scaleX(1);
  }
  
  .recommendation-card:hover {
    transform: translateY(-12px) scale(1.02);
    box-shadow: 0 25px 50px rgba(0, 0, 0, 0.15);
    border-color: #667eea;
    background: linear-gradient(135deg, #ffffff 0%, #e8f2ff 100%);
  }
  
  @keyframes cardEntrance {
    0% {
      opacity: 0;
      transform: translateY(40px) scale(0.9) rotateX(10deg);
    }
    100% {
      opacity: 1;
      transform: translateY(0) scale(1) rotateX(0deg);
    }
  }
  
  .recommendation-card:nth-child(1) { animation-delay: 0.1s; }
  .recommendation-card:nth-child(2) { animation-delay: 0.2s; }
  .recommendation-card:nth-child(3) { animation-delay: 0.3s; }
  .recommendation-card:nth-child(4) { animation-delay: 0.4s; }
  .recommendation-card:nth-child(5) { animation-delay: 0.5s; }
  .recommendation-card:nth-child(6) { animation-delay: 0.6s; }
  
  .recommendation-card .card-header {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    border: none;
    padding: 1.5rem;
    position: relative;
    overflow: hidden;
  }
  
  .recommendation-card .card-header::before {
    content: '';
    position: absolute;
    top: -50%;
    left: -50%;
    width: 200%;
    height: 200%;
    background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%);
    animation: shimmer 3s infinite;
  }
  
  @keyframes shimmer {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
  
  .recommendation-badge {
    font-size: 0.75rem;
    padding: 0.5rem 0.75rem;
    border-radius: 20px;
    font-weight: 600;
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    transition: all 0.3s ease;
  }
  
  .recommendation-badge:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  }
  
  .recommendation-avatar {
    border: 3px solid rgba(255, 255, 255, 0.3);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
    transition: all 0.3s ease;
  }
  
  .recommendation-avatar:hover {
    transform: scale(1.05);
    box-shadow: 0 12px 35px rgba(0, 0, 0, 0.2);
  }
  
  .stats-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 0.5rem;
    margin: 1rem 0;
  }
  
  .stat-item {
    text-align: center;
    padding: 0.75rem;
    background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
    border-radius: 10px;
    transition: all 0.3s ease;
    border: 1px solid rgba(0,0,0,0.05);
  }
  
  .recommendation-card:hover .stat-item {
    background: linear-gradient(135deg, #e8f2ff 0%, #d1e7ff 100%);
    transform: scale(1.05);
    box-shadow: 0 6px 15px rgba(102, 126, 234, 0.2);
  }
  
  .action-btn {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border: none;
    color: white;
    border-radius: 25px;
    padding: 0.5rem 1.5rem;
    font-weight: 600;
    transition: all 0.3s ease;
    box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
  }
  
  .action-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
  }
  
  .empty-state {
    text-align: center;
    padding: 4rem 2rem;
    animation: fadeInUp 0.8s ease-out;
  }
  
  .empty-state i {
    font-size: 4rem;
    color: #6c757d;
    margin-bottom: 1rem;
  }
  
  .loading-container {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 300px;
  }
  
  .loading-spinner {
    width: 50px;
    height: 50px;
    border: 4px solid #f3f3f3;
    border-top: 4px solid #667eea;
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
  
  @media (max-width: 768px) {
    .recommendations-content {
      padding: 1rem;
      margin: 1rem;
    }
    
    .recommendations-header h2 {
      font-size: 2rem;
    }
  }
`;

const PlayerRecommendationsPage = () => {
  const { user } = useAuth();
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (user) {
      fetchRecommendations();
    } else {
      setLoading(false);
    }
  }, [user]);

  const fetchRecommendations = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔍 Tentative de récupération des recommandations...');
      const data = await playerAPI.getRecommendations();
      console.log('✅ Recommandations reçues:', data);
      
      setRecommendations(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('❌ Erreur recommandations:', err);
      setError(`Erreur lors du chargement des recommandations: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const getDisponibiliteColor = (disponibilite) => {
    const colors = {
      'Disponible': 'success',
      'Indisponible': 'danger'
    };
    return colors[disponibilite] || 'secondary';
  };

  if (!user) {
    return (
      <div className="recommendations-container">
        <style>{recommendationsStyles}</style>
        <div className="container">
          <div className="recommendations-content">
            <div className="alert alert-warning" role="alert">
              <i className="fas fa-exclamation-triangle me-2"></i>
              Vous devez être connecté pour voir les recommandations
            </div>
            <div className="text-center mt-3">
              <Link to="/login" className="btn action-btn">
                <i className="fas fa-sign-in-alt me-2"></i>
                Se connecter
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="recommendations-container">
        <style>{recommendationsStyles}</style>
        <div className="container">
          <div className="recommendations-content">
            <div className="loading-container">
              <div className="loading-spinner"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="recommendations-container">
      <style>{recommendationsStyles}</style>
      <div className="container">
        <div className="recommendations-content">
          {/* Header */}
          <div className="recommendations-header">
            <h2>
              <i className="fas fa-lightbulb me-3"></i>
              Recommandations pour vous
            </h2>
            <p className="lead text-muted">Joueurs qui pourraient vous intéresser</p>
          </div>



          {error && (
            <div className="alert alert-danger" role="alert">
              <i className="fas fa-exclamation-triangle me-2"></i>
              <strong>Erreur :</strong> {error}
              <div className="mt-2">
                <button 
                  className="btn btn-outline-danger btn-sm"
                  onClick={fetchRecommendations}
                >
                  <i className="fas fa-redo me-1"></i>
                  Réessayer
                </button>
              </div>
            </div>
          )}

          {recommendations.length === 0 && !loading && !error ? (
            <div className="empty-state">
              <i className="fas fa-users"></i>
              <h5 className="text-muted">Aucune recommandation disponible</h5>
              <p className="text-muted">
                Complétez votre profil pour recevoir des recommandations personnalisées
              </p>
              <div className="mt-4">
                <Link to="/mon-profil/edit" className="btn action-btn me-3">
                  <i className="fas fa-edit me-2"></i>
                  Compléter mon profil
                </Link>
                <Link to="/recherche-joueur" className="btn btn-outline-primary">
                  <i className="fas fa-search me-2"></i>
                  Recherche manuelle
                </Link>
              </div>
            </div>
          ) : (
            <div className="row">
              {recommendations.map((player) => (
                <div key={player._id} className="col-md-6 col-lg-4 mb-4">
                  <div className="card h-100 recommendation-card">
                    <div className="card-header">
                      <div className="d-flex align-items-center">
                        <i className="fas fa-star text-warning me-2"></i>
                        <span>Recommandé</span>
                      </div>
                    </div>
                    <div className="card-body">
                      <div className="d-flex align-items-center mb-3">
                        <Avatar 
                          src={player.photoProfil} 
                          alt={player.pseudo}
                          name={player.pseudo}
                          size="md"
                          className="me-3 recommendation-avatar"
                        />
                        <div className="flex-grow-1">
                          <h5 className="card-title mb-1">
                            <Link to={`/player/${player._id}`} className="text-decoration-none">
                              {player.pseudo}
                            </Link>
                          </h5>
                          <div className="d-flex gap-2 mb-2">
                            <span className={`badge bg-${getDisponibiliteColor(player.disponibilite)} recommendation-badge`}>
                              {player.disponibilite}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="row mb-3">
                        <div className="col-6">
                          <small className="text-muted d-block">
                            <i className="fas fa-futbol me-1"></i>Position
                          </small>
                          <strong>{player.position}</strong>
                        </div>
                        <div className="col-6">
                          <small className="text-muted d-block">
                            <i className="fas fa-gamepad me-1"></i>Plateforme
                          </small>
                          <strong>{player.plateforme}</strong>
                        </div>
                      </div>

                      {player.statistiques && (
                        <div className="stats-grid">
                          <div className="stat-item">
                            <div className="small text-muted">Matchs</div>
                            <div className="fw-bold">{player.statistiques.matchsJoues}</div>
                          </div>
                          <div className="stat-item">
                            <div className="small text-muted">Win Rate</div>
                            <div className="fw-bold text-success">{player.winRate || 0}%</div>
                          </div>
                          <div className="stat-item">
                            <div className="small text-muted">Expérience</div>
                            <div className="fw-bold">{player.experience || 0} ans</div>
                          </div>
                        </div>
                      )}

                      <div className="d-flex justify-content-between align-items-center">
                        <small className="text-muted">
                          <i className="fas fa-map-marker-alt me-1"></i>
                          {player.pays}
                          {player.ville && `, ${player.ville}`}
                        </small>
                        <Link 
                          to={`/player/${player._id}`}
                          className="btn action-btn"
                        >
                          <i className="fas fa-eye me-1"></i>
                          Voir profil
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Actions */}
          <div className="row mt-4">
            <div className="col text-center">
              <Link to="/recherche-joueur" className="btn btn-outline-primary me-3">
                <i className="fas fa-search me-2"></i>
                Recherche avancée
              </Link>
              <Link to="/mon-profil/edit" className="btn btn-outline-secondary">
                <i className="fas fa-edit me-2"></i>
                Modifier mon profil
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlayerRecommendationsPage; 