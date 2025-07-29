import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { userAPI } from '../services/api';

export default function NotificationPopup() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [showPopup, setShowPopup] = useState(false);
  const [currentNotification, setCurrentNotification] = useState(null);
  const [shownNotifications, setShownNotifications] = useState(new Set());
  const loadNotificationsRef = useRef();

  const loadNotifications = useCallback(async () => {
    if (!user) return;
    
    try {
      const data = await userAPI.getUnreadNotifications();
      
      // Filtrer les notifications importantes (demandes d'adhésion, acceptations, refus, exclusions)
      const notificationsImportantes = data.filter(notif => 
        ['demande_adhesion', 'invitation_acceptee', 'invitation_refusee', 'exclusion_club'].includes(notif.type)
      );
      
      // Vérifier s'il y a une nouvelle notification à afficher
      if (notificationsImportantes.length > 0) {
        const nouvelleNotification = notificationsImportantes[0];
        console.log('🎉 Nouvelle notification détectée:', nouvelleNotification.message);
        setCurrentNotification(nouvelleNotification);
        setShowPopup(true);
        setShownNotifications(prev => new Set([...prev, nouvelleNotification._id]));
      }
      
      setNotifications(notificationsImportantes);
    } catch (err) {
      console.error('Erreur chargement notifications:', err);
    }
  }, [user]);

  // Stocker la fonction dans useRef pour éviter les re-créations
  loadNotificationsRef.current = loadNotifications;



  const handleMarkAsRead = async (notificationId) => {
    try {
      await userAPI.markNotificationAsRead(notificationId);
      setNotifications(prev => prev.filter(n => n._id !== notificationId));
      setShowPopup(false);
      setCurrentNotification(null);
      
      // Vérifier s'il y a une autre notification non affichée
      setTimeout(() => {
        const prochaineNotification = notifications.find(notif => 
          !shownNotifications.has(notif._id) && notif._id !== notificationId
        );
        
        if (prochaineNotification) {
          setCurrentNotification(prochaineNotification);
          setShowPopup(true);
          setShownNotifications(prev => new Set([...prev, prochaineNotification._id]));
        }
      }, 300); // Délai pour l'animation de fermeture
    } catch (err) {
      console.error('Erreur marquage notification:', err);
    }
  };

  const handleViewClub = async (clubId) => {
    // Marquer la notification comme lue avant de rediriger
    try {
      await userAPI.markNotificationAsRead(currentNotification._id);
      setNotifications(prev => prev.filter(n => n._id !== currentNotification._id));
      setShowPopup(false);
      setCurrentNotification(null);
      
      // Rediriger vers le club
      window.location.href = `/club/${clubId}`;
    } catch (err) {
      console.error('Erreur marquage notification:', err);
      // Rediriger quand même même si le marquage échoue
      window.location.href = `/club/${clubId}`;
    }
  };

  const getNotificationIcon = (type) => {
    const icons = {
      'demande_adhesion': 'fas fa-user-plus',
      'invitation_acceptee': 'fas fa-check-circle',
      'invitation_refusee': 'fas fa-times-circle',
      'exclusion_club': 'fas fa-user-times'
    };
    return icons[type] || 'fas fa-bell';
  };

  const getNotificationColor = (type) => {
    const colors = {
      'demande_adhesion': 'text-primary',
      'invitation_acceptee': 'text-success',
      'invitation_refusee': 'text-danger',
      'exclusion_club': 'text-warning'
    };
    return colors[type] || 'text-secondary';
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (user) {
      // Réinitialiser les notifications affichées quand l'utilisateur change
      setShownNotifications(new Set());
      setNotifications([]);
      setCurrentNotification(null);
      setShowPopup(false);
      
      // Chargement initial avec un délai pour éviter les conflits
      const initialTimeout = setTimeout(() => loadNotificationsRef.current(), 2000);
      
      // Vérifier les nouvelles notifications toutes les 60 secondes
      const interval = setInterval(() => loadNotificationsRef.current(), 60000);
      
      return () => {
        clearTimeout(initialTimeout);
        clearInterval(interval);
      };
    } else {
      // Réinitialiser quand l'utilisateur se déconnecte
      setShownNotifications(new Set());
      setNotifications([]);
      setCurrentNotification(null);
      setShowPopup(false);
    }
  }, [user]);

  // Fermer la popup et passer à la notification suivante si il y en a une
  const handleClosePopup = () => {
    setShowPopup(false);
    setCurrentNotification(null);
    
    // Vérifier s'il y a une autre notification non affichée
    setTimeout(() => {
      const prochaineNotification = notifications.find(notif => 
        !shownNotifications.has(notif._id)
      );
      
      if (prochaineNotification) {
        setCurrentNotification(prochaineNotification);
        setShowPopup(true);
        setShownNotifications(prev => new Set([...prev, prochaineNotification._id]));
      }
    }, 300); // Délai pour l'animation de fermeture
  };


  
  if (!showPopup || !currentNotification) {
    return null;
  }

  return (
    <div className="notification-popup-overlay">
      <div className="notification-popup">
                <div className="notification-popup-header">
          <h5>
            <i className="fas fa-bell me-2"></i>
            Nouvelle notification
          </h5>
          <button 
            type="button" 
            className="btn-close" 
            onClick={handleClosePopup}
          ></button>
        </div>
        
        <div className="notification-popup-body">
          <div className="notification-item">
            <div className="notification-content">
              <div className="d-flex align-items-start">
                <i className={`${getNotificationIcon(currentNotification.type)} ${getNotificationColor(currentNotification.type)} me-2 mt-1`}></i>
                <div>
                  <p className="mb-1">{currentNotification.message}</p>
                  <small className="text-muted">
                    {new Date(currentNotification.dateCreation).toLocaleString()}
                  </small>
                </div>
              </div>
            </div>
            
            <div className="notification-actions">
              {currentNotification.donnees?.clubId && (
                <button
                  className="btn btn-sm btn-outline-primary"
                  onClick={() => handleViewClub(currentNotification.donnees.clubId)}
                >
                  <i className="fas fa-eye me-1"></i>
                  Voir le club
                </button>
              )}
              <button
                className="btn btn-sm btn-outline-secondary"
                onClick={() => handleMarkAsRead(currentNotification._id)}
              >
                <i className="fas fa-check me-1"></i>
                Marquer comme lue
              </button>
            </div>
          </div>
        </div>
        
        <div className="notification-popup-footer">
          <button 
            type="button" 
            className="btn btn-secondary btn-sm"
            onClick={handleClosePopup}
          >
            Fermer
          </button>
        </div>
      </div>
      
      <style jsx>{`
        .notification-popup-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(0, 0, 0, 0.5);
          backdrop-filter: blur(5px);
          z-index: 1060;
          display: flex;
          align-items: center;
          justify-content: center;
          animation: fadeIn 0.3s ease-out;
        }
        
        .notification-popup {
          background: white;
          border-radius: 15px;
          box-shadow: 0 25px 50px rgba(0, 0, 0, 0.25);
          max-width: 500px;
          width: 90%;
          max-height: 80%;
          overflow: hidden;
          animation: slideInUp 0.3s ease-out;
        }
        
        .notification-popup-header {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 1rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        
        .notification-popup-header h5 {
          margin: 0;
          font-weight: 600;
        }
        
        .notification-popup-body {
          padding: 1rem;
          max-height: 400px;
          overflow-y: auto;
        }
        
        .notification-item {
          border: 1px solid #e9ecef;
          border-radius: 8px;
          padding: 1rem;
          margin-bottom: 1rem;
          background: #f8f9fa;
        }
        
        .notification-content p {
          margin: 0;
          font-weight: 500;
        }
        
        .notification-actions {
          display: flex;
          gap: 0.5rem;
          margin-top: 0.5rem;
        }
        
        .notification-popup-footer {
          padding: 1rem;
          border-top: 1px solid #e9ecef;
          text-align: right;
        }
        
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes slideInUp {
          from { 
            opacity: 0;
            transform: translateY(30px);
          }
          to { 
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .notification-item {
          border: none;
          background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
          border-radius: 12px;
          padding: 1.5rem;
          margin: 0;
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
        }
        
        .notification-content p {
          font-size: 1.1rem;
          font-weight: 500;
          line-height: 1.4;
          margin-bottom: 0.5rem;
        }
        
        .notification-actions {
          margin-top: 1rem;
          gap: 0.75rem;
        }
        
        .notification-actions .btn {
          border-radius: 8px;
          font-weight: 500;
          padding: 0.5rem 1rem;
        }
      `}</style>
    </div>
  );
} 