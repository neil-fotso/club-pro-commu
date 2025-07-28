import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Avatar from './Avatar';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark" style={{background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'}}>
      <div className="container">
        <Link className="navbar-brand" to="/">
          <i className="fas fa-trophy me-2"></i>
          Club Pro Communauté
        </Link>

        <button
          className="navbar-toggler"
          type="button"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className={`collapse navbar-collapse ${isMenuOpen ? 'show' : ''}`}>
          <ul className="navbar-nav me-auto">
            <li className="nav-item">
              <Link className="nav-link" to="/" onClick={() => setIsMenuOpen(false)}>
                <i className="fas fa-home me-1"></i>
                Accueil
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/recherche-joueur" onClick={() => setIsMenuOpen(false)}>
                <i className="fas fa-search me-1"></i>
                Recherche Joueurs
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/recommandations" onClick={() => setIsMenuOpen(false)}>
                <i className="fas fa-star me-1"></i>
                Recommandations
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/clubs" onClick={() => setIsMenuOpen(false)}>
                <i className="fas fa-shield-alt me-1"></i>
                Clubs
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/competitions" onClick={() => setIsMenuOpen(false)}>
                <i className="fas fa-trophy me-1"></i>
                Compétitions
              </Link>
            </li>
          </ul>

          <ul className="navbar-nav">
            {user ? (
              <>
                <li className="nav-item dropdown">
                  <button
                    className="nav-link dropdown-toggle d-flex align-items-center"
                    type="button"
                    data-bs-toggle="dropdown"
                  >
                    <Avatar
                      src={user.photoProfil}
                      name={user.pseudo}
                      size="sm"
                      className="me-2"
                    />
                    {user.pseudo}
                  </button>
                  <ul className="dropdown-menu">
                    <li>
                      <Link className="dropdown-item" to="/mon-profil" onClick={() => setIsMenuOpen(false)}>
                        <i className="fas fa-user me-2"></i>
                        Mon Profil
                      </Link>
                    </li>
                    <li>
                      <Link className="dropdown-item" to="/mes-clubs" onClick={() => setIsMenuOpen(false)}>
                        <i className="fas fa-shield-alt me-2"></i>
                        Mes Clubs
                      </Link>
                    </li>
                    <li>
                      <Link className="dropdown-item" to="/mes-competitions" onClick={() => setIsMenuOpen(false)}>
                        <i className="fas fa-trophy me-2"></i>
                        Mes Compétitions
                      </Link>
                    </li>
                    <li>
                      <Link className="dropdown-item" to="/invitations" onClick={() => setIsMenuOpen(false)}>
                        <i className="fas fa-envelope me-2"></i>
                        Invitations
                      </Link>
                    </li>
                    <li>
                      <Link className="dropdown-item" to="/notifications" onClick={() => setIsMenuOpen(false)}>
                        <i className="fas fa-bell me-2"></i>
                        Notifications
                      </Link>
                    </li>
                    <li><hr className="dropdown-divider" /></li>
                    <li>
                      <Link className="dropdown-item" to="/compte" onClick={() => setIsMenuOpen(false)}>
                        <i className="fas fa-cog me-2"></i>
                        Paramètres
                      </Link>
                    </li>
                    <li>
                      <button className="dropdown-item text-danger" onClick={() => {
                        setIsMenuOpen(false);
                        handleLogout();
                      }}>
                        <i className="fas fa-sign-out-alt me-2"></i>
                        Déconnexion
                      </button>
                    </li>
                  </ul>
                </li>
              </>
            ) : (
              <>
                <li className="nav-item">
                  <Link className="nav-link" to="/login" onClick={() => setIsMenuOpen(false)}>
                    <i className="fas fa-sign-in-alt me-1"></i>
                    Connexion
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/register" onClick={() => setIsMenuOpen(false)}>
                    <i className="fas fa-user-plus me-1"></i>
                    Inscription
                  </Link>
                </li>
              </>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
} 