import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { playerAPI, clubAPI } from '../services/api';
import Avatar from '../components/Avatar';
import bgHeader from '../assets/bg-header.jpg';

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
  const [topPlayers, setTopPlayers] = useState([]);
  const [topClubs, setTopClubs] = useState([]);
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

        // Meilleurs joueurs (par ratio de victoire)
        const sortedPlayers = playersResponse
          .filter(player => player.winRate && player.winRate > 0)
          .sort((a, b) => b.winRate - a.winRate)
          .slice(0, 3);
        setTopPlayers(sortedPlayers);

        // Meilleurs clubs (par ratio de victoire)
        const sortedClubs = clubsResponse
          .filter(club => club.winRate && club.winRate > 0)
          .sort((a, b) => b.winRate - a.winRate)
          .slice(0, 3);
        setTopClubs(sortedClubs);
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
                La plateforme ultime pour les joueurs FIFA Pro Clubs.
                Trouvez votre équipe, recrutez des talents et construisez votre légende.
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
                  <Link to="/recherche-joueur" className="btn btn-light btn-lg px-4 fw-bold">
                    <i className="fas fa-users me-2"></i>
                    Voir les joueurs
                  </Link>
                  <Link to="/clubs" className="btn btn-outline-light btn-lg px-4 fw-bold">
                    <i className="fas fa-shield-alt me-2"></i>
                    Voir les clubs
                  </Link>
                </div>
              )}
            </div>
            <div className="col-lg-4 text-center">
              <div className="bg-white bg-opacity-10 rounded p-4 backdrop-blur mb-4 mb-lg-0">
                <div className="mb-3" style={{fontSize: '4rem'}}>⚽</div>
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
              Tout ce dont vous avez besoin pour exceller dans FIFA Pro Clubs
            </p>
          </div>
          
          <div className="col-lg-4 col-md-6 mb-4">
            <Link to="/recherche-joueur" className="text-decoration-none">
              <div className="card border-0 shadow-sm h-100 text-center p-4 feature-card">
                <div className="mb-3 feature-icon" style={{fontSize: '3rem'}}>🔍</div>
                <h4 className="text-primary mb-3">Recherche de Joueurs</h4>
                <p className="text-muted">
                  Trouvez des joueurs selon leurs compétences, plateforme et disponibilité.
                  Filtres avancés pour des résultats précis.
                </p>
                <div className="btn btn-outline-primary">
                  <i className="fas fa-search me-2"></i>
                  Rechercher
                </div>
              </div>
            </Link>
          </div>

          <div className="col-lg-4 col-md-6 mb-4">
            <Link to="/clubs" className="text-decoration-none">
              <div className="card border-0 shadow-sm h-100 text-center p-4 feature-card">
                <div className="mb-3 feature-icon" style={{fontSize: '3rem'}}>🏆</div>
                <h4 className="text-primary mb-3">Gestion de Clubs</h4>
                <p className="text-muted">
                  Créez votre club, recrutez des membres et gérez votre équipe.
                  Système de rôles et permissions avancé.
                </p>
                <div className="btn btn-outline-primary">
                  <i className="fas fa-shield-alt me-2"></i>
                  Voir les clubs
                </div>
              </div>
            </Link>
          </div>

          <div className="col-lg-4 col-md-6 mb-4">
            <Link to="/competitions" className="text-decoration-none">
              <div className="card border-0 shadow-sm h-100 text-center p-4 feature-card">
                <div className="mb-3 feature-icon" style={{fontSize: '3rem'}}>🎮</div>
                <h4 className="text-primary mb-3">Compétitions</h4>
                <p className="text-muted">
                  Organisez et participez à des tournois. Système de récompenses
                  et classements en temps réel.
                </p>
                <div className="btn btn-outline-primary">
                  <i className="fas fa-trophy me-2"></i>
                  Voir les compétitions
                </div>
              </div>
            </Link>
          </div>
        </div>

        {/* Section Meilleurs Performeurs */}
        <div className="row mb-5">
          <div className="col-12 text-center mb-4">
            <h2 className="display-5 fw-bold text-primary mb-3">
              🏆 Meilleurs Performeurs
            </h2>
            <p className="lead text-muted">
              Découvrez les joueurs et clubs avec les meilleurs ratios de victoire
            </p>
          </div>

          {/* Meilleurs Joueurs */}
          <div className="col-lg-6 mb-4">
            <div className="card border-0 shadow-lg h-100">
              <div className="card-header bg-gradient-primary text-white">
                <h4 className="mb-0">
                  <i className="fas fa-crown me-2"></i>
                  Top 3 Joueurs
                </h4>
              </div>
              <div className="card-body">
                {topPlayers.length > 0 ? (
                  <div className="row">
                    {topPlayers.map((player, index) => (
                      <div key={player._id} className="col-12 mb-3">
                        <Link to={`/player/${player._id}`} className="text-decoration-none">
                          <div className="d-flex align-items-center p-3 rounded-3 hover-card">
                            <div className="position-relative me-3">
                              <Avatar
                                src={player.photoProfil}
                                name={player.pseudo}
                                size="md"
                              />
                              <div className="position-absolute top-0 start-100 translate-middle badge bg-warning text-dark rounded-pill">
                                #{index + 1}
                              </div>
                            </div>
                            <div className="flex-grow-1">
                              <h6 className="mb-1 text-dark">{player.pseudo}</h6>
                              <p className="text-muted mb-0 small">
                                {player.plateforme} • {player.pays || 'Non renseigné'}
                              </p>
                            </div>
                            <div className="text-end">
                              <div className="h5 mb-0 text-success fw-bold">
                                {player.winRate}%
                              </div>
                              <small className="text-muted">Victoires</small>
                            </div>
                          </div>
                        </Link>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <i className="fas fa-trophy text-muted" style={{fontSize: '3rem'}}></i>
                    <p className="text-muted mt-2">Aucun joueur avec des statistiques disponibles</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Meilleurs Clubs */}
          <div className="col-lg-6 mb-4">
            <div className="card border-0 shadow-lg h-100">
              <div className="card-header bg-gradient-success text-white">
                <h4 className="mb-0">
                  <i className="fas fa-shield-alt me-2"></i>
                  Top 3 Clubs
                </h4>
              </div>
              <div className="card-body">
                {topClubs.length > 0 ? (
                  <div className="row">
                    {topClubs.map((club, index) => (
                      <div key={club._id} className="col-12 mb-3">
                        <Link to={`/club/${club._id}`} className="text-decoration-none">
                          <div className="d-flex align-items-center p-3 rounded-3 hover-card">
                            <div className="position-relative me-3">
                              <Avatar
                                src={club.logo}
                                name={club.nom}
                                size="md"
                                type="club"
                              />
                              <div className="position-absolute top-0 start-100 translate-middle badge bg-warning text-dark rounded-pill">
                                #{index + 1}
                              </div>
                            </div>
                            <div className="flex-grow-1">
                              <h6 className="mb-1 text-dark">{club.nom}</h6>
                              <p className="text-muted mb-0 small">
                                {club.plateforme} • {club.pays || 'Non renseigné'}
                              </p>
                            </div>
                            <div className="text-end">
                              <div className="h5 mb-0 text-success fw-bold">
                                {club.winRate}%
                              </div>
                              <small className="text-muted">Victoires</small>
                            </div>
                          </div>
                        </Link>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <i className="fas fa-shield-alt text-muted" style={{fontSize: '3rem'}}></i>
                    <p className="text-muted mt-2">Aucun club avec des statistiques disponibles</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Section Joueurs Récents */}
        {recentPlayers.length > 0 && (
          <div className="row mb-5">
            <div className="col-12">
              <h3 className="text-primary mb-4">
                <i className="fas fa-users me-2"></i>
                Joueurs récents
              </h3>
              <div className="row">
                {recentPlayers.map((player) => (
                  <div key={player._id} className="col-lg-4 col-md-6 mb-3">
                    <div className="card border-0 shadow-sm">
                      <div className="card-body text-center">
                        <Avatar
                          src={player.photoProfil}
                          name={player.pseudo}
                          size="lg"
                          className="mb-3"
                        />
                        <h5 className="card-title">{player.pseudo}</h5>
                        <p className="text-muted mb-2">
                          {player.plateforme} • {player.pays}
                        </p>
                        <Link to={`/player/${player._id}`} className="btn btn-outline-primary btn-sm">
                          Voir profil
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Section Clubs Récents */}
        {recentClubs.length > 0 && (
          <div className="row mb-5">
            <div className="col-12">
              <h3 className="text-primary mb-4">
                <i className="fas fa-shield-alt me-2"></i>
                Clubs récents
              </h3>
              <div className="row">
                {recentClubs.map((club) => (
                  <div key={club._id} className="col-lg-4 col-md-6 mb-3">
                    <div className="card border-0 shadow-sm">
                      <div className="card-body text-center">
                        <Avatar
                          src={club.logo}
                          name={club.nom}
                          size="lg"
                          type="club"
                          className="mb-3"
                        />
                        <h5 className="card-title">{club.nom}</h5>
                        <p className="text-muted mb-2">
                          {club.plateforme} • {club.pays}
                        </p>
                        <Link to={`/club/${club._id}`} className="btn btn-outline-primary btn-sm">
                          Voir club
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

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
                  Créez votre profil, trouvez votre équipe et commencez votre aventure FIFA Pro Clubs !
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
                    <Link to="/recherche-joueur" className="btn btn-outline-light btn-lg px-4">
                      <i className="fas fa-search me-2"></i>
                      Rechercher des joueurs
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