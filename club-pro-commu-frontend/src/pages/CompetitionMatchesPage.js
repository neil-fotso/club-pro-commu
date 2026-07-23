import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { competitionAPI, clubAPI } from '../services/api';
import LiveMatchLobby from '../components/LiveMatchLobby';

const matchesPageStyles = `
  .matches-page-container {
    min-height: 100vh;
  }
  
  .gaming-matches-card {
    background: rgba(13, 19, 32, 0.75) !important;
    border: 1px solid var(--border-glass) !important;
    backdrop-filter: blur(16px);
    border-radius: 16px !important;
    padding: 2rem !important;
    box-shadow: 0 15px 35px rgba(0, 0, 0, 0.4) !important;
    color: var(--text-white) !important;
  }
  
  .gaming-stat-card-custom {
    background: rgba(13, 19, 32, 0.6) !important;
    border: 1px solid var(--border-glass) !important;
    backdrop-filter: blur(12px);
    border-radius: 12px !important;
    padding: 1.25rem !important;
    transition: all 0.3s ease;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2) !important;
  }
  
  .gaming-stat-card-custom:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.35) !important;
  }
  
  .gaming-table {
    background: transparent !important;
    color: var(--text-silver) !important;
    border-collapse: separate;
    border-spacing: 0 8px;
  }
  
  .gaming-table tr {
    background: rgba(255, 255, 255, 0.01);
    border-radius: 8px;
    transition: all 0.2s ease;
  }
  
  .gaming-table tr:hover {
    background: rgba(255, 255, 255, 0.03);
  }
  
  .gaming-table th {
    background: transparent !important;
    color: var(--text-white) !important;
    font-family: 'Rajdhani', sans-serif;
    text-transform: uppercase;
    font-size: 0.85rem;
    border-bottom: 2px solid var(--border-glass) !important;
    padding: 1rem !important;
  }
  
  .gaming-table td {
    padding: 1rem !important;
    border: none !important;
    vertical-align: middle;
  }
  
  /* Bracket visualization tree styling */
  .tournament-bracket {
    width: 100%;
    overflow-x: auto;
    padding: 2rem 1rem;
    display: flex;
    justify-content: flex-start;
    align-items: center;
    position: relative;
    scrollbar-width: thin;
    scrollbar-color: var(--neon-cyan) rgba(0,0,0,0.1);
  }

  .tournament-bracket::-webkit-scrollbar {
    height: 6px;
  }
  
  .tournament-bracket::-webkit-scrollbar-thumb {
    background: var(--neon-cyan);
    border-radius: 10px;
  }

  .bracket-container {
    display: flex;
    align-items: center;
    gap: 40px; /* Space between rounds */
    padding: 2rem;
  }

  .bracket-node {
    display: flex;
    align-items: center;
    position: relative;
  }

  .bracket-children {
    display: flex;
    flex-direction: column;
    justify-content: space-around;
    gap: 20px;
    position: relative;
  }

  .bracket-match-wrapper {
    width: 240px;
    position: relative;
    z-index: 2;
    margin: 10px 0;
  }

  .match-card-container {
    background: rgba(13, 19, 32, 0.85) !important;
    border: 1px solid var(--border-glass) !important;
    border-radius: 12px !important;
    padding: 1rem !important;
    transition: all 0.3s ease;
    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.3) !important;
  }

  .match-card-container:hover {
    transform: translateY(-3px);
    border-color: var(--neon-cyan) !important;
    box-shadow: 0 8px 25px var(--neon-cyan-glow) !important;
  }

  .match-card-container.termine {
    border-left: 4px solid #28a745 !important;
  }

  .match-card-container.programme {
    border-left: 4px solid #00f0ff !important;
  }
  
  .match-card-container.annule {
    border-left: 4px solid #dc3545 !important;
  }

  .match-card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 0.75rem;
    color: var(--text-silver);
    margin-bottom: 0.75rem;
    padding-bottom: 0.4rem;
    border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  }

  .match-card-teams {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    margin-bottom: 0.75rem;
  }

  .match-card-team {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 0.85rem;
    color: var(--text-silver);
  }

  .match-card-team.winner {
    color: white !important;
    font-weight: 700;
  }

  .match-card-team-name {
    max-width: 150px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .match-card-team-score {
    font-family: 'Rajdhani', sans-serif;
    font-weight: 700;
    font-size: 0.95rem;
    background: rgba(255, 255, 255, 0.05);
    padding: 0.15rem 0.5rem;
    border-radius: 4px;
    min-width: 25px;
    text-align: center;
  }

  .match-card-team.winner .match-card-team-score {
    background: rgba(40, 167, 69, 0.2);
    color: #81c784;
  }

  .match-card-actions {
    display: flex;
    gap: 0.4rem;
    margin-top: 0.5rem;
  }
  
  .match-card-actions .btn {
    flex-grow: 1;
    font-size: 0.75rem !important;
    padding: 0.35rem 0.5rem !important;
    min-height: auto !important;
  }

  .match-card-placeholder {
    background: rgba(13, 19, 32, 0.4);
    border: 1px dashed var(--border-glass);
    border-radius: 12px;
    padding: 1.5rem 1rem;
    text-align: center;
    font-size: 0.85rem;
    color: var(--text-silver);
  }
  
  /* Champion / Podium cards */
  .champion-card {
    border-radius: 16px;
    padding: 1.5rem 1rem;
    text-align: center;
    color: white !important;
    transition: transform 0.3s ease;
  }

  .champion-card h5,
  .champion-card p,
  .champion-card .champion-name {
    color: white !important;
  }

  .champion-card:hover {
    transform: translateY(-4px);
  }

  .champion-card .trophy-icon {
    font-size: 2.5rem;
    margin-bottom: 0.5rem;
  }

  .champion-card .champion-name {
    font-size: 1.1rem;
    font-weight: 700;
    margin: 0;
  }

  .champion-card.gold {
    background: linear-gradient(135deg, rgba(255, 200, 0, 0.25), rgba(255, 160, 0, 0.15));
    border: 2px solid rgba(255, 200, 0, 0.5);
    box-shadow: 0 0 20px rgba(255, 200, 0, 0.2);
  }

  .champion-card.silver {
    background: linear-gradient(135deg, rgba(180, 180, 200, 0.25), rgba(140, 140, 160, 0.15));
    border: 2px solid rgba(180, 180, 200, 0.5);
    box-shadow: 0 0 20px rgba(180, 180, 200, 0.2);
  }

  .champion-card.bronze {
    background: linear-gradient(135deg, rgba(180, 110, 60, 0.25), rgba(140, 80, 40, 0.15));
    border: 2px solid rgba(180, 110, 60, 0.5);
    box-shadow: 0 0 20px rgba(180, 110, 60, 0.2);
  }

  /* Stat cards */
  .gaming-stat-card {
    background: rgba(13, 19, 32, 0.75) !important;
    border: 1px solid var(--border-glass) !important;
    backdrop-filter: blur(12px);
    border-radius: 12px !important;
    color: white !important;
  }

  .gaming-stat-card .card-text {
    color: rgba(255,255,255,0.7) !important;
  }

  .gaming-mobile-match-card {
    background: rgba(13, 19, 32, 0.7) !important;
    border: 1px solid var(--border-glass) !important;
    border-radius: 14px !important;
    padding: 1.25rem !important;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2) !important;
    margin-bottom: 1rem;
  }
  
  .gaming-mobile-match-card .team-container {
    width: 40%;
    font-size: 0.9rem;
    font-weight: 600;
  }
  
  .gaming-mobile-match-card .vs-score-container {
    width: 20%;
    font-family: 'Rajdhani', sans-serif;
    font-weight: 700;
    text-align: center;
  }

  @media (max-width: 768px) {
    .gaming-matches-card {
      padding: 1rem !important;
    }

    .matches-page-container.container {
      padding-left: 1rem !important;
      padding-right: 1rem !important;
      padding-top: 1.5rem !important;
    }

    .matches-page-header {
      flex-direction: column !important;
      align-items: flex-start !important;
      gap: 0.75rem;
    }

    .matches-page-header .header-left {
      width: 100%;
    }

    .matches-page-header .header-right {
      align-self: flex-start;
    }

    .matches-page-title {
      font-size: 1.25rem !important;
      line-height: 1.3 !important;
      margin-top: 0.5rem !important;
      display: block !important;
    }

    .matches-page-title .competition-name {
      display: block;
      font-size: 1.5rem !important;
      font-weight: 800;
      background: linear-gradient(135deg, #00f0ff, #a855f7);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      margin-top: 0.2rem;
    }

    .matches-back-btn {
      font-size: 0.85rem !important;
      padding: 0.4rem 0.8rem !important;
    }
  }
`;

