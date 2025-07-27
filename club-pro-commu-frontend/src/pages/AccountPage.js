import React from 'react';
import { useAuth } from '../context/AuthContext';

export default function AccountPage() {
  const { user } = useAuth();

  if (!user) {
    return (
      <div className="container py-5 text-center">
        <div className="alert alert-warning">Vous devez être connecté pour accéder à votre compte.</div>
      </div>
    );
  }

  return (
    <div className="container py-5">
      <h2>Mon compte</h2>
      <div className="card p-4 mt-4" style={{maxWidth: 400}}>
        <p><b>Pseudo :</b> {user.pseudo}</p>
        <p><b>Email :</b> {user.email}</p>
        <p className="text-success">Connecté en mode test</p>
      </div>
    </div>
  );
} 