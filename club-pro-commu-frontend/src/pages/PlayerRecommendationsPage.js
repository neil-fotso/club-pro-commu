import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { playerAPI } from '../services/api';
import Avatar from '../components/Avatar';
import APITest from '../components/APITest';

const PlayerRecommendationsPage = () => {
  const { user } = useAuth();
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showDebug, setShowDebug] = useState(false);

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

  const getNiveauColor = (niveau) => {
    const colors = {
      'Débutant': 'success',
      'Intermédiaire': 'info',
      'Avancé': 'warning',
      'Expert': 'danger',
      'Pro': 'dark'
    };
    return colors[niveau] || 'secondary';
  };

  const getDisponibiliteColor = (disponibilite) => {
    const colors = {
      'Disponible': 'success',
      'Occupé': 'warning',
      'Absent': 'danger',
      'Recherche équipe': 'info'
    };
    return colors[disponibilite] || 'secondary';
  };

  if (!user) {
    return (
      <div className="container mt-4">
        <div className="alert alert-warning" role="alert">
          <i className="fas fa-exclamation-triangle me-2"></i>
          Vous devez être connecté pour voir les recommandations
        </div>
        <div className="text-center mt-3">
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
      <div className="container mt-4">
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Chargement...</span>
          </div>
          <p className="mt-3 text-muted">Chargement des recommandations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mt-4">
      {/* Header */}
      <div className="row mb-4">
        <div className="col">
          <h2 className="text-primary mb-0">
            <i className="fas fa-lightbulb me-2"></i>
            Recommandations pour vous
          </h2>
          <p className="text-muted">Joueurs qui pourraient vous intéresser</p>
        </div>
        <div className="col-auto">
          <button
            className="btn btn-outline-secondary btn-sm"
            onClick={() => setShowDebug(!showDebug)}
          >
            <i className="fas fa-bug me-1"></i>
            Debug
          </button>
        </div>
      </div>

      {/* Debug panel */}
      {showDebug && (
        <div className="mb-4">
          <APITest />
        </div>
      )}

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
        <div className="text-center py-5">
          <i className="fas fa-users fa-3x text-muted mb-3"></i>
          <h5 className="text-muted">Aucune recommandation disponible</h5>
          <p className="text-muted">
            Complétez votre profil pour recevoir des recommandations personnalisées
          </p>
          <div className="mt-3">
            <Link to="/mon-profil/edit" className="btn btn-primary me-2">
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
              <div className="card h-100 shadow-sm border-primary border-2">
                <div className="card-header bg-primary text-white">
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
                      size="md"
                      className="me-3"
                    />
                    <div className="flex-grow-1">
                      <h5 className="card-title mb-1">
                        <Link to={`/player/${player._id}`} className="text-decoration-none">
                          {player.pseudo}
                        </Link>
                      </h5>
                      <div className="d-flex gap-2 mb-2">
                        <span className={`badge bg-${getNiveauColor(player.niveau)}`}>
                          {player.niveau}
                        </span>
                        <span className={`badge bg-${getDisponibiliteColor(player.disponibilite)}`}>
                          {player.disponibilite}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="row mb-3">
                    <div className="col-6">
                      <small className="text-muted d-block">Position</small>
                      <strong>{player.position}</strong>
                    </div>
                    <div className="col-6">
                      <small className="text-muted d-block">Plateforme</small>
                      <strong>{player.plateforme}</strong>
                    </div>
                  </div>

                  {player.statistiques && (
                    <div className="mb-3">
                      <small className="text-muted d-block mb-2">Statistiques</small>
                      <div className="row text-center">
                        <div className="col-4">
                          <div className="small text-muted">Matchs</div>
                          <div className="fw-bold">{player.statistiques.matchsJoues}</div>
                        </div>
                        <div className="col-4">
                          <div className="small text-muted">Win Rate</div>
                          <div className="fw-bold">{player.winRate || 0}%</div>
                        </div>
                        <div className="col-4">
                          <div className="small text-muted">Expérience</div>
                          <div className="fw-bold">{player.experience || 0} ans</div>
                        </div>
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
                      className="btn btn-primary btn-sm"
                    >
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
          <Link to="/recherche-joueur" className="btn btn-outline-primary me-2">
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
  );
};

export default PlayerRecommendationsPage; 