import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
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

  return (
    <div className="min-vh-100">
      <style>{featureCardStyles}</style>
      {/* Hero Section */}
      <div className="text-white py-5 position-relative overflow-hidden" 
           style={{
             background: `url(${bgHeader}) no-repeat center center`,
             backgroundSize: 'cover',
             minHeight: '380px',
             borderBottom: '1px solid var(--border-glass)'
           }}>
        <div className="position-absolute w-100 h-100" 
             style={{
               background: 'linear-gradient(135deg, rgba(8, 12, 20, 0.92) 0%, rgba(17, 22, 37, 0.85) 100%)',
               top: 0,
               left: 0,
               zIndex: 1
             }}></div>
        <div className="container position-relative py-5" style={{zIndex: 2}}>
          <div className="row justify-content-center text-center">
            <div className="col-lg-8 px-4 px-md-5">
              <img src={logo} alt="Club Pro Communauté Logo" style={{ width: '80px', height: '80px', marginBottom: '1.5rem' }} />
              <h1 className="display-4 fw-bold mb-3 text-white" style={{fontFamily: 'Rajdhani', letterSpacing: '1px'}}>
                🏆 Club Pro Communauté
              </h1>
              <p className="lead mb-4 text-silver" style={{fontSize: '1.1rem', color: 'var(--text-silver)'}}>
                La plateforme de référence pour organiser et participer aux compétitions de clubs.
                Rejoignez ou créez votre équipe, et affrontez la communauté dans nos tournois en ligne.
              </p>
              {!user ? (
                <div className="d-flex gap-3 justify-content-center">
                  <Link to="/register" className="btn btn-primary btn-lg px-4">
                    <i className="fas fa-user-plus me-2"></i>
                    S'inscrire
                  </Link>
                  <Link to="/login" className="btn btn-outline-light btn-lg px-4">
                    <i className="fas fa-sign-in-alt me-2"></i>
                    Se connecter
                  </Link>
                </div>
              ) : (
                <div className="d-flex gap-3 justify-content-center">
                  <Link to="/competitions" className="btn btn-primary btn-lg px-4">
                    <i className="fas fa-trophy me-2"></i>
                    Voir les compétitions
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Contenu principal */}
      <div className="container py-5">
        {/* Section Call to Action */}
        <div className="row justify-content-center">
          <div className="col-lg-8 px-4 px-md-5">
            <div className="card border-0 text-center p-4 p-md-5" 
                 style={{
                   background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.08) 0%, rgba(0, 240, 255, 0.04) 100%)',
                 }}>
              <h2 className="mb-4" style={{fontFamily: 'Rajdhani', fontWeight: 700}}>Prêt à rejoindre la communauté ?</h2>
              <p className="lead text-silver mb-4" style={{fontSize: '1.05rem', color: 'var(--text-silver)'}}>
                Créez votre profil de joueur, rejoignez votre équipe idéale et commencez votre aventure EA Sports FC Pro Clubs !
              </p>
              {!user ? (
                <div className="d-flex gap-3 justify-content-center">
                  <Link to="/register" className="btn btn-primary px-4">
                    <i className="fas fa-user-plus me-2"></i>
                    S'inscrire maintenant
                  </Link>
                </div>
              ) : (
                <div className="d-flex gap-3 justify-content-center">
                  <Link to="/mon-profil" className="btn btn-primary px-4">
                    <i className="fas fa-user me-2"></i>
                    Mon profil
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage; 