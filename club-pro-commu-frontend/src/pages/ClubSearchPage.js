import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { clubAPI } from '../services/api';
import { getAllCountries } from '../utils/countryUtils';
import Avatar from '../components/Avatar';

// Styles Gaming pour la page de recherche de clubs
const clubSearchStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;700;800&display=swap');

  .cs-container {
    background: #090714;
    background-image:
      radial-gradient(circle at 10% 20%, rgba(123, 0, 255, 0.18), transparent 40%),
      radial-gradient(circle at 90% 80%, rgba(0, 240, 255, 0.12), transparent 40%),
      linear-gradient(rgba(255,255,255,0.006) 1px, transparent 1px),
      linear-gradient(90deg, rgba(255,255,255,0.006) 1px, transparent 1px);
    background-size: 100% 100%, 100% 100%, 32px 32px, 32px 32px;
    min-height: 100vh;
    padding: 2.5rem 0;
    color: #f1f0f6;
    font-family: 'Outfit', 'Inter', sans-serif;
  }

  .cs-hero {
    text-align: center;
    padding: 2.5rem 0 2rem;
    animation: cs-fadeUp 0.7s cubic-bezier(0.16, 1, 0.3, 1);
  }

  .cs-hero-eyebrow {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    background: rgba(0, 240, 255, 0.08);
    border: 1px solid rgba(0, 240, 255, 0.25);
    border-radius: 50px;
    padding: 0.35rem 1.1rem;
    font-size: 0.78rem;
    font-weight: 700;
    letter-spacing: 2px;
    text-transform: uppercase;
    color: #00f0ff;
    margin-bottom: 1.25rem;
  }

  .cs-hero h1 {
    font-size: clamp(2rem, 5vw, 3.4rem);
    font-weight: 800;
    line-height: 1.1;
    margin-bottom: 0.75rem;
    background: linear-gradient(135deg, #ffffff 0%, #00f0ff 50%, #7b00ff 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    text-transform: uppercase;
    letter-spacing: 1px;
  }

  .cs-hero p {
    color: #a29db8;
    font-size: 1.05rem;
    max-width: 500px;
    margin: 0 auto;
  }

  .cs-filters {
    background: rgba(18, 14, 33, 0.7);
    backdrop-filter: blur(20px);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 22px;
    padding: 1.75rem;
    margin-bottom: 1.75rem;
    box-shadow: 0 20px 50px rgba(0,0,0,0.4);
    animation: cs-fadeUp 0.7s cubic-bezier(0.16, 1, 0.3, 1) 0.1s both;
  }

  .cs-filter-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
    gap: 1rem;
    margin-bottom: 1.25rem;
  }

  .cs-filter-group label {
    display: flex;
    align-items: center;
    gap: 0.4rem;
    font-size: 0.78rem;
    font-weight: 700;
    letter-spacing: 1px;
    text-transform: uppercase;
    color: #a29db8;
    margin-bottom: 0.45rem;
  }

  .cs-filter-group label i { color: #00f0ff; }

  .cs-filter-group .form-control,
  .cs-filter-group .form-select {
    background: rgba(255, 255, 255, 0.04);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 12px;
    color: #f1f0f6;
    padding: 0.65rem 1rem;
    font-size: 0.92rem;
    transition: all 0.25s ease;
    outline: none;
  }

  .cs-filter-group .form-control::placeholder { color: rgba(255,255,255,0.25); }

  .cs-filter-group .form-control:focus,
  .cs-filter-group .form-select:focus {
    background: rgba(0, 240, 255, 0.06);
    border-color: rgba(0, 240, 255, 0.5);
    box-shadow: 0 0 0 3px rgba(0, 240, 255, 0.1);
    color: #fff;
  }

  .cs-filter-group .form-select option { background: #120e21; color: #f1f0f6; }

  .cs-advanced-separator {
    border-top: 1px solid rgba(255,255,255,0.06);
    margin: 1.25rem 0;
  }

  .cs-filter-actions {
    display: flex;
    gap: 0.75rem;
    justify-content: flex-end;
    flex-wrap: wrap;
    margin-top: 0.25rem;
  }

  .cs-btn-search {
    background: linear-gradient(135deg, #7b00ff 0%, #00f0ff 100%);
    border: none;
    color: #fff;
    border-radius: 30px;
    padding: 0.7rem 2rem;
    font-size: 0.9rem;
    font-weight: 700;
    letter-spacing: 0.5px;
    text-transform: uppercase;
    cursor: pointer;
    transition: all 0.3s ease;
    box-shadow: 0 0 20px rgba(123, 0, 255, 0.35);
    display: inline-flex;
    align-items: center;
    gap: 0.4rem;
  }

  .cs-btn-search:hover {
    transform: translateY(-2px);
    box-shadow: 0 0 30px rgba(0, 240, 255, 0.4);
    color: #fff;
  }

  .cs-btn-advanced {
    background: transparent;
    border: 1px solid rgba(0, 240, 255, 0.3);
    color: #00f0ff;
    border-radius: 30px;
    padding: 0.7rem 1.5rem;
    font-size: 0.85rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.25s ease;
    display: inline-flex;
    align-items: center;
    gap: 0.4rem;
  }

  .cs-btn-advanced:hover {
    background: rgba(0, 240, 255, 0.08);
    border-color: #00f0ff;
  }

  .cs-btn-clear {
    background: transparent;
    border: 1px solid rgba(255, 0, 80, 0.4);
    color: #ff5080;
    border-radius: 30px;
    padding: 0.7rem 1.5rem;
    font-size: 0.85rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.25s ease;
    display: inline-flex;
    align-items: center;
    gap: 0.4rem;
  }

  .cs-btn-clear:hover {
    background: rgba(255, 0, 80, 0.08);
    border-color: #ff5080;
  }

  .cs-results-bar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 0.75rem;
    margin-bottom: 1.75rem;
    animation: cs-fadeUp 0.7s cubic-bezier(0.16, 1, 0.3, 1) 0.2s both;
  }

  .cs-results-count {
    font-size: 0.9rem;
    color: #a29db8;
    font-weight: 600;
  }

  .cs-results-count strong { color: #00f0ff; }

  .cs-sort-group {
    display: flex;
    gap: 0.4rem;
    flex-wrap: wrap;
  }

  .cs-sort-btn {
    background: rgba(255,255,255,0.04);
    border: 1px solid rgba(255,255,255,0.08);
    color: #a29db8;
    border-radius: 10px;
    padding: 0.4rem 0.85rem;
    font-size: 0.78rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
    display: inline-flex;
    align-items: center;
    gap: 0.3rem;
  }

  .cs-sort-btn:hover { border-color: rgba(0, 240, 255, 0.3); color: #fff; }

  .cs-sort-btn.active {
    background: rgba(0, 240, 255, 0.1);
    border-color: rgba(0, 240, 255, 0.5);
    color: #00f0ff;
  }

  .cs-card {
    background: rgba(18, 14, 33, 0.65);
    backdrop-filter: blur(16px);
    border: 1px solid rgba(255, 255, 255, 0.07);
    border-radius: 22px;
    padding: 0;
    margin-bottom: 1.5rem;
    box-shadow: 0 10px 35px rgba(0,0,0,0.35);
    transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
    overflow: hidden;
    position: relative;
    animation: cs-fadeUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) both;
  }

  .cs-card::before {
    content: '';
    position: absolute;
    top: 0; left: 0;
    width: 100%; height: 3px;
    background: linear-gradient(90deg, #7b00ff, #00f0ff, #ff007f);
    opacity: 0;
    transition: opacity 0.4s ease;
  }

  .cs-card:hover {
    transform: translateY(-8px);
    border-color: rgba(0, 240, 255, 0.25);
    box-shadow: 0 20px 50px rgba(123, 0, 255, 0.2), 0 0 0 1px rgba(0, 240, 255, 0.1);
  }

  .cs-card:hover::before { opacity: 1; }

  .cs-card-banner {
    height: 72px;
    background: linear-gradient(135deg, #180d32 0%, #06030c 100%);
    position: relative;
    overflow: hidden;
  }

  .cs-card-banner-pattern {
    position: absolute;
    inset: 0;
    opacity: 0.05;
    background-image:
      linear-gradient(45deg, #00f0ff 25%, transparent 25%),
      linear-gradient(-45deg, #00f0ff 25%, transparent 25%),
      linear-gradient(45deg, transparent 75%, #00f0ff 75%),
      linear-gradient(-45deg, transparent 75%, #00f0ff 75%);
    background-size: 16px 16px;
  }

  .cs-card-body { padding: 0 1.4rem 1.4rem; }

  .cs-card-avatar-wrap {
    display: flex;
    align-items: flex-end;
    gap: 1rem;
    margin-top: -32px;
    margin-bottom: 0.75rem;
  }

  .cs-card-avatar {
    width: 66px;
    height: 66px;
    border-radius: 16px;
    background: #151128;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 3px solid #00f0ff;
    box-shadow: 0 0 16px rgba(0, 240, 255, 0.3);
    flex-shrink: 0;
    overflow: hidden;
  }

  .cs-card-avatar i {
    font-size: 1.7rem;
    color: #00f0ff;
    filter: drop-shadow(0 0 6px rgba(0,240,255,0.5));
  }

  .cs-card-avatar img { width: 100%; height: 100%; object-fit: cover; }

  .cs-card-name {
    font-size: 1.1rem;
    font-weight: 800;
    color: #fff;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    line-height: 1.2;
    flex: 1;
    padding-bottom: 0.2rem;
  }

  .cs-card-name a { color: inherit; text-decoration: none; transition: color 0.2s; }
  .cs-card-name a:hover { color: #00f0ff; }

  .cs-card-badges { display: flex; flex-wrap: wrap; gap: 0.4rem; margin-bottom: 0.9rem; }

  .cs-badge {
    border-radius: 8px;
    padding: 0.28rem 0.7rem;
    font-size: 0.7rem;
    font-weight: 700;
    letter-spacing: 0.5px;
    text-transform: uppercase;
  }

  .cs-badge-recrute {
    background: linear-gradient(135deg, #00ff87, #60efff);
    color: #0c0a16;
    box-shadow: 0 0 10px rgba(0,255,135,0.25);
  }

  .cs-badge-closed {
    background: rgba(255,255,255,0.07);
    color: #a29db8;
    border: 1px solid rgba(255,255,255,0.08);
  }

  .cs-badge-platform {
    background: rgba(0, 240, 255, 0.1);
    color: #00f0ff;
    border: 1px solid rgba(0, 240, 255, 0.2);
  }

  .cs-card-stats {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 0.5rem;
    margin-bottom: 0.9rem;
  }

  .cs-stat {
    background: rgba(255,255,255,0.03);
    border: 1px solid rgba(255,255,255,0.05);
    border-radius: 10px;
    padding: 0.55rem 0.4rem;
    text-align: center;
  }

  .cs-stat-label {
    font-size: 0.6rem;
    font-weight: 700;
    letter-spacing: 0.8px;
    text-transform: uppercase;
    color: #7b6fa0;
    margin-bottom: 0.15rem;
  }

  .cs-stat-value { font-size: 0.88rem; font-weight: 800; color: #fff; }
  .cs-stat-value.cyan { color: #00f0ff; }

  .cs-card-divider {
    border: none;
    border-top: 1px solid rgba(255,255,255,0.05);
    margin: 0.7rem 0;
  }

  .cs-card-actions { display: flex; gap: 0.6rem; flex-wrap: wrap; }

  .cs-btn-view {
    background: transparent;
    border: 1px solid rgba(0, 240, 255, 0.35);
    color: #00f0ff;
    border-radius: 20px;
    padding: 0.5rem 1.1rem;
    font-size: 0.78rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    text-decoration: none;
    display: inline-flex;
    align-items: center;
    gap: 0.4rem;
    transition: all 0.25s ease;
    cursor: pointer;
  }

  .cs-btn-view:hover {
    background: rgba(0, 240, 255, 0.1);
    border-color: #00f0ff;
    color: #00f0ff;
    transform: translateY(-1px);
    box-shadow: 0 0 15px rgba(0,240,255,0.2);
  }

  .cs-btn-join {
    background: linear-gradient(135deg, #ff007f 0%, #7b00ff 100%);
    border: none;
    color: #fff;
    border-radius: 20px;
    padding: 0.5rem 1.1rem;
    font-size: 0.78rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    display: inline-flex;
    align-items: center;
    gap: 0.4rem;
    transition: all 0.25s ease;
    cursor: pointer;
    box-shadow: 0 0 15px rgba(255,0,127,0.25);
  }

  .cs-btn-join:hover {
    transform: translateY(-2px);
    box-shadow: 0 0 25px rgba(255,0,127,0.4);
    color: #fff;
  }

  .cs-btn-join:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }

  .cs-pending-box {
    background: rgba(255, 200, 0, 0.06);
    border: 1px solid rgba(255,200,0,0.2);
    border-radius: 10px;
    padding: 0.55rem 0.85rem;
  }

  .cs-pending-title {
    font-size: 0.72rem;
    font-weight: 700;
    color: #ffc800;
    letter-spacing: 0.5px;
    text-transform: uppercase;
    display: flex;
    align-items: center;
    gap: 0.3rem;
    margin-bottom: 0.15rem;
  }

  .cs-pending-date { font-size: 0.68rem; color: #7b6fa0; margin-bottom: 0.35rem; }

  .cs-btn-cancel {
    background: transparent;
    border: 1px solid rgba(255,80,80,0.4);
    color: #ff5080;
    border-radius: 8px;
    padding: 0.22rem 0.6rem;
    font-size: 0.7rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
    display: inline-flex;
    align-items: center;
    gap: 0.3rem;
  }

  .cs-btn-cancel:hover { background: rgba(255,80,80,0.1); border-color: #ff5080; }

  .cs-loading {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 5rem 2rem;
    gap: 1.25rem;
  }

  .cs-spinner {
    width: 52px; height: 52px;
    border: 3px solid rgba(0,240,255,0.15);
    border-top-color: #00f0ff;
    border-radius: 50%;
    animation: cs-spin 0.9s linear infinite;
  }

  .cs-loading p { color: #7b6fa0; font-size: 0.95rem; }

  .cs-empty { text-align: center; padding: 4rem 2rem; color: #7b6fa0; }
  .cs-empty i { font-size: 3.5rem; margin-bottom: 1rem; opacity: 0.35; color: #00f0ff; }
  .cs-empty h3 { font-size: 1.3rem; font-weight: 700; color: #a29db8; margin-bottom: 0.5rem; }
  .cs-empty p { font-size: 0.9rem; }

  @keyframes cs-fadeUp {
    from { opacity: 0; transform: translateY(24px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  @keyframes cs-spin { to { transform: rotate(360deg); } }

  @media (max-width: 768px) {
    .cs-hero h1 { font-size: 1.7rem; }
    .cs-filters { padding: 1.2rem; }
    .cs-filter-grid { grid-template-columns: 1fr; gap: 0.75rem; }
    .cs-filter-actions { justify-content: stretch; }
    .cs-btn-search, .cs-btn-advanced, .cs-btn-clear { width: 100%; justify-content: center; }
    .cs-results-bar { flex-direction: column; align-items: flex-start; }
  }
`;

export default function ClubSearchPage() {
  const { user } = useAuth();
  const [clubs, setClubs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [userClub, setUserClub] = useState(null);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [userRequests, setUserRequests] = useState({});
  const [loadingRequests, setLoadingRequests] = useState({});
  const [joining, setJoining] = useState(false);
  const [filters, setFilters] = useState({
    nom: '',
    pays: '',
    plateforme: '',
    recrute: '',
    langue: ''
  });
  const [sortBy, setSortBy] = useState('nom');
  const [sortOrder, setSortOrder] = useState('asc');


  const loadClubs = useCallback(async (currentFilters = filters) => {
    try {
      setLoading(true);
      const data = await clubAPI.getClubs(currentFilters);
      
      // Tri côté client pour l'instant
      const sortedClubs = [...data].sort((a, b) => {
        let aValue = a[sortBy];
        let bValue = b[sortBy];
        
        // Gestion des valeurs nulles/undefined
        if (!aValue) aValue = '';
        if (!bValue) bValue = '';
        
        // Conversion en string pour le tri
        aValue = String(aValue).toLowerCase();
        bValue = String(bValue).toLowerCase();
        
        if (sortOrder === 'asc') {
          return aValue.localeCompare(bValue);
        } else {
          return bValue.localeCompare(aValue);
        }
      });
      
      setClubs(sortedClubs);
      setError('');
    } catch (err) {
      setError('Erreur lors du chargement des clubs');
      console.error('Erreur chargement clubs:', err);
    } finally {
      setLoading(false);
    }
  }, [sortBy, sortOrder, filters]);

  const loadUserClub = useCallback(async () => {
    if (!user) return;
    
    try {
      const userClubs = await clubAPI.getMyClubs();
      if (userClubs.length > 0) {
        setUserClub(userClubs[0]); // L'utilisateur ne peut avoir qu'un seul club
      }
    } catch (err) {
      console.error('Erreur chargement club utilisateur:', err);
    }
  }, [user]);

  const checkUserRequest = useCallback(async (clubId) => {
    if (!user) return;
    
    try {
      setLoadingRequests(prev => ({ ...prev, [clubId]: true }));
      const data = await clubAPI.checkUserRequest(clubId);
      setUserRequests(prev => ({
        ...prev,
        [clubId]: data.hasPendingRequest ? data.demande : null
      }));
    } catch (err) {
      console.error('Erreur vérification demande utilisateur:', err);
    } finally {
      setLoadingRequests(prev => ({ ...prev, [clubId]: false }));
    }
  }, [user]);

  const handleCancelRequest = async (clubId) => {
    if (!window.confirm('Êtes-vous sûr de vouloir annuler votre demande d\'adhésion ?')) return;
    
    try {
      await clubAPI.cancelUserRequest(clubId);
      alert('Demande d\'adhésion annulée avec succès !');
      // Réinitialiser l'état local pour ce club
      setUserRequests(prev => ({
        ...prev,
        [clubId]: null
      }));
    } catch (err) {
      alert(err.message || 'Erreur lors de l\'annulation de la demande');
    }
  };

  useEffect(() => {
    // Charger les clubs au montage du composant
    loadClubs();
    loadUserClub();
  }, [loadClubs, loadUserClub]);

  // Vérifier les demandes d'adhésion pour tous les clubs
  useEffect(() => {
    if (clubs.length > 0 && user) {
      clubs.forEach(club => {
        checkUserRequest(club._id);
      });
    }
  }, [clubs, user, checkUserRequest]);

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }));
    // Ne pas déclencher la recherche automatiquement
  };

  const handleSearch = () => {
    loadClubs(filters);
  };

  const handleSortChange = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  const clearFilters = () => {
    setFilters({
      nom: '',
      pays: '',
      plateforme: '',
      recrute: '',
      langue: ''
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

    const message = prompt('Message optionnel pour votre demande d\'adhésion (laissez vide si aucun) :');
    if (message === null) return; // Annulé par l'utilisateur

    try {
      setJoining(true);
      await clubAPI.joinClub(clubId, message);
      alert(`Demande d'adhésion envoyée au club ${clubName} ! Les administrateurs vont l'examiner.`);
      loadUserClub(); // Recharger le club de l'utilisateur
      // Recharger les demandes pour ce club
      checkUserRequest(clubId);
    } catch (err) {
      alert(err.message || 'Erreur lors de la demande d\'adhésion');
    } finally {
      setJoining(false);
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



  if (loading) {
    return (
      <div className="cs-container">
        <style>{clubSearchStyles}</style>
        <div className="container">
          <div className="cs-loading">
            <div className="cs-spinner"></div>
            <p>Recherche de clubs en cours...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="cs-container">
        <style>{clubSearchStyles}</style>
        <div className="container">
          <div className="cs-empty">
            <i className="fas fa-exclamation-triangle"></i>
            <h3>Erreur</h3>
            <p>{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="cs-container">
      <style>{clubSearchStyles}</style>
      <div className="container">

        {/* ── HERO ── */}
        <div className="cs-hero">
          <div className="cs-hero-eyebrow">
            <i className="fas fa-shield-alt"></i>
            Trouver un Club
          </div>
          <h1>Rechercher un Club</h1>
          <p>Rejoignez une équipe, dominez les compétitions. Trouve ton clan.</p>
        </div>

        {/* ── FILTRES ── */}
        <div className="cs-filters">
          <div className="cs-filter-grid">
            <div className="cs-filter-group">
              <label><i className="fas fa-search"></i> Nom du club</label>
              <input
                type="text"
                className="form-control"
                value={filters.nom}
                onChange={(e) => handleFilterChange('nom', e.target.value)}
                placeholder="Rechercher un club..."
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>
            <div className="cs-filter-group">
              <label><i className="fas fa-gamepad"></i> Plateforme</label>
              <select
                className="form-select"
                value={filters.plateforme}
                onChange={(e) => handleFilterChange('plateforme', e.target.value)}
              >
                <option value="">Toutes les plateformes</option>
                <option value="PS5">🎮 PS5</option>
                <option value="Xbox">🎮 Xbox</option>
                <option value="PC">💻 PC</option>
              </select>
            </div>
          </div>

          {/* Filtres avancés */}
          {showAdvancedFilters && (
            <>
              <div className="cs-advanced-separator"></div>
              <div className="cs-filter-grid">
                <div className="cs-filter-group">
                  <label><i className="fas fa-flag"></i> Pays</label>
                  <select
                    className="form-select"
                    value={filters.pays}
                    onChange={(e) => handleFilterChange('pays', e.target.value)}
                  >
                    <option value="">Tous les pays</option>
                    {getAllCountries().map(country => (
                      <option key={country.code} value={country.name}>
                        {country.flag} {country.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="cs-filter-group">
                  <label><i className="fas fa-users"></i> Recrutement</label>
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
                <div className="cs-filter-group">
                  <label><i className="fas fa-language"></i> Langue</label>
                  <select
                    className="form-select"
                    value={filters.langue}
                    onChange={(e) => handleFilterChange('langue', e.target.value)}
                  >
                    <option value="">Toutes les langues</option>
                    <option value="Français">🇫🇷 Français</option>
                    <option value="Anglais">🇬🇧 Anglais</option>
                    <option value="Espagnol">🇪🇸 Espagnol</option>
                    <option value="Allemand">🇩🇪 Allemand</option>
                    <option value="Italien">🇮🇹 Italien</option>
                    <option value="Portugais">🇵🇹 Portugais</option>
                    <option value="Néerlandais">🇳🇱 Néerlandais</option>
                    <option value="Arabe">🇸🇦 Arabe</option>
                    <option value="Chinois">🇨🇳 Chinois</option>
                    <option value="Japonais">🇯🇵 Japonais</option>
                    <option value="Coréen">🇰🇷 Coréen</option>
                    <option value="Russe">🇷🇺 Russe</option>
                  </select>
                </div>
              </div>
            </>
          )}

          <div className="cs-filter-actions">
            <button className="cs-btn-advanced" onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}>
              <i className={`fas fa-${showAdvancedFilters ? 'minus' : 'sliders-h'}`}></i>
              {showAdvancedFilters ? 'Masquer' : 'Filtres avancés'}
            </button>
            <button className="cs-btn-clear" onClick={clearFilters}>
              <i className="fas fa-times"></i>
              Effacer
            </button>
            <button className="cs-btn-search" onClick={handleSearch} disabled={loading}>
              {loading
                ? <><span className="spinner-border spinner-border-sm"></span> Recherche...</>
                : <><i className="fas fa-search"></i> Rechercher</>
              }
            </button>
          </div>
        </div>

        {/* ── BARRE RÉSULTATS + TRI ── */}
        <div className="cs-results-bar">
          <div className="cs-results-count">
            <strong>{clubs.length}</strong> club{clubs.length !== 1 ? 's' : ''} trouvé{clubs.length !== 1 ? 's' : ''}
          </div>
          <div className="cs-sort-group">
            {[
              { key: 'nom', icon: 'shield-alt', label: 'Nom' },
              { key: 'membres', icon: 'users', label: 'Membres' },
              { key: 'dateCreation', icon: 'calendar', label: 'Date' },
            ].map(s => (
              <button
                key={s.key}
                className={`cs-sort-btn${sortBy === s.key ? ' active' : ''}`}
                onClick={() => handleSortChange(s.key)}
              >
                <i className={`fas fa-${s.icon}`}></i>
                {s.label}
                {sortBy === s.key && <i className={`fas fa-sort-${sortOrder === 'asc' ? 'up' : 'down'}`}></i>}
              </button>
            ))}
          </div>
        </div>

        {/* ── CARTES ── */}
        {clubs.length === 0 ? (
          <div className="cs-empty">
            <i className="fas fa-search"></i>
            <h3>Aucun club trouvé</h3>
            <p>Essayez de modifier vos critères de recherche</p>
          </div>
        ) : (
          <div className="row">
            {clubs.map((club, idx) => (
              <div key={club._id} className="col-md-6 col-xl-4">
                <div className="cs-card" style={{ animationDelay: `${idx * 0.05}s` }}>
                  {/* Banner */}
                  <div className="cs-card-banner">
                    <div className="cs-card-banner-pattern"></div>
                  </div>

                  {/* Body */}
                  <div className="cs-card-body">
                    {/* Avatar + Nom */}
                    <div className="cs-card-avatar-wrap">
                      <div className="cs-card-avatar">
                        {club.logo
                          ? <Avatar src={club.logo} name={club.nom} size="md" type="club" />
                          : <i className="fas fa-shield-alt"></i>
                        }
                      </div>
                      <div className="cs-card-name">
                        <Link to={`/club/${club._id}`}>{club.nom}</Link>
                      </div>
                    </div>

                    {/* Badges */}
                    <div className="cs-card-badges">
                      <span className={`cs-badge ${club.recrute ? 'cs-badge-recrute' : 'cs-badge-closed'}`}>
                        {club.recrute ? '✦ Recrute' : 'Fermé'}
                      </span>
                      {club.plateformes?.map(p => (
                        <span key={p} className="cs-badge cs-badge-platform">
                          {getPlatformIcon(p)} {p}
                        </span>
                      ))}
                    </div>

                    {/* Stats */}
                    <div className="cs-card-stats">
                      <div className="cs-stat">
                        <div className="cs-stat-label">Membres</div>
                        <div className="cs-stat-value cyan">{club.membres?.length || 0}<span style={{color:'#7b6fa0',fontWeight:400}}>/{club.effectifMax}</span></div>
                      </div>
                      <div className="cs-stat">
                        <div className="cs-stat-label">Pays</div>
                        <div className="cs-stat-value" style={{fontSize:'0.78rem'}}>{club.pays || '—'}</div>
                      </div>
                      <div className="cs-stat">
                        <div className="cs-stat-label">Langue</div>
                        <div className="cs-stat-value" style={{fontSize:'0.75rem'}}>{club.langues?.[0] || '—'}</div>
                      </div>
                    </div>

                    <div className="cs-card-divider"></div>

                    {/* Actions */}
                    <div className="cs-card-actions">
                      <Link to={`/club/${club._id}`} className="cs-btn-view">
                        <i className="fas fa-eye"></i> Voir
                      </Link>

                      {club.recrute && !userClub && (
                        <>
                          {loadingRequests[club._id] ? (
                            <button className="cs-btn-join" disabled>
                              <span className="spinner-border spinner-border-sm"></span>
                            </button>
                          ) : userRequests[club._id] ? (
                            <div className="cs-pending-box">
                              <div className="cs-pending-title">
                                <i className="fas fa-clock"></i> En attente
                              </div>
                              <div className="cs-pending-date">
                                Envoyée le {new Date(userRequests[club._id].dateDemande).toLocaleDateString()}
                              </div>
                              <button className="cs-btn-cancel" onClick={() => handleCancelRequest(club._id)}>
                                <i className="fas fa-times"></i> Annuler
                              </button>
                            </div>
                          ) : (
                            <button
                              className="cs-btn-join"
                              onClick={() => handleJoinRequest(club._id, club.nom)}
                              disabled={joining}
                            >
                              {joining
                                ? <><span className="spinner-border spinner-border-sm"></span> En cours...</>
                                : <><i className="fas fa-user-plus"></i> Rejoindre</>
                              }
                            </button>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
