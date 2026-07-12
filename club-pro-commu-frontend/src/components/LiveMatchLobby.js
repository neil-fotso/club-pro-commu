import React, { useState, useEffect, useRef } from 'react';
import { competitionAPI } from '../services/api';

// Fonction utilitaire pour générer des effets sonores via l'AudioContext du navigateur (zéro dépendance externe)
const playSynthSound = (type) => {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    
    if (type === 'ready') {
      // Bip ascendant cool
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, ctx.currentTime); // La
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.15); // La octave sup
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);
      osc.start();
      osc.stop(ctx.currentTime + 0.15);
    } else if (type === 'start') {
      // Alerte de match prêt à être joué (son style arcade futuriste)
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(ctx.destination);
      
      osc1.type = 'triangle';
      osc2.type = 'sawtooth';
      
      osc1.frequency.setValueAtTime(587.33, ctx.currentTime); // Ré
      osc1.frequency.setValueAtTime(659.25, ctx.currentTime + 0.1); // Mi
      osc1.frequency.setValueAtTime(880, ctx.currentTime + 0.2); // La
      
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
    console.warn('Audio Context non supporté ou bloqué par le navigateur', err);
  }
};

export default function LiveMatchLobby({ match, competitionId, userClubs, userId, isAdmin, onRefresh }) {
  const [timeLeft, setTimeLeft] = useState('');
  const [timerProgress, setTimerProgress] = useState(100);
  const [score1, setScore1] = useState('');
  const [score2, setScore2] = useState('');
  const [submittingScore, setSubmittingScore] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [adminForfaitSelected, setAdminForfaitSelected] = useState('double');

  // Suivi de l'état "Prêt" précédent pour jouer le son de début ou de prêt
  const prevReady1 = useRef(match?.equipe1Prete);
  const prevReady2 = useRef(match?.equipe2Prete);
  const prevStatut = useRef(match?.statut);

  useEffect(() => {
    if (!match) return;
    
    // Jouer un effet sonore si l'adversaire ou le match change de statut de préparation
    if (match.equipe1Prete && !prevReady1.current) {
      playSynthSound('ready');
    }
    if (match.equipe2Prete && !prevReady2.current) {
      playSynthSound('ready');
    }
    if (match.statut === 'En cours' && prevStatut.current === 'Programmé') {
      playSynthSound('start');
    }
    
    prevReady1.current = match.equipe1Prete;
    prevReady2.current = match.equipe2Prete;
    prevStatut.current = match.statut;
  }, [match]);

  // Déterminer les affiliations de l'utilisateur connecté
  const userIsAdminEquipe1 = match?.equipe1?._id 
    ? userClubs.some(c => c._id === match.equipe1._id && c.membres.some(m => m.userId === userId && m.role === 'Admin'))
    : false;
  const userIsAdminEquipe2 = match?.equipe2?._id
    ? userClubs.some(c => c._id === match.equipe2._id && c.membres.some(m => m.userId === userId && m.role === 'Admin'))
    : false;

  const isCaptain = userIsAdminEquipe1 || userIsAdminEquipe2;

  // Calcul du minuteur
  useEffect(() => {
    if (!match) return;
    
    const interval = setInterval(() => {
      let limitDate = null;
      let durationMax = 10 * 60 * 1000; // Par défaut 10 min

      if (match.statut === 'Programmé' && match.dateLimiteDebut) {
        limitDate = new Date(match.dateLimiteDebut).getTime();
        durationMax = 10 * 60 * 1000;
      } else if (match.statut === 'En cours' && match.dateDebutMatch) {
        // Chronomètre du match en cours (20 min)
        const dateDebut = new Date(match.dateDebutMatch).getTime();
        limitDate = dateDebut + (20 * 60 * 1000);
        durationMax = 20 * 60 * 1000;
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
        clearInterval(interval);
        // Demander un rafraîchissement au parent pour appliquer le forfait automatique
        if (onRefresh) onRefresh();
        return;
      }

      const minutes = Math.floor(diff / 60000);
      const seconds = Math.floor((diff % 60000) / 1000);
      setTimeLeft(`${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
      
      const pct = Math.max(0, Math.min(100, (diff / durationMax) * 100));
      setTimerProgress(pct);
    }, 1000);

    return () => clearInterval(interval);
  }, [match, onRefresh]);

  if (!match || !match.equipe1 || !match.equipe2) {
    return (
      <div className="card text-center border-0 shadow-sm p-4 text-white bg-dark bg-opacity-75 backdrop-blur">
        <div className="card-body">
          <i className="fas fa-hourglass-half fa-3x text-warning mb-3"></i>
          <h4>En attente des équipes qualifiées</h4>
          <p className="text-muted mb-0">Le match de ce tour commencera dès que les adversaires auront terminé leurs matchs précédents.</p>
        </div>
      </div>
    );
  }

  const handleReady = async () => {
    try {
      const token = localStorage.getItem('token');
      await competitionAPI.marquerPret(competitionId, match._id, token);
      if (onRefresh) onRefresh();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleScoreSubmit = async (e) => {
    e.preventDefault();
    if (score1 === '' || score2 === '') {
      alert('Veuillez renseigner les scores pour les deux équipes.');
      return;
    }
    setSubmittingScore(true);
    try {
      const token = localStorage.getItem('token');
      await competitionAPI.mettreAJourScore(competitionId, match._id, {
        score1: parseInt(score1),
        score2: parseInt(score2)
      }, token);
      if (onRefresh) onRefresh();
    } catch (err) {
      alert(err.message);
    } finally {
      setSubmittingScore(false);
    }
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploadingPhoto(true);
    setUploadProgress(0);
    try {
      const token = localStorage.getItem('token');
      await competitionAPI.uploadPhotoLitige(
        competitionId,
        match._id,
        file,
        token,
        (progress) => setUploadProgress(progress)
      );
      if (onRefresh) onRefresh();
    } catch (err) {
      alert(err.message);
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleAdminForfait = async () => {
    if (!window.confirm(`Confirmer la déclaration de forfait (${adminForfaitSelected}) pour ce match ?`)) return;
    try {
      const token = localStorage.getItem('token');
      await competitionAPI.declarerForfait(competitionId, match._id, adminForfaitSelected, token);
      if (onRefresh) onRefresh();
    } catch (err) {
      alert(err.message);
    }
  };

  // Déterminer la couleur du timer
  let progressColor = 'bg-success';
  if (timerProgress < 25) progressColor = 'bg-danger animate-pulse';
  else if (timerProgress < 50) progressColor = 'bg-warning';

  return (
    <div className="card border-0 shadow-lg text-white mb-4 bg-dark bg-opacity-75 backdrop-blur overflow-hidden position-relative" style={{ borderRadius: '16px' }}>
      
      {/* Barre de progression du minuteur */}
      {timeLeft && (
        <div className="progress position-absolute top-0 start-0 end-0 rounded-0" style={{ height: '5px', backgroundColor: 'rgba(255,255,255,0.05)' }}>
          <div className={`progress-bar ${progressColor}`} style={{ width: `${timerProgress}%`, transition: 'width 1s linear' }}></div>
        </div>
      )}

      <div className="card-body p-4 pt-5">
        
        {/* En-tête avec Phase et statut */}
        <div className="d-flex justify-content-between align-items-center mb-4">
          <span className="badge bg-primary text-uppercase px-3 py-2 fw-bold letter-spacing-1">
            {match.phase}
          </span>
          <div className="d-flex align-items-center">
            {match.statut === 'Programmé' && (
              <span className="badge bg-warning text-dark px-3 py-2 fw-semibold">
                <i className="fas fa-stopwatch me-1 animate-spin"></i> Validation de présence ({timeLeft})
              </span>
            )}
            {match.statut === 'En cours' && !match.litige && (
              <span className="badge bg-success px-3 py-2 fw-semibold">
                <i className="fas fa-play me-1"></i> En jeu ({timeLeft})
              </span>
            )}
            {match.litige && (
              <span className="badge bg-danger px-3 py-2 fw-bold animate-pulse">
                <i className="fas fa-exclamation-triangle me-1"></i> Litige actif
              </span>
            )}
          </div>
        </div>

        {/* Bloc central des équipes */}
        <div className="row align-items-center justify-content-center my-4">
          
          {/* Équipe 1 */}
          <div className="col-5 text-center position-relative">
            <div className="avatar-wrapper mb-3 position-relative d-inline-block">
              {match.equipe1.logo ? (
                <img src={match.equipe1.logo} alt={match.equipe1.nom} className="rounded-circle border border-3 border-opacity-50" style={{ width: '80px', height: '80px', objectFit: 'cover' }} />
              ) : (
                <div className="rounded-circle bg-secondary d-flex align-items-center justify-content-center text-uppercase fw-bold border border-3" style={{ width: '80px', height: '80px', fontSize: '32px' }}>
                  {match.equipe1.nom.substring(0, 2)}
                </div>
              )}
              {match.statut === 'Programmé' && (
                <span className={`position-absolute bottom-0 end-0 p-2 rounded-circle border border-2 border-dark ${match.equipe1Prete ? 'bg-success' : 'bg-danger'}`} title={match.equipe1Prete ? 'Prête' : 'Non prête'} style={{ width: '16px', height: '16px' }}></span>
              )}
            </div>
            <h5 className="mb-0 fw-bold">{match.equipe1.nom}</h5>
            {userIsAdminEquipe1 && <span className="badge bg-secondary mt-1">Capitaine</span>}
          </div>

          {/* VS & Scores */}
          <div className="col-2 text-center">
            {match.statut === 'Terminé' ? (
              <div className="d-flex justify-content-center align-items-center">
                <span className="fs-1 fw-black text-warning">{match.score1}</span>
                <span className="mx-2 text-muted fs-4">-</span>
                <span className="fs-1 fw-black text-warning">{match.score2}</span>
              </div>
            ) : (
              <div className="vstack gap-1">
                <span className="badge bg-dark bg-opacity-50 fs-6 py-2 px-3 fw-bold border border-secondary border-opacity-25 shadow-sm">VS</span>
                {match.propositionScore && match.propositionScore.proposePar && (
                  <span className="text-muted small">Score proposé</span>
                )}
              </div>
            )}
          </div>

          {/* Équipe 2 */}
          <div className="col-5 text-center position-relative">
            <div className="avatar-wrapper mb-3 position-relative d-inline-block">
              {match.equipe2.logo ? (
                <img src={match.equipe2.logo} alt={match.equipe2.nom} className="rounded-circle border border-3 border-opacity-50" style={{ width: '80px', height: '80px', objectFit: 'cover' }} />
              ) : (
                <div className="rounded-circle bg-secondary d-flex align-items-center justify-content-center text-uppercase fw-bold border border-3" style={{ width: '80px', height: '80px', fontSize: '32px' }}>
                  {match.equipe2.nom.substring(0, 2)}
                </div>
              )}
              {match.statut === 'Programmé' && (
                <span className={`position-absolute bottom-0 end-0 p-2 rounded-circle border border-2 border-dark ${match.equipe2Prete ? 'bg-success' : 'bg-danger'}`} title={match.equipe2Prete ? 'Prête' : 'Non prête'} style={{ width: '16px', height: '16px' }}></span>
              )}
            </div>
            <h5 className="mb-0 fw-bold">{match.equipe2.nom}</h5>
            {userIsAdminEquipe2 && <span className="badge bg-secondary mt-1">Capitaine</span>}
          </div>

        </div>

        {/* Section Actions pour les Capitaines et Admins */}
        <div className="border-top border-secondary border-opacity-25 pt-4 mt-4">
          
          {/* Phase 1 : Ready Check */}
          {match.statut === 'Programmé' && (
            <div className="text-center">
              <p className="text-muted small mb-3">
                Chaque équipe doit se déclarer prête avant la fin du décompte sous peine de forfait.
              </p>
              
              {userIsAdminEquipe1 && !match.equipe1Prete && (
                <button className="btn btn-success btn-lg px-5 fw-bold shadow-sm" onClick={handleReady}>
                  <i className="fas fa-check-circle me-2"></i> Je suis prêt
                </button>
              )}
              {userIsAdminEquipe2 && !match.equipe2Prete && (
                <button className="btn btn-success btn-lg px-5 fw-bold shadow-sm" onClick={handleReady}>
                  <i className="fas fa-check-circle me-2"></i> Je suis prêt
                </button>
              )}

              {/* Si le capitaine connecté est déjà prêt */}
              {((userIsAdminEquipe1 && match.equipe1Prete) || (userIsAdminEquipe2 && match.equipe2Prete)) && (
                <div className="alert alert-success border-0 bg-success bg-opacity-10 d-inline-block px-4 py-2 mb-0">
                  <i className="fas fa-clock me-2"></i> Vous êtes prêt ! En attente du capitaine adverse...
                </div>
              )}

              {/* Si l'utilisateur n'est pas capitaine */}
              {!isCaptain && !isAdmin && (
                <div className="text-warning small">
                  <i className="fas fa-spinner fa-spin me-2"></i> En attente de la préparation des capitaines d'équipes.
                </div>
              )}
            </div>
          )}

          {/* Phase 2 : Match en cours - Saisie des scores */}
          {match.statut === 'En cours' && !match.litige && (
            <div>
              {/* Si aucun score n'a encore été validé ni proposé */}
              {(!match.propositionScore || !match.propositionScore.proposePar) ? (
                isCaptain ? (
                  <form onSubmit={handleScoreSubmit} className="mx-auto" style={{ maxWidth: '400px' }}>
                    <h6 className="text-center mb-3 text-uppercase letter-spacing-1 fw-bold">Saisie du score final</h6>
                    <div className="row g-2 mb-3">
                      <div className="col">
                        <input type="number" min="0" placeholder={match.equipe1.nom} className="form-control form-control-lg bg-dark text-white border-secondary text-center" value={score1} onChange={e => setScore1(e.target.value)} required />
                      </div>
                      <div className="col-auto align-self-center text-muted fw-bold">:</div>
                      <div className="col">
                        <input type="number" min="0" placeholder={match.equipe2.nom} className="form-control form-control-lg bg-dark text-white border-secondary text-center" value={score2} onChange={e => setScore2(e.target.value)} required />
                      </div>
                    </div>
                    <button type="submit" className="btn btn-primary w-100 btn-lg fw-bold shadow-sm" disabled={submittingScore}>
                      {submittingScore ? 'Envoi...' : 'Soumettre le score'}
                    </button>
                  </form>
                ) : (
                  <div className="text-center text-muted py-2">
                    <i className="fas fa-gamepad animate-pulse me-2"></i> Match en cours de jeu. Les capitaines renseigneront les scores sous peu.
                  </div>
                )
              ) : (
                /* Un score a déjà été proposé */
                <div className="text-center">
                  {/* Si l'utilisateur connecté est le capitaine émetteur */}
                  {((userIsAdminEquipe1 && match.propositionScore.proposePar === 'equipe1') ||
                    (userIsAdminEquipe2 && match.propositionScore.proposePar === 'equipe2')) ? (
                    <div className="alert alert-info border-0 bg-info bg-opacity-10 d-inline-block px-4 py-3">
                      <h5>Score proposé : {match.propositionScore.score1} - {match.propositionScore.score2}</h5>
                      <p className="mb-0 small text-muted">En attente que le capitaine de l'équipe adverse confirme ou propose son score.</p>
                    </div>
                  ) : isCaptain ? (
                    /* Si le capitaine connecté est le destinataire de la validation */
                    <form onSubmit={handleScoreSubmit} className="mx-auto" style={{ maxWidth: '400px' }}>
                      <div className="alert alert-warning border-0 bg-warning bg-opacity-10 py-3 mb-3">
                        <h6 className="fw-bold"><i className="fas fa-exclamation-circle me-2"></i>Validation de Score requise</h6>
                        <p className="small mb-0">L'adversaire a déclaré un score de <strong>{match.propositionScore.score1} - {match.propositionScore.score2}</strong>.</p>
                      </div>
                      <p className="small text-muted mb-3">Saisissez le même score pour le valider d'office, ou entrez votre propre version pour ouvrir un litige.</p>
                      <div className="row g-2 mb-3">
                        <div className="col">
                          <input type="number" min="0" placeholder={match.equipe1.nom} className="form-control form-control-lg bg-dark text-white border-secondary text-center" value={score1} onChange={e => setScore1(e.target.value)} required />
                        </div>
                        <div className="col-auto align-self-center text-muted fw-bold">:</div>
                        <div className="col">
                          <input type="number" min="0" placeholder={match.equipe2.nom} className="form-control form-control-lg bg-dark text-white border-secondary text-center" value={score2} onChange={e => setScore2(e.target.value)} required />
                        </div>
                      </div>
                      <button type="submit" className="btn btn-warning w-100 btn-lg fw-bold shadow-sm" disabled={submittingScore}>
                        {submittingScore ? 'Validation...' : 'Valider / Soumettre score'}
                      </button>
                    </form>
                  ) : (
                    <div className="text-center text-muted py-2">
                      <i className="fas fa-clock me-2"></i> Score de {match.propositionScore.score1} - {match.propositionScore.score2} proposé. En attente de la validation adverse.
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Phase 3 : Litige Actif */}
          {match.litige && (
            <div className="p-3 rounded bg-danger bg-opacity-10 border border-danger border-opacity-25">
              <h5 className="text-danger fw-bold"><i className="fas fa-exclamation-triangle me-2"></i>Désaccord détecté</h5>
              <p className="small text-muted">
                Les scores saisis par les deux équipes ne correspondent pas. Pour résoudre ce litige rapidement, veuillez charger une capture d'écran du tableau d'affichage final du match.
              </p>

              {/* Si preuve photo déjà chargée */}
              {match.litigeDetails?.preuveVideo ? (
                <div className="mb-3 text-center">
                  <span className="badge bg-success mb-2"><i className="fas fa-check me-1"></i> Capture d'écran chargée</span>
                  <div>
                    <a href={match.litigeDetails.preuveVideo} target="_blank" rel="noopener noreferrer" className="btn btn-outline-light btn-sm">
                      <i className="fas fa-eye me-1"></i> Voir la photo de preuve
                    </a>
                  </div>
                </div>
              ) : isCaptain ? (
                /* Charger une photo */
                <div className="mb-3">
                  <label className="form-label small fw-bold">Charger une photo du score final (JPG, PNG)</label>
                  <input type="file" accept="image/*" onChange={handlePhotoUpload} className="form-control bg-dark text-white border-secondary" disabled={uploadingPhoto} />
                  {uploadingPhoto && (
                    <div className="progress mt-2" style={{ height: '6px' }}>
                      <div className="progress-bar progress-bar-striped progress-bar-animated bg-danger" style={{ width: `${uploadProgress}%` }}></div>
                    </div>
                  )}
                </div>
              ) : null}

              <div className="text-center text-warning small py-1">
                <i className="fas fa-gavel me-2"></i> Un administrateur examine actuellement les preuves pour clore le match.
              </div>
            </div>
          )}

          {/* Commandes Admin (Forfait manuel et bypass) */}
          {(isAdmin) && (
            <div className="mt-4 pt-3 border-top border-secondary border-opacity-10 bg-dark bg-opacity-25 p-3 rounded">
              <h6 className="text-warning fw-bold mb-3"><i className="fas fa-shield-alt me-2"></i>Administration du Match</h6>
              <div className="row g-2 align-items-center">
                <div className="col-md-6 col-12">
                  <select className="form-select bg-dark text-white border-secondary" value={adminForfaitSelected} onChange={e => setAdminForfaitSelected(e.target.value)}>
                    <option value="double">Forfait des deux équipes (Double)</option>
                    <option value="equipe1">Forfait Équipe 1 ({match.equipe1.nom})</option>
                    <option value="equipe2">Forfait Équipe 2 ({match.equipe2.nom})</option>
                  </select>
                </div>
                <div className="col-md-6 col-12">
                  <button className="btn btn-danger w-100 fw-semibold" onClick={handleAdminForfait}>
                    <i className="fas fa-times-circle me-1"></i> Appliquer le Forfait
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
}
