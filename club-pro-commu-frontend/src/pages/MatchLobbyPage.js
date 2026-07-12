import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { competitionAPI, clubAPI } from '../services/api';

const matchLobbyStyles = `
  .match-lobby-page {
    min-height: 100vh;
    padding-bottom: 4rem;
    color: #e2e8f0;
    font-family: 'Inter', sans-serif;
  }

  .lobby-card {
    background: rgba(13, 19, 32, 0.85);
    border: 1px solid rgba(255, 255, 255, 0.08);
    backdrop-filter: blur(16px);
    border-radius: 24px;
    padding: 2rem;
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.5);
  }

  .header-area {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 2rem;
  }

  .back-btn {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    color: rgba(255, 255, 255, 0.6);
    text-decoration: none;
    font-weight: 500;
    transition: all 0.2s ease;
    background: rgba(255, 255, 255, 0.04);
    padding: 0.5rem 1rem;
    border-radius: 12px;
    border: 1px solid rgba(255, 255, 255, 0.05);
  }

  .back-btn:hover {
    color: #fff;
    background: rgba(255, 255, 255, 0.08);
    border-color: rgba(0, 240, 255, 0.3);
  }

  .comp-badge {
    font-family: 'Rajdhani', sans-serif;
    font-size: 0.75rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 1px;
    background: linear-gradient(90deg, rgba(0, 240, 255, 0.15) 0%, rgba(139, 92, 246, 0.15) 100%);
    border: 1px solid rgba(0, 240, 255, 0.3);
    color: #00f0ff;
    padding: 4px 12px;
    border-radius: 20px;
  }

  .phase-title {
    font-family: 'Rajdhani', sans-serif;
    font-weight: 700;
    font-size: 1.1rem;
    color: rgba(255, 255, 255, 0.5);
    text-transform: uppercase;
    letter-spacing: 1.5px;
    margin-bottom: 0.25rem;
  }

  .matchdown-grid {
    display: grid;
    grid-template-columns: 1fr 120px 1fr;
    align-items: center;
    gap: 2rem;
    padding: 2rem 0;
    border-bottom: 1px solid rgba(255, 255, 255, 0.06);
    margin-bottom: 2rem;
  }

  .lobby-team-column {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
  }

  .lobby-logo-wrapper {
    position: relative;
    width: 110px;
    height: 110px;
    margin-bottom: 1rem;
    transition: transform 0.3s ease;
  }

  .lobby-logo-wrapper:hover {
    transform: scale(1.05);
  }

  .lobby-team-logo {
    width: 100%;
    height: 100%;
    border-radius: 50%;
    object-fit: cover;
    border: 3px solid rgba(255, 255, 255, 0.1);
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.4);
    background: #111827;
  }

  .lobby-logo-placeholder {
    width: 100%;
    height: 100%;
    border-radius: 50%;
    background: linear-gradient(135deg, #1f2937 0%, #111827 100%);
    border: 3px solid rgba(255, 255, 255, 0.1);
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: 'Rajdhani', sans-serif;
    font-weight: 700;
    font-size: 2.2rem;
    color: rgba(255, 255, 255, 0.7);
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.4);
  }

  .ready-status-circle {
    position: absolute;
    bottom: 2px;
    right: 2px;
    width: 22px;
    height: 22px;
    border-radius: 50%;
    border: 3px solid #0d1320;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.5);
  }

  .ready-status-circle.ready {
    background-color: #10b981;
    box-shadow: 0 0 10px #10b981;
  }

  .ready-status-circle.not-ready {
    background-color: #ef4444;
  }

  .lobby-team-name {
    font-family: 'Rajdhani', sans-serif;
    font-weight: 700;
    font-size: 1.4rem;
    color: #fff;
    margin: 0;
  }

  .lobby-role-badge {
    font-size: 0.7rem;
    background: rgba(255, 255, 255, 0.08);
    color: rgba(255, 255, 255, 0.6);
    padding: 2px 8px;
    border-radius: 6px;
    margin-top: 0.4rem;
    display: inline-block;
  }

  .vs-score-center {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
  }

  .vs-badge-text {
    font-family: 'Rajdhani', sans-serif;
    font-weight: 800;
    font-size: 1.2rem;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.08);
    padding: 6px 16px;
    border-radius: 10px;
    color: rgba(255, 255, 255, 0.4);
    letter-spacing: 1px;
  }

  .center-score-display {
    font-family: 'Rajdhani', sans-serif;
    font-weight: 900;
    font-size: 3.5rem;
    color: #f59e0b;
    display: flex;
    align-items: center;
    gap: 0.8rem;
    line-height: 1;
  }

  .score-separator {
    color: rgba(255, 255, 255, 0.2);
    font-size: 2.2rem;
    font-weight: 400;
  }

  .countdown-widget {
    background: linear-gradient(135deg, rgba(245, 158, 11, 0.08) 0%, rgba(239, 68, 68, 0.08) 100%);
    border: 1px solid rgba(245, 158, 11, 0.2);
    border-radius: 16px;
    padding: 1.2rem;
    display: flex;
    align-items: center;
    gap: 1.2rem;
    margin-bottom: 2rem;
    position: relative;
    overflow: hidden;
  }

  .countdown-widget.in-game {
    background: linear-gradient(135deg, rgba(16, 185, 129, 0.08) 0%, rgba(59, 130, 246, 0.08) 100%);
    border-color: rgba(16, 185, 129, 0.2);
  }

  .countdown-widget.litige {
    background: linear-gradient(135deg, rgba(239, 68, 68, 0.1) 0%, rgba(139, 92, 246, 0.08) 100%);
    border-color: rgba(239, 68, 68, 0.3);
  }

  .countdown-progress-bar {
    position: absolute;
    bottom: 0;
    left: 0;
    height: 4px;
    background: #f59e0b;
    transition: width 1s linear;
  }

  .countdown-widget.in-game .countdown-progress-bar {
    background: #10b981;
  }

  .timer-icon-container {
    width: 44px;
    height: 44px;
    border-radius: 12px;
    background: rgba(245, 158, 11, 0.15);
    color: #f59e0b;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.3rem;
  }

  .countdown-widget.in-game .timer-icon-container {
    background: rgba(16, 185, 129, 0.15);
    color: #10b981;
  }

  .countdown-widget.litige .timer-icon-container {
    background: rgba(239, 68, 68, 0.15);
    color: #ef4444;
  }

  .timer-values {
    flex: 1;
  }

  .timer-label {
    font-size: 0.72rem;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    color: rgba(255, 255, 255, 0.5);
    margin-bottom: 0.2rem;
  }

  .timer-countdown {
    font-family: 'Rajdhani', sans-serif;
    font-size: 1.6rem;
    font-weight: 700;
    color: #fff;
    line-height: 1;
  }

  .lobby-action-box {
    background: rgba(255, 255, 255, 0.02);
    border: 1px solid rgba(255, 255, 255, 0.05);
    border-radius: 20px;
    padding: 1.5rem;
    margin-bottom: 2rem;
  }

  .lobby-section-title {
    font-family: 'Rajdhani', sans-serif;
    font-size: 0.85rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 1px;
    color: rgba(255, 255, 255, 0.4);
    margin-bottom: 1rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .dispute-tab-header {
    display: flex;
    background: rgba(0, 0, 0, 0.2);
    border-radius: 10px;
    padding: 4px;
    margin-bottom: 1rem;
  }

  .dispute-tab-btn {
    flex: 1;
    background: transparent;
    border: none;
    color: rgba(255, 255, 255, 0.6);
    padding: 8px;
    font-size: 0.8rem;
    font-weight: 600;
    border-radius: 8px;
    transition: all 0.2s ease;
  }

  .dispute-tab-btn.active {
    background: rgba(255, 255, 255, 0.08);
    color: #00f0ff;
  }

  .rules-mini-card {
    background: rgba(255, 255, 255, 0.01);
    border: 1px solid rgba(255, 255, 255, 0.03);
    border-radius: 16px;
    padding: 1.25rem;
  }

  .rules-list {
    margin: 0;
    padding-left: 1.2rem;
    font-size: 0.8rem;
    color: rgba(255, 255, 255, 0.5);
  }

  .rules-list li {
    margin-bottom: 0.5rem;
  }

  @media (max-width: 768px) {
    .matchdown-grid {
      grid-template-columns: 1fr;
      gap: 1.5rem;
      padding: 1rem 0;
    }
    .vs-score-center {
      grid-row: 1;
    }
    .lobby-logo-wrapper {
      width: 90px;
      height: 90px;
    }
    .lobby-team-name {
      font-size: 1.2rem;
    }
  }
`;

