import React, { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import NotificationPopup from '../components/NotificationPopup';
import Chatbot from '../components/Chatbot';

export default function MainLayout({ children }) {
  const { user } = useAuth();
  const location = useLocation();

  // Forcer le re-rendu quand l'URL change
  useEffect(() => {
    // Scroll vers le haut de la page
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return (
    <div>
      <Navbar />
      <main>{children}</main>
      <NotificationPopup />
      <Chatbot />
      
      {/* Footer avec liens légaux */}
      <footer className="bg-dark text-white py-4 mt-5">
        <div className="container">
          <div className="row align-items-center">
            <div className="col-md-6">
              <small>
                © 2024 Club Pro Communauté. Tous droits réservés.
              </small>
            </div>
            <div className="col-md-6 text-md-end">
              <small>
                <Link to="/privacy" className="text-white text-decoration-none me-3">
                  <i className="fas fa-shield-alt me-1"></i>
                  Confidentialité
                </Link>
                <Link to="/cgu" className="text-white text-decoration-none me-3">
                  <i className="fas fa-file-contract me-1"></i>
                  CGU
                </Link>
                {user && (
                  <Link to="/droits-donnees" className="text-white text-decoration-none">
                    <i className="fas fa-user-shield me-1"></i>
                    Mes droits
                  </Link>
                )}
              </small>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
} 