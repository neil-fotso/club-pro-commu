import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { clubAPI } from '../services/api';

// Styles améliorés pour la page de profil du club
const clubProfileStyles = `
  .club-profile-container {
    background: #090714;
    background-image: 
      radial-gradient(circle at 10% 20%, rgba(123, 0, 255, 0.15), transparent 40%),
      radial-gradient(circle at 90% 80%, rgba(0, 240, 255, 0.12), transparent 40%),
      linear-gradient(rgba(255,255,255,0.007) 1px, transparent 1px),
      linear-gradient(90deg, rgba(255,255,255,0.007) 1px, transparent 1px);
    background-size: 100% 100%, 100% 100%, 30px 30px, 30px 30px;
    min-height: 100vh;
    padding: 2.5rem 0;
    color: #f1f0f6;
    font-family: 'Outfit', 'Inter', sans-serif;
  }
  
  .club-profile-content {
    background: rgba(18, 14, 33, 0.65);
    backdrop-filter: blur(20px);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 28px;
    padding: 0;
    box-shadow: 0 25px 60px rgba(0, 0, 0, 0.6), 0 0 40px rgba(123, 0, 255, 0.05);
    animation: fadeInUp 0.8s cubic-bezier(0.16, 1, 0.3, 1);
    overflow: hidden;
  }

  .club-banner-cover {
    height: 220px;
    background: linear-gradient(135deg, #180d32 0%, #06030c 100%);
    position: relative;
    overflow: hidden;
    border-bottom: 2px solid #00f0ff;
  }

  .club-banner-pattern {
    position: absolute;
    top: 0; left: 0; right: 0; bottom: 0;
    opacity: 0.06;
    background-image: 
      linear-gradient(45deg, #00f0ff 25%, transparent 25%), 
      linear-gradient(-45deg, #00f0ff 25%, transparent 25%), 
      linear-gradient(45deg, transparent 75%, #00f0ff 75%), 
      linear-gradient(-45deg, transparent 75%, #00f0ff 75%);
    background-size: 20px 20px;
  }

  .club-banner-glow {
    position: absolute;
    top: 50%; left: 50%;
    transform: translate(-50%, -50%);
    width: 60%;
    height: 80%;
    background: radial-gradient(circle, rgba(123, 0, 255, 0.3) 0%, transparent 70%);
    filter: blur(30px);
    pointer-events: none;
  }

  .club-profile-body {
    padding: 2.5rem;
  }
  
  @keyframes fadeInUp {
    0% {
      opacity: 0;
      transform: translateY(40px);
    }
    100% {
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  .club-header {
    text-align: center;
    margin-bottom: 2.5rem;
    position: relative;
  }
  
  .club-title-glow {
    color: #ffffff;
    font-size: 3.2rem;
    font-weight: 800;
    margin-bottom: 0.5rem;
    text-transform: uppercase;
    letter-spacing: 1px;
    text-shadow: 0 0 20px rgba(0, 240, 255, 0.25);
  }
  
  .club-avatar {
    width: 130px;
    height: 130px;
    border-radius: 24px;
    background: #151128;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: -80px auto 1.5rem;
    box-shadow: 0 15px 35px rgba(0, 0, 0, 0.5), 0 0 25px rgba(0, 240, 255, 0.25);
    border: 3px solid #00f0ff;
    position: relative;
    z-index: 10;
    transition: all 0.5s ease;
  }

  .club-avatar::after {
    content: '';
    position: absolute;
    top: -5px; left: -5px; right: -5px; bottom: -5px;
    border-radius: 28px;
    border: 1px solid rgba(0, 240, 255, 0.5);
    opacity: 0;
    transition: all 0.5s ease;
    pointer-events: none;
  }

  .club-avatar:hover {
    transform: scale(1.05) rotate(2deg);
    border-color: #ff007f;
    box-shadow: 0 15px 35px rgba(0, 0, 0, 0.6), 0 0 25px rgba(255, 0, 127, 0.4);
  }

  .club-avatar:hover::after {
    opacity: 1;
    transform: scale(1.05);
    border-color: rgba(255, 0, 127, 0.5);
  }
  
  .club-avatar i {
    font-size: 3.5rem;
    color: #ffffff;
    filter: drop-shadow(0 0 10px rgba(0, 240, 255, 0.4));
  }
  
  .club-stats {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
    gap: 1.25rem;
    margin: 2rem 0;
  }
  
  .stat-card {
    background: rgba(24, 20, 42, 0.7);
    border-radius: 20px;
    padding: 1.5rem;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
    transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
    border: 1px solid rgba(255, 255, 255, 0.05);
    position: relative;
    overflow: hidden;
  }

  .stat-card::before {
    content: '';
    position: absolute;
    top: 0; left: 0;
    width: 4px;
    height: 100%;
    background: linear-gradient(to bottom, #00f0ff, #7b00ff);
    opacity: 0.7;
  }
  
  .stat-card:hover {
    transform: translateY(-5px) scale(1.02);
    box-shadow: 0 15px 35px rgba(0, 240, 255, 0.15);
    border-color: rgba(0, 240, 255, 0.3);
  }
  
  .stat-card h6 {
    color: #a29db8;
    font-weight: 600;
    font-size: 0.85rem;
    text-transform: uppercase;
    letter-spacing: 1px;
    margin-bottom: 0.75rem;
    display: flex;
    align-items: center;
  }

  .stat-card h6 i {
    color: #00f0ff;
    margin-right: 0.5rem;
  }
  
  .badge {
    border-radius: 12px;
    padding: 0.5rem 1rem;
    font-weight: 700;
    letter-spacing: 0.5px;
    text-transform: uppercase;
  }

  .badge.bg-success {
    background: linear-gradient(135deg, #00ff87 0%, #60efff 100%) !important;
    color: #0c0a16 !important;
    box-shadow: 0 0 15px rgba(0, 255, 135, 0.3);
  }

  .badge.bg-info {
    background: linear-gradient(135deg, #00f0ff 0%, #0072ff 100%) !important;
    color: #ffffff !important;
    box-shadow: 0 0 15px rgba(0, 240, 255, 0.3);
  }

  .badge.bg-secondary {
    background: rgba(255, 255, 255, 0.1) !important;
    color: #d1cfe2 !important;
    border: 1px solid rgba(255, 255, 255, 0.05);
  }

  .badge.bg-dark {
    background: #110e20 !important;
    color: #00f0ff !important;
    border: 1px solid rgba(0, 240, 255, 0.2);
  }
  
  .action-btn {
    background: linear-gradient(135deg, #ff007f 0%, #7b00ff 100%);
    border: none;
    color: white;
    border-radius: 30px;
    padding: 0.85rem 2.5rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 1px;
    transition: all 0.3s ease;
    box-shadow: 0 0 20px rgba(255, 0, 127, 0.3);
  }
  
  .action-btn:hover {
    transform: translateY(-2px) scale(1.03);
    box-shadow: 0 0 30px rgba(255, 0, 127, 0.5);
    color: white;
  }
  
  .edit-btn {
    background: transparent;
    border: 2px solid #00f0ff;
    color: #00f0ff;
    border-radius: 30px;
    padding: 0.65rem 2rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 1px;
    transition: all 0.3s ease;
    box-shadow: 0 0 15px rgba(0, 240, 255, 0.1);
  }
  
  .edit-btn:hover {
    background: #00f0ff;
    color: #0c0a16;
    transform: translateY(-2px);
    box-shadow: 0 0 25px rgba(0, 240, 255, 0.4);
  }
  
  .member-card {
    background: rgba(24, 20, 42, 0.65);
    border-radius: 20px;
    padding: 1.25rem;
    text-align: center;
    transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
    border: 1px solid rgba(255, 255, 255, 0.05);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.2);
  }
  
  .member-card-clickable {
    cursor: pointer;
    position: relative;
    overflow: hidden;
  }
  
  .member-card-clickable::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(0, 240, 255, 0.15), transparent);
    transition: left 0.6s ease;
  }
  
  .member-card-clickable:hover::before {
    left: 100%;
  }
  
  .member-card-clickable:hover {
    transform: translateY(-8px) scale(1.03);
    box-shadow: 0 15px 35px rgba(123, 0, 255, 0.25);
    border-color: #7b00ff;
  }
  
  .member-avatar {
    width: 64px;
    height: 64px;
    border-radius: 50%;
    background: linear-gradient(135deg, #1a153b 0%, #0c0a16 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto 0.75rem;
    border: 2px solid rgba(0, 240, 255, 0.2);
    box-shadow: inset 0 0 10px rgba(0, 240, 255, 0.2);
    transition: all 0.3s ease;
  }

  .member-card-clickable:hover .member-avatar {
    border-color: #7b00ff;
    box-shadow: 0 0 15px rgba(123, 0, 255, 0.5);
  }
  
  .member-avatar i {
    font-size: 1.75rem;
    color: #00f0ff;
    transition: all 0.3s ease;
  }

  .member-card-clickable:hover .member-avatar i {
    color: #7b00ff;
  }

  .text-gradient {
    background: linear-gradient(135deg, #00f0ff 0%, #7b00ff 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }
  
  /* Modal de style gaming */
  .custom-modal {
    position: fixed;
    top: 0; left: 0;
    width: 100%; height: 100%;
    background: rgba(5, 3, 10, 0.85);
    backdrop-filter: blur(10px);
    z-index: 1050;
    display: flex;
    align-items: center;
    justify-content: center;
    animation: fadeIn 0.3s ease-out;
  }
  
  .custom-modal-content {
    background: #120f26;
    border-radius: 24px;
    box-shadow: 0 25px 60px rgba(0, 0, 0, 0.8), 0 0 30px rgba(0, 240, 255, 0.15);
    max-width: 90%;
    max-height: 90%;
    overflow: hidden;
    border: 1px solid rgba(0, 240, 255, 0.15);
    animation: slideInUp 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  }
  
  .custom-modal-header {
    background: linear-gradient(135deg, #180e35 0%, #0b0718 100%);
    color: white;
    padding: 1.5rem;
    border-bottom: 1px solid rgba(255, 255, 255, 0.05);
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
  
  .custom-modal-header h5 {
    margin: 0;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 1px;
    color: #ffffff;
    text-shadow: 0 0 10px rgba(0, 240, 255, 0.3);
  }
  
  .custom-modal-body {
    padding: 2rem;
    max-height: 60vh;
    overflow-y: auto;
    background: #120f26;
    color: #d1cfe2;
  }
  
  .custom-modal-footer {
    padding: 1.25rem 2rem;
    border-top: 1px solid rgba(255, 255, 255, 0.05);
    background: #0a0718;
  }

  .custom-modal-footer .btn-secondary {
    background: rgba(255, 255, 255, 0.08);
    border: 1px solid rgba(255, 255, 255, 0.05);
    color: #d1cfe2;
    border-radius: 20px;
    padding: 0.5rem 1.5rem;
    font-weight: 600;
    transition: all 0.3s ease;
  }

  .custom-modal-footer .btn-secondary:hover {
    background: rgba(255, 255, 255, 0.15);
    color: #ffffff;
  }
  
  .table {
    border-radius: 16px;
    overflow: hidden;
    background: rgba(24, 20, 42, 0.6);
    border: 1px solid rgba(255, 255, 255, 0.05);
    color: #d1cfe2;
  }
  
  .table thead th {
    background: linear-gradient(135deg, #180d32 0%, #06030c 100%);
    color: #00f0ff;
    border-bottom: 2px solid rgba(0, 240, 255, 0.2);
    font-weight: 700;
    text-transform: uppercase;
    font-size: 0.8rem;
    letter-spacing: 1px;
    padding: 1.2rem 1rem;
  }

  .table tbody td {
    padding: 1.2rem 1rem;
    border-color: rgba(255, 255, 255, 0.03);
    vertical-align: middle;
  }
  
  .table tbody tr {
    transition: all 0.3s ease;
  }
  
  .table tbody tr:hover {
    background: rgba(123, 0, 255, 0.08) !important;
  }
  
  .btn-group .btn {
    border-radius: 12px;
    margin: 0 0.25rem;
    transition: all 0.3s ease;
  }
  
  .form-control, .form-select {
    border: 1.5px solid rgba(255, 255, 255, 0.08);
    border-radius: 14px;
    padding: 0.75rem 1.2rem;
    font-size: 0.95rem;
    transition: all 0.3s ease;
    background: #181432;
    color: #ffffff;
  }

  .form-control:focus, .form-select:focus {
    border-color: #00f0ff;
    box-shadow: 0 0 15px rgba(0, 240, 255, 0.25);
    background: #1c183b;
    color: #ffffff;
  }
  
  .form-label {
    font-weight: 700;
    color: #a29db8;
    font-size: 0.85rem;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    margin-bottom: 0.5rem;
  }
  
  .form-label i {
    margin-right: 0.5rem;
    color: #00f0ff;
  }

  /* List group items */
  .list-group-item {
    background: rgba(24, 20, 42, 0.5);
    border: 1px solid rgba(255, 255, 255, 0.03);
    color: #ffffff;
    margin-bottom: 0.5rem;
    border-radius: 14px !important;
    transition: all 0.3s ease;
  }

  .list-group-item:hover {
    background: rgba(123, 0, 255, 0.1);
    border-color: rgba(123, 0, 255, 0.2);
    transform: translateX(4px);
  }

  /* Titres h5 globaux */
  h5.text-primary {
    color: #ffffff !important;
    font-weight: 800;
    font-size: 1.25rem;
    text-transform: uppercase;
    letter-spacing: 1px;
    position: relative;
    padding-bottom: 0.5rem;
    display: inline-block;
  }

  h5.text-primary::after {
    content: '';
    position: absolute;
    bottom: 0; left: 0;
    width: 60%;
    height: 3px;
    background: linear-gradient(90deg, #00f0ff, #ff007f);
    border-radius: 2px;
  }

  h5.text-primary i {
    color: #00f0ff;
  }

  .card.bg-light {
    background: rgba(24, 20, 42, 0.55) !important;
    border: 1px solid rgba(255, 255, 255, 0.05) !important;
    border-radius: 20px;
    color: #d1cfe2;
  }
  
  @media (max-width: 768px) {
    .club-profile-container {
      padding: 1.5rem 1rem;
    }

    .club-profile-body {
      padding: 1.5rem 1rem;
    }
    
    .club-title-glow {
      font-size: 2.2rem;
    }
    
    .club-avatar {
      width: 100px;
      height: 100px;
      margin-top: -60px;
    }
    
    .club-stats {
      grid-template-columns: 1fr;
    }
  }
`;

