import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

export default function CookieConsent() {
  const [showConsent, setShowConsent] = useState(false);
  const [, setConsentGiven] = useState(false);

  useEffect(() => {
    // Vérifier si le consentement a déjà été donné
    const cookieConsent = localStorage.getItem('cookieConsent');
    if (!cookieConsent) {
      setShowConsent(true);
    } else {
      setConsentGiven(cookieConsent === 'true');
    }
  }, []);

  const handleAcceptAll = () => {
    localStorage.setItem('cookieConsent', 'true');
    localStorage.setItem('analyticsConsent', 'true');
    localStorage.setItem('marketingConsent', 'true');
    setConsentGiven(true);
    setShowConsent(false);
  };

  const handleAcceptEssential = () => {
    localStorage.setItem('cookieConsent', 'true');
    localStorage.setItem('analyticsConsent', 'false');
    localStorage.setItem('marketingConsent', 'false');
    setConsentGiven(true);
    setShowConsent(false);
  };

  const handleReject = () => {
    localStorage.setItem('cookieConsent', 'false');
    localStorage.setItem('analyticsConsent', 'false');
    localStorage.setItem('marketingConsent', 'false');
    setConsentGiven(false);
    setShowConsent(false);
  };

  if (!showConsent) {
    return null;
  }

  return (
    <div className="cookie-consent-overlay">
      <div className="cookie-consent-modal">
        <div className="card border-0 shadow-lg">
          <div className="card-header bg-primary text-white">
            <h5 className="mb-0">
              <i className="fas fa-cookie-bite me-2"></i>
              Gestion des cookies
            </h5>
          </div>
          <div className="card-body">
            <p className="mb-3">
              Nous utilisons des cookies pour améliorer votre expérience sur notre site. 
              Certains cookies sont nécessaires au fonctionnement du site, d'autres nous aident 
              à améliorer nos services.
            </p>

            <div className="row mb-3">
              <div className="col-md-4">
                <h6 className="text-success">
                  <i className="fas fa-check-circle me-2"></i>
                  Cookies essentiels
                </h6>
                <small className="text-muted">
                  Nécessaires au fonctionnement du site (authentification, sécurité)
                </small>
              </div>
              <div className="col-md-4">
                <h6 className="text-info">
                  <i className="fas fa-chart-line me-2"></i>
                  Cookies analytiques
                </h6>
                <small className="text-muted">
                  Nous aident à comprendre l'utilisation du site (anonymisé)
                </small>
              </div>
              <div className="col-md-4">
                <h6 className="text-warning">
                  <i className="fas fa-bullhorn me-2"></i>
                  Cookies marketing
                </h6>
                <small className="text-muted">
                  Personnalisation et communications (avec votre accord)
                </small>
              </div>
            </div>

            <div className="d-flex flex-wrap gap-2 mb-3">
              <button
                className="btn btn-success"
                onClick={handleAcceptAll}
              >
                <i className="fas fa-check me-2"></i>
                Accepter tous les cookies
              </button>
              <button
                className="btn btn-outline-primary"
                onClick={handleAcceptEssential}
              >
                <i className="fas fa-shield-alt me-2"></i>
                Cookies essentiels uniquement
              </button>
              <button
                className="btn btn-outline-secondary"
                onClick={handleReject}
              >
                <i className="fas fa-times me-2"></i>
                Refuser
              </button>
            </div>

            <div className="text-center">
              <small className="text-muted">
                En continuant, vous acceptez notre{' '}
                <Link to="/privacy" className="text-decoration-none">
                  Politique de Confidentialité
                </Link>
                {' '}et nos{' '}
                <Link to="/cgu" className="text-decoration-none">
                  Conditions Générales d'Utilisation
                </Link>
              </small>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .cookie-consent-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 9999;
          padding: 20px;
        }

        .cookie-consent-modal {
          max-width: 600px;
          width: 100%;
        }

        .cookie-consent-modal .card {
          border-radius: 15px;
        }

        .cookie-consent-modal .btn {
          border-radius: 25px;
          padding: 8px 20px;
        }
      `}</style>
    </div>
  );
} 