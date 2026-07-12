import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { competitionAPI, clubAPI } from '../services/api';

const styles = `
  .club-matches-page {
    min-height: 100vh;
    padding-bottom: 3rem;
  }

  .club-matches-header {
    background: linear-gradient(135deg, rgba(0,240,255,0.06) 0%, rgba(139,92,246,0.06) 100%);
    border: 1px solid rgba(0,240,255,0.12);
    border-radius: 20px;
    padding: 1.5rem;
    margin-bottom: 1.5rem;
  }

  .club-match-card {
    background: rgba(13, 19, 32, 0.75);
    border: 1px solid rgba(255,255,255,0.07);
    border-radius: 14px;
    padding: 1rem 1.1rem;
    margin-bottom: 0.7rem;
    transition: all 0.2s ease;
    position: relative;
    overflow: hidden;
  }

  .club-match-card::before {
    content: '';
    position: absolute;
    left: 0; top: 0; bottom: 0;
    width: 3px;
    border-radius: 14px 0 0 14px;
  }

  .club-match-card.statut-termine::before { background: #28a745; }
  .club-match-card.statut-programme::before { background: #00f0ff; }
  .club-match-card.statut-en-cours::before { background: #ffc107; }
  .club-match-card.statut-annule::before { background: #dc3545; }

  .club-match-card:hover {
    background: rgba(13,19,32,0.9);
    border-color: rgba(0,240,255,0.2);
    transform: translateY(-1px);
    box-shadow: 0 6px 20px rgba(0,0,0,0.3);
  }

  .match-meta {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 0.6rem;
  }

  .match-phase-label {
    font-family: 'Rajdhani', sans-serif;
    font-size: 0.68rem;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    color: rgba(255,255,255,0.4);
  }

  .match-status-badges {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .result-badge {
    font-size: 0.65rem;
    font-weight: 700;
    padding: 2px 8px;
    border-radius: 6px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }
  .result-badge.win { background: rgba(40,167,69,0.2); color: #81c784; border: 1px solid rgba(40,167,69,0.3); }
  .result-badge.loss { background: rgba(220,53,69,0.2); color: #ef9a9a; border: 1px solid rgba(220,53,69,0.3); }
  .result-badge.draw { background: rgba(255,193,7,0.2); color: #ffe082; border: 1px solid rgba(255,193,7,0.3); }

  .match-statut-label {
    font-size: 0.68rem;
  }

  .match-teams-row {
    display: flex;
    align-items: center;
    gap: 0.6rem;
  }

  .team-name {
    flex: 1;
    font-family: 'Rajdhani', sans-serif;
    font-weight: 600;
    font-size: 1rem;
    color: white;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .team-name.home { text-align: right; }
  .team-name.away { text-align: left; }

  .team-name.my-team { color: #00f0ff !important; }

  .score-area {
    display: flex;
    align-items: center;
    gap: 0.35rem;
    flex-shrink: 0;
  }

  .score-box {
    font-family: 'Rajdhani', sans-serif;
    font-weight: 800;
    font-size: 1.1rem;
    background: rgba(255,255,255,0.07);
    border-radius: 6px;
    padding: 2px 10px;
    min-width: 32px;
    text-align: center;
    color: white;
  }

  .score-box.winner-score { background: rgba(40,167,69,0.2); color: #81c784; }

  .score-sep {
    color: rgba(255,255,255,0.2);
    font-weight: 700;
    font-size: 0.9rem;
  }

  .vs-label {
    color: rgba(255,255,255,0.2);
    font-family: 'Rajdhani', sans-serif;
    font-weight: 700;
    font-size: 0.9rem;
    padding: 0 0.4rem;
  }

  .match-date-label {
    text-align: center;
    margin-top: 0.5rem;
    font-size: 0.7rem;
    color: rgba(255,255,255,0.3);
  }

  .stat-mini-card {
    flex: 1;
    text-align: center;
    padding: 0.6rem 0.4rem;
    border-radius: 12px;
  }

  .stat-mini-val {
    font-family: 'Rajdhani', sans-serif;
    font-weight: 800;
    font-size: 1.6rem;
    line-height: 1;
  }

  .stat-mini-label {
    font-size: 0.65rem;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    color: rgba(255,255,255,0.4);
    margin-top: 0.2rem;
  }

  .section-title {
    font-family: 'Rajdhani', sans-serif;
    font-size: 0.75rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 1px;
    color: rgba(255,255,255,0.35);
    margin-bottom: 0.6rem;
    padding-bottom: 0.4rem;
    border-bottom: 1px solid rgba(255,255,255,0.05);
  }

  @media (max-width: 768px) {
    .club-matches-page.container {
      padding-left: 1rem !important;
      padding-right: 1rem !important;
    }
    .team-name { font-size: 0.88rem; }
    .score-box { font-size: 1rem; padding: 2px 8px; min-width: 28px; }
  }
`;

