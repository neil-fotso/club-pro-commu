import React from 'react';
import { Link, useLocation } from 'react-router-dom';

export default function BottomNavigation() {
  const location = useLocation();

  const isActive = (path) => {
    return location.pathname === path ? 'active' : '';
  };

  return (
    <div className="bottom-nav d-lg-none">
      <Link to="/" className={`bottom-nav-item ${isActive('/')}`}>
        <i className="fas fa-home"></i>
        <span>Accueil</span>
      </Link>
      <Link to="/mes-clubs" className={`bottom-nav-item ${isActive('/mes-clubs')}`}>
        <i className="fas fa-shield-alt"></i>
        <span>Mon Club</span>
      </Link>
      <Link to="/competitions" className={`bottom-nav-item ${isActive('/competitions')}`}>
        <i className="fas fa-trophy"></i>
        <span>Tournois</span>
      </Link>
      <Link to="/reglement" className={`bottom-nav-item ${isActive('/reglement')}`}>
        <i className="fas fa-gavel"></i>
        <span>Règles</span>
      </Link>
      <Link to="/mon-profil" className={`bottom-nav-item ${isActive('/mon-profil')}`}>
        <i className="fas fa-user"></i>
        <span>Profil</span>
      </Link>
    </div>
  );
}
