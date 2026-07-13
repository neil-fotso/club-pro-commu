import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { adminAPI } from '../services/api';

export default function AdminSignalementsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [signalements, setSignalements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionEnCours, setActionEnCours] = useState(null);
  const [banModal, setBanModal] = useState({ open: false, item: null });
  const [banDuree, setBanDuree] = useState('7');
  const [banRaison, setBanRaison] = useState('');
  const [avertirModal, setAvertirModal] = useState({ open: false, item: null });
  const [avertirRaison, setAvertirRaison] = useState('');

  useEffect(() => {
    if (!user?.isAdmin) { navigate('/'); return; }
    fetchSignalements();
  }, [user, navigate]);

  const fetchSignalements = async () => {
    try {
      setLoading(true);
      const data = await adminAPI.getSignalements();
      setSignalements(data);
    } catch (err) {
      console.error('Erreur chargement signalements:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleIgnorer = async (item) => {
    if (!window.confirm('Ignorer ce signalement ?')) return;
    try {
      setActionEnCours(item.messageId);
      await adminAPI.ignorerSignalement(item.competitionId, item.matchId, item.messageId);
      setSignalements(s => s.filter(x => x.messageId !== item.messageId));
    } catch (err) { alert(err.message || 'Erreur'); }
    finally { setActionEnCours(null); }
  };

  const handleSupprimerMessage = async (item) => {
    if (!window.confirm('Supprimer ce message du chat ?')) return;
    try {
      setActionEnCours(item.messageId);
      await adminAPI.supprimerMessage(item.competitionId, item.matchId, item.messageId);
      setSignalements(s => s.filter(x => x.messageId !== item.messageId));
    } catch (err) { alert(err.message || 'Erreur'); }
    finally { setActionEnCours(null); }
  };

  const handleAvertir = async () => {
    if (!avertirModal.item) return;
    try {
      setActionEnCours(avertirModal.item.messageId);
      await adminAPI.avertirUtilisateur(avertirModal.item.expediteur, avertirRaison || 'Comportement inapproprié dans le chat', avertirModal.item.competitionId, avertirModal.item.matchId);
      setAvertirModal({ open: false, item: null });
      setAvertirRaison('');
      alert('Avertissement envoyé.');
      fetchSignalements();
    } catch (err) { alert(err.message || 'Erreur'); }
    finally { setActionEnCours(null); }
  };

  const handleBannir = async () => {
    if (!banModal.item) return;
    try {
      setActionEnCours(banModal.item.messageId);
      const dureeNum = banDuree === 'definitif' ? null : parseInt(banDuree, 10);
      await adminAPI.bannirUtilisateur(banModal.item.expediteur, dureeNum, banRaison);
      setBanModal({ open: false, item: null });
      setBanRaison('');
      alert('Utilisateur banni du chat.');
      fetchSignalements();
    } catch (err) { alert(err.message || 'Erreur'); }
    finally { setActionEnCours(null); }
  };

  if (!user?.isAdmin) return null;

  return (
    <div style={{ minHeight: '100vh', background: '#0d1320', color: '#e2e8f0', fontFamily: "'Inter', sans-serif", padding: '2rem 1rem' }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
        <div className="d-flex align-items-center gap-3 mb-4">
          <button className="btn btn-sm btn-outline-secondary" onClick={() => navigate('/admin/dashboard')}>← Retour</button>
          <div>
            <h1 className="mb-0 h4 text-danger fw-bold"><i className="fas fa-flag me-2"></i>Signalements Chat</h1>
            <p className="text-muted small mb-0">Messages signalés comme offensants par les participants</p>
          </div>
          <button className="btn btn-sm btn-outline-info ms-auto" onClick={fetchSignalements}><i className="fas fa-sync me-1"></i> Actualiser</button>
        </div>

        {loading ? (
          <div className="text-center py-5"><div className="spinner-border text-danger"></div></div>
        ) : signalements.length === 0 ? (
          <div className="text-center py-5" style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '16px' }}>
            <i className="fas fa-check-circle fa-3x text-success mb-3 opacity-50"></i>
            <p className="text-muted">Aucun message signalé en attente.</p>
          </div>
        ) : (
          <div className="d-flex flex-column gap-3">
            <p className="text-muted small">{signalements.length} signalement(s) en attente</p>
            {signalements.map((item) => (
              <div key={item.messageId} style={{ background: 'rgba(255,80,80,0.05)', border: '1px solid rgba(255,80,80,0.2)', borderRadius: '12px', padding: '1.25rem' }}>
                <div className="d-flex justify-content-between align-items-start flex-wrap gap-2 mb-3">
                  <div>
                    <span className="badge bg-danger me-2"><i className="fas fa-flag me-1"></i>{item.nbSignalements} signalement(s)</span>
                    <span className="text-muted small"><strong className="text-white">{item.pseudo}</strong> · {item.competitionNom} · {new Date(item.dateEnvoi).toLocaleString('fr-FR')}</span>
                  </div>
                </div>
                <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: '8px', padding: '0.75rem 1rem', fontSize: '0.92rem', marginBottom: '1rem', borderLeft: '3px solid rgba(255,80,80,0.5)' }}>
                  {item.texte}
                </div>
                {item.signalements.some(s => s.raison) && (
                  <div className="mb-3">
                    <p className="text-muted small mb-1">Raisons :</p>
                    {item.signalements.filter(s => s.raison).map((s, i) => (
                      <span key={i} className="badge bg-dark border border-secondary me-1 mb-1">{s.raison}</span>
                    ))}
                  </div>
                )}
                <div className="d-flex flex-wrap gap-2">
                  <button className="btn btn-sm btn-warning fw-bold" disabled={actionEnCours === item.messageId} onClick={() => { setAvertirModal({ open: true, item }); setAvertirRaison(''); }}>
                    <i className="fas fa-exclamation-triangle me-1"></i> Avertir
                  </button>
                  <button className="btn btn-sm btn-danger fw-bold" disabled={actionEnCours === item.messageId} onClick={() => { setBanModal({ open: true, item }); setBanDuree('7'); setBanRaison(''); }}>
                    <i className="fas fa-ban me-1"></i> Bannir
                  </button>
                  <button className="btn btn-sm btn-outline-danger" disabled={actionEnCours === item.messageId} onClick={() => handleSupprimerMessage(item)}>
                    <i className="fas fa-trash me-1"></i> Supprimer message
                  </button>
                  <button className="btn btn-sm btn-outline-secondary ms-auto" disabled={actionEnCours === item.messageId} onClick={() => handleIgnorer(item)}>
                    <i className="fas fa-times me-1"></i> Ignorer
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modale Avertissement */}
      {avertirModal.open && (
        <div className="modal show d-block" style={{ background: 'rgba(0,0,0,0.7)', zIndex: 9999 }} onClick={() => setAvertirModal({ open: false, item: null })}>
          <div className="modal-dialog modal-dialog-centered" onClick={e => e.stopPropagation()}>
            <div className="modal-content" style={{ background: '#1a2035', border: '1px solid rgba(255,193,7,0.3)' }}>
              <div className="modal-header border-warning border-opacity-25">
                <h5 className="modal-title text-warning"><i className="fas fa-exclamation-triangle me-2"></i>Émettre un avertissement</h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setAvertirModal({ open: false, item: null })}></button>
              </div>
              <div className="modal-body">
                <p className="text-muted small mb-3">Avertir <strong className="text-white">{avertirModal.item?.pseudo}</strong></p>
                <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: '8px', padding: '0.75rem', marginBottom: '1rem', fontSize: '0.88rem' }}>{avertirModal.item?.texte}</div>
                <input type="text" className="form-control bg-dark border-secondary text-white" placeholder="Raison de l'avertissement..." value={avertirRaison} onChange={e => setAvertirRaison(e.target.value)} />
              </div>
              <div className="modal-footer border-secondary border-opacity-25">
                <button className="btn btn-secondary" onClick={() => setAvertirModal({ open: false, item: null })}>Annuler</button>
                <button className="btn btn-warning text-dark fw-bold" onClick={handleAvertir}><i className="fas fa-exclamation-triangle me-1"></i>Avertir</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modale Bannissement */}
      {banModal.open && (
        <div className="modal show d-block" style={{ background: 'rgba(0,0,0,0.7)', zIndex: 9999 }} onClick={() => setBanModal({ open: false, item: null })}>
          <div className="modal-dialog modal-dialog-centered" onClick={e => e.stopPropagation()}>
            <div className="modal-content" style={{ background: '#1a2035', border: '1px solid rgba(255,80,80,0.3)' }}>
              <div className="modal-header border-danger border-opacity-25">
                <h5 className="modal-title text-danger"><i className="fas fa-ban me-2"></i>Bannir du chat</h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setBanModal({ open: false, item: null })}></button>
              </div>
              <div className="modal-body">
                <p className="text-muted small mb-3">Bannir <strong className="text-white">{banModal.item?.pseudo}</strong></p>
                <select className="form-select bg-dark border-secondary text-white mb-3" value={banDuree} onChange={e => setBanDuree(e.target.value)}>
                  <option value="7">7 jours</option>
                  <option value="30">30 jours</option>
                  <option value="90">90 jours</option>
                  <option value="definitif">Définitif</option>
                </select>
                <input type="text" className="form-control bg-dark border-secondary text-white" placeholder="Raison transmise à l'utilisateur..." value={banRaison} onChange={e => setBanRaison(e.target.value)} />
              </div>
              <div className="modal-footer border-secondary border-opacity-25">
                <button className="btn btn-secondary" onClick={() => setBanModal({ open: false, item: null })}>Annuler</button>
                <button className="btn btn-danger fw-bold" onClick={handleBannir}><i className="fas fa-ban me-1"></i>Bannir</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
