import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { playerAPI, clubAPI } from '../services/api';
import Avatar from '../components/Avatar';
import bgHeader from '../assets/bg-header.jpg';

const HomePage = () => {
  const { user } = useAuth();
  const [recentPlayers, setRecentPlayers] = useState([]);
  const [recentClubs, setRecentClubs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecentData = async () => {
      try {
        const [playersResponse, clubsResponse] = await Promise.all([
          playerAPI.getPlayers(),
          clubAPI.getClubs()
        ]);

        setRecentPlayers(playersResponse.slice(0, 3));
        setRecentClubs(clubsResponse.slice(0, 3));
      } catch (error) {
        console.error('Erreur lors du chargement des données récentes:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRecentData();
  }, []);

  return (
    <div className="min-vh-100">
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
                <div className="d-flex gap-3">
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
                <div className="d-flex gap-3">
                  <Link to="/joueurs" className="btn btn-light btn-lg px-4 fw-bold">
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
              <div className="bg-white bg-opacity-10 rounded p-4 backdrop-blur">
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

      {/* Main Features Section */}
      <div className="container py-5 mt-5">
        <h2 className="text-center mb-5">✨ Fonctionnalités Clés</h2>
        <div className="row g-4 g-md-4 g-lg-4">
          <div className="col-md-4 mb-3 mb-md-0">
            <Link to="/joueurs" className="text-decoration-none">
              <div className="card h-100 border-0 shadow-sm hover-shadow cursor-pointer" 
                   style={{
                     background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                     color: 'white',
                     transition: 'all 0.3s ease'
                   }}>
                <div className="card-body text-center p-4">
                  <div className="bg-white rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style={{width: '60px', height: '60px'}}>
                    <i className="fas fa-user-friends text-primary" style={{fontSize: '1.5rem'}}></i>
                  </div>
                  <h5 className="card-title">Recherche de Joueur</h5>
                  <p className="card-text text-white-90">
                    Trouvez des joueurs avec des filtres précis (poste, plateforme, disponibilité, niveau...).
                  </p>
                  <div className="btn btn-warning btn-sm">
                    <i className="fas fa-search me-1"></i>
                    Rechercher des joueurs
                  </div>
                </div>
              </div>
            </Link>
          </div>

          <div className="col-md-4 mb-3 mb-md-0">
            <Link to="/mes-clubs" className="text-decoration-none">
              <div className="card h-100 border-0 shadow-sm hover-shadow cursor-pointer" 
                   style={{
                     background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                     color: 'white',
                     transition: 'all 0.3s ease'
                   }}>
                <div className="card-body text-center p-4">
                  <div className="bg-white rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style={{width: '60px', height: '60px'}}>
                    <i className="fas fa-shield-alt text-primary" style={{fontSize: '1.5rem'}}></i>
                  </div>
                  <h5 className="card-title">Gestion de Club</h5>
                  <p className="card-text text-white-90">
                    Créez votre club, gérez votre effectif, définissez vos formations et stratégies.
                  </p>
                  <div className="btn btn-warning btn-sm">
                    <i className="fas fa-shield-alt me-1"></i>
                    Gérer mon club
                  </div>
                </div>
              </div>
            </Link>
          </div>

          <div className="col-md-4 mb-3 mb-md-0">
            <Link to="/competition" className="text-decoration-none">
              <div className="card h-100 border-0 shadow-sm hover-shadow cursor-pointer" 
                   style={{
                     background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                     color: 'white',
                     transition: 'all 0.3s ease'
                   }}>
                <div className="card-body text-center p-4">
                  <div className="bg-white rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style={{width: '60px', height: '60px'}}>
                    <i className="fas fa-medal text-primary" style={{fontSize: '1.5rem'}}></i>
                  </div>
                  <h5 className="card-title">Compétitions</h5>
                  <p className="card-text text-white-90">
                    Participez à des tournois et championnats, mesurez-vous aux meilleures équipes.
                  </p>
                  <div className="btn btn-warning btn-sm">
                    <i className="fas fa-trophy me-1"></i>
                    Voir les compétitions
                  </div>
                </div>
              </div>
            </Link>
          </div>
        </div>
      </div>

      {/* Section Derniers Joueurs et Clubs */}
      {!loading && (recentPlayers.length > 0 || recentClubs.length > 0) && (
        <div className="py-5" style={{
          background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%)'
        }}>
          <div className="container">
            <div className="row">
              {/* Derniers Joueurs */}
              {recentPlayers.length > 0 && (
                <div className="col-lg-6 mb-4">
                  <h3 className="mb-4">👥 Derniers Joueurs Inscrits</h3>
                  <div className="row g-3 g-md-3 g-lg-3">
                    {recentPlayers.map((player) => (
                      <div key={player._id} className="col-12">
                        <Link to={`/joueur/${player._id}`} className="text-decoration-none">
                          <div className="card border-0 shadow-sm hover-shadow cursor-pointer" 
                               style={{
                                 background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                 color: 'white',
                                 transition: 'all 0.3s ease'
                               }}>
                            <div className="card-body p-3">
                              <div className="d-flex align-items-center">
                                <Avatar
                                  src={player.photoProfil}
                                  name={player.pseudo}
                                  size="sm"
                                  type="player"
                                  className="me-3"
                                />
                                <div className="flex-grow-1">
                                  <h6 className="mb-1 text-white">
                                    {player.pseudo}
                                  </h6>
                                  <small className="text-white-75">
                                    {player.postePrincipal} • {player.plateforme} • {player.niveau}
                                  </small>
                                </div>
                                <div className="text-end">
                                  <span className={`badge ${player.rechercheClub ? 'bg-success' : 'bg-secondary'}`}>
                                    {player.rechercheClub ? 'Recherche club' : 'Club trouvé'}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </Link>
                      </div>
                    ))}
                  </div>
                  <div className="text-center mt-3">
                    <Link to="/joueurs" className="btn btn-outline-primary">
                      <i className="fas fa-users me-1"></i>
                      Voir tous les joueurs
                    </Link>
                  </div>
                </div>
              )}

              {/* Derniers Clubs */}
              {recentClubs.length > 0 && (
                <div className="col-lg-6 mb-4">
                  <h3 className="mb-4">🏆 Derniers Clubs Créés</h3>
                  <div className="row g-3 g-md-3 g-lg-3">
                    {recentClubs.map((club) => (
                      <div key={club._id} className="col-12">
                        <Link to={`/club/${club._id}`} className="text-decoration-none">
                          <div className="card border-0 shadow-sm hover-shadow cursor-pointer" 
                               style={{
                                 background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                 color: 'white',
                                 transition: 'all 0.3s ease'
                               }}>
                            <div className="card-body p-3">
                              <div className="d-flex align-items-center">
                                <Avatar
                                  src={club.photoProfil}
                                  name={club.nom}
                                  size="sm"
                                  type="club"
                                  className="me-3"
                                />
                                <div className="flex-grow-1">
                                  <h6 className="mb-1 text-white">
                                    {club.nom}
                                  </h6>
                                  <small className="text-white-75">
                                    {club.plateforme} • {club.membres.length} membres
                                  </small>
                                </div>
                                <div className="text-end">
                                  <span className={`badge ${club.rechercheJoueurs ? 'bg-info' : 'bg-secondary'}`}>
                                    {club.rechercheJoueurs ? 'Recrute' : 'Complet'}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </Link>
                      </div>
                    ))}
                  </div>
                  <div className="text-center mt-3">
                    <Link to="/clubs" className="btn btn-outline-primary">
                      <i className="fas fa-shield-alt me-1"></i>
                      Voir tous les clubs
                    </Link>
                  </div>
                </div>
              )}

              {/* Compétitions */}
              <div className="col-lg-12 mb-4">
                <div className="card border-0 shadow-lg" style={{
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: 'white'
                }}>
                  <div className="card-body text-center p-5">
                    <i className="fas fa-trophy fa-4x text-warning mb-4"></i>
                    <h2 className="mb-3">🏆 Compétitions FIFA Pro Clubs</h2>
                    <p className="lead mb-4">
                      Participez à des tournois, championnats et coupes organisés par la communauté
                    </p>
                    <div className="d-flex justify-content-center gap-3 flex-wrap">
                      <Link to="/competitions" className="btn btn-warning btn-lg">
                        <i className="fas fa-search me-2"></i>
                        Découvrir les compétitions
                      </Link>
                      {user && (
                        <Link to="/competitions/creer" className="btn btn-outline-light btn-lg">
                          <i className="fas fa-plus me-2"></i>
                          Créer une compétition
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Section Plateformes */}
      <div className="py-5 mt-5" style={{
        background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%)'
      }}>
        <div className="container">
          <div className="row align-items-center">
            <div className="col-lg-6">
              <h3 className="mb-4">🎮 Multi-Plateformes</h3>
              <p className="lead text-muted mb-4">
                Notre communauté s'étend sur toutes les plateformes FIFA Pro Clubs
              </p>
              <div className="row g-3 g-md-3 g-lg-3">
                <div className="col-4 mb-3 mb-md-0">
                  <div className="text-center p-3 bg-white rounded shadow-sm hover-shadow">
                    <div className="mb-2" style={{fontSize: '2rem'}}>🎮</div>
                    <div className="h6 text-primary mb-1">PS5</div>
                    <small className="text-muted">PlayStation 5</small>
                  </div>
                </div>
                <div className="col-4 mb-3 mb-md-0">
                  <div className="text-center p-3 bg-white rounded shadow-sm hover-shadow">
                    <div className="mb-2" style={{fontSize: '2rem'}}>🎮</div>
                    <div className="h6 text-primary mb-1">Xbox</div>
                    <small className="text-muted">Xbox Series</small>
                  </div>
                </div>
                <div className="col-4 mb-3 mb-md-0">
                  <div className="text-center p-3 bg-white rounded shadow-sm hover-shadow">
                    <div className="mb-2" style={{fontSize: '2rem'}}>💻</div>
                    <div className="h6 text-primary mb-1">PC</div>
                    <small className="text-muted">Origin/Steam</small>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-lg-6">
              <div className="bg-white rounded p-4 shadow-sm">
                <h5 className="mb-3">📈 Statistiques Récentes</h5>
                <div className="row text-center g-3">
                  <div className="col-6 mb-3">
                    <div className="h4 text-primary">85%</div>
                    <small className="text-muted">Joueurs trouvent un club</small>
                  </div>
                  <div className="col-6 mb-3">
                    <div className="h4 text-primary">92%</div>
                    <small className="text-muted">Satisfaction utilisateurs</small>
                  </div>
                  <div className="col-6 mb-3">
                    <div className="h4 text-primary">15min</div>
                    <small className="text-muted">Temps moyen de réponse</small>
                  </div>
                  <div className="col-6 mb-3">
                    <div className="h4 text-primary">24/7</div>
                    <small className="text-muted">Support disponible</small>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Section Call-to-Action */}
      <div className="container py-5 mt-5">
        <div className="row justify-content-center">
          <div className="col-lg-8 text-center">
            <h2 className="mb-4">🚀 Prêt à Rejoindre l'Aventure ?</h2>
            <p className="lead text-muted mb-4">
              Rejoignez des milliers de joueurs FIFA Pro Clubs et faites partie de la plus grande communauté française !
            </p>
            {!user ? (
              <div className="d-flex gap-3 justify-content-center">
                <Link to="/register" className="btn btn-primary btn-lg px-5 fw-bold"
                      style={{
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        border: 'none'
                      }}>
                  <i className="fas fa-user-plus me-2"></i>
                  Créer mon compte
                </Link>
                <Link to="/joueurs" className="btn btn-outline-primary btn-lg px-5 fw-bold">
                  <i className="fas fa-users me-2"></i>
                  Voir les joueurs
                </Link>
              </div>
            ) : (
              <div className="d-flex gap-3 justify-content-center">
                <Link to="/joueurs" className="btn btn-primary btn-lg px-5 fw-bold"
                      style={{
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        border: 'none'
                      }}>
                  <i className="fas fa-search me-2"></i>
                  Rechercher des joueurs
                </Link>
                <Link to="/clubs" className="btn btn-outline-primary btn-lg px-5 fw-bold">
                  <i className="fas fa-shield-alt me-2"></i>
                  Voir les clubs
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="py-4 mt-5" style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white'
      }}>
        <div className="container">
          <div className="row">
            <div className="col-md-6">
              <h5>Club Pro Communauté</h5>
              <p className="text-white-75 mb-0">
                &copy; {new Date().getFullYear()} Tous droits réservés.
              </p>
            </div>
            <div className="col-md-6 text-md-end">
              <ul className="list-inline mb-0">
                <li className="list-inline-item">
                  <Link to="/about" className="text-white-75 text-decoration-none">À propos</Link>
                </li>
                <li className="list-inline-item">
                  <Link to="/contact" className="text-white-75 text-decoration-none">Contact</Link>
                </li>
                <li className="list-inline-item">
                  <Link to="/privacy" className="text-white-75 text-decoration-none">Confidentialité</Link>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage; 