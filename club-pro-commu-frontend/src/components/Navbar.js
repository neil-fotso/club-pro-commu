import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Avatar from './Avatar';
import { userAPI } from '../services/api';
import logo from '../assets/logo.png';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [notificationCount, setNotificationCount] = useState(0);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleNavigation = (path) => {
    // Forcer la navigation même si on est déjà sur la même page
    if (location.pathname === path) {
      window.location.reload();
    } else {
      navigate(path);
    }
  };

  const loadNotificationCount = useCallback(async () => {
    if (!user) return;
    
    try {
      const notifications = await userAPI.getUnreadNotifications();
      // Compter toutes les notifications non lues (pas seulement les demandes d'adhésion)
      setNotificationCount(notifications.length);
    } catch (err) {
      console.error('Erreur chargement notifications:', err);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      // Chargement initial avec un délai pour éviter les conflits
      const initialTimeout = setTimeout(loadNotificationCount, 1000);
      
      // Recharger les notifications toutes les 60 secondes
      const interval = setInterval(loadNotificationCount, 60000);
      
      // Écouter les événements de mise à jour des notifications
      const handleNotificationsUpdated = () => {
        loadNotificationCount();
      };
      window.addEventListener('notifications-updated', handleNotificationsUpdated);
      
      return () => {
        clearTimeout(initialTimeout);
        clearInterval(interval);
        window.removeEventListener('notifications-updated', handleNotificationsUpdated);
      };
    }
  }, [user, loadNotificationCount]);

  return (
    <nav className="navbar navbar-expand-lg navbar-dark" style={{backgroundColor: '#0c101b', borderBottom: '1px solid var(--border-glass)', position: 'sticky', top: 0, zIndex: 1050}}>
      <div className="container">
        <Link className="navbar-brand d-flex align-items-center" to="/">
          <img src={logo} alt="Club Pro Communauté Logo" style={{ width: '36px', height: '36px', marginRight: '8px' }} />
          <span style={{fontFamily: 'Rajdhani', fontWeight: 700, fontSize: '1.25rem', letterSpacing: '0.5px'}}>Club Pro Communauté</span>
        </Link>

        {/* Menu principal - visible uniquement sur desktop */}
        <div className="collapse navbar-collapse d-none d-lg-flex">
          <ul className="navbar-nav me-auto">
            <li className="nav-item">
              <Link className="nav-link" to="/" onClick={() => handleNavigation('/')}>
                <i className="fas fa-home me-1"></i>
                Accueil
              </Link>
            </li>
            <li className="nav-item dropdown">
              <button
                className="nav-link dropdown-toggle"
                type="button"
                data-bs-toggle="dropdown"
                aria-expanded="false"
                style={{ background: 'none', border: 'none' }}
              >
                <i className="fas fa-shield-alt me-1"></i>
                Clubs
              </button>
              <ul className="dropdown-menu">
                <li>
                  <Link className="dropdown-item" to="/create-club" onClick={() => handleNavigation('/create-club')}>
                    <i className="fas fa-plus me-2"></i>
                    Créer un club
                  </Link>
                </li>
                <li>
                  <Link className="dropdown-item" to="/mes-clubs" onClick={() => handleNavigation('/mes-clubs')}>
                    <i className="fas fa-user-friends me-2"></i>
                    Mon club
                  </Link>
                </li>
              </ul>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/competitions" onClick={() => handleNavigation('/competitions')}>
                <i className="fas fa-trophy me-1"></i>
                Compétitions
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/reglement" onClick={() => handleNavigation('/reglement')}>
                <i className="fas fa-gavel me-1"></i>
                Règlement
              </Link>
            </li>
          </ul>
        </div>

        {/* Zone Utilisateur - Toujours visible en haut à droite (non effondrée) */}
        <div className="d-flex align-items-center">
          <ul className="navbar-nav flex-row align-items-center gap-1">
            {user ? (
              <li className="nav-item dropdown">
                <button
                  className="nav-link dropdown-toggle d-flex align-items-center px-2"
                  type="button"
                  data-bs-toggle="dropdown"
                  style={{ background: 'none', border: 'none' }}
                >
                  <Avatar
                    src={user.photoProfil}
                    name={user.pseudo}
                    size="sm"
                    className="me-2"
                  />
                  <span className="d-none d-sm-inline-flex align-items-center text-white me-1">
                    {user.pseudo}
                  </span>
                  {notificationCount > 0 && (
                    <span className="badge bg-danger rounded-circle p-1 ms-1 d-flex align-items-center justify-content-center" style={{width: '18px', height: '18px', fontSize: '0.65rem'}}>
                      {notificationCount}
                    </span>
                  )}
                </button>
                <ul className="dropdown-menu dropdown-menu-end" style={{position: 'absolute'}}>
                  <li>
                    <Link className="dropdown-item" to="/mon-profil" onClick={() => handleNavigation('/mon-profil')}>
                      <i className="fas fa-user me-2"></i>
                      Mon Profil
                    </Link>
                  </li>
                  <li>
                    <Link className="dropdown-item" to="/mes-clubs" onClick={() => handleNavigation('/mes-clubs')}>
                      <i className="fas fa-shield-alt me-2"></i>
                      Mes Clubs
                    </Link>
                  </li>
                  {/* <li>
                    <Link className="dropdown-item" to="/mes-competitions" onClick={() => handleNavigation('/mes-competitions')}>
                      <i className="fas fa-trophy me-2"></i>
                      Mes Compétitions
                    </Link>
                  </li>
                  <li>
                    <Link className="dropdown-item" to="/invitations" onClick={() => handleNavigation('/invitations')}>
                      <i className="fas fa-envelope me-2"></i>
                      Invitations
                    </Link>
                  </li>
                  <li>
                    <Link className="dropdown-item" to="/notifications" onClick={() => handleNavigation('/notifications')}>
                      <i className="fas fa-bell me-2"></i>
                      Notifications
                    </Link>
                  </li> */}
                  {user.isAdmin && (
                    <>
                      <li><hr className="dropdown-divider" /></li>
                      <li>
                        <Link className="dropdown-item text-danger" to="/admin/dashboard" onClick={() => handleNavigation('/admin/dashboard')}>
                          <i className="fas fa-tachometer-alt me-2"></i>
                          Dashboard Admin
                        </Link>
                      </li>
                      <li>
                        <Link className="dropdown-item text-danger" to="/admin" onClick={() => handleNavigation('/admin')}>
                          <i className="fas fa-cog me-2"></i>
                          Administration
                        </Link>
                      </li>
                    </>
                  )}
                  <li><hr className="dropdown-divider" /></li>
                  <li>
                    <Link className="dropdown-item" to="/compte" onClick={() => handleNavigation('/compte')}>
                      <i className="fas fa-cog me-2"></i>
                      Paramètres
                    </Link>
                  </li>
                  <li>
                    <button className="dropdown-item text-danger" onClick={() => {
                      handleLogout();
                    }}>
                      <i className="fas fa-sign-out-alt me-2"></i>
                      Déconnexion
                    </button>
                  </li>
                </ul>
              </li>
            ) : (
              <>
                <li className="nav-item">
                  <Link className="nav-link px-2 text-white" to="/login" onClick={() => handleNavigation('/login')}>
                    <i className="fas fa-sign-in-alt me-1"></i>
                    <span className="d-none d-sm-inline">Connexion</span>
                  </Link>
                </li>
                <li className="nav-item ms-1">
                  <Link className="btn btn-sm btn-primary px-3" to="/register" onClick={() => handleNavigation('/register')}>
                    <i className="fas fa-user-plus me-1"></i>
                    <span>S'inscrire</span>
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