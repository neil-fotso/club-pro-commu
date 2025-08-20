require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Player = require('../models/Player');
const Club = require('../models/Club');

const MONGODB_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/club-pro-commu';

// Données pour générer les joueurs
const prenoms = [
  'Lucas', 'Thomas', 'Hugo', 'Louis', 'Théo', 'Nathan', 'Enzo', 'Léo', 'Gabriel', 'Arthur',
  'Jules', 'Maxime', 'Noah', 'Adam', 'Paul', 'Raphaël', 'Antoine', 'Alexandre', 'Clément', 'Nicolas',
  'Pierre', 'Valentin', 'Mathis', 'Julien', 'Baptiste', 'Mohamed', 'Romain', 'Kevin', 'Alexis', 'David'
];

const noms = [
  'Martin', 'Bernard', 'Dubois', 'Thomas', 'Robert', 'Richard', 'Petit', 'Durand', 'Leroy', 'Moreau',
  'Simon', 'Laurent', 'Lefebvre', 'Michel', 'Garcia', 'David', 'Bertrand', 'Roux', 'Vincent', 'Fournier',
  'Morel', 'Girard', 'Andre', 'Lefevre', 'Mercier', 'Dupont', 'Lambert', 'Bonnet', 'François', 'Martinez'
];

const positions = ['Gardien', 'Défenseur', 'Milieu', 'Attaquant'];
const postesGardien = ['GB'];
const postesDefenseur = ['DG', 'DC', 'DD', 'MDC'];
const postesMilieu = ['MG', 'MC', 'MD', 'MOC', 'MDC'];
const postesAttaquant = ['AG', 'BU', 'AD'];
const plateformes = ['PS5', 'Xbox', 'PC'];
const pays = ['FR', 'BE', 'CH', 'CA', 'MA', 'TN', 'SN'];
const villes = ['Paris', 'Lyon', 'Marseille', 'Toulouse', 'Nice', 'Nantes', 'Montpellier', 'Strasbourg', 'Bordeaux', 'Lille'];
const langues = ['Français', 'Anglais', 'Espagnol', 'Arabe'];

// Données pour les clubs
const nomsClubs = [
  'FC Dragons', 'Eagles United', 'Thunder FC', 'Phoenix Rising', 'Wolves Esport',
  'Titans Gaming', 'Storm Warriors', 'Fire Legends', 'Ice Breakers', 'Lightning Bolts',
  'Shadow Hunters', 'Golden Lions'
];