export default function ClubMatchesPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const [competition, setCompetition] = useState(null);
  const [userClubs, setUserClubs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [compData, clubsData] = await Promise.all([
        competitionAPI.getCompetition(id),
        user ? clubAPI.getMyClubs(user.token) : Promise.resolve([])
      ]);
      setCompetition(compData);
      setUserClubs(clubsData);
    } catch (err) {
      setError('Erreur lors du chargement');
    } finally {
      setLoading(false);
    }
  }, [id, user]);

  useEffect(() => { fetchData(); }, [fetchData]);

  if (loading) return (
    <div className="container py-5 text-center">
      <div className="spinner-border text-info" role="status" />
    </div>
  );

  if (error || !competition) return (
    <div className="container py-5">
      <div className="alert alert-danger">{error || 'Compétition introuvable'}</div>
    </div>
  );

  // --- Collecter tous les matchs ---
  const tousLesMatchs = [];
  if (competition.poules) {
    competition.poules.forEach(poule => {
      if (poule.matchs) {
        tousLesMatchs.push(...poule.matchs.map(m => ({ ...m, phaseLabel: poule.nom || 'Poule' })));
      }
    });
  }
  if (competition.matchsElimination) {
    tousLesMatchs.push(...competition.matchsElimination.map(m => ({ ...m, phaseLabel: m.phase || 'Élimination' })));
  }

  // --- Trouver le(s) club(s) de l'utilisateur ---
  const compareIds = (a, b) => {
    const ia = typeof a === 'object' ? a?._id?.toString() : a?.toString();
    const ib = typeof b === 'object' ? b?._id?.toString() : b?.toString();
    return ia && ib && ia === ib;
  };

  const myClubs = userClubs;

  const isMyMatch = (match) => {
    if (!match.equipe1 || !match.equipe2) return false;
    return myClubs.some(club =>
      compareIds(club._id, match.equipe1) || compareIds(club._id, match.equipe2)
    );
  };

  const matchsDuClub = tousLesMatchs.filter(isMyMatch);

  // Trouver mon club dans le match
  const getMyClubInMatch = (match) => {
    return myClubs.find(club =>
      compareIds(club._id, match.equipe1) || compareIds(club._id, match.equipe2)
    );
  };

  // Résultat depuis la perspective de mon club
  const getResultat = (match) => {
    if (match.statut !== 'Terminé') return null;
    const myClub = getMyClubInMatch(match);
    if (!myClub) return null;
    const iAmTeam1 = compareIds(myClub._id, match.equipe1);
    const myScore = iAmTeam1 ? match.score1 : match.score2;
    const oppScore = iAmTeam1 ? match.score2 : match.score1;
    if (myScore > oppScore) return 'win';
    if (myScore < oppScore) return 'loss';
    return 'draw';
  };

  const getStatutClass = (statut) => {
    if (statut === 'Terminé') return 'statut-termine';
    if (statut === 'En cours') return 'statut-en-cours';
    if (statut === 'Annulé') return 'statut-annule';
    return 'statut-programme';
  };

  const getStatutColor = (statut) => {
    if (statut === 'Terminé') return '#28a745';
    if (statut === 'En cours') return '#ffc107';
    if (statut === 'Annulé') return '#dc3545';
    return '#00f0ff';
  };

  const getStatutIcon = (statut) => {
    if (statut === 'Terminé') return 'fa-check-circle';
    if (statut === 'En cours') return 'fa-circle-notch fa-spin';
    if (statut === 'Annulé') return 'fa-times-circle';
    return 'fa-clock';
  };

  // Séparer passés / futurs
  const matchsTermines = matchsDuClub.filter(m => m.statut === 'Terminé');
  const matchsAVenir = matchsDuClub.filter(m => m.statut !== 'Terminé');

  // Stats rapides
  const wins = matchsTermines.filter(m => getResultat(m) === 'win').length;
  const draws = matchsTermines.filter(m => getResultat(m) === 'draw').length;
  const losses = matchsTermines.filter(m => getResultat(m) === 'loss').length;

  const clubInscrit = myClubs.find(club =>
    competition.equipesInscrites?.some(e => compareIds(club._id, e.clubId))
  );

  const renderMatch = (match) => {
    const resultat = getResultat(match);
    const myClub = getMyClubInMatch(match);
    const equipe1 = typeof match.equipe1 === 'object' ? match.equipe1 : { nom: 'Équipe 1', _id: match.equipe1 };
    const equipe2 = typeof match.equipe2 === 'object' ? match.equipe2 : { nom: 'Équipe 2', _id: match.equipe2 };
    const iAmTeam1 = myClub && compareIds(myClub._id, equipe1._id);
    const score1Winner = match.statut === 'Terminé' && match.score1 > match.score2;
    const score2Winner = match.statut === 'Terminé' && match.score2 > match.score1;

    const isClickable = match.statut === 'Programmé' || match.statut === 'En cours';

    const matchCardContent = (
      <div className={`club-match-card ${getStatutClass(match.statut)}`} style={isClickable ? { cursor: 'pointer' } : {}}>
        {/* Meta */}
        <div className="match-meta">
          <span className="match-phase-label">{match.phaseLabel}</span>
          <div className="match-status-badges">
            {resultat && (
              <span className={`result-badge ${resultat}`}>
                {resultat === 'win' ? 'Victoire' : resultat === 'loss' ? 'Défaite' : 'Nul'}
              </span>
            )}
            <span className="match-statut-label" style={{ color: getStatutColor(match.statut) }}>
              <i className={`fas ${getStatutIcon(match.statut)} me-1`}></i>
              {match.statut}
            </span>
          </div>
        </div>

        {/* Équipes + Score */}
        <div className="match-teams-row">
          <span className={`team-name home ${iAmTeam1 ? 'my-team' : ''}`}>
            {equipe1.nom}
          </span>
          <div className="score-area">
            {match.statut === 'Terminé' ? (
              <>
                <span className={`score-box ${score1Winner ? 'winner-score' : ''}`}>{match.score1 ?? '-'}</span>
                <span className="score-sep">:</span>
                <span className={`score-box ${score2Winner ? 'winner-score' : ''}`}>{match.score2 ?? '-'}</span>
              </>
            ) : (
              <span className="vs-label">vs</span>
            )}
          </div>
          <span className={`team-name away ${!iAmTeam1 ? 'my-team' : ''}`}>
            {equipe2.nom}
          </span>
        </div>

        {/* Date */}
        {match.dateMatch && (
          <div className="match-date-label">
            <i className="far fa-calendar-alt me-1"></i>
            {new Date(match.dateMatch).toLocaleDateString('fr-FR', {
              weekday: 'short', day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit'
            })}
          </div>
        )}
      </div>
    );

    if (isClickable) {
      return (
        <Link key={match._id} to={`/competition/${id}/match/${match._id}`} style={{ textDecoration: 'none', display: 'block' }}>
          {matchCardContent}
        </Link>
      );
    }

    return (
      <div key={match._id}>
        {matchCardContent}
      </div>
    );
  };

  return (
    <div className="club-matches-page container py-4">
      <style>{styles}</style>

      {/* Header */}
      <div className="club-matches-header">
        <div className="d-flex align-items-center gap-2 mb-2">
          <Link to={`/competition/${id}`} className="btn btn-sm btn-outline-secondary">
            <i className="fas fa-arrow-left me-1"></i>
            Retour
          </Link>
        </div>
        <div className="d-flex align-items-center gap-2 mt-2">
          <i className="fas fa-futbol" style={{ color: '#00f0ff', fontSize: '1.1rem' }}></i>
          <div>
            <div style={{ fontFamily: "'Rajdhani', sans-serif", fontWeight: 700, fontSize: '1.2rem', color: 'white', textTransform: 'uppercase', letterSpacing: '1px' }}>
              Mes Matchs
            </div>
            <small style={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.78rem' }}>
              {clubInscrit?.nom || (myClubs[0]?.nom) || 'Mon club'} · {competition.nom}
            </small>
          </div>
        </div>
      </div>

      {!user ? (
        <div className="alert alert-info">
          <i className="fas fa-info-circle me-2"></i>
          Connectez-vous pour voir vos matchs.
        </div>
      ) : matchsDuClub.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'rgba(255,255,255,0.3)' }}>
          <i className="fas fa-calendar-times" style={{ fontSize: '3rem', marginBottom: '1rem', display: 'block' }}></i>
          <p>Votre club n'a aucun match dans cette compétition.</p>
          <Link to={`/competition/${id}/matchs`} className="btn btn-outline-info btn-sm mt-2">
            <i className="fas fa-calendar-alt me-1"></i>
            Voir le calendrier complet
          </Link>
        </div>
      ) : (
        <>
          {/* Stats rapides */}
          {matchsTermines.length > 0 && (
            <div className="d-flex gap-2 mb-4">
              {[
                ['V', wins, '#81c784', 'rgba(40,167,69,0.15)', 'rgba(40,167,69,0.25)'],
                ['N', draws, '#ffe082', 'rgba(255,193,7,0.15)', 'rgba(255,193,7,0.25)'],
                ['D', losses, '#ef9a9a', 'rgba(220,53,69,0.15)', 'rgba(220,53,69,0.25)'],
                ['Total', matchsDuClub.length, '#00f0ff', 'rgba(0,240,255,0.08)', 'rgba(0,240,255,0.2)'],
              ].map(([label, val, color, bg, border]) => (
                <div key={label} className="stat-mini-card" style={{ background: bg, border: `1px solid ${border}` }}>
                  <div className="stat-mini-val" style={{ color }}>{val}</div>
                  <div className="stat-mini-label">{label}</div>
                </div>
              ))}
            </div>
          )}

          {/* Matchs à venir / en cours */}
          {matchsAVenir.length > 0 && (
            <div className="mb-4">
              <div className="section-title">
                <i className="fas fa-clock me-1" style={{ color: '#00f0ff' }}></i>
                À venir & En cours ({matchsAVenir.length})
              </div>
              {matchsAVenir.map(renderMatch)}
            </div>
          )}

          {/* Matchs terminés */}
          {matchsTermines.length > 0 && (
            <div className="mb-4">
              <div className="section-title">
                <i className="fas fa-check-circle me-1" style={{ color: '#28a745' }}></i>
                Résultats ({matchsTermines.length})
              </div>
              {matchsTermines.map(renderMatch)}
            </div>
          )}

          {/* Lien calendrier complet */}
          <div className="text-center mt-3">
            <Link to={`/competition/${id}/matchs`} className="btn btn-outline-info btn-sm">
              <i className="fas fa-calendar-alt me-2"></i>
              Voir le calendrier complet
            </Link>
          </div>
        </>
      )}
    </div>
  );
}
