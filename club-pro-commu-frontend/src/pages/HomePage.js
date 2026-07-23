import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { clubAPI, competitionAPI } from '../services/api';
import bgHeader from '../assets/bg-header.jpg';
import logo from '../assets/logo.png';

// Styles pour les cartes de fonctionnalités
const featureCardStyles = `
  .feature-card {
    transition: all 0.3s ease;
    cursor: pointer;
    border-radius: 15px;
    background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
    border: 2px solid transparent;
  }
  
  .feature-card:hover {
    transform: translateY(-10px) scale(1.02);
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
    border-color: #667eea;
    background: linear-gradient(135deg, #ffffff 0%, #e8f2ff 100%);
  }
  
  .feature-icon {
    transition: all 0.3s ease;
  }
  
  .feature-card:hover .feature-icon {
    transform: scale(1.1);
    filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.2));
  }
  
  .feature-card:hover h4 {
    color: #667eea !important;
  }
  
  .feature-card:hover .btn {
    background-color: #667eea;
    border-color: #667eea;
    color: white;
  }
  
  .hover-card {
    transition: all 0.3s ease;
    cursor: pointer;
    border: 2px solid transparent;
  }
  
  .hover-card:hover {
    background-color: #f8f9fa;
    border-color: #667eea;
    transform: translateX(5px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
  
  .bg-gradient-primary {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  }
  
  .bg-gradient-success {
    background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
  }

  .gaming-hover-card {
    transition: all 0.2s ease;
  }
  .gaming-hover-card:hover {
    border-color: rgba(0, 240, 255, 0.4) !important;
    transform: translateY(-2px);
    box-shadow: 0 4px 15px rgba(0, 240, 255, 0.15);
  }
`;

