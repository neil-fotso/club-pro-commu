import React, { useState } from 'react';

export default function RulesPage() {
  const [activeTab, setActiveTab] = useState('general');

  const renderTabContent = () => {
    switch (activeTab) {
      case 'general':
        return (
          <div className="card border-0 shadow-sm p-4">
            <h3 className="text-primary mb-4">
              <i className="fas fa-users me-2"></i>
              Effectifs & Restrictions de Tailles
            </h3>
            
            <div className="alert alert-info">
              <i className="fas fa-info-circle me-2"></i>
              <strong>Règle d'or :</strong> Ces restrictions visent à maintenir un jeu réaliste et équitable pour toutes les équipes.
            </div>

            <div className="row g-4 mt-2">
              <div className="col-md-6">
                <div className="p-3 bg-light rounded h-100">
                  <h5 className="fw-bold text-dark mb-3">
                    <i className="fas fa-user-friends text-primary me-2"></i>
                    Taille de l'Effectif
                  </h5>
                  <ul className="list-group list-group-flush bg-transparent">
                    <li className="list-group-item bg-transparent px-0 border-0">
                      <i className="fas fa-check-circle text-success me-2"></i>
                      <strong>6 joueurs minimum</strong> obligatoires par équipe en match.
                    </li>
                    <li className="list-group-item bg-transparent px-0 border-0">
                      <i className="fas fa-info-circle text-info me-2"></i>
                      <strong>Gardien (GK)</strong> : Facultatif.
                    </li>
                  </ul>
                </div>
              </div>

              <div className="col-md-6">
                <div className="p-3 bg-light rounded h-100">
                  <h5 className="fw-bold text-dark mb-3">
                    <i className="fas fa-arrows-alt-v text-primary me-2"></i>
                    Restrictions de Taille (Giraffe)
                  </h5>
                  <p className="mb-2">La taille maximale autorisée varie selon le dispositif défensif :</p>
                  
                  <div className="card border-0 bg-white p-3 mb-2 shadow-sm">
                    <h6 className="fw-bold text-secondary mb-2">🛡️ Défense à 3</h6>
                    <ul className="mb-0 ps-3">
                      <li>Les 3 Défenseurs Centraux (DCG - DC - DCD) : <strong>jusqu'à 1.87 m</strong> maximum.</li>
                      <li>Tous les autres postes : <strong>jusqu'à 1.82 m</strong> maximum.</li>
                    </ul>
                  </div>

                  <div className="card border-0 bg-white p-3 shadow-sm">
                    <h6 className="fw-bold text-secondary mb-2">🛡️ Défense à 4</h6>
                    <ul className="mb-0 ps-3">
                      <li>Les 2 DC + 1 latéral : <strong>jusqu'à 1.87 m</strong> maximum.</li>
                      <li>Tous les autres postes : <strong>jusqu'à 1.82 m</strong> maximum.</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="col-12">
                <div className="p-3 bg-light rounded">
                  <h5 className="fw-bold text-danger mb-3">
                    <i className="fas fa-exchange-alt me-2"></i>
                    Changement de Poste Interdit (Fraude)
                  </h5>
                  <p>
                    Il est strictement interdit de faire jouer un joueur à un poste différent de celui déclaré sur la feuille de match dans l'unique but de contourner le règlement des tailles (ex: utiliser un milieu de terrain avec un build Attaquant de plus de 1.82 m).
                  </p>
                  <div className="row">
                    <div className="col-md-6">
                      <div className="card border-0 bg-white p-3 shadow-sm h-100">
                        <span className="badge bg-danger align-self-start mb-2">Interdit</span>
                        <p className="mb-0 text-muted small">
                          Utiliser un joueur de plus de 1.82 m en attaque en déclarant administrativement un poste de milieu.
                        </p>
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="card border-0 bg-white p-3 shadow-sm h-100">
                        <span className="badge bg-success align-self-start mb-2">Autorisé</span>
                        <p className="mb-0 text-muted small">
                          Faire monter un Défenseur dans la surface de réparation en fin de match (uniquement à partir de la 80ème minute) pour tenter de recoller au score. Toute percée défensive offensive entraînant un but avant la 80e minute sera refusée.
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
          <div className="card border-0 shadow-sm p-4">
            <h3 className="text-primary mb-4">
              <i className="fas fa-gamepad me-2"></i>
              Règles de Jeu, Bugs & Glitches
            </h3>

            <div className="row g-4">
              <div className="col-md-6">
                <div className="card border-danger border-opacity-25 h-100">
                  <div className="card-header bg-danger bg-opacity-10 text-danger fw-bold border-0">
                    <i className="fas fa-bug me-2"></i>
                    Bugs & Glitches de Pénalty
                  </div>
                  <div className="card-body">
                    <div className="mb-3">
                      <span className="badge bg-success me-2">Autorisée</span>
                      <strong>Panenka :</strong> La panenka franche et directe est tout à fait autorisée.
                    </div>
                    <div className="mb-3">
                      <span className="badge bg-danger me-2">Interdite</span>
                      <strong>Frappe flottante / Glitch :</strong> Toute frappe molle avec une trajectoire lobée (glitch technique de frappe) est strictement interdite.
                    </div>
                    
                    <div className="p-3 bg-light rounded mt-3 text-muted small">
                      <strong>Sanctions appliquées :</strong>
                      <ul className="mb-0 ps-3 mt-2">
                        <li><strong>Pendant le match :</strong> Le pénalty est annulé et le but n'est pas validé.</li>
                        <li><strong>Tirs au but :</strong> L'utilisation du glitch entraîne un forfait immédiat de l'équipe (car impossible de rejouer le tir).</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              <div className="col-md-6">
                <div className="card border-warning border-opacity-25 h-100">
                  <div className="card-header bg-warning bg-opacity-10 text-dark fw-bold border-0">
                    <i className="fas fa-exclamation-triangle me-2"></i>
                    Règles sur Coup Franc
                  </div>
                  <div className="card-body">
                    <div className="mb-4">
                      <h6 className="fw-bold text-dark">
                        <i className="fas fa-hand-paper text-danger me-2"></i>
                        Gêne sur le gardien
                      </h6>
                      <p className="text-muted small mb-0">
                        Interdiction pour l'équipe qui tire de gêner le gardien adverse lors du coup franc. Si un clip prouve une gêne excessive empêchant le plongeon, le but sera refusé.
                      </p>
                    </div>
                    <div>
                      <h6 className="fw-bold text-dark">
                        <i className="fas fa-border-all text-danger me-2"></i>
                        Joueurs sur la ligne de but
                      </h6>
                      <p className="text-muted small mb-0">
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
          <div className="card border-0 shadow-sm p-4">
            <h3 className="text-primary mb-4">
              <i className="fas fa-gavel me-2"></i>
              Procédures de Litige & Preuves
            </h3>

            <div className="alert alert-warning">
              <i className="fas fa-exclamation-triangle me-2"></i>
              <strong>Attention :</strong> L'administration se base uniquement sur des preuves claires et horodatées. Respectez scrupuleusement la procédure sous peine de refus automatique de votre litige.
            </div>

            <div className="row g-4 mt-2">
              <div className="col-md-6">
                <div className="p-3 bg-light rounded h-100">
                  <h5 className="fw-bold text-dark mb-3">
                    <i className="fas fa-clock text-primary me-2"></i>
                    Timing de la Demande
                  </h5>
                  <p className="small">
                    Toute demande de vérification de taille doit être formulée <strong>impérativement à la MI-TEMPS</strong> du match. Les demandes en seconde période ou après le match concernant les tailles seront catégoriquement refusées.
                  </p>
                  <div className="alert bg-white border small text-muted">
                    <strong>Conseil :</strong> Indiquez clairement votre passage à la mi-temps par un message explicite sur le chat/Discord pour servir de preuve horodatée.
                  </div>
                </div>
              </div>

              <div className="col-md-6">
                <div className="p-3 bg-light rounded h-100">
                  <h5 className="fw-bold text-dark mb-3">
                    <i className="fas fa-video text-primary me-2"></i>
                    Critères de Validité du Clip
                  </h5>
                  <ul className="mb-0 ps-3 small">
                    <li className="mb-2">Le clip vidéo doit être parfaitement <strong>lisible</strong> (non flou).</li>
                    <li className="mb-2">Les <strong>deux noms d'équipes</strong> doivent être clairement visibles.</li>
                    <li className="mb-2">Toute demande doit s'accompagner d'une notification officielle du gérant adverse.</li>
                    <li className="mb-2"><strong>Interdiction de modifier un message :</strong> Modifier un message a posteriori pour y ajouter une demande de taille est considéré comme de la triche et peut mener à l'exclusion du tournoi.</li>
                  </ul>
                </div>
              </div>

              <div className="col-12">
                <div className="p-3 bg-light rounded">
                  <h5 className="fw-bold text-dark mb-3">
                    <i className="fas fa-balance-scale text-primary me-2"></i>
                    Principe de Réciprocité
                  </h5>
                  <p className="mb-0 small">
                    Si vous formulez une demande de tailles mais que l'adversaire ne demande pas en retour les vôtres à la mi-temps, vous n'êtes pas tenu de lui fournir. La règle repose sur un principe simple : <strong>demande explicite = droit réciproque</strong>. Les demandes formulées après coup car l'adversaire a perdu ne seront pas prises en compte.
                  </p>
                </div>
              </div>
            </div>
          </div>
        );

      case 'fairplay':
        return (
          <div className="card border-0 shadow-sm p-4">
            <h3 className="text-primary mb-4">
              <i className="fas fa-handshake me-2"></i>
              Fair-play, Anti-jeu & Tacles de Fin de Match
            </h3>

            <div className="row g-4">
              <div className="col-md-6">
                <div className="card border-danger border-opacity-25 h-100">
                  <div className="card-header bg-danger bg-opacity-10 text-danger fw-bold border-0">
                    <i className="fas fa-stopwatch me-2"></i>
                    Gain de Temps Abusif
                  </div>
                  <div className="card-body">
                    <p className="small">
                      L'administration se réserve le droit d'appliquer un <strong>forfait</strong> à toute équipe abusant de manière répétée des gains de temps en dehors des phases de jeu normales (retards de remise en jeu de plus de 20s, changements de tireur multiples en temps additionnel, passes excessives vers le gardien sans intention d'attaque).
                    </p>
                    <div className="alert bg-light border small mb-0">
                      <strong>Condition de Forfait :</strong> Ne s'applique uniquement que si le score est serré (1 but d'écart en faveur de l'équipe qui abuse). Si l'écart est de 2 buts ou plus, aucun forfait ne sera appliqué.
                    </div>
                  </div>
                </div>
              </div>

              <div className="col-md-6">
                <div className="card border-dark h-100">
                  <div className="card-header bg-dark text-white fw-bold border-0">
                    <i className="fas fa-ban me-2"></i>
                    Tacles par Derrière en Fin de Match
                  </div>
                  <div className="card-body">
                    <p className="small">
                      <strong>À partir de la 80ème minute :</strong> Tout tacle par derrière volontaire du dernier défenseur annihilant une occasion franche de face-à-face face au gardien sera sanctionné par l'attribution automatique du <strong>but accordé</strong> à l'équipe attaquante.
                    </p>
                    
                    <div className="p-3 bg-light rounded small mt-2">
                      <strong>Conséquence d'égalité (Mort Subite) :</strong>
                      <br />
                      Si le but accordé entraîne une égalité parfaite au score et que le match se termine, les deux équipes devront relancer un match pour disputer une mi-temps sur le principe du <strong>But en Or (mort subite)</strong>.
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
    <div className="min-vh-100 py-5" style={{background: '#f8f9fa'}}>
      <div className="container">
        {/* Header */}
        <div className="text-center mb-5">
          <span className="badge bg-primary px-3 py-2 rounded-pill uppercase mb-2">Règlement Officiel</span>
          <h1 className="display-5 fw-bold text-dark">Règles & Fair-play</h1>
          <p className="text-muted col-md-8 mx-auto">
            Retrouvez le règlement complet de Club Pro Communauté. Toutes les équipes et tous les joueurs s'engagent à respecter ces règles lors de leur inscription à nos compétitions.
          </p>
        </div>

        {/* Navigation Tabs */}
        <div className="d-flex justify-content-center mb-4">
          <ul className="nav nav-pills bg-white p-2 rounded-pill shadow-sm">
            <li className="nav-item">
              <button
                className={`nav-link rounded-pill px-4 ${activeTab === 'general' ? 'active' : 'text-secondary bg-transparent'}`}
                onClick={() => setActiveTab('general')}
              >
                <i className="fas fa-users me-2"></i>
                Effectifs & Tailles
              </button>
            </li>
            <li className="nav-item">
              <button
                className={`nav-link rounded-pill px-4 ${activeTab === 'gameplay' ? 'active' : 'text-secondary bg-transparent'}`}
                onClick={() => setActiveTab('gameplay')}
              >
                <i className="fas fa-gamepad me-2"></i>
                Gameplay & Bugs
              </button>
            </li>
            <li className="nav-item">
              <button
                className={`nav-link rounded-pill px-4 ${activeTab === 'litiges' ? 'active' : 'text-secondary bg-transparent'}`}
                onClick={() => setActiveTab('litiges')}
              >
                <i className="fas fa-gavel me-2"></i>
                Litiges & Preuves
              </button>
            </li>
            <li className="nav-item">
              <button
                className={`nav-link rounded-pill px-4 ${activeTab === 'fairplay' ? 'active' : 'text-secondary bg-transparent'}`}
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
          <i className="fas fa-shield-alt me-1"></i>
          Dernière mise à jour du règlement : 7 Avril 2026. L'administration se réserve le droit d'adapter ces règles pour préserver l'équité sportive.
        </div>
      </div>
    </div>
  );
}
