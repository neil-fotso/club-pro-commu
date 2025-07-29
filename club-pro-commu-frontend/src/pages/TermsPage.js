import React from 'react';
import { Link } from 'react-router-dom';

export default function TermsPage() {
  return (
    <div className="container mt-4">
      <div className="row">
        <div className="col-lg-8 mx-auto">
          <div className="card shadow-sm">
            <div className="card-header bg-primary text-white">
              <h1 className="h3 mb-0">
                <i className="fas fa-file-contract me-2"></i>
                Conditions Générales d'Utilisation
              </h1>
              <p className="mb-0 mt-2">Dernière mise à jour : {new Date().toLocaleDateString('fr-FR')}</p>
            </div>
            <div className="card-body">
              <div className="alert alert-info">
                <i className="fas fa-info-circle me-2"></i>
                <strong>Club Pro Communauté</strong> est une plateforme de mise en relation pour les joueurs de jeux vidéo.
              </div>

              <h2 className="h4 text-primary mt-4 mb-3">1. Définitions</h2>
              <ul>
                <li><strong>Plateforme</strong> : Le site web et services Club Pro Communauté</li>
                <li><strong>Utilisateur</strong> : Toute personne utilisant la plateforme</li>
                <li><strong>Joueur</strong> : Utilisateur avec un profil de joueur</li>
                <li><strong>Club</strong> : Groupe de joueurs organisé sur la plateforme</li>
                <li><strong>Compétition</strong> : Tournoi ou événement organisé via la plateforme</li>
                <li><strong>Contenu</strong> : Toute information publiée par les utilisateurs</li>
              </ul>

              <h2 className="h4 text-primary mt-4 mb-3">2. Objet</h2>
              <p>
                Les présentes CGU ont pour objet de définir les modalités et conditions d'utilisation 
                de la plateforme Club Pro Communauté, service de mise en relation pour les joueurs de jeux vidéo.
              </p>

              <h2 className="h4 text-primary mt-4 mb-3">3. Acceptation des conditions</h2>
              <p>
                L'utilisation de la plateforme implique l'acceptation pleine et entière des présentes CGU. 
                Tout utilisateur qui n'accepte pas ces conditions ne doit pas utiliser la plateforme.
              </p>

              <h2 className="h4 text-primary mt-4 mb-3">4. Services proposés</h2>
              <h3 className="h5 mt-3">4.1 Services principaux</h3>
              <ul>
                <li>Création et gestion de profils de joueurs</li>
                <li>Recherche et mise en relation de joueurs</li>
                <li>Création et gestion de clubs</li>
                <li>Organisation de compétitions</li>
                <li>Système d'invitations et de notifications</li>
                <li>Intégration Discord pour les communications</li>
              </ul>

              <h3 className="h5 mt-3">4.2 Services optionnels</h3>
              <ul>
                <li>Recommandations personnalisées</li>
                <li>Statistiques détaillées</li>
                <li>Fonctionnalités avancées de recherche</li>
              </ul>

              <h2 className="h4 text-primary mt-4 mb-3">5. Conditions d'utilisation</h2>
              <h3 className="h5 mt-3">5.1 Âge minimum</h3>
              <p>
                L'utilisation de la plateforme est réservée aux personnes âgées d'au moins 13 ans. 
                Les mineurs de moins de 16 ans doivent avoir l'autorisation de leurs parents ou tuteurs légaux.
              </p>

              <h3 className="h5 mt-3">5.2 Capacité juridique</h3>
              <p>
                L'utilisateur déclare avoir la capacité juridique pour s'engager dans les présentes conditions.
              </p>

              <h3 className="h5 mt-3">5.3 Exactitude des informations</h3>
              <p>
                L'utilisateur s'engage à fournir des informations exactes, complètes et à jour lors de son inscription 
                et tout au long de son utilisation de la plateforme.
              </p>

              <h2 className="h4 text-primary mt-4 mb-3">6. Inscription et compte</h2>
              <h3 className="h5 mt-3">6.1 Création de compte</h3>
              <ul>
                <li>L'inscription est gratuite et obligatoire</li>
                <li>Un seul compte par personne physique</li>
                <li>L'email fourni doit être valide et personnel</li>
                <li>Le mot de passe doit être sécurisé</li>
              </ul>

              <h3 className="h5 mt-3">6.2 Sécurité du compte</h3>
              <ul>
                <li>L'utilisateur est responsable de la sécurité de ses identifiants</li>
                <li>Il doit immédiatement signaler toute utilisation non autorisée</li>
                <li>La plateforme ne peut être tenue responsable d'une utilisation frauduleuse</li>
              </ul>

              <h2 className="h4 text-primary mt-4 mb-3">7. Règles de conduite</h2>
              <h3 className="h5 mt-3">7.1 Comportement général</h3>
              <ul>
                <li>Respecter les autres utilisateurs</li>
                <li>Ne pas publier de contenu illégal, diffamatoire ou offensant</li>
                <li>Ne pas usurper l'identité d'autrui</li>
                <li>Ne pas utiliser la plateforme à des fins commerciales non autorisées</li>
                <li>Ne pas tenter de perturber le fonctionnement de la plateforme</li>
              </ul>

              <h3 className="h5 mt-3">7.2 Contenu interdit</h3>
              <ul>
                <li>Contenu à caractère pornographique ou sexuellement explicite</li>
                <li>Contenu violent, choquant ou gore</li>
                <li>Contenu discriminatoire ou haineux</li>
                <li>Contenu incitant à la violence ou au terrorisme</li>
                <li>Contenu contrefait ou violant les droits de propriété intellectuelle</li>
                <li>Spam, publicité non autorisée ou contenu commercial</li>
              </ul>

              <h2 className="h4 text-primary mt-4 mb-3">8. Clubs et compétitions</h2>
              <h3 className="h5 mt-3">8.1 Création de clubs</h3>
              <ul>
                <li>Un utilisateur ne peut créer qu'un seul club</li>
                <li>Le créateur devient automatiquement administrateur</li>
                <li>Le nom du club doit être unique et approprié</li>
                <li>La description doit être respectueuse et non commerciale</li>
              </ul>

              <h3 className="h5 mt-3">8.2 Gestion des clubs</h3>
              <ul>
                <li>Les administrateurs peuvent promouvoir des membres en admin</li>
                <li>Les administrateurs peuvent exclure des membres</li>
                <li>Les décisions d'exclusion doivent être justifiées</li>
                <li>Les membres peuvent quitter un club librement</li>
              </ul>

              <h3 className="h5 mt-3">8.3 Compétitions</h3>
              <ul>
                <li>Les compétitions doivent respecter les règles de jeu officielles</li>
                <li>Les récompenses annoncées doivent être honorées</li>
                <li>La plateforme n'est pas responsable des litiges entre participants</li>
                <li>Les compétitions peuvent être supprimées si elles violent les CGU</li>
              </ul>

              <h2 className="h4 text-primary mt-4 mb-3">9. Propriété intellectuelle</h2>
              <h3 className="h5 mt-3">9.1 Droits de la plateforme</h3>
              <p>
                La plateforme et son contenu (code, design, marques) sont protégés par les droits de propriété intellectuelle. 
                Toute reproduction ou utilisation non autorisée est interdite.
              </p>

              <h3 className="h5 mt-3">9.2 Contenu des utilisateurs</h3>
              <ul>
                <li>Les utilisateurs conservent leurs droits sur leur contenu</li>
                <li>Ils accordent une licence d'utilisation à la plateforme</li>
                <li>La plateforme peut supprimer tout contenu inapproprié</li>
                <li>Les utilisateurs sont responsables de leur contenu</li>
              </ul>

              <h2 className="h4 text-primary mt-4 mb-3">10. Protection des données</h2>
              <p>
                La collecte et le traitement des données personnelles sont régis par notre 
                <Link to="/privacy" className="text-decoration-none"> Politique de Confidentialité</Link> 
                et le Règlement Général sur la Protection des Données (RGPD).
              </p>

              <h2 className="h4 text-primary mt-4 mb-3">11. Responsabilités</h2>
              <h3 className="h5 mt-3">11.1 Responsabilité de la plateforme</h3>
              <ul>
                <li>La plateforme s'efforce de maintenir un service de qualité</li>
                <li>Elle ne peut garantir une disponibilité permanente</li>
                <li>Elle n'est pas responsable des relations entre utilisateurs</li>
                <li>Elle n'est pas responsable des contenus externes (Discord, etc.)</li>
              </ul>

              <h3 className="h5 mt-3">11.2 Responsabilité des utilisateurs</h3>
              <ul>
                <li>Ils sont responsables de leur comportement sur la plateforme</li>
                <li>Ils sont responsables des dommages causés à autrui</li>
                <li>Ils s'engagent à respecter les lois en vigueur</li>
                <li>Ils sont responsables de la sécurité de leur compte</li>
              </ul>

              <h2 className="h4 text-primary mt-4 mb-3">12. Limitation de responsabilité</h2>
              <p>
                Dans toute la mesure permise par la loi, la responsabilité de la plateforme est limitée aux dommages directs 
                prouvés, à l'exclusion de tout dommage indirect, accessoire ou consécutif.
              </p>

              <h2 className="h4 text-primary mt-4 mb-3">13. Sanctions</h2>
              <h3 className="h5 mt-3">13.1 Mesures possibles</h3>
              <ul>
                <li>Avertissement</li>
                <li>Suspension temporaire du compte</li>
                <li>Suppression de contenu inapproprié</li>
                <li>Fermeture définitive du compte</li>
                <li>Exclusion d'un club</li>
                <li>Suppression d'une compétition</li>
              </ul>

              <h3 className="h5 mt-3">13.2 Procédure</h3>
              <ul>
                <li>Les sanctions sont proportionnées à la gravité de l'infraction</li>
                <li>L'utilisateur est informé des motifs de la sanction</li>
                <li>Il peut contester la sanction dans un délai de 30 jours</li>
                <li>La plateforme se réserve le droit de modifier les sanctions</li>
              </ul>

              <h2 className="h4 text-primary mt-4 mb-3">14. Force majeure</h2>
              <p>
                La plateforme ne peut être tenue responsable de l'inexécution de ses obligations en cas de force majeure 
                (panne technique, catastrophe naturelle, etc.).
              </p>

              <h2 className="h4 text-primary mt-4 mb-3">15. Droit applicable</h2>
              <p>
                Les présentes CGU sont soumises au droit français. Tout litige sera soumis à la compétence 
                des tribunaux français, sauf pour les consommateurs qui peuvent saisir les tribunaux de leur domicile.
              </p>

              <h2 className="h4 text-primary mt-4 mb-3">16. Modification des CGU</h2>
              <p>
                La plateforme se réserve le droit de modifier ces CGU à tout moment. Les modifications importantes 
                seront notifiées par email et affichées sur le site. La poursuite de l'utilisation vaut acceptation 
                des nouvelles conditions.
              </p>

              <h2 className="h4 text-primary mt-4 mb-3">17. Contact</h2>
              <p>
                Pour toute question concernant ces CGU :<br />
                <strong>Email :</strong> legal@club-pro-commu.com<br />
                <strong>Adresse :</strong> [Adresse à compléter]
              </p>

              <div className="text-center mt-5">
                <Link to="/" className="btn btn-primary me-2">
                  <i className="fas fa-home me-2"></i>
                  Retour à l'accueil
                </Link>
                <Link to="/privacy" className="btn btn-outline-primary">
                  <i className="fas fa-shield-alt me-2"></i>
                  Politique de confidentialité
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 