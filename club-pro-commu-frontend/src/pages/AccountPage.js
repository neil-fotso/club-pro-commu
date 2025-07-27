import React from 'react';
import { useAuth } from '../context/AuthContext';
import Avatar from '../components/Avatar';

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
      <div className="row justify-content-center">
        <div className="col-lg-8">
          <div className="card border-0 shadow-lg">
            <div className="card-header text-white text-center" style={{background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'}}>
              <h2 className="mb-0">
                <i className="fas fa-user-circle me-2"></i>
                Mon Compte
              </h2>
            </div>
            <div className="card-body p-5">
              <div className="row">
                <div className="col-md-4 text-center mb-4">
                  <Avatar
                    src={user.photoProfil}
                    name={user.pseudo}
                    size="3xl"
                    type="player"
                    className="mb-3"
                  />
                  <h4 className="text-primary">{user.pseudo}</h4>
                  <p className="text-muted">Membre de la communauté</p>
                </div>
                <div className="col-md-8">
                  <h5 className="text-primary mb-3">
                    <i className="fas fa-info-circle me-2"></i>
                    Informations du compte
                  </h5>
                  <div className="row">
                    <div className="col-sm-6 mb-3">
                      <label className="form-label fw-bold">Pseudo</label>
                      <p className="text-muted">{user.pseudo}</p>
                    </div>
                    <div className="col-sm-6 mb-3">
                      <label className="form-label fw-bold">Email</label>
                      <p className="text-muted">{user.email}</p>
                    </div>
                    <div className="col-sm-6 mb-3">
                      <label className="form-label fw-bold">Plateforme</label>
                      <p className="text-muted">{user.plateforme || 'Non spécifiée'}</p>
                    </div>
                    <div className="col-sm-6 mb-3">
                      <label className="form-label fw-bold">Statut</label>
                      <span className="badge bg-success">Connecté</span>
                    </div>
                  </div>
                  
                  <hr />
                  
                  <div className="d-grid gap-2 d-md-flex justify-content-md-start">
                    <a href="/profile/edit" className="btn btn-primary">
                      <i className="fas fa-edit me-2"></i>
                      Modifier le profil
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 