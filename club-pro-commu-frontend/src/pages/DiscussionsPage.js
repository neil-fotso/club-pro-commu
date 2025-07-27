import React from 'react';
import { useAuth } from '../context/AuthContext';

export default function DiscussionsPage() {
  const { user } = useAuth();

  if (!user) {
    return (
      <div className="container py-5 text-center">
        <div className="alert alert-warning">Connectez-vous pour accéder au forum.</div>
      </div>
    );
  }

  return (
    <div className="container py-5">
      <h2>Discussions / Forum</h2>
      <p>Fonctionnalité à venir : espace d'échange entre les membres.</p>
    </div>
  );
} 