const CompetitionMatchesPage = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [competition, setCompetition] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [showScoreModal, setShowScoreModal] = useState(false);
  const [scoreData, setScoreData] = useState({
    score1: '',
    score2: '',
    buteurs: [],
    passeurs: [],
    cartonsJaunes: [],
    cartonsRouges: [],
    captureEcran: ''
  });
  const [showDateModal, setShowDateModal] = useState(false);
  const [selectedMatchForDate, setSelectedMatchForDate] = useState(null);
  const [matchDate, setMatchDate] = useState('');
  const [userClubs, setUserClubs] = useState([]);
  const [showJoueurModal, setShowJoueurModal] = useState(false);
  const [joueurModalType, setJoueurModalType] = useState('');
  const [selectedJoueur, setSelectedJoueur] = useState('');
  const [joueurQuantite, setJoueurQuantite] = useState(1);
  const [generatingBracket, setGeneratingBracket] = useState(false);
  const [showLitigeModal, setShowLitigeModal] = useState(false);
  const [selectedMatchForLitige, setSelectedMatchForLitige] = useState(null);
  const [litigeData, setLitigeData] = useState({ description: '', preuveVideo: '' });
  const [submittingLitige, setSubmittingLitige] = useState(false);
  const [litigeUploadMode, setLitigeUploadMode] = useState('link'); // 'link' ou 'file'
  const [litigeFile, setLitigeFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  const fetchCompetition = useCallback(async () => {
    try {
      setLoading(true);
      const data = await competitionAPI.getCompetition(id);
      setCompetition(data);
    } catch (error) {
      console.error('Erreur récupération compétition:', error);
      setError('Erreur lors du chargement de la compétition');
    } finally {
      setLoading(false);
    }
  }, [id]);

  const fetchUserClubs = useCallback(async () => {
    if (user) {
      try {
        const clubs = await clubAPI.getMyClubs(user.token);
        setUserClubs(clubs);
      } catch (error) {
        console.error('Erreur récupération clubs:', error);
        setUserClubs([]);
      }
    } else {
      setUserClubs([]);
    }
  }, [user]);

  // Fonction pour organiser les matchs par journées (pour championnats)
  const organizeMatchesByJournee = (matchs, nombreEquipes) => {
    if (!matchs || matchs.length === 0) return [];
    
    const matchsParJournee = [];
    const nombreMatchsParJournee = Math.floor(nombreEquipes / 2);
    
    // Pour un championnat aller-retour, on a nombre_equipes - 1 journées d'aller
    // et nombre_equipes - 1 journées de retour
    const nombreJourneesAller = nombreEquipes - 1;
    const nombreJourneesTotal = nombreJourneesAller * 2; // Aller + Retour
    
    for (let journee = 1; journee <= nombreJourneesTotal; journee++) {
      const startIndex = (journee - 1) * nombreMatchsParJournee;
      const endIndex = startIndex + nombreMatchsParJournee;
      const matchsJournee = matchs.slice(startIndex, endIndex);
      
      if (matchsJournee.length > 0) {
        const isRetour = journee > nombreJourneesAller;
        const journeeLabel = isRetour 
          ? `Journée ${journee - nombreJourneesAller} (Retour)`
          : `Journée ${journee} (Aller)`;
          
        matchsParJournee.push({
          numero: journee,
          label: journeeLabel,
          matchs: matchsJournee,
          isRetour: isRetour
        });
      }
    }
    
    return matchsParJournee;
  };

  useEffect(() => {
    fetchCompetition();
    fetchUserClubs();
  }, [fetchCompetition, fetchUserClubs]);

  const handleScoreSubmit = async () => {
    try {
      await competitionAPI.mettreAJourScore(id, selectedMatch._id, scoreData, user.token);
      setShowScoreModal(false);
      setSelectedMatch(null);
      setScoreData({
        score1: '',
        score2: '',
        buteurs: [],
        passeurs: [],
        cartonsJaunes: [],
        cartonsRouges: [],
        captureEcran: ''
      });
      fetchCompetition(); // Recharger les données
      alert('Score mis à jour avec succès');
    } catch (error) {
      console.error('Erreur mise à jour score:', error);
      alert('Erreur lors de la mise à jour du score');
    }
  };

  const handleLitigeSubmit = async () => {
    try {
      setSubmittingLitige(true);
      let finalPreuveVideo = litigeData.preuveVideo;

      // 1. Si mode d'upload fichier est activé et qu'un fichier est sélectionné
      if (litigeUploadMode === 'file' && litigeFile) {
        const uploadUrl = `${process.env.NODE_ENV === 'production' ? 'https://club-pro-commu.onrender.com/api' : 'http://localhost:3001/api'}/competitions/${id}/matchs/${selectedMatchForLitige._id}/upload-video`;
        
        const formData = new FormData();
        formData.append('video', litigeFile);

        const xhr = new XMLHttpRequest();
        
        const uploadPromise = new Promise((resolve, reject) => {
          xhr.upload.addEventListener('progress', (event) => {
            if (event.lengthComputable) {
              const progress = Math.round((event.loaded / event.total) * 100);
              setUploadProgress(progress);
            }
          });

          xhr.addEventListener('load', () => {
            if (xhr.status >= 200 && xhr.status < 300) {
              try {
                const response = JSON.parse(xhr.responseText);
                resolve(response);
              } catch (e) {
                reject(new Error('Réponse invalide du serveur'));
              }
            } else {
              reject(new Error(`Erreur lors du chargement de la vidéo`));
            }
          });

          xhr.addEventListener('error', () => reject(new Error('Erreur réseau')));
          xhr.addEventListener('abort', () => reject(new Error('Chargement annulé')));

          xhr.open('POST', uploadUrl);
          xhr.setRequestHeader('Authorization', `Bearer ${user.token}`);
          xhr.send(formData);
        });

        const uploadResult = await uploadPromise;
        if (uploadResult && uploadResult.success) {
          finalPreuveVideo = uploadResult.videoUrl;
        } else {
          throw new Error('Impossible d\'obtenir l\'URL de la vidéo');
        }
      }

      // 2. Envoyer le litige avec l'URL finale
      const url = `${process.env.NODE_ENV === 'production' ? 'https://club-pro-commu.onrender.com/api' : 'http://localhost:3001/api'}/competitions/${id}/matchs/${selectedMatchForLitige._id}/litige`;
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`
        },
        body: JSON.stringify({
          description: litigeData.description,
          preuveVideo: finalPreuveVideo
        })
      });

      if (!response.ok) {
        throw new Error('Erreur lors du signalement');
      }

      setShowLitigeModal(false);
      setSelectedMatchForLitige(null);
      setLitigeData({ description: '', preuveVideo: '' });
      setLitigeFile(null);
      setUploadProgress(0);
      fetchCompetition();
      alert('Litige signalé avec succès. L\'administrateur va examiner le match.');
    } catch (error) {
      console.error('Erreur signalement litige:', error);
      alert('Erreur lors du signalement du litige : ' + error.message);
    } finally {
      setSubmittingLitige(false);
    }
  };

  // eslint-disable-next-line no-unused-vars
  const openLitigeModal = (match) => {
    setSelectedMatchForLitige(match);
    setLitigeData({ description: '', preuveVideo: '' });
    setLitigeFile(null);
    setLitigeUploadMode('link');
    setUploadProgress(0);
    setShowLitigeModal(true);
  };

  const openScoreModal = (match) => {
    setSelectedMatch(match);
    setScoreData({
      score1: match.score1 || '',
      score2: match.score2 || '',
      buteurs: match.stats?.buteurs || [],
      passeurs: match.stats?.passeurs || [],
      cartonsJaunes: match.stats?.cartonsJaunes || [],
      cartonsRouges: match.stats?.cartonsRouges || [],
      captureEcran: match.captureEcran || ''
    });
    setShowScoreModal(true);
  };



  // Fonction pour obtenir les joueurs du club de l'admin connecté
  const getJoueursClubAdmin = (match) => {
    if (!user || !userClubs || userClubs.length === 0) {
      return [];
    }

    // Trouver le club dont l'utilisateur est admin et qui participe au match
    const team1Id = typeof match.equipe1 === 'object' ? match.equipe1._id : match.equipe1;
    const team2Id = typeof match.equipe2 === 'object' ? match.equipe2._id : match.equipe2;

    // Chercher dans les clubs de l'utilisateur
    for (const club of userClubs) {
      const clubId = typeof club._id === 'object' ? club._id.toString() : club._id;
      const isMatchClub = clubId === team1Id || clubId === team2Id;
      
      if (isMatchClub) {
        // Vérifier que l'utilisateur est admin de ce club
        const isAdmin = club.membres.some(member => {
          const memberId = typeof member.userId === 'object' ? member.userId._id : member.userId;
          return memberId === user._id && member.role === 'Admin';
        });

        if (isAdmin && club.membres) {
          // Retourner les membres de ce club uniquement
          return club.membres
            .filter(membre => membre.userId && membre.userId.pseudo)
            .map(membre => ({
              pseudo: membre.userId.pseudo,
              equipe: club.nom || 'Mon Club',
              role: membre.role,
              userId: membre.userId._id || membre.userId
            }));
        }
      }
    }

    // Si pas trouvé dans userClubs, chercher dans les équipes inscrites de la compétition
    if (competition && competition.equipesInscrites) {
      for (const equipe of competition.equipesInscrites) {
        if (!equipe.clubId) continue;
        
        const clubId = typeof equipe.clubId === 'object' ? equipe.clubId._id : equipe.clubId;
        const isMatchClub = clubId === team1Id || clubId === team2Id;
        
        if (isMatchClub) {
          // Vérifier si l'utilisateur est admin de ce club
          const isAdmin = equipe.clubId.membres && equipe.clubId.membres.some(member => {
            const memberId = typeof member.userId === 'object' ? member.userId._id : member.userId;
            return memberId === user._id && member.role === 'Admin';
          });

          if (isAdmin && equipe.clubId.membres) {
            return equipe.clubId.membres
              .filter(membre => membre.userId && membre.userId.pseudo)
              .map(membre => ({
                pseudo: membre.userId.pseudo,
                equipe: equipe.clubId.nom || 'Mon Club',
                role: membre.role,
                userId: membre.userId._id || membre.userId
              }));
          }
        }
      }
    }

    return [];
  };

  // Calculer la profondeur maximale du tas (le nombre de rounds)
  const getMaxDepth = () => {
    if (!competition?.matchsElimination || competition.matchsElimination.length === 0) return 1;
    // Exclure la Petite finale du calcul de profondeur
    const tourMatches = competition.matchsElimination.filter(m => m.phase !== 'Petite finale');
    if (tourMatches.length === 0) return 1;
    const maxTour = tourMatches.reduce((max, m) => Math.max(max, m.tour), 0);
    if (maxTour >= 31) return 6; // 32e
    if (maxTour >= 15) return 5; // 16e
    if (maxTour >= 7) return 4;  // 8e
    if (maxTour >= 3) return 3;  // Quart
    if (maxTour >= 1) return 2;  // Demi
    return 1; // Finale
  };

  // Fonction de rendu récursif de l'arbre (tas binaire)
  const renderBracketNode = (index, currentDepth = 1, maxDepth = 1) => {
    // Trouver les matchs avec le tour égal à index et qui n'est pas la petite finale
    const matches = competition.matchsElimination.filter(m => m.tour === index && m.phase !== 'Petite finale');
    
    // Vérifier si cette branche contient des matchs réels (en ignorant la petite finale)
    const hasMatchesInBranch = competition.matchsElimination.some(m => {
      if (m.phase === 'Petite finale') return false;
      if (m.tour === index) return true;
      let parent = m.tour;
      while (parent > index) {
        parent = Math.floor((parent - 1) / 2);
      }
      return parent === index;
    });
    
    // Si aucun match n'existe dans cette branche, on ne l'affiche pas
    if (!hasMatchesInBranch) {
      return null;
    }

    const isLeaf = currentDepth === maxDepth;

    return (
      <div className="bracket-node" key={index}>
        {!isLeaf && (
          <div className="bracket-children">
            {renderBracketNode(2 * index + 1, currentDepth + 1, maxDepth)}
            {renderBracketNode(2 * index + 2, currentDepth + 1, maxDepth)}
          </div>
        )}
        <div className="bracket-match-wrapper">
          {matches.map((match, mIdx) => (
            <Link key={mIdx} to={`/competition/${id}/match/${match._id}`} className="text-decoration-none d-block mb-2">
              <div className={`match-card-container ${match.statut.toLowerCase()} ${match.litige ? 'border-warning shadow-lg' : ''}`} style={{ cursor: 'pointer' }}>
                <div className="match-card-header">
                  <span className="match-card-date">
                    {match.type === 'aller' ? '🟢 Aller • ' : match.type === 'retour' ? '🔴 Retour • ' : ''}
                    {match.dateMatch ? (
                      <>
                        <i className="far fa-calendar-alt me-1"></i>
                        {new Date(match.dateMatch).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
                      </>
                    ) : (
                      'À programmer'
                    )}
                  </span>
                  <span className={`match-card-status badge ${getMatchStatus(match)}`}>
                    {getMatchStatusText(match)}
                  </span>
                  {getLitigeBadge(match)}
                </div>
                
                {match.litige && (
                  <div className="bg-warning text-dark text-center py-1 px-2 small font-weight-bold" style={{ fontSize: '0.85em' }}>
                    <i className="fas fa-exclamation-triangle me-1 animate-pulse"></i>
                    LITIGE EN COURS
                  </div>
                )}
                
                <div className="match-card-teams">
                  {/* Équipe 1 */}
                  <div className={`match-card-team ${match.statut === 'Terminé' && match.score1 > match.score2 ? 'winner' : ''}`}>
                    <span className="match-card-team-name" title={match.equipe1?.nom || 'TBD'}>
                      {match.equipe1?.nom || 'TBD'}
                    </span>
                    {match.statut === 'Terminé' && (
                      <span className="match-card-team-score">{match.score1}</span>
                    )}
                  </div>
                  
                  {/* Équipe 2 */}
                  <div className={`match-card-team ${match.statut === 'Terminé' && match.score2 > match.score1 ? 'winner' : ''}`}>
                    <span className="match-card-team-name" title={match.equipe2?.nom || 'TBD'}>
                      {match.equipe2?.nom || 'TBD'}
                    </span>
                    {match.statut === 'Terminé' && (
                      <span className="match-card-team-score">{match.score2}</span>
                    )}
                  </div>
                </div>

                {/* Actions de saisie score / date */}
                <div className="match-card-actions">
                  {match.statut === 'Programmé' && canEditMatchScore(match) && (
                    <button 
                      className="btn btn-primary btn-sm"
                      onClick={(e) => { e.preventDefault(); e.stopPropagation(); openScoreModal(match); }}
                    >
                      <i className="fas fa-edit me-1"></i>
                      Score
                    </button>
                  )}
                </div>
              </div>
            </Link>
          ))}

          {/* Affichage du score cumulé si les deux matchs sont terminés */}
          {matches.length === 2 && matches[0].statut === 'Terminé' && matches[1].statut === 'Terminé' && (() => {
            const mAller = matches.find(m => m.type === 'aller') || matches[0];
            const mRetour = matches.find(m => m.type === 'retour') || matches[1];
            
            // Équipe A du match aller
            const teamA = mAller.equipe1;
            const teamB = mAller.equipe2;
            
            const scoreA_aller = mAller.score1;
            const scoreB_aller = mAller.score2;
            
            let scoreA_retour = 0;
            let scoreB_retour = 0;
            const t1Id = mRetour.equipe1?._id || mRetour.equipe1;
            const tAId = teamA?._id || teamA;
            if (t1Id?.toString() === tAId?.toString()) {
              scoreA_retour = mRetour.score1;
              scoreB_retour = mRetour.score2;
            } else {
              scoreA_retour = mRetour.score2;
              scoreB_retour = mRetour.score1;
            }
            
            const totalA = scoreA_aller + scoreA_retour;
            const totalB = scoreB_aller + scoreB_retour;
            
            return (
              <div className="text-center small py-1 px-2 rounded font-rajdhani fw-bold text-white bg-black bg-opacity-40 border border-secondary border-opacity-10 mt-1" style={{ fontSize: '0.82rem' }}>
                <span className="text-muted me-1">CUMUL :</span>
                <span className="text-info">{teamA?.nom || 'TBD'}</span>
                <span className="mx-2 text-warning">{totalA} - {totalB}</span>
                <span className="text-info">{teamB?.nom || 'TBD'}</span>
              </div>
            );
          })()}
          {matches.length === 0 && (
            <div className="match-card-placeholder">
              <i className="fas fa-clock me-1"></i>
              Match en attente
            </div>
          )}
        </div>
      </div>
    );
  };



  // Fonction pour ouvrir la modale de sélection de joueur
  const openJoueurModal = (type) => {
    setJoueurModalType(type);
    setSelectedJoueur('');
    setJoueurQuantite(1);
    setShowJoueurModal(true);
  };

  // Fonction pour générer le bracket d'élimination
  const handleGenerateBracket = async () => {
    try {
      setGeneratingBracket(true);
      await competitionAPI.genererElimination(id);
      
      // Recharger la compétition pour voir les nouveaux matchs
      await fetchCompetition();
      
      alert('Bracket d\'élimination généré avec succès !');
    } catch (error) {
      console.error('Erreur génération bracket:', error);
      alert('Erreur lors de la génération du bracket');
    } finally {
      setGeneratingBracket(false);
    }
  };

  // Fonction pour ajouter un joueur via la modale
  const handleJoueurSubmit = () => {
    if (!selectedJoueur) return;

    // Utiliser la liste des joueurs du club de l'admin
    const joueurs = getJoueursClubAdmin(selectedMatch);
    const joueur = joueurs.find(j => j.pseudo === selectedJoueur);
    
    if (joueur) {
      if (joueurModalType === 'buteur') {
        setScoreData(prev => ({
          ...prev,
          buteurs: [...prev.buteurs, { joueur: selectedJoueur, buts: joueurQuantite }]
        }));
      } else if (joueurModalType === 'passeur') {
        setScoreData(prev => ({
          ...prev,
          passeurs: [...prev.passeurs, { joueur: selectedJoueur, passes: joueurQuantite }]
        }));
      } else if (joueurModalType === 'cartonJaune') {
        setScoreData(prev => ({
          ...prev,
          cartonsJaunes: [...prev.cartonsJaunes, selectedJoueur]
        }));
      } else if (joueurModalType === 'cartonRouge') {
        setScoreData(prev => ({
          ...prev,
          cartonsRouges: [...prev.cartonsRouges, selectedJoueur]
        }));
      }
    }
    
    setShowJoueurModal(false);
  };

  const addButeur = () => {
    if (!selectedMatch) return;
    openJoueurModal('buteur');
  };

  const addPasseur = () => {
    if (!selectedMatch) return;
    openJoueurModal('passeur');
  };

  const addCarton = (type) => {
    if (!selectedMatch) return;
    openJoueurModal(type === 'jaune' ? 'cartonJaune' : 'cartonRouge');
  };

  const openDateModal = (match) => {
    setSelectedMatchForDate(match);
    setMatchDate(match.dateMatch ? new Date(match.dateMatch).toISOString().slice(0, 16) : '');
    setShowDateModal(true);
  };

  const handleDateSubmit = async () => {
    try {
      await competitionAPI.programmerMatch(id, selectedMatchForDate._id, matchDate, user.token);
      setShowDateModal(false);
      setSelectedMatchForDate(null);
      setMatchDate('');
      fetchCompetition(); // Recharger les données
      alert('Date programmée avec succès');
    } catch (error) {
      console.error('Erreur programmation date:', error);
      alert('Erreur lors de la programmation de la date');
    }
  };

  const getMatchStatus = (match) => {
    if (match.statut === 'Terminé') return 'bg-success text-white';
    if (match.statut === 'En cours') return 'bg-primary text-white';
    if (match.statut === 'Annulé') return 'bg-danger text-white';
    return 'bg-secondary text-white';
  };

  const getMatchStatusText = (match) => {
    if (match.statut === 'Terminé') return 'Terminé';
    if (match.statut === 'En cours') return 'En cours';
    if (match.statut === 'Annulé') return 'Annulé';
    return 'Programmé';
  };

  const getLitigeBadge = (match) => {
    if (match.litige) {
      return <span className="badge bg-danger text-white ms-1" style={{ fontSize: '0.7rem' }}><i className="fas fa-exclamation-triangle me-1 animate-pulse"></i>Litige</span>;
    }
    if (match.litigeDetails && match.litigeDetails.statut && match.litigeDetails.statut !== 'En attente') {
      return <span className="badge bg-info text-white ms-1" style={{ fontSize: '0.7rem' }}><i className="fas fa-gavel me-1"></i>Arbitré</span>;
    }
    return null;
  };



  // Fonction helper pour comparer les IDs utilisateur
  const compareUserIds = (userId1, userId2) => {
    const id1 = typeof userId1 === 'object' ? userId1._id : userId1;
    const id2 = typeof userId2 === 'object' ? userId2._id : userId2;
    return id1 === id2;
  };

  // Fonction helper pour comparer les IDs de clubs
  const compareClubIds = (clubId1, clubId2) => {
    const id1 = typeof clubId1 === 'object' ? clubId1._id : clubId1;
    const id2 = typeof clubId2 === 'object' ? clubId2._id : clubId2;
    return id1 === id2;
  };

  // Fonction pour vérifier si l'utilisateur peut saisir le score d'un match
  const canEditMatchScore = (match) => {
    if (!user) return false;

    // 1. Admin du site
    if (user.isAdmin) return true;

    // 2. Créateur de la compétition
    if (competition && competition.createurId) {
      const competitionCreatorId = typeof competition.createurId === 'object' ? competition.createurId._id : competition.createurId;
      if (competitionCreatorId === user._id) return true;
    }

    // 3. Admin d'un des clubs concernés par le match
    if (!match.equipe1 || !match.equipe2) return false;

    // Obtenir les IDs des équipes du match
    const team1Id = typeof match.equipe1 === 'object' ? match.equipe1._id : match.equipe1;
    const team2Id = typeof match.equipe2 === 'object' ? match.equipe2._id : match.equipe2;

    // Vérifier si l'utilisateur est admin d'un des clubs du match
    const isAdminOfMatchTeam = userClubs.some(club => {
      const clubId = typeof club._id === 'object' ? club._id.toString() : club._id;
      const isMatchClub = clubId === team1Id || clubId === team2Id;
      
      if (!isMatchClub) return false;
      
      // Vérifier si l'utilisateur est admin de ce club
      return club.membres.some(member => {
        const memberId = typeof member.userId === 'object' ? member.userId._id : member.userId;
        return memberId === user._id && member.role === 'Admin';
      });
    });

    return isAdminOfMatchTeam;
  };

  // eslint-disable-next-line no-unused-vars
  const canReportDispute = (match) => {
    if (!user) return false;
    if (user.isAdmin) return true;
    if (!match.equipe1 || !match.equipe2) return false;

    // Obtenir les IDs des équipes du match
    const team1Id = typeof match.equipe1 === 'object' ? match.equipe1._id : match.equipe1;
    const team2Id = typeof match.equipe2 === 'object' ? match.equipe2._id : match.equipe2;

    return userClubs.some(club => {
      const clubId = typeof club._id === 'object' ? club._id.toString() : club._id;
      const isMatchClub = clubId === team1Id || clubId === team2Id;
      
      if (!isMatchClub) return false;
      
      return club.membres.some(member => {
        const memberId = typeof member.userId === 'object' ? member.userId._id : member.userId;
        return memberId === user._id && (member.role === 'Admin' || member.role === 'Capitaine');
      });
    });
  };

  const getActiveMatchesForUser = () => {
    if (!competition || !userClubs || userClubs.length === 0) return [];
    
    const allMatches = [];
    if (competition.poules) {
      competition.poules.forEach(p => {
        if (p.matchs) allMatches.push(...p.matchs);
      });
    }
    if (competition.matchsElimination) {
      allMatches.push(...competition.matchsElimination);
    }
    
    return allMatches.filter(m => {
      if (!m || m.statut === 'Terminé' || m.statut === 'Annulé') return false;
      if (!m.equipe1 || !m.equipe2) return false;
      
      const id1 = m.equipe1._id || m.equipe1;
      const id2 = m.equipe2._id || m.equipe2;
      
      return userClubs.some(club => compareClubIds(club._id, id1) || compareClubIds(club._id, id2));
    });
  };

  if (loading) {
    return (
      <div className="container py-5">
        <div className="text-center">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Chargement...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container py-5">
        <div className="alert alert-danger">
          <i className="fas fa-exclamation-triangle me-2"></i>
          {error}
        </div>
      </div>
    );
  }

  if (!competition) {
    return (
      <div className="container py-5">
        <div className="alert alert-danger">
          <i className="fas fa-exclamation-triangle me-2"></i>
          Compétition non trouvée
        </div>
      </div>
    );
  }

  return (
    <div className="matches-page-container container py-5">
      <style>{matchesPageStyles}</style>
      {/* Header */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="d-flex matches-page-header" style={{ alignItems: 'center', justifyContent: 'space-between' }}>
            <div className="header-left">
              <Link to={`/competition/${id}`} className="btn btn-outline-secondary matches-back-btn">
                <i className="fas fa-arrow-left me-2"></i>
                Retour
              </Link>
              <h1 className="matches-page-title mb-0 d-inline-block ms-3">
                <i className="fas fa-calendar-alt me-2" style={{ opacity: 0.7 }}></i>
                Calendrier
                <span className="competition-name ms-1">{competition.nom}</span>
              </h1>
            </div>
            <div className="header-right">
              <span className={`badge ${getMatchStatusText(competition.statut) === 'Terminé' ? 'bg-success' : 'bg-warning text-dark'}`}>
                {competition.statut}
              </span>
            </div>
          </div>
        </div>
      </div>



      {/* Salons de Match en Direct (Lobbies) */}
      {competition.statut === 'En cours' && (
        <div className="row mb-4">
          <div className="col-12">
            {getActiveMatchesForUser().map(m => (
              <LiveMatchLobby 
                key={m._id}
                match={m}
                competitionId={id}
                userClubs={userClubs}
                userId={user?._id}
                isAdmin={user?.isAdmin || (competition.createurId?._id === user?._id || competition.createurId === user?._id)}
                onRefresh={fetchCompetition}
              />
            ))}
            
            {/* Si l'utilisateur est admin et qu'aucun match n'est le sien, ou pour administrer tous les matchs en cours */}
            {(user?.isAdmin || (competition.createurId?._id === user?._id || competition.createurId === user?._id)) && getActiveMatchesForUser().length === 0 && (
              <div className="card bg-dark bg-opacity-50 text-white border-secondary p-3 mb-4">
                <div className="card-body">
                  <h5 className="text-warning"><i className="fas fa-shield-alt me-2"></i>Administration des matchs en cours</h5>
                  <p className="text-muted small">Aucun de vos clubs n'a de match actif en ce moment, mais en tant qu'administrateur de la compétition, vous pouvez superviser ou déclarer forfait sur les matchs actifs ci-dessous.</p>
                  
                  {(() => {
                    const allActive = [];
                    if (competition.poules) {
                      competition.poules.forEach(p => {
                        if (p.matchs) allActive.push(...p.matchs);
                      });
                    }
                    if (competition.matchsElimination) {
                      allActive.push(...competition.matchsElimination);
                    }
                    const activeMatchs = allActive.filter(m => m && m.statut !== 'Terminé' && m.statut !== 'Annulé' && m.equipe1 && m.equipe2);
                    
                    if (activeMatchs.length === 0) {
                      return <span className="text-muted small">Aucun match n'est en cours pour le moment.</span>;
                    }
                    
                    return (
                      <div className="row g-3">
                        {activeMatchs.map(m => (
                          <div key={m._id} className="col-12">
                            <LiveMatchLobby 
                              match={m}
                              competitionId={id}
                              userClubs={userClubs}
                              userId={user?._id}
                              isAdmin={true}
                              onRefresh={fetchCompetition}
                            />
                          </div>
                        ))}
                      </div>
                    );
                  })()}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Matchs (Poules ou Championnat) */}
      {competition.poules && competition.poules.length > 0 && (
        <div className="row mb-4">
          <div className="col-12">
            <h3>
              <i className="fas fa-calendar-alt me-2"></i>
              {competition.type === 'championnat' ? 'Calendrier du championnat' : 'Phases de poules'}
            </h3>
            {competition.poules.map((poule, pouleIndex) => (
              <div key={pouleIndex} className="card mb-3">
                <div className="card-header">
                  <h5 className="mb-0">
                    <i className={`fas ${competition.type === 'championnat' ? 'fa-trophy' : 'fa-users'} me-2`}></i>
                    {competition.type === 'championnat' ? 'Matchs du championnat' : poule.nom}
                  </h5>
                </div>
                <div className="card-body">
                  {poule.matchs && poule.matchs.length > 0 ? (
                    competition.type === 'championnat' ? (
                      // Affichage par journées pour championnats
                      (() => {
                        const journees = organizeMatchesByJournee(poule.matchs, competition.equipesInscrites.length);
                        return journees.map((journee, journeeIndex) => (
                          <div key={journeeIndex} className="mb-4">
                            <h6 className={`bg-${journee.isRetour ? 'info' : 'primary'} text-white p-2 rounded`}>
                              <i className="fas fa-calendar-day me-2"></i>
                              {journee.label}
                            </h6>
                            {/* Version Desktop : Tableau classique */}
                            <div className="table-responsive d-none d-md-block">
                              <table className="table gaming-table">
                                <thead>
                                  <tr>
                                    <th>Date</th>
                                    <th>Équipe 1</th>
                                    <th className="text-center">Score</th>
                                    <th>Équipe 2</th>
                                    <th>Statut</th>
                                    <th className="text-end">Actions</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {journee.matchs.map((match, matchIndex) => (
                                    <tr key={matchIndex} style={{cursor:'pointer'}} onClick={() => window.location.href=`/competition/${id}/match/${match._id}`}>
                                      <td>
                                        {match.dateMatch ? 
                                          new Date(match.dateMatch).toLocaleDateString('fr-FR') : 
                                          'À programmer'
                                        }
                                      </td>
                                      <td>
                                        <strong className="text-white">{match.equipe1?.nom || 'TBD'}</strong>
                                      </td>
                                      <td className="text-center">
                                        {match.statut === 'Terminé' ? (
                                          <span className="badge bg-success font-rajdhani px-3 py-1">
                                            {match.score1} - {match.score2}
                                          </span>
                                        ) : (
                                          <span className="text-muted font-rajdhani">-</span>
                                        )}
                                      </td>
                                      <td>
                                        <strong className="text-white">{match.equipe2?.nom || 'TBD'}</strong>
                                      </td>
                                      <td>
                                        <span className={`badge ${getMatchStatus(match)}`}>
                                          {getMatchStatusText(match)}
                                        </span>
                                        {getLitigeBadge(match)}
                                      </td>
                                      <td className="text-end">
                                        <div className="btn-group" role="group">
                                          {!match.dateMatch && (user?.isAdmin || 
                                            userClubs.some(club => 
                                              (compareClubIds(club._id, match.equipe1) || compareClubIds(club._id, match.equipe2)) &&
                                              club.membres.some(m => compareUserIds(m.userId, user) && m.role === 'Admin')
                                            )) && (
                                            <button 
                                              className="btn btn-sm btn-outline-secondary"
                                              onClick={() => openDateModal(match)}
                                              title="Programmer une date"
                                            >
                                              <i className="fas fa-calendar-plus me-1"></i>
                                              Programmer
                                            </button>
                                          )}
                                          {match.statut === 'Programmé' && canEditMatchScore(match) && (
                                            <button 
                                              className="btn btn-sm btn-primary"
                                              onClick={() => openScoreModal(match)}
                                            >
                                              <i className="fas fa-edit me-1"></i>
                                              Saisir score
                                            </button>
                                          )}
                                          {match.statut === 'Terminé' && (
                                            <button 
                                              className="btn btn-sm btn-outline-primary"
                                              onClick={() => openScoreModal(match)}
                                            >
                                              <i className="fas fa-eye me-1"></i>
                                              {canEditMatchScore(match) ? 'Modifier' : 'Détails'}
                                            </button>
                                          )}
                                        </div>
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>

                            {/* Version Mobile : Cartes de matchs responsives */}
                            <div className="d-md-none">
                              {journee.matchs.map((match, matchIndex) => (
                                <Link key={matchIndex} to={`/competition/${id}/match/${match._id}`} style={{textDecoration:'none',display:'block'}}>
                                <div className="gaming-mobile-match-card" style={{cursor:'pointer'}}>
                                  <div className="d-flex justify-content-between align-items-center mb-2 pb-2 border-bottom border-secondary border-opacity-25">
                                    <span className="small text-muted">
                                      <i className="far fa-calendar-alt me-1"></i>
                                      {match.dateMatch ? 
                                        new Date(match.dateMatch).toLocaleDateString('fr-FR') : 
                                        'À programmer'
                                      }
                                    </span>
                                    <span className={`badge ${getMatchStatus(match)}`}>
                                      {getMatchStatusText(match)}
                                    </span>
                                    {getLitigeBadge(match)}
                                  </div>
                                  
                                  <div className="d-flex align-items-center justify-content-between my-3">
                                    <div className="team-container text-start text-truncate text-white">
                                      {match.equipe1?.nom || 'TBD'}
                                    </div>
                                    
                                    <div className="vs-score-container">
                                      {match.statut === 'Terminé' ? (
                                        <span className="badge bg-success font-rajdhani px-3 py-1">
                                          {match.score1} - {match.score2}
                                        </span>
                                      ) : (
                                        <span className="text-muted font-rajdhani">VS</span>
                                      )}
                                    </div>
                                    
                                    <div className="team-container text-end text-truncate text-white">
                                      {match.equipe2?.nom || 'TBD'}
                                    </div>
                                  </div>
                                  
                                  <div className="d-flex gap-2 mt-2">
                                    {!match.dateMatch && (user?.isAdmin || 
                                      userClubs.some(club => 
                                        (compareClubIds(club._id, match.equipe1) || compareClubIds(club._id, match.equipe2)) &&
                                        club.membres.some(m => compareUserIds(m.userId, user) && m.role === 'Admin')
                                      )) && (
                                      <button 
                                        className="btn btn-sm btn-outline-secondary w-100 py-2"
                                        onClick={(e) => { e.preventDefault(); openDateModal(match); }}
                                      >
                                        <i className="fas fa-calendar-plus me-1"></i>
                                        Programmer
                                      </button>
                                    )}
                                    {match.statut === 'Programmé' && canEditMatchScore(match) && (
                                      <button 
                                        className="btn btn-sm btn-primary w-100 py-2"
                                        onClick={(e) => { e.preventDefault(); openScoreModal(match); }}
                                      >
                                        <i className="fas fa-edit me-1"></i>
                                        Saisir score
                                      </button>
                                    )}
                                    {match.statut === 'Terminé' && (
                                      <button 
                                        className="btn btn-sm btn-outline-primary w-100 py-2"
                                        onClick={(e) => { e.preventDefault(); openScoreModal(match); }}
                                      >
                                        <i className="fas fa-eye me-1"></i>
                                        {canEditMatchScore(match) ? 'Modifier' : 'Détails'}
                                      </button>
                                    )}
                                  </div>
                                </div>
                                </Link>
                              ))}
                            </div>
                          </div>
                        ));
                      })()
                    ) : (
                      // Affichage classique pour les phases de poules
                      <>
                        {/* Version Desktop : Tableau classique */}
                        <div className="table-responsive d-none d-md-block">
                          <table className="table gaming-table">
                            <thead>
                              <tr>
                                <th>Date</th>
                                <th>Équipe 1</th>
                                <th className="text-center">Score</th>
                                <th>Équipe 2</th>
                                <th>Statut</th>
                                <th className="text-end">Actions</th>
                              </tr>
                            </thead>
                            <tbody>
                              {poule.matchs.map((match, matchIndex) => (
                                <tr key={matchIndex} style={{cursor:'pointer'}} onClick={() => window.location.href=`/competition/${id}/match/${match._id}`}>
                                  <td>
                                    {match.dateMatch ? 
                                      new Date(match.dateMatch).toLocaleDateString('fr-FR') : 
                                      'À programmer'
                                    }
                                  </td>
                                  <td>
                                    <strong className="text-white">{match.equipe1?.nom || 'TBD'}</strong>
                                  </td>
                                  <td className="text-center">
                                    {match.statut === 'Terminé' ? (
                                      <span className="badge bg-success font-rajdhani px-3 py-1">
                                        {match.score1} - {match.score2}
                                      </span>
                                    ) : (
                                      <span className="text-muted font-rajdhani">-</span>
                                    )}
                                  </td>
                                  <td>
                                    <strong className="text-white">{match.equipe2?.nom || 'TBD'}</strong>
                                  </td>
                                  <td>
                                    <span className={`badge ${getMatchStatus(match)}`}>
                                      {getMatchStatusText(match)}
                                    </span>
                                    {getLitigeBadge(match)}
                                  </td>
                                  <td className="text-end">
                                    <div className="btn-group" role="group">
                                      {!match.dateMatch && (user?.isAdmin || 
                                        userClubs.some(club => 
                                          (compareClubIds(club._id, match.equipe1) || compareClubIds(club._id, match.equipe2)) &&
                                          club.membres.some(m => compareUserIds(m.userId, user) && m.role === 'Admin')
                                        )) && (
                                        <button 
                                          className="btn btn-sm btn-outline-secondary"
                                          onClick={() => openDateModal(match)}
                                          title="Programmer une date"
                                        >
                                          <i className="fas fa-calendar-plus me-1"></i>
                                          Programmer
                                        </button>
                                      )}
                                      {match.statut === 'Programmé' && canEditMatchScore(match) && (
                                        <button 
                                          className="btn btn-sm btn-primary"
                                          onClick={() => openScoreModal(match)}
                                        >
                                          <i className="fas fa-edit me-1"></i>
                                          Saisir score
                                        </button>
                                      )}
                                      {match.statut === 'Terminé' && (
                                        <button 
                                          className="btn btn-sm btn-outline-primary"
                                          onClick={() => openScoreModal(match)}
                                        >
                                          <i className="fas fa-eye me-1"></i>
                                          {canEditMatchScore(match) ? 'Modifier' : 'Détails'}
                                        </button>
                                      )}
                                    </div>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>

                        {/* Version Mobile : Cartes de matchs responsives */}
                        <div className="d-md-none">
                          {poule.matchs.map((match, matchIndex) => (
                             <Link key={matchIndex} to={`/competition/${id}/match/${match._id}`} style={{textDecoration:'none',display:'block'}}>
                             <div className="gaming-mobile-match-card" style={{cursor:'pointer'}}>
                              <div className="d-flex justify-content-between align-items-center mb-2 pb-2 border-bottom border-secondary border-opacity-25">
                                <span className="small text-muted">
                                  <i className="far fa-calendar-alt me-1"></i>
                                  {match.dateMatch ? 
                                    new Date(match.dateMatch).toLocaleDateString('fr-FR') : 
                                    'À programmer'
                                  }
                                </span>
                                <div className="d-flex gap-1">
                                  <span className={`badge ${getMatchStatus(match)}`}>
                                    {getMatchStatusText(match)}
                                  </span>
                                  {getLitigeBadge(match)}
                                </div>
                              </div>
                              
                              <div className="d-flex align-items-center justify-content-between my-3">
                                <div className="team-container text-start text-truncate text-white">
                                  {match.equipe1?.nom || 'TBD'}
                                </div>
                                
                                <div className="vs-score-container">
                                  {match.statut === 'Terminé' ? (
                                    <span className="badge bg-success font-rajdhani px-3 py-1">
                                      {match.score1} - {match.score2}
                                    </span>
                                  ) : (
                                    <span className="text-muted font-rajdhani">VS</span>
                                  )}
                                </div>
                                
                                <div className="team-container text-end text-truncate text-white">
                                  {match.equipe2?.nom || 'TBD'}
                                </div>
                              </div>
                              
                              <div className="d-flex gap-2 mt-2">
                                {!match.dateMatch && (user?.isAdmin || 
                                  userClubs.some(club => 
                                    (compareClubIds(club._id, match.equipe1) || compareClubIds(club._id, match.equipe2)) &&
                                    club.membres.some(m => compareUserIds(m.userId, user) && m.role === 'Admin')
                                  )) && (
                                  <button 
                                    className="btn btn-sm btn-outline-secondary w-100 py-2"
                                    onClick={(e) => { e.preventDefault(); openDateModal(match); }}
                                  >
                                    <i className="fas fa-calendar-plus me-1"></i>
                                    Programmer
                                  </button>
                                )}
                                {match.statut === 'Programmé' && canEditMatchScore(match) && (
                                  <button 
                                    className="btn btn-sm btn-primary w-100 py-2"
                                    onClick={(e) => { e.preventDefault(); openScoreModal(match); }}
                                  >
                                    <i className="fas fa-edit me-1"></i>
                                    Saisir score
                                  </button>
                                )}
                                {match.statut === 'Terminé' && (
                                  <button 
                                    className="btn btn-sm btn-outline-primary w-100 py-2"
                                    onClick={(e) => { e.preventDefault(); openScoreModal(match); }}
                                  >
                                    <i className="fas fa-eye me-1"></i>
                                    {canEditMatchScore(match) ? 'Modifier' : 'Détails'}
                                  </button>
                                )}
                              </div>
                             </div>
                             </Link>
                          ))}
                        </div>
                      </>
                    )
                  ) : (
                    <p className="text-muted">Aucun match programmé dans cette poule.</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Bracket d'élimination directe */}
      {competition.type === 'elimination_directe' && (
        <div className="row mb-4">
          <div className="col-12">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h3>
                <i className="fas fa-sitemap me-2"></i>
                Bracket d'élimination directe
              </h3>
              {competition.matchsElimination.length === 0 && user && (
                competition.createurId === user._id || user.isAdmin
              ) && (
                <button
                  className="btn btn-success"
                  onClick={handleGenerateBracket}
                  disabled={generatingBracket}
                >
                  {generatingBracket ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2"></span>
                      Génération...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-plus me-2"></i>
                      Générer le bracket
                    </>
                  )}
                </button>
              )}
            </div>

            {competition.matchsElimination.length === 0 ? (
              <div className="alert alert-info">
                <i className="fas fa-info-circle me-2"></i>
                Le bracket d'élimination n'a pas encore été généré. 
                {competition.equipesInscrites?.length >= 2 ? 
                  ' Cliquez sur "Générer le bracket" pour commencer.' :
                  ' Au moins 2 équipes doivent être inscrites.'
                }
              </div>
            ) : (
              // Visualiseur d'arbre récursif moderne
              <>
                <div className="text-center d-md-none mb-3 text-muted small bg-dark bg-opacity-25 py-2 px-3 rounded border border-secondary border-opacity-10 d-inline-flex align-items-center gap-2 w-100 justify-content-center">
                  <i className="fas fa-arrows-alt-h text-gradient"></i>
                  <span>Glissez de gauche à droite pour voir toutes les phases</span>
                </div>
                <div className="tournament-bracket">
                  <div className="bracket-container justify-content-center">
                    {renderBracketNode(0, 1, getMaxDepth())}
                  </div>
                </div>

                {/* Finale & Petite finale */}
                {(() => {
                  const finale = competition.matchsElimination.find(m => m.tour === 0 && m.phase !== 'Petite finale');
                  const pFinale = competition.matchsElimination.find(m => m.phase === 'Petite finale');
                  if (!finale && !pFinale) return null;
                  return (
                    <div className="row justify-content-center mt-5 g-4">
                      {finale && (
                        <div className="col-md-6 col-lg-4">
                          <div className="card border-0 shadow-sm" style={{ background: 'rgba(30, 27, 46, 0.85)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255, 193, 7, 0.2)' }}>
                            <div className="card-header text-center border-0 text-white" style={{ background: 'linear-gradient(135deg, #ffc107 0%, #fd7e14 100%)' }}>
                              <h5 className="mb-0 text-dark fw-bold">🏆 La Grande Finale</h5>
                            </div>
                            <div className="card-body p-3">
                              <Link to={`/competition/${id}/match/${finale._id}`} className="text-decoration-none d-block">
                                <div className="match-card-container m-0 w-100" style={{ cursor: 'pointer' }}>
                                  <div className="match-card-header">
                                    <span className="match-card-date">
                                      {finale.dateMatch ? (
                                        <>
                                          <i className="far fa-calendar-alt me-1"></i>
                                          {new Date(finale.dateMatch).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
                                        </>
                                      ) : (
                                        'À programmer'
                                      )}
                                    </span>
                                    <span className={`match-card-status badge ${getMatchStatus(finale)}`}>
                                      {getMatchStatusText(finale)}
                                    </span>
                                    {getLitigeBadge(finale)}
                                  </div>
                                  {finale.litige && (
                                    <div className="bg-warning text-dark text-center py-1 px-2 small font-weight-bold" style={{ fontSize: '0.85em' }}>
                                      <i className="fas fa-exclamation-triangle me-1 animate-pulse"></i>
                                      LITIGE EN COURS
                                    </div>
                                  )}
                                  <div className="match-card-teams">
                                    <div className={`match-card-team ${finale.statut === 'Terminé' && finale.score1 > finale.score2 ? 'winner' : ''}`}>
                                      <span className="match-card-team-name" title={finale.equipe1?.nom || 'TBD'}>
                                        {finale.equipe1?.nom || 'TBD'}
                                      </span>
                                      {finale.statut === 'Terminé' && (
                                        <span className="match-card-team-score">{finale.score1}</span>
                                      )}
                                    </div>
                                    <div className={`match-card-team ${finale.statut === 'Terminé' && finale.score2 > finale.score1 ? 'winner' : ''}`}>
                                      <span className="match-card-team-name" title={finale.equipe2?.nom || 'TBD'}>
                                        {finale.equipe2?.nom || 'TBD'}
                                      </span>
                                      {finale.statut === 'Terminé' && (
                                        <span className="match-card-team-score">{finale.score2}</span>
                                      )}
                                    </div>
                                  </div>
                                  <div className="match-card-actions">
                                    {finale.statut === 'Programmé' && canEditMatchScore(finale) && (
                                      <button 
                                        className="btn btn-primary btn-sm"
                                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); openScoreModal(finale); }}
                                      >
                                        <i className="fas fa-edit me-1"></i> Score
                                      </button>
                                    )}
                                  </div>
                                </div>
                              </Link>
                            </div>
                          </div>
                        </div>
                      )}

                      {pFinale && (
                        <div className="col-md-6 col-lg-4">
                          <div className="card border-0 shadow-sm" style={{ background: 'rgba(30, 27, 46, 0.85)', backdropFilter: 'blur(10px)' }}>
                            <div className="card-header text-center border-0 text-white" style={{ background: 'linear-gradient(135deg, #6f42c1 0%, #e83e8c 100%)' }}>
                              <h5 className="mb-0">🥉 Petite Finale (3ème Place)</h5>
                            </div>
                            <div className="card-body p-3">
                              <Link to={`/competition/${id}/match/${pFinale._id}`} className="text-decoration-none d-block">
                                <div className="match-card-container m-0 w-100" style={{ cursor: 'pointer' }}>
                                  <div className="match-card-header">
                                    <span className="match-card-date">
                                      {pFinale.dateMatch ? (
                                        <>
                                          <i className="far fa-calendar-alt me-1"></i>
                                          {new Date(pFinale.dateMatch).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
                                        </>
                                      ) : (
                                        'À programmer'
                                      )}
                                    </span>
                                    <span className={`match-card-status badge ${getMatchStatus(pFinale)}`}>
                                      {getMatchStatusText(pFinale)}
                                    </span>
                                    {getLitigeBadge(pFinale)}
                                  </div>
                                  {pFinale.litige && (
                                    <div className="bg-warning text-dark text-center py-1 px-2 small font-weight-bold" style={{ fontSize: '0.85em' }}>
                                      <i className="fas fa-exclamation-triangle me-1 animate-pulse"></i>
                                      LITIGE EN COURS
                                    </div>
                                  )}
                                  <div className="match-card-teams">
                                    <div className={`match-card-team ${pFinale.statut === 'Terminé' && pFinale.score1 > pFinale.score2 ? 'winner' : ''}`}>
                                      <span className="match-card-team-name" title={pFinale.equipe1?.nom || 'TBD'}>
                                        {pFinale.equipe1?.nom || 'TBD'}
                                      </span>
                                      {pFinale.statut === 'Terminé' && (
                                        <span className="match-card-team-score">{pFinale.score1}</span>
                                      )}
                                    </div>
                                    <div className={`match-card-team ${pFinale.statut === 'Terminé' && pFinale.score2 > pFinale.score1 ? 'winner' : ''}`}>
                                      <span className="match-card-team-name" title={pFinale.equipe2?.nom || 'TBD'}>
                                        {pFinale.equipe2?.nom || 'TBD'}
                                      </span>
                                      {pFinale.statut === 'Terminé' && (
                                        <span className="match-card-team-score">{pFinale.score2}</span>
                                      )}
                                    </div>
                                  </div>
                                  <div className="match-card-actions">
                                    {pFinale.statut === 'Programmé' && canEditMatchScore(pFinale) && (
                                      <button 
                                        className="btn btn-primary btn-sm"
                                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); openScoreModal(pFinale); }}
                                      >
                                        <i className="fas fa-edit me-1"></i> Score
                                      </button>
                                    )}
                                  </div>
                                </div>
                              </Link>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })()}

              </>
            )}
                
                {/* Champions */}
                {(competition.gagnant || competition.finaliste || competition.troisieme) && (
                  <div className="champions-section mt-4">
                    <h4 className="text-center mb-3">🏆 Podium Final</h4>
                    <div className="row justify-content-center">
                      {competition.gagnant && (
                        <div className="col-md-4 text-center mb-3">
                          <div className="champion-card gold">
                            <div className="trophy-icon">🏆</div>
                            <h5>Champion</h5>
                            <p className="champion-name">{competition.gagnant.nom}</p>
                          </div>
                        </div>
                      )}
                      {competition.finaliste && (
                        <div className="col-md-4 text-center mb-3">
                          <div className="champion-card silver">
                            <div className="trophy-icon">🥈</div>
                            <h5>Finaliste</h5>
                            <p className="champion-name">{competition.finaliste.nom}</p>
                          </div>
                        </div>
                      )}
                      {competition.troisieme && (
                        <div className="col-md-4 text-center mb-3">
                          <div className="champion-card bronze">
                            <div className="trophy-icon">🥉</div>
                            <h5>3ème place</h5>
                            <p className="champion-name">{competition.troisieme.nom}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
          </div>
        </div>
      )}

      {/* Modal de saisie de score */}
      {showScoreModal && selectedMatch && (
        <div className="modal fade show" style={{ display: 'block' }} tabIndex="-1">
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  <i className={`fas ${canEditMatchScore(selectedMatch) ? 'fa-edit' : 'fa-eye'} me-2`}></i>
                  {canEditMatchScore(selectedMatch) ? 'Saisie de score' : 'Détails du match'} - {selectedMatch.equipe1?.nom} vs {selectedMatch.equipe2?.nom}
                </h5>
                <button 
                  type="button" 
                  className="btn-close" 
                  onClick={() => setShowScoreModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                <div className="row">
                  <div className="col-md-6">
                    <div className="mb-3">
                      <label className="form-label">
                        <strong>Score {selectedMatch.equipe1?.nom}</strong>
                      </label>
                      <input
                        type="number"
                        className="form-control"
                        value={scoreData.score1}
                        onChange={(e) => setScoreData(prev => ({ ...prev, score1: e.target.value }))}
                        min="0"
                        disabled={!canEditMatchScore(selectedMatch)}
                      />
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="mb-3">
                      <label className="form-label">
                        <strong>Score {selectedMatch.equipe2?.nom}</strong>
                      </label>
                      <input
                        type="number"
                        className="form-control"
                        value={scoreData.score2}
                        onChange={(e) => setScoreData(prev => ({ ...prev, score2: e.target.value }))}
                        min="0"
                        disabled={!canEditMatchScore(selectedMatch)}
                      />
                    </div>
                  </div>
                </div>

                <hr />

                <h6>Statistiques détaillées</h6>
                
                {/* Buteurs */}
                <div className="mb-3">
                  <label className="form-label">Buteurs</label>
                  {canEditMatchScore(selectedMatch) && (
                    <div className="d-flex gap-2 mb-2">
                      <button 
                        type="button" 
                        className="btn btn-sm btn-outline-primary"
                        onClick={addButeur}
                      >
                        <i className="fas fa-plus me-1"></i>
                        Ajouter buteur
                      </button>
                    </div>
                  )}
                  {scoreData.buteurs.map((buteur, index) => (
                    <div key={index} className="badge bg-success me-2 mb-2">
                      {buteur.joueur} ({buteur.buts} buts)
                    </div>
                  ))}
                </div>

                {/* Passeurs */}
                <div className="mb-3">
                  <label className="form-label">Passeurs</label>
                  {canEditMatchScore(selectedMatch) && (
                    <div className="d-flex gap-2 mb-2">
                      <button 
                        type="button" 
                        className="btn btn-sm btn-outline-info"
                        onClick={addPasseur}
                      >
                        <i className="fas fa-plus me-1"></i>
                        Ajouter passeur
                      </button>
                    </div>
                  )}
                  {scoreData.passeurs.map((passeur, index) => (
                    <div key={index} className="badge bg-info me-2 mb-2">
                      {passeur.joueur} ({passeur.passes} passes)
                    </div>
                  ))}
                </div>

                {/* Cartons */}
                <div className="row">
                  <div className="col-md-6">
                    <label className="form-label">Cartons jaunes</label>
                    {canEditMatchScore(selectedMatch) && (
                      <div className="d-flex gap-2 mb-2">
                        <button 
                          type="button" 
                          className="btn btn-sm btn-outline-warning"
                          onClick={() => addCarton('jaune')}
                        >
                          <i className="fas fa-plus me-1"></i>
                          Ajouter
                        </button>
                      </div>
                    )}
                    {scoreData.cartonsJaunes.map((joueur, index) => (
                      <div key={index} className="badge bg-warning text-dark me-2 mb-2">
                        {joueur}
                      </div>
                    ))}
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Cartons rouges</label>
                    {canEditMatchScore(selectedMatch) && (
                      <div className="d-flex gap-2 mb-2">
                        <button 
                          type="button" 
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => addCarton('rouge')}
                        >
                          <i className="fas fa-plus me-1"></i>
                          Ajouter
                        </button>
                      </div>
                    )}
                    {scoreData.cartonsRouges.map((joueur, index) => (
                      <div key={index} className="badge bg-danger me-2 mb-2">
                        {joueur}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Capture d'écran */}
                <div className="mb-3">
                  <label className="form-label">URL capture d'écran (optionnel)</label>
                  <input
                    type="url"
                    className="form-control"
                    value={scoreData.captureEcran}
                    onChange={(e) => setScoreData(prev => ({ ...prev, captureEcran: e.target.value }))}
                    placeholder="https://..."
                    disabled={!canEditMatchScore(selectedMatch)}
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  onClick={() => setShowScoreModal(false)}
                >
                  {canEditMatchScore(selectedMatch) ? 'Annuler' : 'Fermer'}
                </button>
                {canEditMatchScore(selectedMatch) && (
                  <button 
                    type="button" 
                    className="btn btn-primary" 
                    onClick={handleScoreSubmit}
                  >
                    <i className="fas fa-save me-2"></i>
                    Enregistrer le score
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de programmation de date */}
      {showDateModal && selectedMatchForDate && (
        <div className="modal fade show" style={{ display: 'block' }} tabIndex="-1">
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  <i className="fas fa-calendar-plus me-2"></i>
                  Programmer une date - {selectedMatchForDate.equipe1?.nom} vs {selectedMatchForDate.equipe2?.nom}
                </h5>
                <button 
                  type="button" 
                  className="btn-close" 
                  onClick={() => setShowDateModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                <div className="mb-3">
                  <label className="form-label">
                    <strong>Date et heure du match</strong>
                  </label>
                  <input
                    type="datetime-local"
                    className="form-control"
                    value={matchDate}
                    onChange={(e) => setMatchDate(e.target.value)}
                    min={new Date().toISOString().slice(0, 16)}
                  />
                  <small className="text-muted">
                    Sélectionnez la date et l'heure du match
                  </small>
                </div>
              </div>
              <div className="modal-footer">
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  onClick={() => setShowDateModal(false)}
                >
                  Annuler
                </button>
                <button 
                  type="button" 
                  className="btn btn-primary" 
                  onClick={handleDateSubmit}
                  disabled={!matchDate}
                >
                  <i className="fas fa-save me-2"></i>
                  Programmer le match
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de sélection de joueur */}
      {showJoueurModal && selectedMatch && (
        <div className="modal fade show" style={{ display: 'block' }} tabIndex="-1">
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  <i className="fas fa-user-plus me-2"></i>
                  {joueurModalType === 'buteur' && 'Ajouter un buteur de mon club'}
                  {joueurModalType === 'passeur' && 'Ajouter un passeur de mon club'}
                  {joueurModalType === 'cartonJaune' && 'Ajouter un carton jaune à mon joueur'}
                  {joueurModalType === 'cartonRouge' && 'Ajouter un carton rouge à mon joueur'}
                </h5>
                <button 
                  type="button" 
                  className="btn-close" 
                  onClick={() => setShowJoueurModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                <div className="mb-3">
                  <label className="form-label">
                    <strong>Sélectionner un joueur</strong>
                  </label>
                  <select
                    className="form-select"
                    value={selectedJoueur}
                    onChange={(e) => setSelectedJoueur(e.target.value)}
                  >
                    <option value="">Choisir un joueur de mon club...</option>
                    {getJoueursClubAdmin(selectedMatch).map((joueur, index) => (
                      <option key={index} value={joueur.pseudo}>
                        {joueur.pseudo} - {joueur.role}
                      </option>
                    ))}
                  </select>
                  {getJoueursClubAdmin(selectedMatch).length === 0 && (
                    <small className="text-muted">
                      <i className="fas fa-info-circle me-1"></i>
                      Vous devez être admin d'un club participant pour ajouter des statistiques.
                    </small>
                  )}
                </div>
                
                {(joueurModalType === 'buteur' || joueurModalType === 'passeur') && (
                  <div className="mb-3">
                    <label className="form-label">
                      <strong>
                        {joueurModalType === 'buteur' ? 'Nombre de buts' : 'Nombre de passes'}
                      </strong>
                    </label>
                    <input
                      type="number"
                      className="form-control"
                      value={joueurQuantite}
                      onChange={(e) => setJoueurQuantite(parseInt(e.target.value) || 1)}
                      min="1"
                      max="10"
                    />
                  </div>
                )}
              </div>
              <div className="modal-footer">
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  onClick={() => setShowJoueurModal(false)}
                >
                  Annuler
                </button>
                <button 
                  type="button" 
                  className="btn btn-primary" 
                  onClick={handleJoueurSubmit}
                  disabled={!selectedJoueur}
                >
                  <i className="fas fa-plus me-2"></i>
                  Ajouter
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de signalement de litige */}
      {showLitigeModal && selectedMatchForLitige && (
        <div className="modal fade show" style={{ display: 'block' }} tabIndex="-1">
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title text-warning">
                  <i className="fas fa-exclamation-triangle me-2"></i>
                  Signaler un litige
                </h5>
                <button 
                  type="button" 
                  className="btn-close" 
                  onClick={() => setShowLitigeModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                <div className="alert alert-info py-2">
                  <i className="fas fa-info-circle me-1"></i>
                  Conformément au règlement, veuillez décrire précisément l'infraction et fournir un clip vidéo comme preuve.
                </div>
                
                <div className="mb-3">
                  <label className="form-label"><strong>Description de l'infraction</strong></label>
                  <textarea
                    className="form-control"
                    rows="4"
                    value={litigeData.description}
                    onChange={(e) => setLitigeData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Ex: Le défenseur OM a une taille de 1.95m (limite 1.87m), ou Gêne du gardien sur coup franc à la 42e minute."
                  ></textarea>
                </div>

                <div className="mb-3">
                  <label className="form-label d-block"><strong>Mode de transmission de la preuve</strong></label>
                  <div className="btn-group w-100 mb-3" role="group">
                    <button 
                      type="button" 
                      className={`btn btn-sm ${litigeUploadMode === 'link' ? 'btn-primary text-white' : 'btn-outline-secondary'}`}
                      onClick={() => setLitigeUploadMode('link')}
                    >
                      <i className="fas fa-link me-1"></i> Lien Vidéo URL
                    </button>
                    <button 
                      type="button" 
                      className={`btn btn-sm ${litigeUploadMode === 'file' ? 'btn-primary text-white' : 'btn-outline-secondary'}`}
                      onClick={() => setLitigeUploadMode('file')}
                    >
                      <i className="fas fa-upload me-1"></i> Fichier Vidéo (Max 100 Mo)
                    </button>
                  </div>
                </div>

                {litigeUploadMode === 'link' && (
                  <div className="mb-3">
                    <label className="form-label"><strong>Lien vers la preuve vidéo (URL)</strong></label>
                    <input
                      type="url"
                      className="form-control"
                      value={litigeData.preuveVideo}
                      onChange={(e) => setLitigeData(prev => ({ ...prev, preuveVideo: e.target.value }))}
                      placeholder="https://twitch.tv/... ou https://youtube.com/..."
                    />
                    <small className="text-muted">Lien vers un clip Twitch, YouTube, Streamable, etc.</small>
                  </div>
                )}

                {litigeUploadMode === 'file' && (
                  <div className="mb-3">
                    <label className="form-label"><strong>Sélectionner le fichier vidéo</strong></label>
                    <input
                      type="file"
                      accept="video/*"
                      className="form-control"
                      onChange={(e) => setLitigeFile(e.target.files[0])}
                    />
                    <small className="text-muted">Formats recommandés : mp4, webm (max. 100 Mo).</small>
                    
                    {litigeFile && (
                      <div className="mt-2 text-success small">
                        <i className="fas fa-file-video me-1"></i>
                        Fichier prêt : {litigeFile.name} ({(litigeFile.size / (1024 * 1024)).toFixed(2)} Mo)
                      </div>
                    )}

                    {submittingLitige && uploadProgress > 0 && (
                      <div className="mt-3">
                        <div className="d-flex justify-content-between small text-muted mb-1">
                          <span>Téléchargement de la vidéo...</span>
                          <span>{uploadProgress}%</span>
                        </div>
                        <div className="progress" style={{ height: '6px' }}>
                          <div 
                            className="progress-bar progress-bar-striped progress-bar-animated bg-warning" 
                            role="progressbar" 
                            style={{ width: `${uploadProgress}%` }}
                            aria-valuenow={uploadProgress} 
                            aria-valuemin="0" 
                            aria-valuemax="100"
                          ></div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
              <div className="modal-footer">
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  onClick={() => setShowLitigeModal(false)}
                >
                  Annuler
                </button>
                <button 
                  type="button" 
                  className="btn btn-warning text-dark" 
                  onClick={handleLitigeSubmit}
                  disabled={!litigeData.description || (litigeUploadMode === 'file' && !litigeFile) || submittingLitige}
                >
                  {submittingLitige ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2"></span>
                      Envoi...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-paper-plane me-2"></i>
                      Envoyer le signalement
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Overlay pour les modals */}
      {(showScoreModal || showDateModal || showJoueurModal || showLitigeModal) && (
        <div className="modal-backdrop fade show"></div>
      )}
    </div>
  );
};

export default CompetitionMatchesPage; 