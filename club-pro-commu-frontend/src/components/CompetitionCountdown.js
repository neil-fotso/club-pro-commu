import React, { useState, useEffect } from 'react';

export default function CompetitionCountdown({ dateDebut, statut }) {
  const [timeLeft, setTimeLeft] = useState('');
  const [isImminent, setIsImminent] = useState(false);

  useEffect(() => {
    if (statut !== 'Ouvert' && statut !== 'Fermé') {
      setTimeLeft('');
      return;
    }

    const interval = setInterval(() => {
      const diff = new Date(dateDebut).getTime() - Date.now();
      
      if (diff <= 0) {
        setTimeLeft('Lancement imminent');
        setIsImminent(true);
        clearInterval(interval);
        return;
      }

      // Convertir en jours, heures, minutes, secondes
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      // Alerte rouge si moins de 1 heure
      if (diff < 60 * 60 * 1000) {
        setIsImminent(true);
      } else {
        setIsImminent(false);
      }

      let text = '';
      if (days > 0) {
        text = `${days}j ${hours}h ${minutes}m`;
      } else if (hours > 0) {
        text = `${hours}h ${minutes}m ${seconds}s`;
      } else {
        text = `${minutes}m ${seconds}s`;
      }

      setTimeLeft(text);
    }, 1000);

    return () => clearInterval(interval);
  }, [dateDebut, statut]);

  if (statut !== 'Ouvert' && statut !== 'Fermé') {
    return null;
  }

  return (
    <div className="mt-2 text-center">
      <span className={`badge ${isImminent ? 'bg-danger animate-pulse text-white border border-danger' : 'bg-dark bg-opacity-75 text-warning border border-secondary border-opacity-25'} px-3 py-2 fw-semibold shadow-sm`} style={{ borderRadius: '20px', letterSpacing: '0.5px' }}>
        <i className="fas fa-stopwatch me-1.5"></i>
        {timeLeft ? ` Débute dans : ${timeLeft}` : ' Chargement...'}
      </span>
    </div>
  );
}
