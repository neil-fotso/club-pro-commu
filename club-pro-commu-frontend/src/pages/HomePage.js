import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { playerAPI, clubAPI } from '../services/api';
import bgHeader from '../assets/bg-header.jpg';
import logo from '../assets/logo.png';

// Styles pour les cartes de fonctionnalités
const featureCardStyles = `
  .feature-card {
    transition: all 0.3s ease;
    cursor: pointer;
    border-radius: 15px;
    background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
    border: 2px solid transparent;
  }
  
  .feature-card:hover {
    transform: translateY(-10px) scale(1.02);
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
    border-color: #667eea;
    background: linear-gradient(135deg, #ffffff 0%, #e8f2ff 100%);
  }
  
  .feature-icon {
    transition: all 0.3s ease;
  }
  
  .feature-card:hover .feature-icon {
    transform: scale(1.1);
    filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.2));
  }
  
  .feature-card:hover h4 {
    color: #667eea !important;
  }
  
  .feature-card:hover .btn {
    background-color: #667eea;
    border-color: #667eea;
    color: white;
  }
  
  .hover-card {
    transition: all 0.3s ease;
    cursor: pointer;
    border: 2px solid transparent;
  }
  
  .hover-card:hover {
    background-color: #f8f9fa;
    border-color: #667eea;
    transform: translateX(5px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
  
  .bg-gradient-primary {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  }
  
  .bg-gradient-success {
    background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
  }
`;

const HomePage = () => {
  const { user } = useAuth();
  const [recentPlayers, setRecentPlayers] = useState([]);
  const [recentClubs, setRecentClubs] = useState([]);
  const [, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [playersResponse, clubsResponse] = await Promise.all([
          playerAPI.getPlayers(),
          clubAPI.getClubs()
        ]);

        // Données récentes
        setRecentPlayers(playersResponse.slice(0, 3));
        setRecentClubs(clubsResponse.slice(0, 3));
      } catch (error) {
        console.error('Erreur lors du chargement des données:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="min-vh-100">
      <style>{featureCardStyles}</style>
      {/* Hero Section */}
      <div className="text-white py-4 position-relative overflow-hidden" 
           style={{
             background: `url(${bgHeader}) no-repeat center center`,
             backgroundSize: 'cover',
             minHeight: '350px'
           }}>
        <div className="position-absolute w-100 h-100" 
             style={{
               background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.8) 0%, rgba(118, 75, 162, 0.7) 100%)',
               top: 0,
               left: 0,
               zIndex: 1
             }}></div>
        <div className="container position-relative" style={{zIndex: 2}}>
          <div className="row align-items-center" style={{minHeight: '350px'}}>
            <div className="col-lg-8">
              <h1 className="display-4 fw-bold mb-4 text-white">
                🏆 Club Pro Communauté
              </h1>
              <p className="lead mb-4 text-white-90">
                La plateforme ultime pour organiser et participer aux compétitions de clubs.
                Rejoignez ou créez votre équipe, et inscrivez-vous aux tournois pour affronter la communauté.
              </p>
              {!user ? (
                <div className="d-flex gap-3 flex-column flex-md-row">
                  <Link to="/register" className="btn btn-light btn-lg px-4 fw-bold">
                    <i className="fas fa-user-plus me-2"></i>
                    S'inscrire
                  </Link>
                  <Link to="/login" className="btn btn-outline-light btn-lg px-4 fw-bold">
                    <i className="fas fa-sign-in-alt me-2"></i>
                    Se connecter
                  </Link>
                </div>
              ) : (
                <div className="d-flex gap-3 flex-column flex-md-row">
                  <Link to="/competitions" className="btn btn-light btn-lg px-4 fw-bold">
                    <i className="fas fa-trophy me-2"></i>
                    Voir les compétitions
                  </Link>
                </div>
              )}
            </div>
            <div className="col-lg-4 text-center mt-5">
              <div className="bg-white bg-opacity-10 rounded p-4 backdrop-blur mb-4 mb-lg-0">
                <img src={logo} alt="Club Pro Communauté Logo" style={{ width: '80px', height: '80px', marginBottom: '1rem' }} />
                <h3 className="text-white mb-3">📊 Statistiques</h3>
                <div className="row text-center g-2">
                  <div className="col-4">
                    <div className="h4 text-white mb-1 fw-bold">{recentPlayers.length > 0 ? '6+' : '150+'}</div>
                    <small className="text-white-75">Joueurs</small>
                  </div>
                  <div className="col-4">
                    <div className="h4 text-white mb-1 fw-bold">{recentClubs.length > 0 ? '3+' : '25+'}</div>
                    <small className="text-white-75">Clubs</small>
                  </div>
                  <div className="col-4">
                    <div className="h4 text-white mb-1 fw-bold">10+</div>
                    <small className="text-white-75">Tournois</small>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Contenu principal */}
      <div className="container py-5">
        {/* Section Fonctionnalités */}
        <div className="row mb-5">
          <div className="col-12 text-center mb-4">
            <h2 className="display-5 fw-bold text-primary mb-3">
              🚀 Fonctionnalités principales
            </h2>
            <p className="lead text-muted">
              Tout ce dont vous avez besoin pour exceller dans EA Sports FC Pro Clubs
            </p>
          </div>
          
          {/* Section Compétitions uniquement */}
          <div className="col-md-8 col-lg-6 mx-auto mb-4">
            <Link to="/competitions" className="text-decoration-none">
              <div className="card border-0 shadow-sm h-100 text-center p-4 feature-card">
                <div className="mb-3 feature-icon" style={{fontSize: '3rem'}}>🎮</div>
                <h4 className="text-primary mb-3">Compétitions & Tournois</h4>
                <p className="text-muted">
                  Participez à des tournois à élimination directe. Gérez les feuilles de match, faites progresser votre club pro dans le bracket et suivez les scores en temps réel.
                </p>
                <div className="btn btn-outline-primary">
                  <i className="fas fa-trophy me-2"></i>
                  Accéder aux compétitions
                </div>
              </div>
            </Link>
          </div>
        </div>

        {/* 
        Meilleurs Performeurs, Joueurs Récents et Clubs Récents désactivés temporairement
        */}

        {/* Section Call to Action */}
        <div className="row">
          <div className="col-12">
            <div className="card border-0 shadow-lg" 
                 style={{
                   background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                   color: 'white'
                 }}>
              <div className="card-body text-center p-5">
                <h2 className="mb-4">Prêt à rejoindre la communauté ?</h2>
                <p className="lead mb-4">
                  Créez votre profil, trouvez votre équipe et commencez votre aventure EA Sports FC Pro Clubs !
                </p>
                {!user ? (
                  <div className="d-flex gap-3 justify-content-center">
                    <Link to="/register" className="btn btn-light btn-lg px-4">
                      <i className="fas fa-user-plus me-2"></i>
                      S'inscrire maintenant
                    </Link>
                    <Link to="/login" className="btn btn-outline-light btn-lg px-4">
                      <i className="fas fa-sign-in-alt me-2"></i>
                      Se connecter
                    </Link>
                  </div>
                ) : (
                  <div className="d-flex gap-3 justify-content-center">
                    <Link to="/mon-profil" className="btn btn-light btn-lg px-4">
                      <i className="fas fa-user me-2"></i>
                      Mon profil
                    </Link>
                    <Link to="/competitions" className="btn btn-outline-light btn-lg px-4">
                      <i className="fas fa-trophy me-2"></i>
                      Voir les compétitions
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage; 