export default function ClubProfilePage() {
  const { id } = useParams();
  const { user } = useAuth();
  const [club, setClub] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [joining, setJoining] = useState(false);
  const [userClub, setUserClub] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showMemberModal, setShowMemberModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showRequestsModal, setShowRequestsModal] = useState(false);
  const [requests, setRequests] = useState([]);
  const [loadingRequests, setLoadingRequests] = useState(false);
  const [userRequest, setUserRequest] = useState(null);
  const [loadingUserRequest, setLoadingUserRequest] = useState(false);
  const [isCurrentUserMember, setIsCurrentUserMember] = useState(false);
  const [isCurrentUserAdmin, setIsCurrentUserAdmin] = useState(false);
  const [editForm, setEditForm] = useState({
    nom: '',
    description: '',
    plateformes: [],
    langues: [],
    effectifMax: 11,
    recrute: true,
    pays: '',
    niveauRecherche: 'Tous niveaux',
    postesRecherches: [],
    horaires: ''
  });
  const [updating, setUpdating] = useState(false);

  const loadClub = useCallback(async () => {
    try {
      setLoading(true);
      const data = await clubAPI.getClub(id);
      setClub(data);
      setError('');
    } catch (err) {
      setError('Erreur lors du chargement du club');
      console.error('Erreur chargement club:', err);
    } finally {
      setLoading(false);
    }
  }, [id]);

  const loadUserClub = useCallback(async () => {
    if (!user) return;
    
    try {
      const userClubs = await clubAPI.getMyClubs();
      if (userClubs.length > 0) {
        setUserClub(userClubs[0]); // L'utilisateur ne peut avoir qu'un seul club
      }
    } catch (err) {
      console.error('Erreur chargement club utilisateur:', err);
      // Si l'erreur est liée à l'authentification, on ignore silencieusement
      if (err.message && err.message.includes('Non autorisé')) {
        console.log('Utilisateur non connecté ou token expiré');
      }
    }
  }, [user]);

  const checkUserMembership = useCallback(() => {
    if (!club || !user) return;
    
    const currentMember = club.membres.find(m => m.userId._id === user._id);
    const isUserMember = !!currentMember;
    const isUserAdmin = currentMember?.role === 'Admin';
    
    setIsCurrentUserMember(isUserMember);
    setIsCurrentUserAdmin(isUserAdmin);
    setIsAdmin(isUserAdmin); // Garder la compatibilité avec l'ancien code
    
    console.log('Vérification appartenance:', { 
      userId: user._id, 
      currentMember, 
      isUserMember,
      isUserAdmin,
      membres: club.membres.map(m => ({ userId: m.userId._id, role: m.role }))
    });
  }, [club, user]);

  const checkUserRequest = useCallback(async () => {
    if (!user) return;
    
    try {
      setLoadingUserRequest(true);
      const data = await clubAPI.checkUserRequest(club._id);
      setUserRequest(data.hasPendingRequest ? data.demande : null);
    } catch (err) {
      console.error('Erreur vérification demande utilisateur:', err);
    } finally {
      setLoadingUserRequest(false);
    }
  }, [user, club?._id]);

  const loadRequests = useCallback(async () => {
    if (!club || !isCurrentUserAdmin) return;
    
    try {
      setLoadingRequests(true);
      const data = await clubAPI.getClubRequests(club._id);
      setRequests(data.demandes || []);
    } catch (err) {
      console.error('Erreur chargement demandes:', err);
    } finally {
      setLoadingRequests(false);
    }
  }, [club, isCurrentUserAdmin]);

  const handleCancelRequest = async () => {
    if (!window.confirm('Êtes-vous sûr de vouloir annuler votre demande d\'adhésion ?')) return;
    
    try {
      await clubAPI.cancelUserRequest(club._id);
      alert('Demande d\'adhésion annulée avec succès !');
      setUserRequest(null); // Réinitialiser l'état local
    } catch (err) {
      alert(err.message || 'Erreur lors de l\'annulation de la demande');
    }
  };

  const handleLeaveClub = async () => {
    if (!window.confirm('Êtes-vous sûr de vouloir quitter ce club ? Cette action ne peut pas être annulée.')) return;
    
    try {
      await clubAPI.leaveClub(club._id);
      alert('Vous avez quitté le club avec succès !');
      setIsCurrentUserMember(false);
      setIsCurrentUserAdmin(false);
      setIsAdmin(false);
      // Recharger le club pour mettre à jour l'affichage
      loadClub();
    } catch (err) {
      alert(err.message || 'Erreur lors du départ du club');
    }
  };

  useEffect(() => {
    loadClub();
    loadUserClub();
  }, [loadClub, loadUserClub]);

  useEffect(() => {
    if (club && user) {
      checkUserMembership();
      checkUserRequest();
      
      // Charger les demandes automatiquement si l'utilisateur est admin
      if (isCurrentUserAdmin) {
        loadRequests();
      }
    }
  }, [club, user, checkUserMembership, checkUserRequest, isCurrentUserAdmin, loadRequests]);

  useEffect(() => {
    if (club) {
      setEditForm({
        nom: club.nom || '',
        description: club.description || '',
        plateformes: club.plateformes || [],
        langues: club.langues || [],
        effectifMax: club.effectifMax || 11,
        recrute: club.recrute !== undefined ? club.recrute : true,
        pays: club.pays || '',
        niveauRecherche: club.niveauRecherche || 'Tous niveaux',
        postesRecherches: club.postesRecherches || [],
        horaires: club.horaires || ''
      });
    }
  }, [club]);

  const handleJoinRequest = async () => {
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
      await clubAPI.joinClub(club._id, message);
      alert('Demande d\'adhésion envoyée ! Les administrateurs du club vont l\'examiner.');
      loadUserClub(); // Recharger le club de l'utilisateur
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

  const handlePromoteMember = async (memberId) => {
    if (!window.confirm('Promouvoir ce membre au rang d\'Admin ?')) return;
    
    try {
      await clubAPI.promoteMember(club._id, memberId);
      loadClub(); // Recharger les données du club
    } catch (err) {
      alert(err.message || 'Erreur lors de la promotion');
    }
  };

  const handleExcludeMember = async (memberId) => {
    if (!window.confirm('Exclure ce membre du club ?')) return;
    
    try {
      await clubAPI.excludeMember(club._id, memberId);
      loadClub(); // Recharger les données du club
    } catch (err) {
      alert(err.message || 'Erreur lors de l\'exclusion');
    }
  };

  const handleUpdateClub = async () => {
    try {
      setUpdating(true);
      const token = localStorage.getItem('token');
      await clubAPI.updateClub(club._id, editForm, token);
      await loadClub(); // Recharger les données du club
      setShowEditModal(false);
      alert('Club mis à jour avec succès !');
    } catch (err) {
      alert(err.message || 'Erreur lors de la mise à jour du club');
    } finally {
      setUpdating(false);
    }
  };

  const handlePlatformChange = (platform, checked) => {
    const newPlateformes = checked
      ? [...editForm.plateformes, platform]
      : editForm.plateformes.filter(p => p !== platform);
    setEditForm(prev => ({ ...prev, plateformes: newPlateformes }));
  };

  const handleLanguageAdd = () => {
    const newLanguage = prompt('Entrez une nouvelle langue:');
    if (newLanguage && newLanguage.trim()) {
      setEditForm(prev => ({
        ...prev,
        langues: [...prev.langues, newLanguage.trim()]
      }));
    }
  };

  const handleLanguageRemove = (index) => {
    setEditForm(prev => ({
      ...prev,
      langues: prev.langues.filter((_, i) => i !== index)
    }));
  };



  const handleAcceptRequest = async (demandeId) => {
    if (!window.confirm('Accepter cette demande d\'adhésion ?')) return;
    
    try {
      await clubAPI.acceptRequest(club._id, demandeId);
      alert('Demande acceptée avec succès !');
      await loadRequests(); // Recharger les demandes
      await loadClub(); // Recharger les données du club
    } catch (err) {
      alert(err.message || 'Erreur lors de l\'acceptation');
    }
  };

  const handleRefuseRequest = async (demandeId) => {
    if (!window.confirm('Refuser cette demande d\'adhésion ?')) return;
    
    try {
      await clubAPI.refuseRequest(club._id, demandeId);
      alert('Demande refusée avec succès !');
      await loadRequests(); // Recharger les demandes
    } catch (err) {
      alert(err.message || 'Erreur lors du refus');
    }
  };

  const getRequestStatusBadge = (statut) => {
    const badges = {
      'En attente': 'badge bg-warning',
      'Acceptée': 'badge bg-success',
      'Refusée': 'badge bg-danger'
    };
    return badges[statut] || 'badge bg-secondary';
  };

  const getRoleBadge = (role) => {
    const badges = {
      'Admin': 'badge bg-danger',
      'Membre': 'badge bg-primary',
      'Capitaine': 'badge bg-warning'
    };
    return badges[role] || 'badge bg-secondary';
  };

  if (loading) {
    return (
      <div className="club-profile-container">
        <style>{clubProfileStyles}</style>
        <div className="container">
          <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Chargement...</span>
            </div>
            <p className="mt-3 text-white">Chargement du club...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !club) {
    return (
      <div className="club-profile-container">
        <style>{clubProfileStyles}</style>
        <div className="container">
          <div className="club-profile-content">
            <div className="text-center">
              <h2>Erreur</h2>
              <p className="text-muted">{error || 'Club non trouvé'}</p>
              <Link to="/clubs" className="btn action-btn">
                <i className="fas fa-arrow-left me-2"></i>
                Retour aux clubs
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="club-profile-container">
      <style>{clubProfileStyles}</style>
      <div className="container">
        <div className="club-profile-content">
          {/* Cover Banner */}
          <div className="club-banner-cover">
            <div className="club-banner-pattern"></div>
            <div className="club-banner-glow"></div>
          </div>
          
          <div className="club-profile-body">
            {/* Header du club */}
            <div className="club-header">
              <div className="club-avatar">
                <i className="fas fa-shield-alt"></i>
              </div>
              <h1 className="club-title-glow">🏆 {club.nom}</h1>
              <p className="lead text-muted">
                {club.plateformes?.map(platform => getPlatformIcon(platform) + ' ' + platform).join(' • ')} • {club.pays}
              </p>
              {isAdmin && (
                <button 
                  className="btn edit-btn mt-3"
                  onClick={() => setShowEditModal(true)}
                >
                  <i className="fas fa-edit me-2"></i>
                  Modifier le club
                </button>
              )}
            </div>

          {/* Actions principales */}
          <div className="text-center mb-4">
            {!user ? (
              <Link to="/login" className="btn action-btn">
                <i className="fas fa-sign-in-alt me-2"></i>
                Se connecter pour rejoindre
              </Link>
            ) : isCurrentUserMember ? (
              <div>
                <div className="alert alert-success mb-3">
                  <i className="fas fa-check-circle me-2"></i>
                  <strong>Vous êtes membre de ce club</strong>
                </div>
                <button 
                  className="btn btn-danger"
                  onClick={handleLeaveClub}
                >
                  <i className="fas fa-sign-out-alt me-2"></i>
                  Quitter le club
                </button>
              </div>
            ) : userClub ? (
              <div className="alert alert-info">
                <i className="fas fa-info-circle me-2"></i>
                Vous êtes déjà membre d'un autre club
              </div>
            ) : (
              <div>
                {loadingUserRequest ? (
                  <button className="btn btn-secondary" disabled>
                    <span className="spinner-border spinner-border-sm me-2"></span>
                    Vérification...
                  </button>
                ) : userRequest ? (
                  <div className="alert alert-warning mb-0">
                    <i className="fas fa-clock me-2"></i>
                    <strong>Demande en attente</strong>
                    <br />
                    <small className="text-muted">
                      Votre demande d'adhésion a été envoyée le {new Date(userRequest.dateDemande).toLocaleDateString()}
                      {userRequest.message && (
                        <>
                          <br />
                          <strong>Message :</strong> {userRequest.message}
                        </>
                      )}
                    </small>
                    <div className="mt-2">
                      <button
                        className="btn btn-sm btn-outline-danger"
                        onClick={handleCancelRequest}
                      >
                        <i className="fas fa-times me-1"></i>
                        Annuler la demande
                      </button>
                    </div>
                  </div>
                ) : (
                  <button 
                    className="btn action-btn"
                    onClick={handleJoinRequest}
                    disabled={joining}
                  >
                    {joining ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2"></span>
                        Demande en cours...
                      </>
                    ) : (
                      <>
                        <i className="fas fa-user-plus me-2"></i>
                        Demander à rejoindre
                      </>
                    )}
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Statistiques du club - Desktop */}
          <div className="d-none d-md-block">
            <div className="club-stats">
              <div className="stat-card">
                <h6><i className="fas fa-users me-2"></i>Effectif</h6>
                <div className="d-flex align-items-center">
                  <span className="badge bg-success me-2">
                    {club.membres?.length || 0}/{club.effectifMax}
                  </span>
                  <small className="text-muted">membres</small>
                </div>
              </div>
              
              <div className="stat-card">
                <h6><i className="fas fa-gamepad me-2"></i>Plateformes</h6>
                <div className="d-flex flex-wrap gap-1">
                  {club.plateformes?.map(platform => (
                    <span key={platform} className="badge bg-dark">
                      {getPlatformIcon(platform)} {platform}
                    </span>
                  ))}
                </div>
              </div>
              
              <div className="stat-card">
                <h6><i className="fas fa-flag me-2"></i>Pays</h6>
                <span className="badge bg-info">{club.pays}</span>
              </div>
              
              <div className="stat-card">
                <h6><i className="fas fa-calendar me-2"></i>Créé le</h6>
                <span className="badge bg-secondary">
                  {new Date(club.dateCreation).toLocaleDateString()}
                </span>
              </div>
              
              <div className="stat-card">
                <h6><i className="fas fa-user-plus me-2"></i>Recrutement</h6>
                {club.recrute ? (
                  <span className="badge bg-success">✅ Ouvert</span>
                ) : (
                  <span className="badge bg-secondary">❌ Fermé</span>
                )}
              </div>
              
              <div className="stat-card">
                <h6><i className="fas fa-language me-2"></i>Langues</h6>
                <div className="mt-1">
                  {club.langues?.map((langue, index) => (
                    <span key={index} className="badge bg-info me-1">
                      {langue}
                    </span>
                  )) || <span className="text-muted">Non spécifié</span>}
                </div>
              </div>
            </div>
          </div>

          {/* Infos club - Mobile */}
          <div className="d-md-none">
            <div className="card bg-light border-0 shadow-sm mb-4">
              <div className="card-body">
                <h5 className="text-primary mb-3">
                  <i className="fas fa-shield-alt me-2"></i>
                  Informations du club
                </h5>
                <div className="row">
                  <div className="col-6 mb-2">
                    <strong>Effectif :</strong><br/>
                    <span className="badge bg-success">{club.membres?.length || 0}/{club.effectifMax}</span>
                  </div>
                  <div className="col-6 mb-2">
                    <strong>Pays :</strong><br/>
                    <span className="badge bg-info">{club.pays}</span>
                  </div>
                  <div className="col-6 mb-2">
                    <strong>Créé le :</strong><br/>
                    <span className="badge bg-secondary">{new Date(club.dateCreation).toLocaleDateString()}</span>
                  </div>
                  <div className="col-6 mb-2">
                    <strong>Recrutement :</strong><br/>
                    {club.recrute ? (
                      <span className="badge bg-success">✅ Ouvert</span>
                    ) : (
                      <span className="badge bg-secondary">❌ Fermé</span>
                    )}
                  </div>
                  <div className="col-12 mb-2">
                    <strong>Plateformes :</strong><br/>
                    <div className="d-flex flex-wrap gap-1 mt-1">
                      {club.plateformes?.map(platform => (
                        <span key={platform} className="badge bg-dark">
                          {getPlatformIcon(platform)} {platform}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="col-12">
                    <strong>Langues :</strong><br/>
                    <div className="d-flex flex-wrap gap-1 mt-1">
                      {club.langues?.map((langue, index) => (
                        <span key={index} className="badge bg-info">
                          {langue}
                        </span>
                      )) || <span className="text-muted">Non spécifié</span>}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Description - Desktop */}
          {club.description && (
            <div className="d-none d-md-block mt-4">
              <h5 className="text-primary mb-3">
                <i className="fas fa-comment me-2"></i>
                Description
              </h5>
              <div className="card bg-light border-0 shadow-sm">
                <div className="card-body">
                  <p className="mb-0">{club.description}</p>
                </div>
              </div>
            </div>
          )}

          {/* Description - Mobile */}
          {club.description && (
            <div className="d-md-none mt-4">
              <div className="card bg-light border-0 shadow-sm">
                <div className="card-body">
                  <h6 className="text-primary mb-2">
                    <i className="fas fa-comment me-2"></i>
                    Description
                  </h6>
                  <p className="mb-0">{club.description}</p>
                </div>
              </div>
            </div>
          )}

          {/* Vitrine des Trophées */}
          <div className="mt-4">
            <h5 className="text-primary mb-3">
              <i className="fas fa-trophy me-2 text-warning"></i>
              Vitrine des Trophées
            </h5>
            {!club.trophees || club.trophees.length === 0 ? (
              <div className="card bg-light border-0 shadow-sm">
                <div className="card-body text-center py-4 text-muted">
                  <i className="fas fa-award fa-3x mb-3 text-secondary opacity-50"></i>
                  <p className="mb-0">Ce club n'a pas encore remporté de trophées. Participez à des compétitions pour remplir l'armoire ! ⚽</p>
                </div>
              </div>
            ) : (
              <div className="row g-3">
                {club.trophees.map((trophy, idx) => {
                  let trophyClass = '';
                  let trophyTitle = '';
                  let iconColor = '';
                  
                  if (trophy.typeTrophée === 'vainqueur') {
                    trophyClass = 'border-warning bg-warning bg-opacity-10';
                    trophyTitle = '🏆 Vainqueur';
                    iconColor = '#ffc107'; // Gold
                  } else if (trophy.typeTrophée === 'finaliste') {
                    trophyClass = 'border-secondary bg-secondary bg-opacity-10';
                    trophyTitle = '🥈 Finaliste';
                    iconColor = '#6c757d'; // Silver
                  } else {
                    trophyClass = 'border-danger bg-danger bg-opacity-10';
                    trophyTitle = '🥉 3ème Place';
                    iconColor = '#b05d23'; // Bronze
                  }

                  return (
                    <div key={idx} className="col-md-4 col-sm-6 col-12">
                      <div className={`card h-100 border-2 shadow-sm ${trophyClass}`} style={{ borderRadius: '15px' }}>
                        <div className="card-body text-center p-3">
                          <div className="mb-2" style={{ fontSize: '3rem', color: iconColor }}>
                            {trophy.typeTrophée === 'vainqueur' ? '🏆' : trophy.typeTrophée === 'finaliste' ? '🥈' : '🥉'}
                          </div>
                          <h6 className="fw-bold mb-1 text-uppercase letter-spacing-1">{trophyTitle}</h6>
                          <h5 className="card-title fw-semibold text-truncate mb-2" title={trophy.nom}>
                            {trophy.nom}
                          </h5>
                          <div className="text-muted small mb-2">
                            Type: <span className="text-capitalize">{trophy.type}</span>
                          </div>
                          {trophy.cashprize > 0 && (
                            <span className="badge bg-success px-3 py-1.5 fs-6 fw-bold">
                              +{trophy.cashprize}€
                            </span>
                          )}
                          <div className="text-muted small mt-2">
                            {trophy.date ? new Date(trophy.date).toLocaleDateString('fr-FR') : ''}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Membres - Desktop */}
          {club.membres && club.membres.length > 0 && (
            <div className="d-none d-md-block mt-4">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h5 className="text-primary mb-0">
                  <i className="fas fa-users me-2"></i>
                  Membres ({club.membres.length})
                </h5>
                {isCurrentUserAdmin && (
                  <div className="d-flex gap-2">
                    <button 
                      className="btn btn-sm action-btn"
                      onClick={() => setShowMemberModal(true)}
                    >
                      <i className="fas fa-cog me-1"></i>
                      Gérer
                    </button>
                  </div>
                )}
              </div>
              <div className="row">
                {club.membres.slice(0, 6).map((membre, index) => {
                  // Vérifier que l'ID du membre existe
                  if (!membre.userId?._id) {
                    console.warn('ID manquant pour le membre:', membre);
                    return null;
                  }
                  
                  return (
                    <div key={index} className="col-md-2 col-sm-3 col-4 mb-3">
                      <Link 
                        to={`/player/${membre.userId._id}`} 
                        className="text-decoration-none"
                        style={{ display: 'block' }}
                      >
                        <div className="member-card member-card-clickable">
                          <div className="member-avatar">
                            <i className="fas fa-user"></i>
                          </div>
                          <small className="d-block text-muted mb-1">
                            {membre.userId?.pseudo}
                          </small>
                          <span className={getRoleBadge(membre.role)}>
                            {membre.role}
                          </span>
                        </div>
                      </Link>
                    </div>
                  );
                })}
                {club.membres.length > 6 && (
                  <div className="col-md-2 col-sm-3 col-4 mb-3">
                    <div className="member-card">
                      <div className="member-avatar">
                        <i className="fas fa-ellipsis-h"></i>
                      </div>
                      <small className="d-block text-muted">
                        +{club.membres.length - 6} autres
                      </small>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Membres - Mobile */}
          {club.membres && club.membres.length > 0 && (
            <div className="d-md-none mt-4">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h5 className="text-primary mb-0">
                  <i className="fas fa-users me-2"></i>
                  Membres ({club.membres.length})
                </h5>
                {isCurrentUserAdmin && (
                  <div className="d-flex gap-2">
                    <button 
                      className="btn btn-sm action-btn"
                      onClick={() => setShowMemberModal(true)}
                    >
                      <i className="fas fa-cog me-1"></i>
                      Gérer
                    </button>
                  </div>
                )}
              </div>
              <div className="card bg-light border-0 shadow-sm">
                <div className="card-body">
                  <div className="list-group list-group-flush">
                    {club.membres.sort((a, b) => (a.postePrincipal || '').localeCompare(b.postePrincipal || '')).map((membre, index) => {
                      if (!membre.userId?._id) {
                        console.warn('ID manquant pour le membre:', membre);
                        return null;
                      }
                      
                      return (
                        <Link 
                          key={index}
                          to={`/player/${membre.userId._id}`} 
                          className="list-group-item list-group-item-action d-flex justify-content-between align-items-center py-3"
                        >
                          <div className="flex-grow-1">
                            <div className="fw-bold text-break">{membre.userId?.pseudo}</div>
                            <div className="small text-muted">
                              {membre.role} {membre.postePrincipal ? `• ${membre.postePrincipal}` : ''}
                            </div>
                          </div>
                          <span className={getRoleBadge(membre.role)}>
                            {membre.role}
                          </span>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Demandes en attente - Section pour les admins */}
          {isCurrentUserAdmin && (
            <div className="mt-4">
              <h5 className="text-warning mb-3">
                <i className="fas fa-user-plus me-2"></i>
                Demandes d'adhésion en attente
              </h5>
              
              {loadingRequests ? (
                <div className="text-center py-4">
                  <div className="spinner-border text-warning" role="status">
                    <span className="visually-hidden">Chargement...</span>
                  </div>
                  <p className="text-muted mt-2">Chargement des demandes...</p>
                </div>
              ) : requests.length === 0 ? (
                <div className="card bg-light border-0 shadow-sm">
                  <div className="card-body text-center py-4">
                    <i className="fas fa-check-circle fa-3x text-success mb-3"></i>
                    <h6 className="text-success">Aucune demande en attente</h6>
                    <p className="text-muted mb-0">Toutes les demandes ont été traitées.</p>
                  </div>
                </div>
              ) : (
                <div className="card bg-light border-0 shadow-sm">
                  <div className="card-body">
                    <div className="row">
                      {requests.map((demande, index) => (
                                                 <div key={index} className="col-md-6 col-lg-4 mb-3">
                           <div className="card border-warning h-100 shadow-sm" style={{transition: 'transform 0.2s ease, box-shadow 0.2s ease'}}>
                            <div className="card-header bg-warning text-dark">
                              <div className="d-flex justify-content-between align-items-center">
                                <strong>
                                  <i className="fas fa-user me-1"></i>
                                  {demande.userId?.pseudo}
                                </strong>
                                <small className="text-muted">
                                  {new Date(demande.dateDemande).toLocaleDateString()}
                                </small>
                              </div>
                            </div>
                            <div className="card-body">
                              {demande.message && (
                                <p className="card-text mb-3">
                                  <i className="fas fa-comment me-1 text-muted"></i>
                                  <em>"{demande.message}"</em>
                                </p>
                              )}
                              <div className="d-flex gap-2">
                                <button
                                  className="btn btn-success btn-sm flex-fill"
                                  onClick={() => handleAcceptRequest(demande._id)}
                                  title="Accepter la demande"
                                >
                                  <i className="fas fa-check me-1"></i>
                                  Accepter
                                </button>
                                <button
                                  className="btn btn-danger btn-sm flex-fill"
                                  onClick={() => handleRefuseRequest(demande._id)}
                                  title="Refuser la demande"
                                >
                                  <i className="fas fa-times me-1"></i>
                                  Refuser
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    {/* Informations sur l'effectif */}
                    <div className="mt-3 p-3 bg-info bg-opacity-10 rounded">
                      <div className="row text-center">
                        <div className="col-6">
                          <strong className="text-info">Effectif actuel</strong>
                          <br />
                          <span className="h5 mb-0">{requests[0]?.effectifActuel || club.effectifActuel}</span>
                        </div>
                        <div className="col-6">
                          <strong className="text-info">Effectif maximum</strong>
                          <br />
                          <span className="h5 mb-0">{requests[0]?.effectifMax || club.effectifMax}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>

      {/* Modal de gestion des membres */}
      {showMemberModal && (
        <div className="custom-modal" onClick={() => setShowMemberModal(false)}>
          <div className="custom-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="custom-modal-header">
              <h5>
                <i className="fas fa-users me-2"></i>
                Gestion des membres - {club?.nom}
              </h5>
              <button 
                type="button" 
                className="btn-close btn-close-white" 
                onClick={() => setShowMemberModal(false)}
              ></button>
            </div>
            <div className="custom-modal-body">
              <div className="table-responsive">
                <table className="table table-hover">
                  <thead>
                    <tr>
                      <th>Membre</th>
                      <th>Rôle</th>
                      <th>Date d'adhésion</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {club?.membres.map((membre, index) => (
                      <tr key={index}>
                        <td>
                          {membre.userId?._id ? (
                            <Link 
                              to={`/player/${membre.userId._id}`} 
                              className="text-decoration-none d-flex align-items-center"
                              style={{ color: 'inherit' }}
                            >
                              <div className="member-avatar me-2" style={{width: '40px', height: '40px'}}>
                                <i className="fas fa-user" style={{fontSize: '1rem'}}></i>
                              </div>
                              <span className="text-primary fw-bold">{membre.userId?.pseudo}</span>
                              <i className="fas fa-external-link-alt ms-2 text-muted" style={{fontSize: '0.8rem'}}></i>
                            </Link>
                          ) : (
                            <div className="d-flex align-items-center">
                              <div className="member-avatar me-2" style={{width: '40px', height: '40px'}}>
                                <i className="fas fa-user" style={{fontSize: '1rem'}}></i>
                              </div>
                              <span className="text-muted">{membre.userId?.pseudo}</span>
                            </div>
                          )}
                        </td>
                        <td>
                          <span className={getRoleBadge(membre.role)}>
                            {membre.role}
                          </span>
                        </td>
                        <td>
                          <small className="text-muted">
                            {new Date(membre.dateAdhesion).toLocaleDateString()}
                          </small>
                        </td>
                        <td>
                          {membre.role !== 'Admin' && (
                            <div className="btn-group btn-group-sm">
                              <button
                                className="btn btn-outline-warning btn-sm"
                                onClick={() => handlePromoteMember(membre.userId._id)}
                                title="Promouvoir en admin"
                              >
                                <i className="fas fa-crown"></i>
                              </button>
                              <button
                                className="btn btn-outline-danger btn-sm"
                                onClick={() => handleExcludeMember(membre.userId._id)}
                                title="Exclure du club"
                              >
                                <i className="fas fa-user-times"></i>
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            <div className="custom-modal-footer">
              <button 
                type="button" 
                className="btn btn-secondary" 
                onClick={() => setShowMemberModal(false)}
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de modification du club */}
      {showEditModal && (
        <div className="custom-modal" onClick={() => setShowEditModal(false)}>
          <div className="custom-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="custom-modal-header">
              <h5>
                <i className="fas fa-edit me-2"></i>
                Modifier le club - {club?.nom}
              </h5>
              <button 
                type="button" 
                className="btn-close btn-close-white" 
                onClick={() => setShowEditModal(false)}
              ></button>
            </div>
            <div className="custom-modal-body">
              <form>
                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label className="form-label">
                      <i className="fas fa-trophy"></i>
                      Nom du club
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      value={editForm.nom}
                      onChange={(e) => setEditForm(prev => ({ ...prev, nom: e.target.value }))}
                    />
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="form-label">
                      <i className="fas fa-flag"></i>
                      Pays
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      value={editForm.pays}
                      onChange={(e) => setEditForm(prev => ({ ...prev, pays: e.target.value }))}
                    />
                  </div>
                </div>

                <div className="mb-3">
                  <label className="form-label">
                    <i className="fas fa-align-left"></i>
                    Description
                  </label>
                  <textarea
                    className="form-control"
                    rows="4"
                    value={editForm.description}
                    onChange={(e) => setEditForm(prev => ({ ...prev, description: e.target.value }))}
                  ></textarea>
                </div>

                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label className="form-label">
                      <i className="fas fa-gamepad"></i>
                      Plateformes
                    </label>
                    <div>
                      {['PS5', 'Xbox', 'PC'].map(platform => (
                        <div key={platform} className="platform-checkbox">
                          <input
                            type="checkbox"
                            id={`edit-platform-${platform}`}
                            checked={editForm.plateformes.includes(platform)}
                            onChange={(e) => handlePlatformChange(platform, e.target.checked)}
                          />
                          <label htmlFor={`edit-platform-${platform}`}>
                            {getPlatformIcon(platform)} {platform}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="form-label">
                      <i className="fas fa-users"></i>
                      Effectif maximum
                    </label>
                    <select
                      className="form-select"
                      value={editForm.effectifMax}
                      onChange={(e) => setEditForm(prev => ({ ...prev, effectifMax: parseInt(e.target.value) }))}
                    >
                      {Array.from({ length: 20 }, (_, i) => i + 11).map(num => (
                        <option key={num} value={num}>{num} joueurs</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="mb-3">
                  <label className="form-label">
                    <i className="fas fa-language"></i>
                    Langues
                  </label>
                  <div className="mb-2">
                    {editForm.langues.map((langue, index) => (
                      <div key={index} className="language-input">
                        <input
                          type="text"
                          className="form-control"
                          value={langue}
                          onChange={(e) => {
                            const newLangues = [...editForm.langues];
                            newLangues[index] = e.target.value;
                            setEditForm(prev => ({ ...prev, langues: newLangues }));
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => handleLanguageRemove(index)}
                          title="Supprimer cette langue"
                        >
                          <i className="fas fa-times"></i>
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      className="btn btn-sm btn-outline-primary"
                      onClick={handleLanguageAdd}
                    >
                      <i className="fas fa-plus me-1"></i>
                      Ajouter une langue
                    </button>
                  </div>
                </div>

                <div className="mb-3">
                  <div className="form-check">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id="edit-recrute"
                      checked={editForm.recrute}
                      onChange={(e) => setEditForm(prev => ({ ...prev, recrute: e.target.checked }))}
                    />
                    <label className="form-check-label" htmlFor="edit-recrute">
                      <i className="fas fa-user-plus me-2 text-success"></i>
                      Recruter des joueurs
                    </label>
                  </div>
                </div>
              </form>
            </div>
            <div className="custom-modal-footer">
              <button 
                type="button" 
                className="btn btn-secondary me-2" 
                onClick={() => setShowEditModal(false)}
              >
                Annuler
              </button>
              <button 
                type="button" 
                className="btn btn-primary" 
                onClick={handleUpdateClub}
                disabled={updating}
              >
                {updating ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2"></span>
                    Mise à jour...
                  </>
                ) : (
                  <>
                    <i className="fas fa-save me-2"></i>
                    Sauvegarder
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal des demandes d'adhésion */}
      {showRequestsModal && (
        <div className="custom-modal" onClick={() => setShowRequestsModal(false)}>
          <div className="custom-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="custom-modal-header">
              <h5>
                <i className="fas fa-user-plus me-2"></i>
                Demandes d'adhésion - {club?.nom}
              </h5>
              <button 
                type="button" 
                className="btn-close btn-close-white" 
                onClick={() => setShowRequestsModal(false)}
              ></button>
            </div>
            <div className="custom-modal-body">
              {loadingRequests ? (
                <div className="text-center py-4">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Chargement...</span>
                  </div>
                  <p className="mt-2">Chargement des demandes...</p>
                </div>
              ) : requests.length === 0 ? (
                <div className="text-center py-4">
                  <i className="fas fa-inbox fa-3x text-muted mb-3"></i>
                  <h6>Aucune demande d'adhésion</h6>
                  <p className="text-muted">Aucune demande en attente pour le moment.</p>
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover">
                    <thead>
                      <tr>
                        <th>Joueur</th>
                        <th>Message</th>
                        <th>Date</th>
                        <th>Statut</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {requests.map((demande) => (
                        <tr key={demande._id}>
                          <td>
                            <div className="d-flex align-items-center">
                              <div className="member-avatar me-2" style={{width: '40px', height: '40px'}}>
                                <i className="fas fa-user" style={{fontSize: '1rem'}}></i>
                              </div>
                              <span className="fw-bold">{demande.userId?.pseudo}</span>
                            </div>
                          </td>
                          <td>
                            <small className="text-muted">
                              {demande.message || 'Aucun message'}
                            </small>
                          </td>
                          <td>
                            <small className="text-muted">
                              {new Date(demande.dateDemande).toLocaleDateString()}
                            </small>
                          </td>
                          <td>
                            <span className={getRequestStatusBadge(demande.statut)}>
                              {demande.statut}
                            </span>
                          </td>
                          <td>
                            {demande.statut === 'En attente' && (
                              <div className="btn-group btn-group-sm">
                                <button
                                  className="btn btn-outline-success btn-sm"
                                  onClick={() => handleAcceptRequest(demande._id)}
                                  title="Accepter la demande"
                                >
                                  <i className="fas fa-check"></i>
                                </button>
                                <button
                                  className="btn btn-outline-danger btn-sm"
                                  onClick={() => handleRefuseRequest(demande._id)}
                                  title="Refuser la demande"
                                >
                                  <i className="fas fa-times"></i>
                                </button>
                              </div>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
            <div className="custom-modal-footer">
              <button 
                type="button" 
                className="btn btn-secondary" 
                onClick={() => setShowRequestsModal(false)}
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 