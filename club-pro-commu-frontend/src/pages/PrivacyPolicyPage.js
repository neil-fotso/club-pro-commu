import React from 'react';
import { Link } from 'react-router-dom';

export default function PrivacyPolicyPage() {
  return (
    <div className="container mt-4">
      <div className="row">
        <div className="col-lg-8 mx-auto">
          <div className="card shadow-sm">
            <div className="card-header bg-primary text-white">
              <h1 className="h3 mb-0">
                <i className="fas fa-shield-alt me-2"></i>
                Politique de Confidentialité
              </h1>
              <p className="mb-0 mt-2">Dernière mise à jour : {new Date().toLocaleDateString('fr-FR')}</p>
            </div>
            <div className="card-body">
              <div className="alert alert-info">
                <i className="fas fa-info-circle me-2"></i>
                <strong>Club Pro Communauté</strong> s'engage à protéger votre vie privée et à traiter vos données personnelles de manière transparente et sécurisée.
              </div>

              <h2 className="h4 text-primary mt-4 mb-3">1. Responsable du traitement</h2>
              <p>
                <strong>Club Pro Communauté</strong><br />
                Contact : privacy@club-pro-commu.com<br />
                Adresse : [Adresse à compléter]<br />
                SIRET : [Numéro à compléter]
              </p>

              <h2 className="h4 text-primary mt-4 mb-3">2. Données personnelles collectées</h2>
              <h3 className="h5 mt-3">2.1 Données d'identification</h3>
              <ul>
                <li>Nom d'utilisateur (pseudo)</li>
                <li>Adresse e-mail</li>
                <li>Mot de passe (haché)</li>
              </ul>

              <h3 className="h5 mt-3">2.2 Données de profil joueur</h3>
              <ul>
                <li>Âge et date de naissance</li>
                <li>Pays et nationalité</li>
                <li>Ville</li>
                <li>Plateforme de jeu</li>
                <li>Position et niveau de jeu</li>
                <li>Bio et description</li>
                <li>Photo de profil (optionnelle)</li>
              </ul>

              <h3 className="h5 mt-3">2.3 Données de jeu et statistiques</h3>
              <ul>
                <li>Statistiques de jeu (matchs joués, victoires, etc.)</li>
                <li>Récompenses et trophées</li>
                <li>Horaires de disponibilité</li>
                <li>Dernière activité</li>
              </ul>

              <h3 className="h5 mt-3">2.4 Données de club</h3>
              <ul>
                <li>Nom et description du club</li>
                <li>Membres et rôles</li>
                <li>Historique des invitations</li>
                <li>Date de création</li>
              </ul>

              <h3 className="h5 mt-3">2.5 Données techniques</h3>
              <ul>
                <li>Adresse IP</li>
                <li>Données de navigation</li>
                <li>Cookies et traceurs</li>
                <li>Logs de connexion</li>
              </ul>

              <h2 className="h4 text-primary mt-4 mb-3">3. Finalités du traitement</h2>
              <h3 className="h5 mt-3">3.1 Finalités principales</h3>
              <ul>
                <li><strong>Création et gestion de compte</strong> : Authentification, sécurité</li>
                <li><strong>Services de mise en relation</strong> : Recherche de joueurs et clubs</li>
                <li><strong>Gestion des clubs</strong> : Création, adhésion, administration</li>
                <li><strong>Organisation de compétitions</strong> : Inscription, gestion des tournois</li>
                <li><strong>Communication</strong> : Notifications, invitations, messages</li>
              </ul>

              <h3 className="h5 mt-3">3.2 Finalités secondaires</h3>
              <ul>
                <li><strong>Amélioration des services</strong> : Statistiques anonymisées</li>
                <li><strong>Sécurité</strong> : Prévention des fraudes et abus</li>
                <li><strong>Support client</strong> : Assistance et résolution de problèmes</li>
              </ul>

              <h2 className="h4 text-primary mt-4 mb-3">4. Base légale</h2>
              <ul>
                <li><strong>Exécution du contrat</strong> : Services de mise en relation</li>
                <li><strong>Intérêt légitime</strong> : Sécurité, amélioration des services</li>
                <li><strong>Consentement</strong> : Cookies, communications marketing</li>
                <li><strong>Obligation légale</strong> : Conservation des données comptables</li>
              </ul>

              <h2 className="h4 text-primary mt-4 mb-3">5. Destinataires des données</h2>
              <h3 className="h5 mt-3">5.1 Destinataires internes</h3>
              <ul>
                <li>Équipe technique (accès limité et sécurisé)</li>
                <li>Support client (données nécessaires uniquement)</li>
                <li>Administrateurs de clubs (données des membres)</li>
              </ul>

              <h3 className="h5 mt-3">5.2 Destinataires externes</h3>
              <ul>
                <li><strong>Prestataires techniques</strong> : Hébergement, sécurité</li>
                <li><strong>Discord</strong> : Notifications et intégrations (avec consentement)</li>
                <li><strong>Autorités</strong> : Sur demande légale uniquement</li>
              </ul>

              <h2 className="h4 text-primary mt-4 mb-3">6. Durée de conservation</h2>
              <ul>
                <li><strong>Compte actif</strong> : Jusqu'à suppression par l'utilisateur</li>
                <li><strong>Compte inactif</strong> : 2 ans après dernière connexion</li>
                <li><strong>Données de connexion</strong> : 12 mois</li>
                <li><strong>Cookies</strong> : 13 mois maximum</li>
                <li><strong>Données comptables</strong> : 10 ans (obligation légale)</li>
              </ul>

              <h2 className="h4 text-primary mt-4 mb-3">7. Vos droits</h2>
              <div className="row">
                <div className="col-md-6">
                  <h3 className="h5 mt-3">7.1 Droits d'accès et de rectification</h3>
                  <ul>
                    <li>Accéder à vos données personnelles</li>
                    <li>Rectifier les données inexactes</li>
                    <li>Compléter les données incomplètes</li>
                  </ul>
                </div>
                <div className="col-md-6">
                  <h3 className="h5 mt-3">7.2 Droits d'opposition et d'effacement</h3>
                  <ul>
                    <li>Vous opposer au traitement</li>
                    <li>Demander l'effacement de vos données</li>
                    <li>Limiter le traitement</li>
                  </ul>
                </div>
              </div>

              <h3 className="h5 mt-3">7.3 Droit à la portabilité</h3>
              <p>Vous pouvez récupérer vos données dans un format structuré et les transférer à un autre responsable.</p>

              <h2 className="h4 text-primary mt-4 mb-3">8. Sécurité des données</h2>
              <ul>
                <li><strong>Chiffrement</strong> : HTTPS, mots de passe hachés</li>
                <li><strong>Accès restreint</strong> : Authentification forte</li>
                <li><strong>Surveillance</strong> : Détection d'intrusion</li>
                <li><strong>Sauvegarde</strong> : Données sécurisées</li>
                <li><strong>Formation</strong> : Personnel sensibilisé au RGPD</li>
              </ul>

              <h2 className="h4 text-primary mt-4 mb-3">9. Cookies et traceurs</h2>
              <p>Nous utilisons des cookies pour :</p>
              <ul>
                <li><strong>Cookies techniques</strong> : Fonctionnement du site (obligatoires)</li>
                <li><strong>Cookies d'authentification</strong> : Connexion sécurisée</li>
                <li><strong>Cookies de préférences</strong> : Personnalisation (avec consentement)</li>
                <li><strong>Cookies analytiques</strong> : Statistiques anonymisées (avec consentement)</li>
              </ul>

              <h2 className="h4 text-primary mt-4 mb-3">10. Transferts hors UE</h2>
              <p>Vos données sont principalement traitées en France. En cas de transfert hors UE :</p>
              <ul>
                <li>Garanties contractuelles appropriées</li>
                <li>Décisions d'adéquation de la Commission européenne</li>
                <li>Certifications approuvées</li>
              </ul>

              <h2 className="h4 text-primary mt-4 mb-3">11. Contact et réclamations</h2>
              <div className="row">
                <div className="col-md-6">
                  <h3 className="h5 mt-3">Pour exercer vos droits</h3>
                  <p>
                    <strong>Email :</strong> privacy@club-pro-commu.com<br />
                    <strong>Adresse :</strong> [Adresse à compléter]<br />
                    <strong>Délai de réponse :</strong> 1 mois maximum
                  </p>
                </div>
                <div className="col-md-6">
                  <h3 className="h5 mt-3">Autorité de contrôle</h3>
                  <p>
                    <strong>CNIL</strong><br />
                    <a href="https://www.cnil.fr" target="_blank" rel="noopener noreferrer">
                      www.cnil.fr
                    </a><br />
                    3 Place de Fontenoy<br />
                    75007 Paris
                  </p>
                </div>
              </div>

              <h2 className="h4 text-primary mt-4 mb-3">12. Modifications</h2>
              <p>
                Cette politique peut être mise à jour. Les modifications importantes seront notifiées par email 
                et affichées sur le site. La date de dernière mise à jour est indiquée en haut de cette page.
              </p>

              <div className="text-center mt-5">
                <Link to="/" className="btn btn-primary me-2">
                  <i className="fas fa-home me-2"></i>
                  Retour à l'accueil
                </Link>
                <Link to="/cgu" className="btn btn-outline-primary">
                  <i className="fas fa-file-contract me-2"></i>
                  Voir les CGU
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 