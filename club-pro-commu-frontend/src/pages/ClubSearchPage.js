import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { clubAPI } from '../services/api';
import Avatar from '../components/Avatar';

export default function ClubSearchPage() {
  const { user } = useAuth();
  const [clubs, setClubs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [userClub, setUserClub] = useState(null);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [filters, setFilters] = useState({
    nom: '',
    pays: '',
    plateforme: '',
    niveau: '',
    recrute: ''
  });

  const loadClubs = useCallback(async () => {
    try {
      setLoading(true);
      const data = await clubAPI.getClubs(filters);
      setClubs(data);
      setError('');
    } catch (err) {
      setError('Erreur lors du chargement des clubs');
      console.error('Erreur chargement clubs:', err);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  const loadUserClub = useCallback(async () => {
    if (!user) return;
    
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      
      const userClubs = await clubAPI.getMyClubs(token);
      if (userClubs.length > 0) {
        setUserClub(userClubs[0]); // L'utilisateur ne peut avoir qu'un seul club
      }
    } catch (err) {
      console.error('Erreur chargement club utilisateur:', err);
    }
  }, [user]);

  useEffect(() => {
    loadClubs();
    loadUserClub();
  }, [loadClubs, loadUserClub]);

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const clearFilters = () => {
    setFilters({
      nom: '',
      pays: '',
      plateforme: '',
      niveau: '',
      recrute: ''
    });
  };

  const handleJoinRequest = async (clubId, clubName) => {
    if (!user) {
      alert('Vous devez être connecté pour rejoindre un club');
      return;
    }

    if (userClub) {
      alert('Vous êtes déjà membre d\'un club. Vous devez le quitter avant de rejoindre un autre club.');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await clubAPI.joinClub(clubId, token);
      alert(`Demande d'adhésion envoyée au club ${clubName} !`);
      loadUserClub(); // Recharger le club de l'utilisateur
    } catch (err) {
      alert(err.message || 'Erreur lors de la demande d\'adhésion');
    }
  };

  const getPlatformIcon = (platform) => {
    switch(platform) {
      case 'PS5': return '🎮';
      case 'Xbox': return '🎮';
      case 'PC': return '💻';
      default: return '🎮';
    }
  };

  const getRecruteBadge = (recrute) => {
    return recrute ? 'bg-success' : 'bg-secondary';
  };

  if (loading) {
    return (
      <div className="container mt-4 text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Chargement...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mt-4">
        <div className="alert alert-danger">
          <h4>Erreur</h4>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mt-4">
      {/* Header avec titre */}
      <div className="row mb-4">
        <div className="col">
          <h2 className="text-primary mb-0">
            <i className="fas fa-shield-alt me-2"></i>
            Recherche de Clubs
          </h2>
          <p className="text-muted">Trouve le club parfait pour ton équipe</p>
        </div>
        <div className="col-auto">
          <Link to="/creer-club" className="btn btn-primary">
            <i className="fas fa-plus me-2"></i>
            Créer un club
          </Link>
        </div>
      </div>

      {/* Filtres simplifiés */}
      <div className="card mb-4">
        <div className="card-header bg-light">
          <h5 className="mb-0">
            <i className="fas fa-filter me-2"></i>
            Critères de recherche
          </h5>
        </div>
        <div className="card-body">
          {/* Critères de base */}
          <div className="row g-3">
            <div className="col-md-6">
              <label className="form-label">Nom du club</label>
              <input
                type="text"
                className="form-control"
                value={filters.nom}
                onChange={(e) => handleFilterChange('nom', e.target.value)}
                placeholder="Rechercher par nom..."
              />
            </div>
            
            <div className="col-md-6">
              <label className="form-label">Plateforme</label>
              <select
                className="form-select"
                value={filters.plateforme}
                onChange={(e) => handleFilterChange('plateforme', e.target.value)}
              >
                <option value="">Toutes les plateformes</option>
                <option value="PC">PC</option>
                <option value="PS5">PS5</option>
                <option value="Xbox">Xbox</option>
                <option value="Switch">Switch</option>
                <option value="Mobile">Mobile</option>
              </select>
            </div>
          </div>

          {/* Bouton pour afficher/masquer les critères avancés */}
          <div className="row mt-3">
            <div className="col">
              <button
                type="button"
                className="btn btn-outline-secondary"
                onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              >
                <i className={`fas fa-chevron-${showAdvancedFilters ? 'up' : 'down'} me-2`}></i>
                {showAdvancedFilters ? 'Masquer' : 'Afficher'} les critères avancés
              </button>
            </div>
          </div>

          {/* Critères avancés (masqués par défaut) */}
          {showAdvancedFilters && (
            <div className="mt-4">
              <h6 className="mb-3">
                <i className="fas fa-cogs me-2"></i>
                Critères avancés
              </h6>
              <div className="row g-3">
                <div className="col-md-4">
                  <label className="form-label">Pays</label>
                  <input
                    type="text"
                    className="form-control"
                    value={filters.pays}
                    onChange={(e) => handleFilterChange('pays', e.target.value)}
                    placeholder="France, Belgique..."
                  />
                </div>

                <div className="col-md-4">
                  <label className="form-label">Niveau</label>
                  <select
                    className="form-select"
                    value={filters.niveau}
                    onChange={(e) => handleFilterChange('niveau', e.target.value)}
                  >
                    <option value="">Tous les niveaux</option>
                    <option value="Débutant">Débutant</option>
                    <option value="Intermédiaire">Intermédiaire</option>
                    <option value="Avancé">Avancé</option>
                    <option value="Expert">Expert</option>
                    <option value="Pro">Pro</option>
                  </select>
                </div>

                <div className="col-md-4">
                  <label className="form-label">Recrutement</label>
                  <select
                    className="form-select"
                    value={filters.recrute}
                    onChange={(e) => handleFilterChange('recrute', e.target.value)}
                  >
                    <option value="">Tous les clubs</option>
                    <option value="true">Recrute</option>
                    <option value="false">Ne recrute pas</option>
                  </select>
                </div>
              </div>

              {/* Boutons d'action pour les critères avancés */}
              <div className="row mt-3">
                <div className="col">
                  <button
                    className="btn btn-outline-danger"
                    onClick={clearFilters}
                  >
                    <i className="fas fa-times me-2"></i>
                    Effacer tous les filtres
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Liste des clubs */}
      <div className="row">
        {clubs.map((club) => (
          <div key={club._id} className="col-md-6 col-lg-4 mb-4">
            <div className="card h-100 shadow-sm">
              <div className="card-body">
                <div className="d-flex align-items-center mb-3">
                  <Avatar 
                    src={club.logo} 
                    alt={club.nom}
                    size="md"
                    className="me-3"
                  />
                  <div className="flex-grow-1">
                    <h5 className="card-title mb-1">
                      <Link to={`/club/${club._id}`} className="text-decoration-none">
                        {club.nom}
                      </Link>
                    </h5>
                    <div className="d-flex gap-2 mb-2">
                      <span className={`badge ${getRecruteBadge(club.recrute)}`}>
                        {club.recrute ? 'Recrute' : 'Fermé'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="row mb-3">
                  <div className="col-6">
                    <small className="text-muted d-block">Plateforme</small>
                    <strong>
                      {getPlatformIcon(club.plateforme)} {club.plateforme}
                    </strong>
                  </div>
                  <div className="col-6">
                    <small className="text-muted d-block">Membres</small>
                    <strong>{club.membres ? club.membres.length : 0}</strong>
                  </div>
                </div>

                {club.description && (
                  <p className="card-text small text-muted mb-3">
                    {club.description.length > 100 
                      ? `${club.description.substring(0, 100)}...` 
                      : club.description
                    }
                  </p>
                )}

                <div className="d-flex justify-content-between align-items-center">
                  <small className="text-muted">
                    <i className="fas fa-map-marker-alt me-1"></i>
                    {club.pays}
                    {club.ville && `, ${club.ville}`}
                  </small>
                  <div className="d-flex gap-2">
                    <Link 
                      to={`/club/${club._id}`}
                      className="btn btn-outline-primary btn-sm"
                    >
                      Voir club
                    </Link>
                    {user && !userClub && club.recrute && (
                      <button
                        className="btn btn-success btn-sm"
                        onClick={() => handleJoinRequest(club._id, club.nom)}
                      >
                        <i className="fas fa-user-plus me-1"></i>
                        Rejoindre
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {clubs.length === 0 && !loading && (
        <div className="text-center py-5">
          <i className="fas fa-shield-alt fa-3x text-muted mb-3"></i>
          <h5 className="text-muted">Aucun club trouvé</h5>
          <p className="text-muted">Essaie de modifier tes critères de recherche</p>
        </div>
      )}
    </div>
  );
} 