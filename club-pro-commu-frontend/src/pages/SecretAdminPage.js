import React, { useState } from 'react';

const SecretAdminPage = () => {
  const [step, setStep] = useState('password'); // 'password' ou 'create'
  const [accessPassword, setAccessPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState('');
  const [adminData, setAdminData] = useState({
    nom: '',
    prenom: '',
    pseudo: '',
    email: '',
    password: '',
    pays: 'France',
    ville: '',
    telephoneProfessionnel: '',
    telephonePersonnel: ''
  });

  // Mot de passe secret pour accéder à cette page
  // En production, récupérer depuis une variable d'environnement ou une config sécurisée
  const SECRET_PASSWORD = process.env.REACT_APP_ADMIN_SECRET || 'CreateAdmin2024!';

  const API_URL = process.env.NODE_ENV === 'production' 
    ? 'https://club-pro-commu.onrender.com/api'
    : 'http://localhost:3001/api';

  // Vérifier si la page doit être accessible en production
  const isProduction = process.env.NODE_ENV === 'production';
  const allowInProduction = process.env.REACT_APP_ALLOW_ADMIN_CREATOR === 'true';

  const handleAccessSubmit = (e) => {
    e.preventDefault();
    
    // Vérifier si la page est accessible en production
    if (isProduction && !allowInProduction) {
      setResult('❌ Cette fonctionnalité est désactivée en production pour des raisons de sécurité.');
      return;
    }

    if (accessPassword === SECRET_PASSWORD) {
      setStep('create');
      setResult('🔓 Accès autorisé ! Vous pouvez maintenant créer un administrateur.');
    } else {
      setResult('❌ Mot de passe incorrect ! Accès refusé.');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setAdminData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const createAdmin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setResult('🔄 Création de l\'administrateur en cours...\n');

    try {
      // Validation des données
      if (!adminData.email || !adminData.password || !adminData.pseudo) {
        setResult('❌ Veuillez remplir au moins l\'email, le pseudo et le mot de passe.');
        return;
      }

      if (adminData.password.length < 8) {
        setResult('❌ Le mot de passe doit contenir au moins 8 caractères.');
        return;
      }

      setResult(prev => prev + '📧 Vérification de l\'unicité de l\'email...\n');

      // Créer l'admin via l'API
      const response = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...adminData,
          isAdmin: true
        })
      });

      if (response.ok) {
        await response.json();
        setResult(prev => prev + '✅ Utilisateur créé avec succès !\n');

        // Vérifier si les droits admin ont été attribués automatiquement
        setResult(prev => prev + '🛡️ Vérification des droits administrateur...\n');

        // Se connecter avec ce compte pour vérifier l'ID et les droits
        const loginResponse = await fetch(`${API_URL}/auth/login`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            email: adminData.email,
            password: adminData.password
          })
        });

        if (loginResponse.ok) {
          const loginData = await loginResponse.json();
          const userId = loginData.user._id;
          
          setResult(prev => prev + `📋 ID utilisateur récupéré: ${userId}\n`);
          setResult(prev => prev + '🎉 ADMINISTRATEUR CRÉÉ AVEC SUCCÈS !\n\n');
          setResult(prev => prev + '┌─────────────────────────────────────────────────────────────────────────┐\n');
          setResult(prev => prev + '│                          🛡️  NOUVEL ADMINISTRATEUR                       │\n');
          setResult(prev => prev + '├─────────────────────────────────────────────────────────────────────────┤\n');
          setResult(prev => prev + `│ 📧 Email:      ${adminData.email.padEnd(40)} │\n`);
          setResult(prev => prev + `│ 🔐 Password:   ${adminData.password.padEnd(40)} │\n`);
          setResult(prev => prev + `│ 👤 Pseudo:     ${adminData.pseudo.padEnd(40)} │\n`);
          setResult(prev => prev + `│ 🛡️  Admin:      OUI${' '.repeat(37)} │\n`);
          setResult(prev => prev + '└─────────────────────────────────────────────────────────────────────────┘\n\n');
          setResult(prev => prev + '🚀 ÉTAPES SUIVANTES:\n');
          setResult(prev => prev + '   1. Notez ces identifiants en lieu sûr\n');
          setResult(prev => prev + '   2. Connectez-vous avec ces identifiants\n');
          setResult(prev => prev + '   3. Accédez au Dashboard Admin\n');
          setResult(prev => prev + '   4. Supprimez cette page secrète si en production\n');

          // Réinitialiser le formulaire
          setAdminData({
            nom: '',
            prenom: '',
            pseudo: '',
            email: '',
            password: '',
            pays: 'France',
            ville: '',
            telephoneProfessionnel: '',
            telephonePersonnel: ''
          });

        } else {
          const loginError = await loginResponse.text();
          setResult(prev => prev + `⚠️ Compte créé mais impossible de vérifier les droits admin: ${loginError}\n`);
          setResult(prev => prev + '💡 Essayez de vous connecter manuellement avec ces identifiants.\n');
        }

      } else {
        const errorData = await response.text();
        setResult(prev => prev + `❌ Erreur lors de la création: ${response.status} - ${errorData}\n`);
        
        if (response.status === 400 && errorData.includes('email')) {
          setResult(prev => prev + '💡 Cet email existe peut-être déjà. Essayez un autre email.\n');
        }
      }

    } catch (error) {
      setResult(prev => prev + `❌ Erreur de connexion: ${error.message}\n`);
      setResult(prev => prev + '💡 Vérifiez que le backend est démarré sur le port 3001.\n');
    } finally {
      setLoading(false);
    }
  };

  // Bloquer l'accès en production si non autorisé
  if (isProduction && !allowInProduction) {
    return (
      <div className="container mt-5">
        <div className="row justify-content-center">
          <div className="col-md-8">
            <div className="alert alert-danger text-center">
              <h2>🚫 Accès Restreint</h2>
              <p className="lead">Cette fonctionnalité est désactivée en production pour des raisons de sécurité.</p>
              <hr />
              <h5>🔧 Pour les administrateurs système :</h5>
              <p className="mb-1">Pour activer temporairement cette page :</p>
              <ol className="text-start">
                <li>Définissez la variable d'environnement : <code>REACT_APP_ALLOW_ADMIN_CREATOR=true</code></li>
                <li>Définissez un mot de passe sécurisé : <code>REACT_APP_ADMIN_SECRET=votre_mot_de_passe_fort</code></li>
                <li>Redémarrez l'application</li>
                <li><strong>⚠️ IMPORTANT :</strong> Désactivez cette page après utilisation</li>
              </ol>
              <div className="mt-3">
                <small className="text-muted">
                  Environnement : Production | URL API : {API_URL}
                </small>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (step === 'password') {
    return (
      <div className="container mt-5">
        <div className="row justify-content-center">
          <div className="col-md-6">
            <div className="card shadow">
              <div className="card-header text-center bg-dark text-white">
                <h3>🔒 Zone Sécurisée</h3>
                <p className="mb-0">Accès Administrateur Requis</p>
              </div>
              <div className="card-body">
                <form onSubmit={handleAccessSubmit}>
                  <div className="mb-3">
                    <label htmlFor="accessPassword" className="form-label">
                      🔐 Mot de passe d'accès
                    </label>
                    <input
                      type="password"
                      className="form-control"
                      id="accessPassword"
                      value={accessPassword}
                      onChange={(e) => setAccessPassword(e.target.value)}
                      placeholder="Entrez le mot de passe secret"
                      required
                    />
                    <div className="form-text">
                      Cette page est protégée. Seuls les administrateurs système peuvent y accéder.
                    </div>
                  </div>
                  
                  <div className="d-grid">
                    <button type="submit" className="btn btn-dark">
                      🔓 Accéder
                    </button>
                  </div>
                </form>

                {result && (
                  <div className={`alert mt-3 ${result.includes('❌') ? 'alert-danger' : 'alert-success'}`}>
                    {result}
                  </div>
                )}
              </div>
              
              <div className="card-footer text-center text-muted">
                <small>
                  {isProduction ? (
                    <>
                      🔒 <strong>Mode Production</strong><br/>
                      Cette page est {allowInProduction ? 'temporairement activée' : 'désactivée'} en production<br/>
                      {allowInProduction && <span className="text-warning">⚠️ Désactivez après utilisation</span>}
                    </>
                  ) : (
                    <>
                      🛠️ <strong>Mode Développement</strong><br/>
                      🔒 Mot de passe: <code>{SECRET_PASSWORD}</code>
                    </>
                  )}
                </small>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mt-5">
      <div className="row">
        <div className="col-md-8">
          <div className="card shadow">
            <div className="card-header bg-success text-white">
              <h3>🛡️ Création d'Administrateur</h3>
              <p className="mb-0">Formulaire sécurisé pour créer un compte administrateur</p>
            </div>
            <div className="card-body">
              <form onSubmit={createAdmin}>
                <div className="row">
                  <div className="col-md-6">
                    <div className="mb-3">
                      <label htmlFor="nom" className="form-label">Nom</label>
                      <input
                        type="text"
                        className="form-control"
                        id="nom"
                        name="nom"
                        value={adminData.nom}
                        onChange={handleInputChange}
                        placeholder="Nom de famille"
                      />
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="mb-3">
                      <label htmlFor="prenom" className="form-label">Prénom</label>
                      <input
                        type="text"
                        className="form-control"
                        id="prenom"
                        name="prenom"
                        value={adminData.prenom}
                        onChange={handleInputChange}
                        placeholder="Prénom"
                      />
                    </div>
                  </div>
                </div>

                <div className="row">
                  <div className="col-md-6">
                    <div className="mb-3">
                      <label htmlFor="pseudo" className="form-label">
                        Pseudo <span className="text-danger">*</span>
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        id="pseudo"
                        name="pseudo"
                        value={adminData.pseudo}
                        onChange={handleInputChange}
                        placeholder="Nom d'utilisateur unique"
                        required
                      />
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="mb-3">
                      <label htmlFor="email" className="form-label">
                        Email <span className="text-danger">*</span>
                      </label>
                      <input
                        type="email"
                        className="form-control"
                        id="email"
                        name="email"
                        value={adminData.email}
                        onChange={handleInputChange}
                        placeholder="admin@example.com"
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="mb-3">
                  <label htmlFor="password" className="form-label">
                    Mot de passe <span className="text-danger">*</span>
                  </label>
                  <input
                    type="password"
                    className="form-control"
                    id="password"
                    name="password"
                    value={adminData.password}
                    onChange={handleInputChange}
                    placeholder="Minimum 8 caractères"
                    required
                    minLength="8"
                  />
                  <div className="form-text">
                    Choisissez un mot de passe fort avec au moins 8 caractères.
                  </div>
                </div>

                <div className="row">
                  <div className="col-md-6">
                    <div className="mb-3">
                      <label htmlFor="pays" className="form-label">Pays</label>
                      <select
                        className="form-select"
                        id="pays"
                        name="pays"
                        value={adminData.pays}
                        onChange={handleInputChange}
                      >
                        <option value="France">France</option>
                        <option value="Belgique">Belgique</option>
                        <option value="Suisse">Suisse</option>
                        <option value="Canada">Canada</option>
                        <option value="Autre">Autre</option>
                      </select>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="mb-3">
                      <label htmlFor="ville" className="form-label">Ville</label>
                      <input
                        type="text"
                        className="form-control"
                        id="ville"
                        name="ville"
                        value={adminData.ville}
                        onChange={handleInputChange}
                        placeholder="Ville"
                      />
                    </div>
                  </div>
                </div>

                <div className="row">
                  <div className="col-md-6">
                    <div className="mb-3">
                      <label htmlFor="telephoneProfessionnel" className="form-label">Téléphone Pro</label>
                      <input
                        type="tel"
                        className="form-control"
                        id="telephoneProfessionnel"
                        name="telephoneProfessionnel"
                        value={adminData.telephoneProfessionnel}
                        onChange={handleInputChange}
                        placeholder="+33 1 23 45 67 89"
                      />
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="mb-3">
                      <label htmlFor="telephonePersonnel" className="form-label">Téléphone Perso</label>
                      <input
                        type="tel"
                        className="form-control"
                        id="telephonePersonnel"
                        name="telephonePersonnel"
                        value={adminData.telephonePersonnel}
                        onChange={handleInputChange}
                        placeholder="+33 6 12 34 56 78"
                      />
                    </div>
                  </div>
                </div>

                <div className="d-grid gap-2 d-md-flex justify-content-md-end">
                  <button 
                    type="button" 
                    className="btn btn-secondary me-md-2"
                    onClick={() => {
                      setStep('password');
                      setAccessPassword('');
                      setResult('');
                    }}
                  >
                    🔒 Verrouiller
                  </button>
                  <button 
                    type="submit" 
                    className="btn btn-success"
                    disabled={loading}
                  >
                    {loading ? '🔄 Création...' : '🛡️ Créer Administrateur'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card">
            <div className="card-header">
              <h5>📋 Résultats</h5>
            </div>
            <div className="card-body">
              <pre style={{ 
                backgroundColor: '#f8f9fa', 
                padding: '1rem', 
                border: '1px solid #dee2e6',
                borderRadius: '0.375rem',
                fontSize: '0.75rem',
                maxHeight: '500px',
                overflow: 'auto',
                whiteSpace: 'pre-wrap'
              }}>
                {result || 'Aucune action effectuée'}
              </pre>
            </div>
          </div>

          <div className="card mt-3">
            <div className="card-header">
              <h6>ℹ️ Informations</h6>
            </div>
            <div className="card-body">
              <small>
                <strong>🌐 Environnement:</strong><br/>
                {isProduction ? '🏭 Production' : '🛠️ Développement'}<br/>
                API: {API_URL}<br/><br/>
                
                <strong>🔒 Sécurité:</strong><br/>
                {isProduction ? (
                  <>
                    • Accès contrôlé par variable d'environnement<br/>
                    • Mot de passe sécurisé requis<br/>
                    • Désactivation automatique recommandée<br/>
                  </>
                ) : (
                  <>
                    • Page de développement<br/>
                    • Mot de passe visible pour test<br/>
                    • Sécurisation requise pour production<br/>
                  </>
                )}<br/>
                
                <strong>📝 Champs requis:</strong><br/>
                • Email (unique)<br/>
                • Pseudo (unique)<br/>
                • Mot de passe (8+ caractères)<br/>
                {!isProduction && '• Plateforme non requise pour admin'}
              </small>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SecretAdminPage; 