export default function MatchLobbyPage() {
  const { id: competitionId, matchId } = useParams();
  const { user } = useAuth();

  const [competition, setCompetition] = useState(null);
  const [match, setMatch] = useState(null);
  const [userClubs, setUserClubs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // States pour la saisie de score
  const [score1, setScore1] = useState('');
  const [score2, setScore2] = useState('');
  const [submittingScore, setSubmittingScore] = useState(false);

  // States pour la déclaration de litige
  const [litigeDesc, setLitigeDesc] = useState('');
  const [litigeUrl, setLitigeUrl] = useState('');
  const [litigeFile, setLitigeFile] = useState(null);
  const [litigeMode, setLitigeMode] = useState('link'); // 'link', 'photo', 'video'
  const [uploadProgress, setUploadProgress] = useState(0);
  const [submittingLitige, setSubmittingLitige] = useState(false);

  // States pour l'arbitrage admin
  const [adminAction, setAdminAction] = useState('trancher'); // 'trancher', 'rejouer', 'rejeter'
  const [adminMotiv, setAdminMotiv] = useState('');
  const [adminScore1, setAdminScore1] = useState('0');
  const [adminScore2, setAdminScore2] = useState('0');
  const [submittingArbitrage, setSubmittingArbitrage] = useState(false);

  // Ready status sound triggers
  const prevReady1 = useRef(false);
  const prevReady2 = useRef(false);
  const prevStatut = useRef('');

  // Timers
  const [timeLeft, setTimeLeft] = useState('');
  const [timerProgress, setTimerProgress] = useState(100);

  const playSynthSound = (type) => {
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return;
      const ctx = new AudioContext();
      if (type === 'ready') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = 'sine';
        osc.frequency.setValueAtTime(440, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.15);
        gain.gain.setValueAtTime(0.1, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);
        osc.start();
        osc.stop(ctx.currentTime + 0.15);
      } else if (type === 'start') {
        const osc1 = ctx.createOscillator();
        const osc2 = ctx.createOscillator();
        const gain = ctx.createGain();
        osc1.connect(gain);
        osc2.connect(gain);
        gain.connect(ctx.destination);
        osc1.type = 'triangle';
        osc2.type = 'sawtooth';
        osc1.frequency.setValueAtTime(587.33, ctx.currentTime);
        osc1.frequency.setValueAtTime(659.25, ctx.currentTime + 0.1);
        osc1.frequency.setValueAtTime(880, ctx.currentTime + 0.2);
        osc2.frequency.setValueAtTime(293.66, ctx.currentTime);
        osc2.frequency.setValueAtTime(329.63, ctx.currentTime + 0.1);
        osc2.frequency.setValueAtTime(440, ctx.currentTime + 0.2);
        gain.gain.setValueAtTime(0.15, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);
        osc1.start();
        osc2.start();
        osc1.stop(ctx.currentTime + 0.4);
        osc2.stop(ctx.currentTime + 0.4);
      }
    } catch (err) {
      console.warn('Audio Context non supporté ou bloqué', err);
    }
  };

  const fetchData = useCallback(async () => {
    try {
      const [compData, clubsData] = await Promise.all([
        competitionAPI.getCompetition(competitionId),
        user ? clubAPI.getMyClubs(user.token) : Promise.resolve([])
      ]);

      setCompetition(compData);
      setUserClubs(clubsData);

      // Trouver le match
      let foundMatch = compData.matchsElimination?.find(m => m._id === matchId);
      if (!foundMatch && compData.poules) {
        for (const p of compData.poules) {
          foundMatch = p.matchs?.find(m => m._id === matchId);
          if (foundMatch) break;
        }
      }

      if (!foundMatch) {
        setError('Match introuvable');
      } else {
        setMatch(foundMatch);
        // Pré-remplir les scores si disponibles
        if (foundMatch.score1 !== null) setAdminScore1(foundMatch.score1.toString());
        if (foundMatch.score2 !== null) setAdminScore2(foundMatch.score2.toString());
        
        // Jouer sons si besoin
        if (foundMatch.equipe1Prete && !prevReady1.current) playSynthSound('ready');
        if (foundMatch.equipe2Prete && !prevReady2.current) playSynthSound('ready');
        if (foundMatch.statut === 'En cours' && prevStatut.current === 'Programmé') playSynthSound('start');

        prevReady1.current = foundMatch.equipe1Prete;
        prevReady2.current = foundMatch.equipe2Prete;
        prevStatut.current = foundMatch.statut;
      }
    } catch (err) {
      console.error(err);
      setError('Erreur lors du chargement des données');
    } finally {
      setLoading(false);
    }
  }, [competitionId, matchId, user]);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 10000); // Rafraîchir toutes les 10 secondes
    return () => clearInterval(interval);
  }, [fetchData]);

  // Timer logique
  useEffect(() => {
    if (!match) return;

    const timerInterval = setInterval(() => {
      let limitDate = null;
      let durationMax = 10 * 60 * 1000; // Ready Check par défaut: 10 minutes

      if (match.statut === 'Programmé' && match.dateLimiteDebut) {
        limitDate = new Date(match.dateLimiteDebut).getTime();
        durationMax = (competition?.delaiLancementMatch || 10) * 60 * 1000;
      } else if (match.statut === 'En cours' && match.dateDebutMatch) {
        limitDate = new Date(match.dateDebutMatch).getTime() + (25 * 60 * 1000); // 25 minutes in game
        durationMax = 25 * 60 * 1000;
      }

      if (!limitDate) {
        setTimeLeft('');
        setTimerProgress(100);
        return;
      }

      const diff = limitDate - Date.now();
      if (diff <= 0) {
        setTimeLeft('00:00');
        setTimerProgress(0);
        clearInterval(timerInterval);
        fetchData(); // Rafraîchir pour appliquer forfait
        return;
      }

      const mins = Math.floor(diff / 60000);
      const secs = Math.floor((diff % 60000) / 1000);
      setTimeLeft(`${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`);
      setTimerProgress(Math.max(0, Math.min(100, (diff / durationMax) * 100)));
    }, 1000);

    return () => clearInterval(timerInterval);
  }, [match, competition, fetchData]);

  if (loading) {
    return (
      <div className="container py-5 text-center text-white">
        <div className="spinner-border text-info" role="status">
          <span className="visually-hidden">Chargement...</span>
        </div>
      </div>
    );
  }

  if (error || !match) {
    return (
      <div className="container py-5 text-white">
        <div className="alert alert-danger">{error || 'Match non disponible'}</div>
        <Link to={`/competition/${competitionId}/mes-matchs`} className="back-btn mt-3">
          <i className="fas fa-arrow-left"></i> Retour
        </Link>
      </div>
    );
  }

  const compareIds = (a, b) => {
    if (!a || !b) return false;
    const ia = typeof a === 'object' ? (a?._id || a?.id)?.toString() : a?.toString();
    const ib = typeof b === 'object' ? (b?._id || b?.id)?.toString() : b?.toString();
    return ia && ib && ia === ib;
  };

  // Relations de l'utilisateur avec les équipes
  const eq1Id = match.equipe1?._id || match.equipe1;
  const eq2Id = match.equipe2?._id || match.equipe2;
  const currentUserId = user?.id || user?._id;

  const isCaptainEq1 = userClubs.some(c => 
    compareIds(c._id, eq1Id) && 
    c.membres.some(m => compareIds(m.userId, currentUserId) && (m.role === 'Admin' || m.role === 'Capitaine'))
  );
  const isCaptainEq2 = userClubs.some(c => 
    compareIds(c._id, eq2Id) && 
    c.membres.some(m => compareIds(m.userId, currentUserId) && (m.role === 'Admin' || m.role === 'Capitaine'))
  );
  const isCaptain = isCaptainEq1 || isCaptainEq2;


  const isAdmin = user?.isAdmin || compareIds(competition?.createurId, currentUserId);

  // Formulaire "Je suis prêt"
  const handleReadyClick = async () => {
    try {
      await competitionAPI.marquerPret(competitionId, match._id, user.token);
      alert('Statut "Prêt" enregistré !');
      fetchData();
    } catch (err) {
      alert(err.message);
    }
  };

  // Soumission de score
  const handleScoreSubmit = async (e) => {
    e.preventDefault();
    if (score1 === '' || score2 === '') {
      alert('Veuillez renseigner le score pour les deux équipes');
      return;
    }
    setSubmittingScore(true);
    try {
      await competitionAPI.mettreAJourScore(competitionId, match._id, {
        score1: parseInt(score1),
        score2: parseInt(score2)
      }, user.token);
      alert('Score soumis avec succès !');
      setScore1('');
      setScore2('');
      fetchData();
    } catch (err) {
      alert(err.message);
    } finally {
      setSubmittingScore(false);
    }
  };

  // Déclaration de litige
  const handleDisputeSubmit = async (e) => {
    e.preventDefault();
    if (!litigeDesc.trim()) {
      alert('Veuillez décrire le problème');
      return;
    }
    setSubmittingLitige(true);
    setUploadProgress(0);
    try {
      let proofUrl = litigeUrl;

      // Gérer l'upload si fichier
      if (litigeMode === 'video' && litigeFile) {
        const uploadUrl = `${process.env.NODE_ENV === 'production' ? 'https://club-pro-commu.onrender.com/api' : 'http://localhost:3001/api'}/competitions/${competitionId}/matchs/${match._id}/upload-video`;
        const formData = new FormData();
        formData.append('video', litigeFile);

        const uploadPromise = new Promise((resolve, reject) => {
          const xhr = new XMLHttpRequest();
          xhr.upload.addEventListener('progress', (e) => {
            if (e.lengthComputable) {
              setUploadProgress(Math.round((e.loaded / e.total) * 100));
            }
          });
          xhr.addEventListener('load', () => {
            if (xhr.status >= 200 && xhr.status < 300) {
              try { resolve(JSON.parse(xhr.responseText)); }
              catch (e) { reject(new Error('Réponse invalide du serveur')); }
            } else {
              reject(new Error('Erreur de chargement du fichier vidéo'));
            }
          });
          xhr.addEventListener('error', () => reject(new Error('Erreur réseau')));
          xhr.open('POST', uploadUrl);
          xhr.setRequestHeader('Authorization', `Bearer ${user.token}`);
          xhr.send(formData);
        });

        const uploadRes = await uploadPromise;
        if (uploadRes && uploadRes.success) {
          proofUrl = uploadRes.videoUrl;
        } else {
          throw new Error('Echec de récupération du lien vidéo');
        }
      } else if (litigeMode === 'photo' && litigeFile) {
        const res = await competitionAPI.uploadPhotoLitige(competitionId, match._id, litigeFile, user.token, (progress) => {
          setUploadProgress(progress);
        });
        if (res && res.success) {
          proofUrl = res.photoUrl;
        } else {
          throw new Error('Echec de récupération du lien de l\'image');
        }
      }

      // Envoyer le litige
      const litigeEndpoint = `${process.env.NODE_ENV === 'production' ? 'https://club-pro-commu.onrender.com/api' : 'http://localhost:3001/api'}/competitions/${competitionId}/matchs/${match._id}/litige`;
      const disputeRes = await fetch(litigeEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`
        },
        body: JSON.stringify({
          description: litigeDesc,
          preuveVideo: proofUrl
        })
      });

      if (!disputeRes.ok) {
        const errorData = await disputeRes.json();
        throw new Error(errorData.message || 'Impossible d\'enregistrer le litige');
      }

      alert('Litige signalé avec succès. Les administrateurs vont l\'analyser.');
      setLitigeDesc('');
      setLitigeUrl('');
      setLitigeFile(null);
      fetchData();
    } catch (err) {
      alert(err.message);
    } finally {
      setSubmittingLitige(false);
      setUploadProgress(0);
    }
  };

  // Arbitrage admin
  const handleArbitrageSubmit = async (e) => {
    e.preventDefault();
    if (adminAction === 'trancher' && (adminScore1 === '' || adminScore2 === '')) {
      alert('Veuillez spécifier le score final pour trancher.');
      return;
    }
    if (!window.confirm('Voulez-vous enregistrer cette décision d\'arbitrage ?')) return;

    setSubmittingArbitrage(true);
    try {
      const endpoint = `${process.env.NODE_ENV === 'production' ? 'https://club-pro-commu.onrender.com/api' : 'http://localhost:3001/api'}/competitions/${competitionId}/matchs/${match._id}/resoudre-litige`;
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`
        },
        body: JSON.stringify({
          action: adminAction,
          decisionAdmin: adminMotiv,
          score1: parseInt(adminScore1),
          score2: parseInt(adminScore2)
        })
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Erreur lors de la résolution du litige');
      }

      alert('Litige arbitré avec succès !');
      setAdminMotiv('');
      fetchData();
    } catch (err) {
      alert(err.message);
    } finally {
      setSubmittingArbitrage(false);
    }
  };

  // Obtenir infos équipes
  const team1 = typeof match.equipe1 === 'object' ? match.equipe1 : { nom: 'Équipe A', logo: '' };
  const team2 = typeof match.equipe2 === 'object' ? match.equipe2 : { nom: 'Équipe B', logo: '' };

  const finalScore1 = match.score1 ?? (match.propositionScore?.proposePar ? match.propositionScore.score1 : '-');
  const finalScore2 = match.score2 ?? (match.propositionScore?.proposePar ? match.propositionScore.score2 : '-');

  // Déterminer la couleur de la barre de progression
  let progressColor = 'bg-warning';
  if (timerProgress < 25) progressColor = 'bg-danger animate-pulse';
  else if (timerProgress < 50) progressColor = 'bg-warning';
  else progressColor = 'bg-success';

  return (
    <div className="match-lobby-page container py-4">
      <style>{matchLobbyStyles}</style>

      {/* Bouton de retour */}
      <div className="header-area">
        <Link to={`/competition/${competitionId}/mes-matchs`} className="back-btn">
          <i className="fas fa-arrow-left"></i>
          <span>Mes Matchs</span>
        </Link>
        <span className="comp-badge">{competition?.nom || 'Compétition'}</span>
      </div>

      <div className="lobby-card">
        
        {/* Phase Label */}
        <div className="text-center">
          <div className="phase-title">{match.phase || 'Tour principal'}</div>
          <span className={`badge ${match.statut === 'Terminé' ? 'bg-success' : match.statut === 'En cours' ? 'bg-info text-white' : 'bg-secondary'} px-3 py-2 fw-semibold`}>
            {match.statut}
          </span>
        </div>

        {/* Confrontation Grid */}
        <div className="matchdown-grid">
          {/* Équipe 1 */}
          <div className="lobby-team-column">
            <div className="lobby-logo-wrapper">
              {team1.logo ? (
                <img src={team1.logo} alt={team1.nom} className="lobby-team-logo" />
              ) : (
                <div className="lobby-logo-placeholder">{team1.nom?.substring(0, 2).toUpperCase()}</div>
              )}
              {match.statut === 'Programmé' && (
                <span className={`ready-status-circle ${match.equipe1Prete ? 'ready' : 'not-ready'}`} title={match.equipe1Prete ? 'Prête' : 'Non prête'}></span>
              )}
            </div>
            <h4 className="lobby-team-name">{team1.nom}</h4>
            {isCaptainEq1 && <span className="lobby-role-badge">Vous êtes Capitaine</span>}
          </div>

          {/* VS / Score central */}
          <div className="vs-score-center">
            {match.statut === 'Terminé' || match.propositionScore?.proposePar ? (
              <div className="center-score-display">
                <span>{finalScore1}</span>
                <span className="score-separator">:</span>
                <span>{finalScore2}</span>
              </div>
            ) : (
              <span className="vs-badge-text">VS</span>
            )}
            {match.propositionScore?.proposePar && match.statut !== 'Terminé' && (
              <span className="text-muted small mt-2">Score proposé</span>
            )}
          </div>

          {/* Équipe 2 */}
          <div className="lobby-team-column">
            <div className="lobby-logo-wrapper">
              {team2.logo ? (
                <img src={team2.logo} alt={team2.nom} className="lobby-team-logo" />
              ) : (
                <div className="lobby-logo-placeholder">{team2.nom?.substring(0, 2).toUpperCase()}</div>
              )}
              {match.statut === 'Programmé' && (
                <span className={`ready-status-circle ${match.equipe2Prete ? 'ready' : 'not-ready'}`} title={match.equipe2Prete ? 'Prête' : 'Non prête'}></span>
              )}
            </div>
            <h4 className="lobby-team-name">{team2.nom}</h4>
            {isCaptainEq2 && <span className="lobby-role-badge">Vous êtes Capitaine</span>}
          </div>
        </div>

        {/* COMPTES À REBOURS AVANT FORFAIT */}
        {timeLeft && !match.litige && (
          <div className={`countdown-widget ${match.statut === 'En cours' ? 'in-game' : ''}`}>
            <div className="timer-icon-container">
              <i className={match.statut === 'En cours' ? 'fas fa-gamepad' : 'fas fa-stopwatch'}></i>
            </div>
            <div className="timer-values">
              <div className="timer-label">
                {match.statut === 'En cours' ? 'Temps restant pour saisir les scores (Forfait double sinon)' : 'Délai d\'attente avant forfait (Ready Check)'}
              </div>
              <div className="timer-countdown">{timeLeft}</div>
            </div>
            <div className={`countdown-progress-bar ${progressColor}`} style={{ width: `${timerProgress}%` }}></div>
          </div>
        )}

        {match.litige && (
          <div className="countdown-widget litige">
            <div className="timer-icon-container">
              <i className="fas fa-exclamation-triangle"></i>
            </div>
            <div className="timer-values">
              <div className="timer-label">Statut du litige</div>
              <div className="timer-countdown text-danger">LITIGE ACTIF</div>
            </div>
          </div>
        )}

        {/* ACTIONS DU LOBBY */}
        <div className="lobby-action-box">
          <div className="lobby-section-title">
            <i className="fas fa-tools"></i>
            <span>Tableau de gestion du match</span>
          </div>

          {/* 1. Ready check button */}
          {match.statut === 'Programmé' && (
            <div className="text-center py-4">
              <p className="text-muted small mb-4">
                Chaque équipe doit marquer son état "Prêt" sous peine de déclarer forfait. Le match commence automatiquement dès que les deux équipes sont prêtes.
              </p>
              {isCaptain ? (
                <>
                  {((isCaptainEq1 && match.equipe1Prete) || (isCaptainEq2 && match.equipe2Prete)) ? (
                    <div className="alert alert-success d-inline-block px-4 py-2 border-0 bg-success bg-opacity-10 text-success">
                      <i className="fas fa-check-circle me-2"></i> Votre équipe est prête. En attente de l'adversaire...
                    </div>
                  ) : (
                    <button className="btn btn-success btn-lg px-5 fw-bold shadow-lg" onClick={handleReadyClick}>
                      <i className="fas fa-check me-2"></i> JE SUIS PRÊT
                    </button>
                  )}
                </>
              ) : (
                <div className="text-warning small">
                  <i className="fas fa-clock me-2"></i> En attente du feu vert des capitaines d'équipes.
                </div>
              )}
            </div>
          )}

          {/* 2. Score entry */}
          {match.statut === 'En cours' && !match.litige && (
            <div className="py-2">
              {(!match.propositionScore || !match.propositionScore.proposePar) ? (
                isCaptain ? (
                  <form onSubmit={handleScoreSubmit} className="mx-auto" style={{ maxWidth: '400px' }}>
                    <h5 className="text-center text-white mb-3 fw-bold">Renseigner le score</h5>
                    <div className="row g-3 mb-3">
                      <div className="col">
                        <label className="form-label text-muted small">{team1.nom}</label>
                        <input type="number" min="0" className="form-control bg-dark border-secondary text-white text-center form-control-lg" value={score1} onChange={e => setScore1(e.target.value)} required />
                      </div>
                      <div className="col-auto align-self-end text-muted pb-2 fw-bold fs-4">:</div>
                      <div className="col">
                        <label className="form-label text-muted small">{team2.nom}</label>
                        <input type="number" min="0" className="form-control bg-dark border-secondary text-white text-center form-control-lg" value={score2} onChange={e => setScore2(e.target.value)} required />
                      </div>
                    </div>
                    <button type="submit" className="btn btn-primary w-100 btn-lg fw-bold" disabled={submittingScore}>
                      {submittingScore ? 'Transmission...' : 'Valider le score'}
                    </button>
                  </form>
                ) : (
                  <div className="text-center text-muted py-3">
                    <i className="fas fa-gamepad fa-2x animate-pulse mb-2 d-block text-info"></i>
                    <span>Match en cours. Les capitaines renseigneront les scores dès la fin du match.</span>
                  </div>
                )
              ) : (
                // Proposition de score existante
                <div className="text-center py-2">
                  {((isCaptainEq1 && match.propositionScore.proposePar === 'equipe1') ||
                    (isCaptainEq2 && match.propositionScore.proposePar === 'equipe2')) ? (
                    <div className="alert alert-info d-inline-block px-4 py-3 border-0 bg-info bg-opacity-10 text-info">
                      <h5>Score soumis : {match.propositionScore.score1} - {match.propositionScore.score2}</h5>
                      <p className="mb-0 small text-muted">En attente que le capitaine adverse saisisse ou confirme ce résultat.</p>
                    </div>
                  ) : isCaptain ? (
                    // Capitaine destinataire doit confirmer
                    <form onSubmit={handleScoreSubmit} className="mx-auto" style={{ maxWidth: '400px' }}>
                      <div className="alert alert-warning border-0 bg-warning bg-opacity-10 py-3 mb-4 text-warning">
                        <h6 className="fw-bold mb-1"><i className="fas fa-exclamation-circle me-2"></i>Validation requise</h6>
                        <p className="small mb-0">L'adversaire propose le score de <strong>{match.propositionScore.score1} - {match.propositionScore.score2}</strong>.</p>
                      </div>
                      <p className="small text-muted mb-3">Validez ce score en entrant les mêmes valeurs, ou saisissez votre propre score pour soulever un litige.</p>
                      <div className="row g-3 mb-3">
                        <div className="col">
                          <label className="form-label text-muted small">{team1.nom}</label>
                          <input type="number" min="0" className="form-control bg-dark border-secondary text-white text-center form-control-lg" value={score1} onChange={e => setScore1(e.target.value)} required />
                        </div>
                        <div className="col-auto align-self-end text-muted pb-2 fw-bold fs-4">:</div>
                        <div className="col">
                          <label className="form-label text-muted small">{team2.nom}</label>
                          <input type="number" min="0" className="form-control bg-dark border-secondary text-white text-center form-control-lg" value={score2} onChange={e => setScore2(e.target.value)} required />
                        </div>
                      </div>
                      <button type="submit" className="btn btn-warning text-dark w-100 btn-lg fw-bold" disabled={submittingScore}>
                        {submittingScore ? 'Enregistrement...' : 'Enregistrer le résultat'}
                      </button>
                    </form>
                  ) : (
                    <div className="text-center text-muted">
                      <i className="fas fa-spinner fa-spin me-2"></i>
                      <span>Score proposé ({match.propositionScore.score1} - {match.propositionScore.score2}). En attente de validation.</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* 3. Litige details et formulaires */}
          {match.litige && (
            <div className="bg-danger bg-opacity-5 border border-danger border-opacity-20 p-4 rounded-xl">
              <h5 className="text-danger fw-bold mb-2">
                <i className="fas fa-exclamation-triangle me-2"></i>
                Litige en cours d'examen
              </h5>
              
              <div className="mb-4 text-muted small bg-dark bg-opacity-40 p-3 rounded-lg border border-secondary border-opacity-10">
                <div className="mb-2"><strong>Motif signalé :</strong> {match.litigeDetails?.description || 'Désaccord sur le score.'}</div>
                {match.litigeDetails?.preuveVideo && (
                  <div>
                    <strong>Preuve fournie :</strong>{' '}
                    {match.litigeDetails.preuveVideo.startsWith('/uploads/') ? (
                      <div className="mt-2">
                        {match.litigeDetails.preuveVideo.includes('/photos/') ? (
                          <img src={`${process.env.NODE_ENV === 'production' ? 'https://club-pro-commu.onrender.com' : 'http://localhost:3001'}${match.litigeDetails.preuveVideo}`} alt="Preuve" className="rounded border border-secondary" style={{ maxWidth: '100%', maxHeight: '300px' }} />
                        ) : (
                          <video src={`${process.env.NODE_ENV === 'production' ? 'https://club-pro-commu.onrender.com' : 'http://localhost:3001'}${match.litigeDetails.preuveVideo}`} controls className="rounded border border-secondary w-100" style={{ maxHeight: '300px', background: '#000' }} />
                        )}
                      </div>
                    ) : (
                      <a href={match.litigeDetails.preuveVideo} target="_blank" rel="noopener noreferrer" className="btn btn-outline-info btn-sm mt-1">
                        <i className="fas fa-external-link-alt me-1"></i> Ouvrir la preuve externe
                      </a>
                    )}
                  </div>
                )}
              </div>

              {/* Upload de preuve additionnelle pour le capitaine qui ne l'a pas fait */}
              {isCaptain && !match.litigeDetails?.preuveVideo && (
                <form onSubmit={handleDisputeSubmit} className="mb-4">
                  <h6 className="text-white fw-bold mb-2">Ajouter votre preuve pour arbitrer le litige</h6>
                  
                  <div className="dispute-tab-header">
                    <button type="button" className={`dispute-tab-btn ${litigeMode === 'link' ? 'active' : ''}`} onClick={() => setLitigeMode('link')}>Lien URL</button>
                    <button type="button" className={`dispute-tab-btn ${litigeMode === 'photo' ? 'active' : ''}`} onClick={() => setLitigeMode('photo')}>Photo</button>
                    <button type="button" className={`dispute-tab-btn ${litigeMode === 'video' ? 'active' : ''}`} onClick={() => setLitigeMode('video')}>Vidéo</button>
                  </div>

                  <div className="mb-3">
                    <label className="form-label small text-muted">Description ou notes</label>
                    <textarea className="form-control bg-dark border-secondary text-white" rows="2" value={litigeDesc} onChange={e => setLitigeDesc(e.target.value)} placeholder="Décrivez succinctement l'action ou le score..." required></textarea>
                  </div>

                  {litigeMode === 'link' ? (
                    <div className="mb-3">
                      <label className="form-label small text-muted">Lien de la preuve (Youtube, Twitch, Imgur...)</label>
                      <input type="url" className="form-control bg-dark border-secondary text-white" value={litigeUrl} onChange={e => setLitigeUrl(e.target.value)} placeholder="https://..." required />
                    </div>
                  ) : (
                    <div className="mb-3">
                      <label className="form-label small text-muted">Sélectionnez le fichier ({litigeMode === 'photo' ? 'Image JPG/PNG' : 'Vidéo MP4'})</label>
                      <input type="file" accept={litigeMode === 'photo' ? 'image/*' : 'video/*'} className="form-control bg-dark border-secondary text-white" onChange={e => setLitigeFile(e.target.files[0])} required />
                      {uploadProgress > 0 && (
                        <div className="progress mt-2" style={{ height: '6px' }}>
                          <div className="progress-bar progress-bar-striped progress-bar-animated bg-danger" style={{ width: `${uploadProgress}%` }}></div>
                        </div>
                      )}
                    </div>
                  )}

                  <button type="submit" className="btn btn-danger w-100" disabled={submittingLitige}>
                    {submittingLitige ? 'Envoi...' : 'Envoyer ma preuve'}
                  </button>
                </form>
              )}
            </div>
          )}

          {/* Formulaire manuel de demande de litige si le match est en cours et pas encore de litige */}
          {match.statut === 'En cours' && !match.litige && isCaptain && (
            <div className="border-top border-secondary border-opacity-10 pt-4 mt-4">
              <h6 className="text-white fw-bold mb-3"><i className="fas fa-exclamation-circle text-warning me-2"></i>Signaler un litige / Problème</h6>
              
              <form onSubmit={handleDisputeSubmit}>
                <div className="dispute-tab-header">
                  <button type="button" className={`dispute-tab-btn ${litigeMode === 'link' ? 'active' : ''}`} onClick={() => setLitigeMode('link')}>Lien URL</button>
                  <button type="button" className={`dispute-tab-btn ${litigeMode === 'photo' ? 'active' : ''}`} onClick={() => setLitigeMode('photo')}>Photo</button>
                  <button type="button" className={`dispute-tab-btn ${litigeMode === 'video' ? 'active' : ''}`} onClick={() => setLitigeMode('video')}>Vidéo</button>
                </div>

                <div className="mb-3">
                  <label className="form-label small text-muted">Description de l'incident</label>
                  <textarea className="form-control bg-dark border-secondary text-white" rows="3" value={litigeDesc} onChange={e => setLitigeDesc(e.target.value)} placeholder="Expliquez brièvement le litige (score erroné, comportement anti-jeu, déconnexion...)" required></textarea>
                </div>

                {litigeMode === 'link' ? (
                  <div className="mb-3">
                    <label className="form-label small text-muted">URL de preuve (Twitch, Youtube, Imgur...)</label>
                    <input type="url" className="form-control bg-dark border-secondary text-white" value={litigeUrl} onChange={e => setLitigeUrl(e.target.value)} placeholder="https://..." />
                  </div>
                ) : (
                  <div className="mb-3">
                    <label className="form-label small text-muted">Fichier de preuve ({litigeMode === 'photo' ? 'Image' : 'Vidéo'})</label>
                    <input type="file" accept={litigeMode === 'photo' ? 'image/*' : 'video/*'} className="form-control bg-dark border-secondary text-white" onChange={e => setLitigeFile(e.target.files[0])} />
                    {uploadProgress > 0 && (
                      <div className="progress mt-2" style={{ height: '6px' }}>
                        <div className="progress-bar progress-bar-striped progress-bar-animated bg-danger" style={{ width: `${uploadProgress}%` }}></div>
                      </div>
                    )}
                  </div>
                )}

                <button type="submit" className="btn btn-warning text-dark fw-bold w-100" disabled={submittingLitige}>
                  {submittingLitige ? 'Envoi...' : 'Déclarer le litige'}
                </button>
              </form>
            </div>
          )}

          {/* 4. ADMIN ARBITRATION PANEL */}
          {isAdmin && match.litige && (
            <div className="mt-4 pt-4 border-top border-warning border-opacity-20 bg-warning bg-opacity-5 p-3 rounded-lg border border-warning border-opacity-10">
              <h5 className="text-warning fw-bold mb-3">
                <i className="fas fa-gavel me-2"></i>
                Arbitrage Administratif
              </h5>
              
              <form onSubmit={handleArbitrageSubmit}>
                <div className="mb-3">
                  <label className="form-label small text-warning">Action de l'arbitre</label>
                  <select className="form-select bg-dark text-white border-secondary" value={adminAction} onChange={e => setAdminAction(e.target.value)}>
                    <option value="trancher">Trancher le litige (Définir le score final)</option>
                    <option value="rejouer">Faire rejouer le match (Réinitialisation)</option>
                    <option value="rejeter">Rejeter le litige (Conserver le score actuel)</option>
                  </select>
                </div>

                {adminAction === 'trancher' && (
                  <div className="row g-2 mb-3">
                    <div className="col">
                      <label className="form-label text-muted small">{team1.nom}</label>
                      <input type="number" min="0" className="form-control bg-dark border-secondary text-white text-center" value={adminScore1} onChange={e => setAdminScore1(e.target.value)} required />
                    </div>
                    <div className="col-auto align-self-end text-muted pb-2 fw-bold fs-5">:</div>
                    <div className="col">
                      <label className="form-label text-muted small">{team2.nom}</label>
                      <input type="number" min="0" className="form-control bg-dark border-secondary text-white text-center" value={adminScore2} onChange={e => setAdminScore2(e.target.value)} required />
                    </div>
                  </div>
                )}

                <div className="mb-3">
                  <label className="form-label small text-warning">Motif ou commentaire de la décision</label>
                  <textarea className="form-control bg-dark border-secondary text-white" rows="3" value={adminMotiv} onChange={e => setAdminMotiv(e.target.value)} placeholder="Justifiez votre décision (ex: preuve vidéo montre un score de 2-1...)" required></textarea>
                </div>

                <button type="submit" className="btn btn-warning text-dark w-100 fw-bold" disabled={submittingArbitrage}>
                  {submittingArbitrage ? 'Validation...' : 'Enregistrer la décision d\'arbitrage'}
                </button>
              </form>
            </div>
          )}

          {/* Admin Manual Forfait control (toujours visible si admin et match non fini) */}
          {isAdmin && match.statut !== 'Terminé' && (
            <div className="mt-4 pt-3 border-top border-secondary border-opacity-10 bg-dark bg-opacity-25 p-3 rounded">
              <h6 className="text-warning fw-bold mb-2"><i className="fas fa-shield-alt me-2"></i>Contrôles Forfait Rapide</h6>
              <div className="d-flex gap-2">
                <button className="btn btn-sm btn-outline-danger flex-fill" onClick={async () => {
                  if (window.confirm(`Forfait pour ${team1.nom} ?`)) {
                    try {
                      await competitionAPI.declarerForfait(competitionId, match._id, 'equipe1', user.token);
                      alert('Forfait appliqué !');
                      fetchData();
                    } catch (e) { alert(e.message); }
                  }
                }}>Forfait {team1.nom}</button>
                <button className="btn btn-sm btn-outline-danger flex-fill" onClick={async () => {
                  if (window.confirm(`Forfait pour ${team2.nom} ?`)) {
                    try {
                      await competitionAPI.declarerForfait(competitionId, match._id, 'equipe2', user.token);
                      alert('Forfait appliqué !');
                      fetchData();
                    } catch (e) { alert(e.message); }
                  }
                }}>Forfait {team2.nom}</button>
                <button className="btn btn-sm btn-outline-danger flex-fill" onClick={async () => {
                  if (window.confirm('Forfait double pour ce match ?')) {
                    try {
                      await competitionAPI.declarerForfait(competitionId, match._id, 'double', user.token);
                      alert('Double Forfait appliqué !');
                      fetchData();
                    } catch (e) { alert(e.message); }
                  }
                }}>Double Forfait</button>
              </div>
            </div>
          )}

        </div>

        {/* REGLEMENT & INFOS LOBBY */}
        <div className="rules-mini-card">
          <div className="lobby-section-title">
            <i className="fas fa-info-circle"></i>
            <span>Règlement et aide du lobby</span>
          </div>
          <ul className="rules-list">
            <li><strong>Ready Check :</strong> Les deux capitaines doivent marquer leur présence sous peine de double forfait automatique à l'issue du décompte.</li>
            <li><strong>Saisie de score :</strong> Saisissez le score à la fin de la rencontre. Si les deux capitaines proposent des résultats différents, un litige est ouvert automatiquement.</li>
            <li><strong>Signalement :</strong> Vous pouvez déclarer un litige manuellement en insérant des preuves (vidéo, photo du score final ou lien Twitch/Youtube).</li>
            <li><strong>Arbitrage :</strong> Les décisions de l'administrateur ou du créateur de la compétition sont définitives et clôturent le match.</li>
          </ul>
        </div>

      </div>
    </div>
  );
}