const HomePage = () => {
  const { user } = useAuth();
  const [activeMatches, setActiveMatches] = useState([]);

  useEffect(() => {
    const loadActiveMatches = async () => {
      if (!user) return;
      try {
        // 1. Charger mes clubs
        const myClubs = await clubAPI.getMyClubs(user.token);
        if (!myClubs || myClubs.length === 0) return;
        const myClubIds = myClubs.map(c => c._id.toString());
        
        // 2. Charger les compétitions en cours
        const response = await competitionAPI.getCompetitions({ statut: 'En cours', limit: 50 });
        const comps = response.competitions || [];
        
        // 3. Filtrer les matchs en cours
        const matches = [];
        comps.forEach(comp => {
          const compMatches = [];
          if (comp.poules) {
            comp.poules.forEach(p => {
              if (p.matchs) compMatches.push(...p.matchs);
            });
          }
          if (comp.matchsElimination) {
            compMatches.push(...comp.matchsElimination);
          }
          
          compMatches.forEach(m => {
            if (m.statut === 'En cours') {
              const t1Id = (m.equipe1?._id || m.equipe1)?.toString();
              const t2Id = (m.equipe2?._id || m.equipe2)?.toString();
              
              const isMyClub1 = myClubIds.includes(t1Id);
              const isMyClub2 = myClubIds.includes(t2Id);
              
              if (isMyClub1 || isMyClub2) {
                const getClubDetails = (cId) => {
                  const eq = comp.equipesInscrites?.find(e => (e.clubId?._id || e.clubId || '').toString() === cId);
                  return eq?.clubId || { nom: 'Club', logo: null };
                };
                
                matches.push({
                  matchId: m._id,
                  competitionId: comp._id,
                  competitionNom: comp.nom,
                  equipe1: getClubDetails(t1Id),
                  equipe2: getClubDetails(t2Id),
                  phase: m.phase || 'Match de poule',
                  type: m.type
                });
              }
            }
          });
        });
        
        setActiveMatches(matches);
      } catch (err) {
        console.error('Erreur chargement matchs actifs:', err);
      }
    };
    
    loadActiveMatches();
  }, [user]);

  return (
    <div className="min-vh-100">
      <style>{featureCardStyles}</style>
      {/* Hero Section */}
      <div className="text-white py-5 position-relative overflow-hidden" 
           style={{
             background: `url(${bgHeader}) no-repeat center center`,
             backgroundSize: 'cover',
             minHeight: '380px',
             borderBottom: '1px solid var(--border-glass)'
           }}>
        <div className="position-absolute w-100 h-100" 
             style={{
               background: 'linear-gradient(135deg, rgba(8, 12, 20, 0.92) 0%, rgba(17, 22, 37, 0.85) 100%)',
               top: 0,
               left: 0,
               zIndex: 1
             }}></div>
        <div className="container position-relative py-5" style={{zIndex: 2}}>
          <div className="row justify-content-center text-center">
            <div className="col-lg-8 px-4 px-md-5">
              <img src={logo} alt="Club Pro Communauté Logo" style={{ width: '80px', height: '80px', marginBottom: '1.5rem' }} />
              <h1 className="display-4 fw-bold mb-3 text-white" style={{fontFamily: 'Rajdhani', letterSpacing: '1px'}}>
                🏆 Club Pro Communauté
              </h1>
              <p className="lead mb-4 text-silver" style={{fontSize: '1.1rem', color: 'var(--text-silver)'}}>
                La plateforme de référence pour organiser et participer aux compétitions de clubs.
                Rejoignez ou créez votre équipe, et affrontez la communauté dans nos tournois en ligne.
              </p>
              {!user ? (
                <div className="d-flex gap-3 justify-content-center">
                  <Link to="/register" className="btn btn-primary btn-lg px-4">
                    <i className="fas fa-user-plus me-2"></i>
                    S'inscrire
                  </Link>
                  <Link to="/login" className="btn btn-outline-light btn-lg px-4">
                    <i className="fas fa-sign-in-alt me-2"></i>
                    Se connecter
                  </Link>
                </div>
              ) : (
                <div className="d-flex gap-3 justify-content-center">
                  <Link to="/competitions" className="btn btn-primary btn-lg px-4">
                    <i className="fas fa-trophy me-2"></i>
                    Voir les compétitions
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Matchs en Cours */}
      {activeMatches.length > 0 && (
        <div className="container py-4 mt-3 animate-fade-in">
          <div className="row justify-content-center">
            <div className="col-lg-8">
              <div className="card border-0 mb-4 shadow-sm" style={{ background: 'rgba(239, 68, 68, 0.05)', border: '1px solid rgba(239, 68, 68, 0.15)', borderRadius: '15px' }}>
                <div className="card-header border-0 bg-transparent pt-3 pb-0">
                  <h5 className="text-danger fw-bold mb-0 d-flex align-items-center gap-2" style={{ fontFamily: 'Rajdhani', letterSpacing: '1px' }}>
                    <span className="spinner-grow spinner-grow-sm text-danger" role="status"></span>
                    🎮 MATCH EN COURS
                  </h5>
                </div>
                <div className="card-body">
                  {activeMatches.map((m, idx) => (
                    <Link key={idx} to={`/competition/${m.competitionId}/match/${m.matchId}`} className="text-decoration-none d-block mb-3 p-3 rounded-lg gaming-hover-card" style={{ background: 'rgba(15, 23, 42, 0.6)', border: '1px solid rgba(255, 255, 255, 0.05)', borderRadius: '8px' }}>
                      <div className="d-flex justify-content-between align-items-center mb-2">
                        <span className="text-muted small text-uppercase fw-semibold" style={{ fontSize: '0.75rem' }}>{m.competitionNom} · {m.phase}</span>
                        {m.type === 'but_en_or' && <span className="badge bg-warning text-dark font-rajdhani fw-bold" style={{ fontSize: '0.7rem' }}>BUT EN OR</span>}
                      </div>
                      <div className="d-flex justify-content-between align-items-center">
                        <div className="d-flex align-items-center gap-2 flex-1">
                          {m.equipe1.logo ? (
                            <img src={m.equipe1.logo} alt="" className="rounded-circle" style={{ width: '28px', height: '28px', objectFit: 'cover' }} />
                          ) : (
                            <div className="rounded-circle bg-secondary d-flex align-items-center justify-content-center text-white text-uppercase" style={{ width: '28px', height: '28px', fontSize: '0.75rem' }}>{m.equipe1.nom?.substring(0, 2)}</div>
                          )}
                          <span className="text-white fw-semibold" style={{ fontSize: '0.9rem' }}>{m.equipe1.nom}</span>
                        </div>
                        <span className="text-warning fw-bold px-3" style={{ fontSize: '0.9rem' }}>VS</span>
                        <div className="d-flex align-items-center gap-2 flex-1 justify-content-end">
                          <span className="text-white fw-semibold" style={{ fontSize: '0.9rem' }}>{m.equipe2.nom}</span>
                          {m.equipe2.logo ? (
                            <img src={m.equipe2.logo} alt="" className="rounded-circle" style={{ width: '28px', height: '28px', objectFit: 'cover' }} />
                          ) : (
                            <div className="rounded-circle bg-secondary d-flex align-items-center justify-content-center text-white text-uppercase" style={{ width: '28px', height: '28px', fontSize: '0.75rem' }}>{m.equipe2.nom?.substring(0, 2)}</div>
                          )}
                        </div>
                      </div>
                      <div className="mt-3 text-center">
                        <span className="btn btn-sm btn-outline-danger text-uppercase font-rajdhani fw-bold py-1 px-4 w-100" style={{ fontSize: '0.8rem', letterSpacing: '0.5px' }}>
                          <i className="fas fa-play me-2"></i> Rejoindre le match
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Contenu principal */}
      <div className="container py-5">
        {/* Section Call to Action */}
        <div className="row justify-content-center">
          <div className="col-lg-8 px-4 px-md-5">
            <div className="card border-0 text-center p-4 p-md-5" 
                 style={{
                   background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.08) 0%, rgba(0, 240, 255, 0.04) 100%)',
                 }}>
              <h2 className="mb-4" style={{fontFamily: 'Rajdhani', fontWeight: 700}}>Prêt à rejoindre la communauté ?</h2>
              <p className="lead text-silver mb-4" style={{fontSize: '1.05rem', color: 'var(--text-silver)'}}>
                Créez votre profil de joueur, rejoignez votre équipe idéale et commencez votre aventure EA Sports FC Pro Clubs !
              </p>
              {!user ? (
                <div className="d-flex gap-3 justify-content-center">
                  <Link to="/register" className="btn btn-primary px-4">
                    <i className="fas fa-user-plus me-2"></i>
                    S'inscrire maintenant
                  </Link>
                </div>
              ) : (
                <div className="d-flex gap-3 justify-content-center">
                  <Link to="/mon-profil" className="btn btn-primary px-4">
                    <i className="fas fa-user me-2"></i>
                    Mon profil
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage; 