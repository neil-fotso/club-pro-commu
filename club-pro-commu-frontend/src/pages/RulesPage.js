import React, { useState } from 'react';
import tournamentFlowchart from '../assets/tournament_flowchart.png';
import lobbyReadyCheck from '../assets/lobby_ready_check.png';
import scoreValidation from '../assets/score_validation.png';

const gamingRulesStyles = `
  .rules-page-container {
    min-height: 100vh;
  }
  
  .gaming-rules-card {
    background: rgba(13, 19, 32, 0.75) !important;
    border: 1px solid var(--border-glass) !important;
    backdrop-filter: blur(16px);
    border-radius: 16px !important;
    padding: 2.5rem !important;
    box-shadow: 0 15px 35px rgba(0, 0, 0, 0.4) !important;
    color: var(--text-white) !important;
  }
  
  .gaming-obsidian-box {
    background: rgba(255, 255, 255, 0.02) !important;
    border: 1px solid var(--border-glass) !important;
    border-radius: 12px !important;
    padding: 1.5rem !important;
    height: 100%;
  }
  
  .gaming-rules-header {
    font-family: 'Rajdhani', sans-serif;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }
  
  .gaming-badge-rule {
    background: rgba(0, 240, 255, 0.1) !important;
    border: 1px solid rgba(0, 240, 255, 0.3) !important;
    color: #00f0ff !important;
    font-family: 'Rajdhani', sans-serif;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 1px;
    padding: 0.4rem 1rem !important;
    border-radius: 20px !important;
  }
  
  .gaming-badge-allow {
    background: rgba(40, 167, 69, 0.15) !important;
    color: #81c784 !important;
    border: 1px solid rgba(40, 167, 69, 0.3) !important;
    font-family: 'Rajdhani', sans-serif;
    font-weight: 700;
    text-transform: uppercase;
    padding: 0.3rem 0.75rem !important;
    border-radius: 6px !important;
    display: inline-block;
  }
  
  .gaming-badge-deny {
    background: rgba(220, 53, 69, 0.15) !important;
    color: #ff6b6b !important;
    border: 1px solid rgba(220, 53, 69, 0.3) !important;
    font-family: 'Rajdhani', sans-serif;
    font-weight: 700;
    text-transform: uppercase;
    padding: 0.3rem 0.75rem !important;
    border-radius: 6px !important;
    display: inline-block;
  }
  
  .gaming-nav-pills {
    background: rgba(13, 19, 32, 0.8) !important;
    border: 1px solid var(--border-glass) !important;
    padding: 0.4rem !important;
    border-radius: 30px !important;
  }
  
  .gaming-nav-pills .nav-link {
    font-family: 'Rajdhani', sans-serif;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    color: var(--text-silver) !important;
    transition: all 0.25s ease;
    border: 1px solid transparent !important;
  }
  
  .gaming-nav-pills .nav-link.active {
    background: var(--gradient-esports) !important;
    color: white !important;
    box-shadow: 0 4px 15px var(--neon-purple-glow) !important;
    border-color: transparent !important;
  }
  
  .gaming-nav-pills .nav-link:hover:not(.active) {
    background: rgba(255, 255, 255, 0.03) !important;
    color: white !important;
    border-color: var(--border-glass) !important;
  }
  
  .gaming-alert-info {
    background: rgba(0, 240, 255, 0.05) !important;
    border: 1px solid rgba(0, 240, 255, 0.2) !important;
    color: #b3f7ff !important;
    border-radius: 10px !important;
  }
  
  .gaming-alert-warning {
    background: rgba(255, 193, 7, 0.05) !important;
    border: 1px solid rgba(255, 193, 7, 0.2) !important;
    color: #ffe699 !important;
    border-radius: 10px !important;
  }
  
  .gaming-inner-card {
    background: rgba(13, 19, 32, 0.4) !important;
    border: 1px solid var(--border-glass) !important;
    border-radius: 10px !important;
    color: var(--text-white) !important;
  }
  
  .gaming-card-header-danger {
    background: rgba(220, 53, 69, 0.1) !important;
    border-bottom: 1px solid rgba(220, 53, 69, 0.2) !important;
    color: #ff6b6b !important;
    font-family: 'Rajdhani', sans-serif;
    font-weight: 700;
    text-transform: uppercase;
  }
  
  .gaming-card-header-warning {
    background: rgba(255, 193, 7, 0.08) !important;
    border-bottom: 1px solid rgba(255, 193, 7, 0.15) !important;
    color: #ffd166 !important;
    font-family: 'Rajdhani', sans-serif;
    font-weight: 700;
    text-transform: uppercase;
  }
  
  .gaming-card-header-dark {
    background: rgba(255, 255, 255, 0.02) !important;
    border-bottom: 1px solid var(--border-glass) !important;
    color: white !important;
    font-family: 'Rajdhani', sans-serif;
    font-weight: 700;
    text-transform: uppercase;
  }
  
  @media (max-width: 768px) {
    .gaming-rules-card {
      padding: 1.5rem !important;
    }
    
    .gaming-nav-pills {
      border-radius: 15px !important;
      width: 100%;
      flex-direction: column;
    }
    
    .gaming-nav-pills .nav-item {
      width: 100%;
    }
    
    .gaming-nav-pills .nav-link {
      border-radius: 10px !important;
      text-align: center;
      width: 100%;
      margin: 0.1rem 0;
    }
  }
`;

