import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout, loginTest } = useAuth();

  return (
    <nav className="navbar navbar-expand-lg navbar-dark shadow-sm" 
         style={{
           background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
           borderBottom: '1px solid rgba(255,255,255,0.1)'
         }}>
      <div className="container">
        <Link className="navbar-brand fw-bold d-flex align-items-center" to="/">
          <i className="fas fa-trophy me-2 text-warning"></i>
          Club Pro Communauté
        </Link>
        
        <button 
          className="navbar-toggler border-0" 
          type="button" 
          data-bs-toggle="collapse" 
          data-bs-target="#navbarNav"
          style={{border: 'none'}}
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav me-auto">
            {user ? (
              <>
                <li className="nav-item dropdown">
                  <button 
                    className="nav-link dropdown-toggle d-flex align-items-center border-0 bg-transparent" 
                    type="button"
                    data-bs-toggle="dropdown"
                    style={{color: 'rgba(255,255,255,0.8)'}}
                  >
                    <i className="fas fa-users me-1"></i>
                    Joueurs
                  </button>
                  <ul className="dropdown-menu shadow-lg border-0" style={{background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(10px)'}}>
                    <li>
                      <Link className="dropdown-item d-flex align-items-center" to="/joueurs">
                        <i className="fas fa-search me-2 text-primary"></i>
                        Rechercher un joueur
                      </Link>
                    </li>
                    <li>
                      <Link className="dropdown-item d-flex align-items-center" to="/mon-profil">
                        <i className="fas fa-user me-2 text-primary"></i>
                        Mon profil
                      </Link>
                    </li>
                  </ul>
                </li>
                
                <li className="nav-item dropdown">
                  <button 
                    className="nav-link dropdown-toggle d-flex align-items-center border-0 bg-transparent" 
                    type="button"
                    data-bs-toggle="dropdown"
                    style={{color: 'rgba(255,255,255,0.8)'}}
                  >
                    <i className="fas fa-shield-alt me-1"></i>
                    Clubs
                  </button>
                  <ul className="dropdown-menu shadow-lg border-0" style={{background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(10px)'}}>
                    <li>
                      <Link className="dropdown-item d-flex align-items-center" to="/clubs">
                        <i className="fas fa-search me-2 text-primary"></i>
                        Rechercher un club
                      </Link>
                    </li>
                    <li>
                      <Link className="dropdown-item d-flex align-items-center" to="/mes-clubs">
                        <i className="fas fa-users me-2 text-info"></i>
                        Mes clubs
                      </Link>
                    </li>
                    <li>
                      <Link className="dropdown-item d-flex align-items-center" to="/creer-club">
                        <i className="fas fa-plus me-2 text-success"></i>
                        Créer un club
                      </Link>
                    </li>
                  </ul>
                </li>
                
                <li className="nav-item">
                  <Link className="nav-link d-flex align-items-center" to="/discussions">
                    <i className="fas fa-comments me-1"></i>
                    Discussions
                  </Link>
                </li>
                
                <li className="nav-item">
                  <Link className="nav-link d-flex align-items-center" to="/competition">
                    <i className="fas fa-trophy me-1"></i>
                    Compétition
                  </Link>
                </li>
              </>
            ) : (
              <li className="nav-item">
                <Link className="nav-link d-flex align-items-center" to="/joueurs">
                  <i className="fas fa-users me-1"></i>
                  Joueurs
                </Link>
              </li>
            )}
          </ul>
          
          <ul className="navbar-nav">
            {user ? (
              <>
                <li className="nav-item dropdown">
                  <button 
                    className="nav-link dropdown-toggle d-flex align-items-center border-0 bg-transparent" 
                    type="button"
                    data-bs-toggle="dropdown"
                    style={{color: 'rgba(255,255,255,0.8)'}}
                  >
                    <div className="bg-white bg-opacity-20 rounded-circle d-flex align-items-center justify-content-center me-2" style={{width: '32px', height: '32px'}}>
                      <i className="fas fa-user text-white" style={{fontSize: '0.9rem'}}></i>
                    </div>
                    {user.pseudo}
                  </button>
                  <ul className="dropdown-menu shadow-lg border-0" style={{background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(10px)'}}>
                    <li>
                      <Link className="dropdown-item d-flex align-items-center" to="/compte">
                        <i className="fas fa-cog me-2 text-primary"></i>
                        Mon compte
                      </Link>
                    </li>
                    <li><hr className="dropdown-divider" /></li>
                    <li>
                      <button className="dropdown-item d-flex align-items-center text-danger" onClick={logout}>
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
                  <Link className="nav-link d-flex align-items-center" to="/login">
                    <i className="fas fa-sign-in-alt me-1"></i>
                    Connexion
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className="btn btn-light btn-sm ms-2 d-flex align-items-center" to="/register" 
                        style={{
                          background: 'rgba(255,255,255,0.9)',
                          border: 'none',
                          color: '#667eea',
                          fontWeight: 'bold'
                        }}>
                    <i className="fas fa-user-plus me-1"></i>
                    Inscription
                  </Link>
                </li>
                <li className="nav-item">
                  <button className="btn btn-outline-light btn-sm ms-2 d-flex align-items-center" onClick={loginTest}
                          style={{border: '1px solid rgba(255,255,255,0.5)'}}>
                    <i className="fas fa-flask me-1"></i>
                    Mode test
                  </button>
                </li>
              </>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
} 