const createTestData = async () => {
  try {
    console.log('🔄 Connexion à MongoDB...');
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connexion MongoDB établie');

    // Mot de passe commun pour tous les comptes de test
    const commonPassword = 'TestPassword123!';
    const hashedPassword = await bcrypt.hash(commonPassword, 12);

    console.log('\n🔄 Vérification/Création de l\'administrateur...');
    
    // Vérifier si l'admin existe déjà
    let adminUser = await User.findOne({ email: 'admin@clubprocommu.fr' });
    
    if (!adminUser) {
      // Créer l'administrateur
      adminUser = new User({
        email: 'admin@clubprocommu.fr',
        pseudo: 'AdminClubPro',
        password: hashedPassword,
        isAdmin: true,
        dateCreation: new Date(),
        derniereConnexion: new Date()
      });
      
      await adminUser.save();
      console.log('✅ Administrateur créé avec succès');
    } else {
      console.log('✅ Administrateur existe déjà');
    }
    console.log('📧 Email: admin@clubprocommu.fr');
    console.log('🔑 Mot de passe: TestPassword123!');
    console.log('👑 Rôle: admin');

    console.log('\n🔄 Création de 30 joueurs de test...');
    
    const users = [];
    const players = [];
    
    for (let i = 1; i <= 30; i++) {
      const prenom = prenoms[Math.floor(Math.random() * prenoms.length)];
      const nom = noms[Math.floor(Math.random() * noms.length)];
      const pseudo = `${prenom}${nom}${i}`.toLowerCase();
      const email = `${pseudo}@test.com`;
      
      // Créer l'utilisateur
      const user = new User({
        email: email,
        pseudo: pseudo,
        password: hashedPassword,
        isAdmin: false,
        dateCreation: new Date(),
        derniereConnexion: new Date()
      });
      
      await user.save();
      users.push(user);
      
      // Sélectionner position et poste principal
      const position = positions[Math.floor(Math.random() * positions.length)];
      let postePrincipal;
      let postesSecondaires = [];
      
      switch(position) {
        case 'Gardien':
          postePrincipal = postesGardien[0];
          break;
        case 'Défenseur':
          postePrincipal = postesDefenseur[Math.floor(Math.random() * postesDefenseur.length)];
          postesSecondaires = postesDefenseur.filter(p => p !== postePrincipal).slice(0, Math.floor(Math.random() * 2));
          break;
        case 'Milieu':
          postePrincipal = postesMilieu[Math.floor(Math.random() * postesMilieu.length)];
          postesSecondaires = postesMilieu.filter(p => p !== postePrincipal).slice(0, Math.floor(Math.random() * 2));
          break;
        case 'Attaquant':
          postePrincipal = postesAttaquant[Math.floor(Math.random() * postesAttaquant.length)];
          postesSecondaires = postesAttaquant.filter(p => p !== postePrincipal).slice(0, Math.floor(Math.random() * 2));
          break;
      }
      
      // Créer le profil joueur
      const player = new Player({
        userId: user._id,
        pseudo: pseudo,
        age: Math.floor(Math.random() * 20) + 16, // 16-35 ans
        pays: pays[Math.floor(Math.random() * pays.length)],
        ville: villes[Math.floor(Math.random() * villes.length)],
        plateforme: plateformes[Math.floor(Math.random() * plateformes.length)],
        pseudoPlateforme: pseudo,
        position: position,
        postePrincipal: postePrincipal,
        postesSecondaires: postesSecondaires,
        langues: [langues[Math.floor(Math.random() * langues.length)]],
        experience: Math.floor(Math.random() * 10), // 0-9 ans d'expérience
        bio: `Joueur passionné de FIFA, spécialisé en ${position}. Recherche un club sérieux pour progresser ensemble !`,
        description: `Expérience en ${position}, disponible pour des matchs compétitifs.`,
        rechercheClub: Math.random() > 0.3, // 70% recherchent un club
        disponibilite: Math.random() > 0.2 ? 'Disponible' : 'Indisponible', // 80% disponibles
        derniereActivite: new Date(),
        statutVerification: 'Non vérifié',
        statistiques: {
          matchsJoues: Math.floor(Math.random() * 100),
          victoires: Math.floor(Math.random() * 60),
          defaites: Math.floor(Math.random() * 40),
          nuls: Math.floor(Math.random() * 20),
          butsMarques: Math.floor(Math.random() * 50),
          butsEncaisses: Math.floor(Math.random() * 30),
          passesDecisives: Math.floor(Math.random() * 40),
          cleanSheets: Math.floor(Math.random() * 15)
        },
        preferences: {
          notifications: {
            email: true,
            push: true,
            discord: Math.random() > 0.5
          },
          visibilite: {
            profil: 'Public',
            statistiques: 'Public',
            disponibilite: 'Public'
          },
          langue: 'Français',
          fuseauHoraire: 'Europe/Paris'
        }
      });
      
      await player.save();
      players.push(player);
      
      if (i % 5 === 0) {
        console.log(`✅ ${i}/30 joueurs créés...`);
      }
    }
    
    console.log('✅ 30 joueurs créés avec succès');
    console.log('🔑 Mot de passe commun pour tous: TestPassword123!');

    console.log('\n🔄 Création de 12 clubs de test...');
    
    const clubs = [];
    
    for (let i = 0; i < 12; i++) {
      const nomClub = nomsClubs[i];
      const createurIndex = Math.floor(Math.random() * users.length);
      const createur = users[createurIndex];
      
      const club = new Club({
        nom: nomClub,
        description: `${nomClub} est un club compétitif recherchant des joueurs motivés pour participer à des tournois et matchs amicaux. Ambiance conviviale garantie !`,
        createurId: createur._id,
        plateformes: [plateformes[Math.floor(Math.random() * plateformes.length)]],
        pays: pays[Math.floor(Math.random() * pays.length)],
        effectifMax: Math.floor(Math.random() * 10) + 15, // 15-24 joueurs max
        effectifActuel: Math.floor(Math.random() * 8) + 3, // 3-10 joueurs actuels
        langues: [langues[Math.floor(Math.random() * langues.length)]],
        recrute: Math.random() > 0.3, // 70% recrutent
        postesRecherches: Math.random() > 0.5 ? 
          ['Milieu', 'Attaquant'] : 
          ['Défenseur', 'Gardien'],
        niveau: ['Débutant', 'Intermédiaire', 'Avancé'][Math.floor(Math.random() * 3)],
        ambiance: ['Compétitive', 'Décontractée', 'Mixte'][Math.floor(Math.random() * 3)],
        horaires: 'Lun-Ven: 20h-22h, Weekend: 14h-18h',
        reseauxSociaux: {
          discord: Math.random() > 0.5 ? `discord.gg/${nomClub.toLowerCase().replace(/\s+/g, '')}` : '',
          twitter: Math.random() > 0.7 ? `@${nomClub.toLowerCase().replace(/\s+/g, '')}` : '',
          twitch: Math.random() > 0.8 ? `twitch.tv/${nomClub.toLowerCase().replace(/\s+/g, '')}` : ''
        },
        statistiques: {
          matchsJoues: Math.floor(Math.random() * 50),
          victoires: Math.floor(Math.random() * 30),
          defaites: Math.floor(Math.random() * 20),
          nuls: Math.floor(Math.random() * 10),
          butsMarques: Math.floor(Math.random() * 100),
          butsEncaisses: Math.floor(Math.random() * 80)
        },
        dateCreation: new Date(Date.now() - Math.floor(Math.random() * 90) * 24 * 60 * 60 * 1000), // Créés dans les 90 derniers jours
        derniereActivite: new Date(Date.now() - Math.floor(Math.random() * 7) * 24 * 60 * 60 * 1000) // Activité dans les 7 derniers jours
      });
      
      await club.save();
      clubs.push(club);
      
      console.log(`✅ Club "${nomClub}" créé (${i + 1}/12)`);
    }
    
    console.log('\n🎉 Toutes les données de test ont été créées avec succès !');
    console.log('\n📊 Résumé :');
    console.log(`👤 Utilisateurs créés : ${users.length + 1} (30 joueurs + 1 admin)`);
    console.log(`⚽ Profils joueurs : ${players.length}`);
    console.log(`🏆 Clubs créés : ${clubs.length}`);
    
    console.log('\n🔐 Accès administrateur :');
    console.log('📧 Email : admin@clubprocommu.fr');
    console.log('🔑 Mot de passe : TestPassword123!');
    console.log('👑 Rôle : admin');
    
    console.log('\n🔐 Accès joueurs de test :');
    console.log('🔑 Mot de passe commun : TestPassword123!');
    console.log('📧 Format email : [pseudo]@test.com');
    console.log('👤 Exemples : lucasmartin1@test.com, thomasbernard2@test.com, etc.');

  } catch (error) {
    console.error('❌ Erreur lors de la création des données :', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Déconnexion de MongoDB');
  }
};

createTestData(); 