export default function RulesPage() {
  const [activeTab, setActiveTab] = useState('tuto');

  const renderTabContent = () => {
    switch (activeTab) {
      case 'tuto':
        return (
          <div className="card gaming-rules-card border-0">
            <h3 className="text-primary gaming-rules-header mb-4">
              <i className="fas fa-map-signs text-gradient me-2"></i>
              Guide Complet du Déroulement d'un Tournoi
            </h3>
            
            <p className="text-silver mb-5" style={{ fontSize: '1.05rem' }}>
              Bienvenue sur le guide officiel de Club Pro Communauté. Découvrez ci-dessous les 5 grandes étapes du déroulement de nos tournois, de l'inscription jusqu'aux phases finales.
            </p>

            {/* Vue d'ensemble */}
            <div className="text-center mb-5">
              <h5 className="gaming-rules-header text-info mb-3">Vue d'ensemble du processus</h5>
              <img src={tournamentFlowchart} alt="Tournament Flowchart" className="img-fluid rounded border border-secondary border-opacity-20 shadow-lg" style={{ maxWidth: '100%', maxHeight: '500px', objectFit: 'contain' }} />
            </div>

            {/* Étapes détaillées */}
            <div className="timeline mt-5">
              {/* Étape 1 */}
              <div className="timeline-item mb-5 pb-3">
                <h5 className="gaming-rules-header text-white mb-3">
                  <span className="badge bg-primary me-2 font-rajdhani">Étape 1</span>
                  Inscription et Lancement
                </h5>
                <p className="text-white-50 small">
                  Le gérant ou l'administrateur de la compétition lance la période d'inscriptions. Les capitaines de clubs s'inscrivent et règlent les frais de participation (si applicables). Une fois les inscriptions closes, l'administrateur génère les poules ou l'arbre final d'élimination directe.
                </p>
              </div>

              {/* Étape 2 */}
              <div className="timeline-item mb-5 pb-3">
                <h5 className="gaming-rules-header text-white mb-3">
                  <span className="badge bg-primary me-2 font-rajdhani">Étape 2</span>
                  La Préparation du Match (Ready Check)
                </h5>
                <div className="row g-4 align-items-center">
                  <div className="col-md-7">
                    <p className="text-white-50 small">
                      Dès que les deux équipes d'une rencontre sont désignées, le match entre dans la phase de <strong>Ready Check</strong> (phase de préparation).
                    </p>
                    <ul className="text-white-50 small">
                      <li className="mb-2">Les capitaines reçoivent une notification et disposent d'un délai fixe de <strong>10 minutes</strong> pour check-in.</li>
                      <li className="mb-2">Ils doivent se rendre sur la page <em>"Mes Matchs"</em> ou la page de la compétition, cliquer sur <strong>"Rejoindre la préparation"</strong>, puis cliquer sur le bouton bleu <strong>"Je suis prêt"</strong> dans le Lobby.</li>
                      <li className="mb-2"><strong className="text-warning">Attention :</strong> Si une équipe ne valide pas sa présence avant la fin du décompte de 10 minutes, elle est déclarée forfait d'office.</li>
                    </ul>
                  </div>
                  <div className="col-md-5">
                    <img src={lobbyReadyCheck} alt="Lobby Ready Check" className="img-fluid rounded border border-secondary border-opacity-20 shadow-sm" style={{ objectFit: 'cover' }} />
                  </div>
                </div>
              </div>

              {/* Étape 3 */}
              <div className="timeline-item mb-5 pb-3">
                <h5 className="gaming-rules-header text-white mb-3">
                  <span className="badge bg-primary me-2 font-rajdhani">Étape 3</span>
                  Déroulement et Lancement des Matchs
                </h5>
                <p className="text-white-50 small">
                  Une fois que les deux équipes ont confirmé leur préparation, le match passe au statut <strong>"En cours"</strong>. Les joueurs ont alors 20 minutes pour s'affronter en jeu sur EA Sports FC Clubs Pro.
                </p>
                <div className="alert gaming-alert-info small mt-3">
                  <i className="fas fa-exclamation-circle text-gradient me-2"></i>
                  <strong>Spécificité Aller-Retour :</strong> Pour préserver le réalisme et le bon séquençage, les deux manches ne se lancent pas simultanément. Le match retour est verrouillé et ne débute que lorsque le match aller est déclaré terminé et validé.
                </div>
              </div>

              {/* Étape 4 */}
              <div className="timeline-item mb-5 pb-3">
                <h5 className="gaming-rules-header text-white mb-3">
                  <span className="badge bg-primary me-2 font-rajdhani">Étape 4</span>
                  Saisie des Scores et Gestion des Litiges
                </h5>
                <div className="row g-4 align-items-center">
                  <div className="col-md-7">
                    <p className="text-white-50 small">
                      À la fin de la rencontre, les capitaines doivent renseigner le score final et charger une capture d'écran faisant foi du résultat.
                    </p>
                    <ul className="text-white-50 small">
                      <li className="mb-2"><strong>Validation automatique :</strong> Si les deux capitaines déclarent le même score, le match est validé instantanément et la progression (ou le match retour) se lance.</li>
                      <li className="mb-2"><strong className="text-danger">Litige automatique :</strong> Si les scores soumis ne correspondent pas exactement, le match est automatiquement bloqué en litige. Une notification est envoyée et les administrateurs devront trancher sur la base de la capture ou d'une preuve vidéo.</li>
                    </ul>
                  </div>
                  <div className="col-md-5">
                    <img src={scoreValidation} alt="Score Validation & Litiges" className="img-fluid rounded border border-secondary border-opacity-20 shadow-sm" style={{ objectFit: 'cover' }} />
                  </div>
                </div>
              </div>

              {/* Étape 5 */}
              <div className="timeline-item">
                <h5 className="gaming-rules-header text-white mb-3">
                  <span className="badge bg-primary me-2 font-rajdhani">Étape 5</span>
                  Égalités et But en Or (Décisif)
                </h5>
                <p className="text-white-50 small">
                  En cas d'égalité sur le cumul des scores d'une confrontation en aller-retour (ex: 2-1 puis 1-2, cumul 3-3), la règle du <strong>But en Or</strong> s'applique :
                </p>
                <ul className="text-white-50 small">
                  <li className="mb-2">Un troisième match décisif nommé <strong>"but en or"</strong> est automatiquement créé dans le bracket.</li>
                  <li className="mb-2">Les équipes s'affrontent lors d'une nouvelle partie. <strong>La première équipe à marquer un but remporte la confrontation.</strong></li>
                  <li className="mb-2">Si le match se termine sur un score nul (0-0), la qualification se joue directement sur la séance de tirs au but, sans prolongations.</li>
                </ul>
              </div>
            </div>
          </div>
        );

      case 'general':
        return (
          <div className="card gaming-rules-card border-0">
            <h3 className="text-primary gaming-rules-header mb-4">
              <i className="fas fa-users text-gradient me-2"></i>
              Effectifs & Restrictions de Tailles
            </h3>
            
            <div className="alert gaming-alert-info d-flex align-items-center gap-2 mb-4">
              <i className="fas fa-info-circle text-gradient" style={{fontSize: '1.2rem'}}></i>
              <div>
                <strong>Règle d'or :</strong> Ces restrictions visent à maintenir un jeu réaliste et équitable pour toutes les équipes.
              </div>
            </div>

            <div className="row g-4 mt-2">
              <div className="col-md-6">
                <div className="gaming-obsidian-box">
                  <h5 className="gaming-rules-header text-white mb-3">
                    <i className="fas fa-user-friends text-gradient me-2"></i>
                    Règles d'Effectif
                  </h5>
                  <ul className="list-group list-group-flush bg-transparent">
                    <li className="list-group-item bg-transparent px-0 border-0 text-white-50">
                      <i className="fas fa-times-circle text-danger me-2"></i>
                      Présence d'un joueur <strong className="text-white">"Tout" (ANY) interdite</strong>.
                    </li>
                    <li className="list-group-item bg-transparent px-0 border-0 text-white-50">
                      <i className="fas fa-info-circle text-info me-2"></i>
                      <strong className="text-white">Gardien (GK)</strong> : Facultatif.
                    </li>
                  </ul>
                </div>
              </div>

              <div className="col-md-6">
                <div className="gaming-obsidian-box">
                  <h5 className="gaming-rules-header text-white mb-3">
                    <i className="fas fa-arrows-alt-v text-gradient me-2"></i>
                    Restrictions de Taille
                  </h5>
                  <p className="text-white-50 mb-3 small">La taille maximale autorisée varie selon le dispositif défensif :</p>
                  
                  <div className="card border-0 gaming-inner-card p-3 mb-3">
                    <h6 className="fw-bold text-primary mb-2 font-rajdhani text-uppercase" style={{fontSize: '0.85rem'}}>🛡️ Défense à 3</h6>
                    <ul className="mb-0 ps-3 text-white-50 small">
                      <li>Les 3 Défenseurs Centraux (DCG - DC - DCD) : <strong className="text-white">jusqu'à 1.87 m</strong> maximum.</li>
                      <li>Tous les autres postes : <strong className="text-white">jusqu'à 1.82 m</strong> maximum.</li>
                    </ul>
                  </div>

                  <div className="card border-0 gaming-inner-card p-3">
                    <h6 className="fw-bold text-primary mb-2 font-rajdhani text-uppercase" style={{fontSize: '0.85rem'}}>🛡️ Défense à 4</h6>
                    <ul className="mb-0 ps-3 text-white-50 small">
                      <li>Les 2 DC + 1 latéral : <strong className="text-white">jusqu'à 1.87 m</strong> maximum.</li>
                      <li>Tous les autres postes : <strong className="text-white">jusqu'à 1.82 m</strong> maximum.</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="col-12">
                <div className="gaming-obsidian-box">
                  <h5 className="gaming-rules-header text-danger mb-3">
                    <i className="fas fa-exchange-alt me-2"></i>
                    Changement de Poste Interdit (Fraude)
                  </h5>
                  <p className="text-white-50 small">
                    Il est strictement interdit de faire jouer un joueur à un poste différent de celui déclaré sur la feuille de match dans l'unique but de contourner le règlement des tailles (ex: utiliser un milieu de terrain avec un build Attaquant de plus de 1.82 m).
                  </p>
                  <div className="row g-3">
                    <div className="col-md-6">
                      <div className="card border-0 gaming-inner-card p-3 h-100">
                        <span className="gaming-badge-deny align-self-start mb-2">Interdit</span>
                        <p className="mb-0 text-white-50 small">
                          Utiliser un joueur de plus de 1.82 m en attaque en déclarant administrativement un poste de milieu.
                        </p>
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="card border-0 gaming-inner-card p-3 h-100">
                        <span className="gaming-badge-allow align-self-start mb-2">Autorisé</span>
                        <p className="mb-0 text-white-50 small">
                          Faire monter un Défenseur dans la surface de réparation en fin de match (uniquement à partir de la 80ème minute) pour tenter de recoller au score. Toute percée offensive entraînant un but avant la 80e minute sera refusée.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'gameplay':
        return (
          <div className="card gaming-rules-card border-0">
            <h3 className="text-primary gaming-rules-header mb-4">
              <i className="fas fa-gamepad text-gradient me-2"></i>
              Règles de Jeu, Bugs & Glitches
            </h3>

            <div className="row g-4">
              <div className="col-md-6">
                <div className="card gaming-inner-card h-100">
                  <div className="card-header gaming-card-header-danger border-0 py-3">
                    <i className="fas fa-bug me-2"></i>
                    Bugs & Glitches de Pénalty
                  </div>
                  <div className="card-body p-4">
                    <div className="mb-3 d-flex align-items-center gap-2">
                      <span className="gaming-badge-allow">Autorisée</span>
                      <span className="text-white font-rajdhani">Panenka classique</span>
                    </div>
                    <div className="mb-3 d-flex align-items-center gap-2">
                      <span className="gaming-badge-deny">Interdite</span>
                      <span className="text-white font-rajdhani">Frappe flottante / Glitch lobé</span>
                    </div>
                    
                    <div className="p-3 gaming-obsidian-box mt-3 small text-white-50">
                      <strong className="text-white d-block mb-2">Sanctions appliquées :</strong>
                      <ul className="mb-0 ps-3">
                        <li className="mb-1"><strong className="text-white">Pendant le match :</strong> Le pénalty est annulé et le but n'est pas validé.</li>
                        <li><strong className="text-white">Tirs au but :</strong> L'utilisation du glitch entraîne un forfait immédiat de l'équipe.</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              <div className="col-md-6">
                <div className="card gaming-inner-card h-100">
                  <div className="card-header gaming-card-header-warning border-0 py-3">
                    <i className="fas fa-exclamation-triangle me-2"></i>
                    Règles sur Coup Franc
                  </div>
                  <div className="card-body p-4">
                    <div className="mb-4">
                      <h6 className="gaming-rules-header text-white mb-2">
                        <i className="fas fa-hand-paper text-danger me-2"></i>
                        Gêne sur le gardien
                      </h6>
                      <p className="text-white-50 small mb-0">
                        Interdiction pour l'équipe qui tire de gêner le gardien adverse lors du coup franc. Si un clip prouve une gêne excessive empêchant le plongeon, le but sera refusé.
                      </p>
                    </div>
                    <div>
                      <h6 className="gaming-rules-header text-white mb-2">
                        <i className="fas fa-border-all text-danger me-2"></i>
                        Joueurs sur la ligne de but
                      </h6>
                      <p className="text-white-50 small mb-0">
                        Il est interdit de placer des joueurs sur la ligne de but pour contrer la frappe. Si l'équipe défensive le fait et que la frappe cadrée est contrée par un de ces joueurs, le but sera d'office accordé à l'équipe attaquante sur contestation.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'litiges':
        return (
          <div className="card gaming-rules-card border-0">
            <h3 className="text-primary gaming-rules-header mb-4">
              <i className="fas fa-gavel text-gradient me-2"></i>
              Procédures de Litige & Preuves
            </h3>

            <div className="alert gaming-alert-warning d-flex align-items-center gap-2 mb-4">
              <i className="fas fa-exclamation-triangle text-gradient" style={{fontSize: '1.2rem'}}></i>
              <div>
                <strong>Attention :</strong> L'administration se base uniquement sur des preuves claires et horodatées. Respectez scrupuleusement la procédure sous peine de refus automatique de votre litige.
              </div>
            </div>

            <div className="row g-4 mt-2">
              <div className="col-12">
                <div className="gaming-obsidian-box">
                  <h5 className="gaming-rules-header text-white mb-3">
                    <i className="fas fa-video text-gradient me-2"></i>
                    Critères de Validité du Clip
                  </h5>
                  <ul className="mb-0 ps-3 text-white-50 small">
                    <li className="mb-2">Le clip vidéo doit être parfaitement <strong className="text-white">lisible</strong> (non flou).</li>
                    <li className="mb-2">Les <strong className="text-white">deux noms d'équipes</strong> doivent être clairement visibles.</li>
                    <li className="mb-2"><strong className="text-white">Description précise :</strong> Veillez à bien décrire le litige lorsqu'il est signalé.</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        );

      case 'fairplay':
        return (
          <div className="card gaming-rules-card border-0">
            <h3 className="text-primary gaming-rules-header mb-4">
              <i className="fas fa-handshake text-gradient me-2"></i>
              Fair-play, Anti-jeu & Tacles de Fin de Match
            </h3>

            <div className="row g-4">
              <div className="col-md-6">
                <div className="card gaming-inner-card h-100">
                  <div className="card-header gaming-card-header-danger border-0 py-3">
                    <i className="fas fa-stopwatch me-2"></i>
                    Gain de Temps Abusif
                  </div>
                  <div className="card-body p-4">
                    <p className="text-white-50 small mb-3">
                      L'administration se réserve le droit d'appliquer un <strong className="text-white">forfait</strong> à toute équipe abusant de manière répétée des gains de temps en dehors des phases de jeu normales (retards de remise en jeu de plus de 20s, changements de tireur multiples en temps additionnel, passes excessives vers le gardien sans intention d'attaque).
                    </p>
                    <div className="alert gaming-alert-info mb-0 small">
                      <strong>Condition de Forfait :</strong> Ne s'applique uniquement que si le score est serré (1 but d'écart en faveur de l'équipe qui abuse). Si l'écart est de 2 buts ou plus, aucun forfait ne sera appliqué.
                    </div>
                  </div>
                </div>
              </div>

              <div className="col-md-6">
                <div className="card gaming-inner-card h-100">
                  <div className="card-header gaming-card-header-dark border-0 py-3">
                    <i className="fas fa-ban me-2"></i>
                    Tacles par Derrière en Fin de Match
                  </div>
                  <div className="card-body p-4">
                    <p className="text-white-50 small mb-3">
                      <strong className="text-white">À partir de la 80ème minute :</strong> Tout tacle par derrière volontaire du dernier défenseur annihilant une occasion franche de face-à-face face au gardien sera sanctionné par l'attribution automatique du <strong className="text-white">but accordé</strong> à l'équipe attaquante.
                    </p>
                    
                    <div className="p-3 gaming-obsidian-box small">
                      <strong className="text-white d-block mb-1">Conséquence d'égalité (Mort Subite) :</strong>
                      Si le but accordé entraîne une égalité parfaite au score et que le match se termine, les deux équipes devront relancer un match pour disputer une mi-temps sur le principe du <strong className="text-white">But en Or (mort subite)</strong>.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="rules-page-container py-4 px-4 px-md-5">
      <style>{gamingRulesStyles}</style>
      <div className="container-fluid px-0">
        {/* Header */}
        <div className="text-center mb-5">
          <span className="gaming-badge-rule mb-3 d-inline-block">Règlement Officiel</span>
          <h1 className="display-5 fw-bold text-gradient font-rajdhani text-uppercase mb-2">Règles & Fair-play</h1>
          <p className="text-muted col-md-8 mx-auto">
            Retrouvez le règlement complet de Club Pro Communauté. Toutes les équipes et tous les joueurs s'engagent à respecter ces règles lors de leur inscription à nos compétitions.
          </p>
        </div>

        {/* Navigation Tabs */}
        <div className="d-flex justify-content-center mb-5">
          <ul className="nav gaming-nav-pills p-2 shadow-sm d-inline-flex">
            <li className="nav-item">
              <button
                className={`nav-link rounded-pill px-4 py-2 ${activeTab === 'tuto' ? 'active' : 'bg-transparent'}`}
                onClick={() => setActiveTab('tuto')}
              >
                <i className="fas fa-book-open me-2"></i>
                Guide Déroulement
              </button>
            </li>
            <li className="nav-item">
              <button
                className={`nav-link rounded-pill px-4 py-2 ${activeTab === 'general' ? 'active' : 'bg-transparent'}`}
                onClick={() => setActiveTab('general')}
              >
                <i className="fas fa-users me-2"></i>
                Effectifs & Tailles
              </button>
            </li>
            <li className="nav-item">
              <button
                className={`nav-link rounded-pill px-4 py-2 ${activeTab === 'gameplay' ? 'active' : 'bg-transparent'}`}
                onClick={() => setActiveTab('gameplay')}
              >
                <i className="fas fa-gamepad me-2"></i>
                Gameplay & Bugs
              </button>
            </li>
            <li className="nav-item">
              <button
                className={`nav-link rounded-pill px-4 py-2 ${activeTab === 'litiges' ? 'active' : 'bg-transparent'}`}
                onClick={() => setActiveTab('litiges')}
              >
                <i className="fas fa-gavel me-2"></i>
                Litiges & Preuves
              </button>
            </li>
            <li className="nav-item">
              <button
                className={`nav-link rounded-pill px-4 py-2 ${activeTab === 'fairplay' ? 'active' : 'bg-transparent'}`}
                onClick={() => setActiveTab('fairplay')}
              >
                <i className="fas fa-handshake me-2"></i>
                Fair-play & Temps
              </button>
            </li>
          </ul>
        </div>

        {/* Content */}
        <div className="row justify-content-center">
          <div className="col-lg-10">
            {renderTabContent()}
          </div>
        </div>

        {/* Footer info */}
        <div className="text-center mt-5 text-muted small">
          <i className="fas fa-shield-alt text-gradient me-2"></i>
          Dernière mise à jour du règlement : 7 Avril 2026. L'administration se réserve le droit d'adapter ces règles pour préserver l'équité sportive.
        </div>
      </div>
    </div>
  );
}
