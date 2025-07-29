import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { notificationAPI } from '../services/api';

const NotificationsPage = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchNotifications = useCallback(async () => {
    if (!user || !user.token) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const response = await notificationAPI.getNotifications(user.token, currentPage, 20);
      setNotifications(response.notifications);
      setTotalPages(response.totalPages);
    } catch (error) {
      console.error('Erreur lors de la récupération des notifications:', error);
    } finally {
      setLoading(false);
    }
  }, [user, currentPage]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const handleMarkAsRead = async (notificationId) => {
    if (!user || !user.token) return;
    
    try {
      await notificationAPI.markAsRead(notificationId, user.token);
      // Mettre à jour l'état local
      setNotifications(prev => 
        prev.map(notif => 
          notif._id === notificationId ? { ...notif, lue: true } : notif
        )
      );
    } catch (error) {
      console.error('Erreur lors du marquage comme lue:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    if (!user || !user.token) return;
    
    try {
      await notificationAPI.markAllAsRead(user.token);
      setNotifications(prev => prev.map(notif => ({ ...notif, lue: true })));
    } catch (error) {
      console.error('Erreur lors du marquage de toutes les notifications:', error);
    }
  };

  const handleDeleteNotification = async (notificationId) => {
    if (!user || !user.token) return;
    
    try {
      await notificationAPI.deleteNotification(notificationId, user.token);
      setNotifications(prev => prev.filter(notif => notif._id !== notificationId));
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
    }
  };

  const handleDeleteAllNotifications = async () => {
    if (!user || !user.token) return;
    
    if (window.confirm('Êtes-vous sûr de vouloir supprimer toutes les notifications ?')) {
      try {
        await notificationAPI.deleteAllNotifications(user.token);
        setNotifications([]);
      } catch (error) {
        console.error('Erreur lors de la suppression de toutes les notifications:', error);
      }
    }
  };

  const getNotificationIcon = (type) => {
    const icons = {
      'invitation_club': 'fas fa-envelope',
      'invitation_acceptee': 'fas fa-check-circle',
      'invitation_refusee': 'fas fa-times-circle',
      'promotion_admin': 'fas fa-crown',
      'exclusion_club': 'fas fa-user-times'
    };
    return icons[type] || 'fas fa-bell';
  };

  const getNotificationColor = (type) => {
    const colors = {
      'invitation_club': 'text-primary',
      'invitation_acceptee': 'text-success',
      'invitation_refusee': 'text-danger',
      'promotion_admin': 'text-warning',
      'exclusion_club': 'text-warning'
    };
    return colors[type] || 'text-secondary';
  };

  if (!user) {
    return (
      <div className="container mt-4">
        <div className="text-center">
          <i className="fas fa-user-lock fa-3x text-muted mb-3"></i>
          <h5 className="text-muted">Connexion requise</h5>
          <p className="text-muted">Vous devez être connecté pour voir vos notifications.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="container mt-4">
        <div className="text-center">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Chargement...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mt-4">
      <div className="row">
        <div className="col-12">
          <div className="card">
            <div className="card-header text-white d-flex justify-content-between align-items-center" 
                 style={{background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'}}>
              <h4 className="mb-0">
                <i className="fas fa-bell me-2"></i>
                Mes Notifications
              </h4>
              <div className="btn-group">
                <button
                  className="btn btn-light btn-sm"
                  onClick={handleMarkAllAsRead}
                  disabled={notifications.every(n => n.lue)}
                >
                  <i className="fas fa-check-double me-1"></i>
                  Tout marquer comme lu
                </button>
                <button
                  className="btn btn-light btn-sm"
                  onClick={handleDeleteAllNotifications}
                  disabled={notifications.length === 0}
                >
                  <i className="fas fa-trash me-1"></i>
                  Tout supprimer
                </button>
              </div>
            </div>
            <div className="card-body">
              {notifications.length === 0 ? (
                <div className="text-center py-4">
                  <i className="fas fa-bell fa-3x text-muted mb-3"></i>
                  <h5 className="text-muted">Aucune notification</h5>
                  <p className="text-muted">Vous n'avez pas encore reçu de notifications.</p>
                </div>
              ) : (
                <div className="list-group">
                  {notifications.map((notification) => (
                    <div
                      key={notification._id}
                      className={`list-group-item list-group-item-action ${
                        !notification.lue ? 'list-group-item-warning' : ''
                      }`}
                    >
                      <div className="d-flex justify-content-between align-items-start">
                        <div className="flex-grow-1">
                          <div className="d-flex align-items-center mb-2">
                            <i className={`${getNotificationIcon(notification.type)} me-2 ${getNotificationColor(notification.type)}`}></i>
                            <h6 className="mb-0">{notification.titre}</h6>
                            {!notification.lue && (
                              <span className="badge bg-warning ms-2">Nouveau</span>
                            )}
                          </div>
                          <p className="mb-2">{notification.message}</p>
                          <small className="text-muted">
                            <i className="fas fa-calendar me-1"></i>
                            {new Date(notification.dateCreation).toLocaleString()}
                          </small>
                        </div>
                        <div className="btn-group btn-group-sm">
                          {!notification.lue && (
                            <button
                              className="btn btn-outline-success btn-sm"
                              onClick={() => handleMarkAsRead(notification._id)}
                              title="Marquer comme lu"
                            >
                              <i className="fas fa-check"></i>
                            </button>
                          )}
                          <button
                            className="btn btn-outline-danger btn-sm"
                            onClick={() => handleDeleteNotification(notification._id)}
                            title="Supprimer"
                          >
                            <i className="fas fa-trash"></i>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Pagination */}
              {totalPages > 1 && (
                <nav className="mt-3">
                  <ul className="pagination justify-content-center">
                    <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                      <button
                        className="page-link"
                        onClick={() => setCurrentPage(currentPage - 1)}
                        disabled={currentPage === 1}
                      >
                        Précédent
                      </button>
                    </li>
                    
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                      <li key={page} className={`page-item ${currentPage === page ? 'active' : ''}`}>
                        <button
                          className="page-link"
                          onClick={() => setCurrentPage(page)}
                        >
                          {page}
                        </button>
                      </li>
                    ))}
                    
                    <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                      <button
                        className="page-link"
                        onClick={() => setCurrentPage(currentPage + 1)}
                        disabled={currentPage === totalPages}
                      >
                        Suivant
                      </button>
                    </li>
                  </ul>
                </nav>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationsPage; 