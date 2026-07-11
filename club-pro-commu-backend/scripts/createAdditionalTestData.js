require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Player = require('../models/Player');
const Club = require('../models/Club');

const createAdditionalTestData = async () => {
  try {
    console.log('🔄 Connexion à MongoDB...');
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/club-pro-commu');
    
    console.log('🚀 CRÉATION DE DONNÉES SUPPLÉMENTAIRES\n');
    console.log('═══════════════════════════════════════════════\n');
    
    // Mot de passe commun
    const commonPassword = 'TestPassword123!';
    const hashedPassword = await bcrypt.hash(commonPassword, 10);
    
    // Statistiques initiales
    const initialPlayers = await Player.countDocuments();
    const initialClubs = await Club.countDocuments();
    
    console.log(`📊 État actuel: ${initialPlayers} joueurs, ${initialClubs} clubs\n`);
    
    // ===== CRÉATION DE 15 NOUVEAUX JOUEURS =====
    console.log('👥 CRÉATION DE 15 NOUVEAUX JOUEURS...\n');
    
    const additionalPlayersData = [
      { pseudo: 'lucasmartin31', nom: 'Martin', prenom: 'Lucas', plateforme: 'PS5', position: 'Gardien' },
      { pseudo: 'emilebertrand32', nom: 'Bertrand', prenom: 'Émile', plateforme: 'Xbox', position: 'Défenseur' },
      { pseudo: 'victorlaurent33', nom: 'Laurent', prenom: 'Victor', plateforme: 'PC', position: 'Milieu' },
      { pseudo: 'hugolefebvre34', nom: 'Lefebvre', prenom: 'Hugo', plateforme: 'PS5', position: 'Attaquant' },
      { pseudo: 'raphaëldurand35', nom: 'Durand', prenom: 'Raphaël', plateforme: 'Xbox', position: 'Défenseur' },
      { pseudo: 'noahlambert36', nom: 'Lambert', prenom: 'Noah', plateforme: 'PC', position: 'Milieu' },
      { pseudo: 'gaëlrobert37', nom: 'Robert', prenom: 'Gaël', plateforme: 'PS5', position: 'Attaquant' },
      { pseudo: 'bastienrichard38', nom: 'Richard', prenom: 'Bastien', plateforme: 'Xbox', position: 'Gardien' },
      { pseudo: 'orianethomas39', nom: 'Thomas', prenom: 'Oriane', plateforme: 'PC', position: 'Défenseur' },
      { pseudo: 'lauremorel40', nom: 'Morel', prenom: 'Laure', plateforme: 'PS5', position: 'Milieu' },
      { pseudo: 'clarapetit41', nom: 'Petit', prenom: 'Clara', plateforme: 'Xbox', position: 'Attaquant' },
      { pseudo: 'zoémercier42', nom: 'Mercier', prenom: 'Zoé', plateforme: 'PC', position: 'Défenseur' },
      { pseudo: 'léadupont43', nom: 'Dupont', prenom: 'Léa', plateforme: 'PS5', position: 'Milieu' },
      { pseudo: 'inèsmartin44', nom: 'Martin', prenom: 'Inès', plateforme: 'Xbox', position: 'Gardien' },
      { pseudo: 'charolevincent45', nom: 'Vincent', prenom: 'Charole', plateforme: 'PC', position: 'Attaquant' }
    ];
    
    const newPlayers = [];
    
    for (let i = 0; i < additionalPlayersData.length; i++) {
      const playerData = additionalPlayersData[i];
      
      // Créer l'utilisateur
      const email = `${playerData.pseudo}@test.com`;
      
      let user = await User.findOne({ email });
      if (!user) {
        user = new User({
          email: email,
          pseudo: playerData.pseudo,
          password: commonPassword,
          isAdmin: false,
          dateCreation: new Date(),
          derniereConnexion: new Date()
        });
        await user.save();
      }
      
      // Créer le joueur
      let player = await Player.findOne({ userId: user._id });
      if (!player) {
        player = new Player({
          userId: user._id,
          pseudo: playerData.pseudo,
          nom: playerData.nom,
          prenom: playerData.prenom,
          position: playerData.position,
          plateforme: playerData.plateforme,
          age: Math.floor(Math.random() * 15) + 18, // 18-32 ans
          disponibilite: 'Disponible',
          rechercheClub: true,
          clubs: [], // Nouveau système multi-clubs
          maxClubs: 3,
          dateCreation: new Date()
        });
        await player.save();
        newPlayers.push(player);
        
        console.log(`   ✅ ${playerData.pseudo} (${playerData.position}, ${playerData.plateforme})`);
      } else {
        console.log(`   ⚠️  ${playerData.pseudo} existe déjà`);
      }
    }
    
    console.log(`\n📊 ${newPlayers.length} nouveaux joueurs créés`);
    
    // ===== CRÉATION DE 5 NOUVEAUX CLUBS =====
    console.log('\n🏆 CRÉATION DE 5 NOUVEAUX CLUBS...\n');
    
    const additionalClubsData = [
      {
        nom: 'Cyber Knights',
        description: 'Club d\'élite pour les joueurs tactiques et stratégiques',
        plateformes: ['PS5', 'Xbox', 'PC'],
        pays: 'France',
        adminPseudo: 'lucasmartin31'
      },
      {
        nom: 'Digital Warriors',
        description: 'Équipe compétitive axée sur les tournois',
        plateformes: ['PS5'],
        pays: 'France',
        adminPseudo: 'emilebertrand32'
      },
      {
        nom: 'Neon Strikers',
        description: 'Club innovant pour les jeunes talents',
        plateformes: ['Xbox'],
        pays: 'France',
        adminPseudo: 'victorlaurent33'
      },
      {
        nom: 'Quantum FC',
        description: 'Formation et développement des compétences',
        plateformes: ['PC'],
        pays: 'France',
        adminPseudo: 'hugolefebvre34'
      },
      {
        nom: 'Apex Legends FC',
        description: 'Club professionnel haut niveau',
        plateformes: ['PS5', 'Xbox', 'PC'],
        pays: 'France',
        adminPseudo: 'raphaëldurand35'
      }
    ];
    
    const newClubs = [];
    
    for (const clubData of additionalClubsData) {
      // Trouver l'admin
      const adminUser = await User.findOne({ pseudo: clubData.adminPseudo });
      const adminPlayer = await Player.findOne({ userId: adminUser._id });
      
      if (!adminUser || !adminPlayer) {
        console.log(`   ❌ Admin ${clubData.adminPseudo} non trouvé pour ${clubData.nom}`);
        continue;
      }
      
      // Vérifier si le club existe déjà
      let existingClub = await Club.findOne({ nom: clubData.nom });
      if (existingClub) {
        console.log(`   ⚠️  Club ${clubData.nom} existe déjà`);
        continue;
      }
      
      // Créer le club
      const club = new Club({
        nom: clubData.nom,
        description: clubData.description,
        createurId: adminUser._id,
        plateformes: clubData.plateformes,
        pays: clubData.pays,
        postesRecherches: ['Attaquant', 'Milieu', 'Défenseur', 'Gardien'],
        effectifMax: Math.floor(Math.random() * 10) + 15, // 15-24 membres
        effectifActuel: 1, // L'admin
        recrute: true,
        membres: [{
          userId: adminUser._id,
          role: 'Admin',
          dateAdhesion: new Date()
        }],
        dateCreation: new Date()
      });
      
      await club.save();
      
      // Ajouter le club au joueur admin
      try {
        await adminPlayer.joinClub(club._id, 'Admin');
        await adminPlayer.calculateDisponibilite();
        
        newClubs.push(club);
        console.log(`   ✅ ${clubData.nom} (Admin: ${clubData.adminPseudo})`);
        console.log(`      📍 ${clubData.plateformes.join(', ')} | 🌍 ${clubData.pays} | 👥 Max: ${club.effectifMax}`);
      } catch (error) {
        console.log(`   ❌ Erreur assignation admin ${clubData.adminPseudo}: ${error.message}`);
        // Supprimer le club si l'assignation échoue
        await Club.findByIdAndDelete(club._id);
      }
    }
    
    console.log(`\n📊 ${newClubs.length} nouveaux clubs créés`);
    
    // ===== ASSIGNATION INTELLIGENTE DES NOUVEAUX JOUEURS =====
    console.log('\n🎯 ASSIGNATION DES NOUVEAUX JOUEURS AUX CLUBS...\n');
    
    // Récupérer tous les clubs (anciens + nouveaux)
    const allClubs = await Club.find();
    
    let totalAssignments = 0;
    
    // Assigner les nouveaux joueurs (sauf ceux qui sont déjà admins)
    const adminPlayerIds = newClubs.map(club => 
      club.membres.find(m => m.role === 'Admin')?.userId.toString()
    );
    
    const playersToAssign = newPlayers.filter(player => 
      !adminPlayerIds.includes(player.userId.toString())
    );
    
    for (const player of playersToAssign) {
      // Choisir 1-3 clubs aléatoirement
      const numClubs = Math.floor(Math.random() * 3) + 1; // 1 à 3 clubs
      const shuffledClubs = allClubs.sort(() => 0.5 - Math.random());
      const selectedClubs = shuffledClubs.slice(0, numClubs);
      
      console.log(`\n   👤 ${player.pseudo}:`);
      
      for (let i = 0; i < selectedClubs.length; i++) {
        const club = selectedClubs[i];
        
        // Vérifier si le club n'est pas plein
        if (club.effectifActuel >= club.effectifMax) {
          console.log(`      ❌ ${club.nom} (complet)`);
          continue;
        }
        
        // Déterminer le rôle
        let role = 'Joueur';
        if (i === 0 && Math.random() < 0.3) { // 30% chance d'être Capitaine au premier club
          role = 'Capitaine';
        }
        
        try {
          await player.joinClub(club._id, role);
          
          // Ajouter le membre au club
          club.membres.push({
            userId: player.userId,
            role: role,
            dateAdhesion: new Date()
          });
          club.effectifActuel += 1;
          await club.save();
          
          totalAssignments++;
          console.log(`      ✅ ${club.nom} (${role})`);
          
        } catch (error) {
          console.log(`      ❌ ${club.nom}: ${error.message}`);
        }
      }
      
      // Recalculer la disponibilité
      await player.calculateDisponibilite();
    }
    
    // ===== STATISTIQUES FINALES =====
    console.log('\n\n📊 STATISTIQUES FINALES:');
    console.log('═══════════════════════════════════════════════');
    
    const finalPlayers = await Player.countDocuments();
    const finalClubs = await Club.countDocuments();
    
    console.log(`👥 Joueurs: ${initialPlayers} → ${finalPlayers} (+${finalPlayers - initialPlayers})`);
    console.log(`🏆 Clubs: ${initialClubs} → ${finalClubs} (+${finalClubs - initialClubs})`);
    console.log(`🔗 Nouvelles assignations: ${totalAssignments}`);
    
    // Afficher les nouveaux clubs avec leurs effectifs
    console.log('\n🏆 NOUVEAUX CLUBS CRÉÉS:');
    for (const club of newClubs) {
      const updatedClub = await Club.findById(club._id).populate('membres.userId', 'pseudo');
      const admin = updatedClub.membres.find(m => m.role === 'Admin');
      
      console.log(`\n   📍 ${updatedClub.nom}:`);
      console.log(`      👑 Admin: ${admin?.userId?.pseudo || 'N/A'}`);
      console.log(`      📈 Effectif: ${updatedClub.effectifActuel}/${updatedClub.effectifMax}`);
      console.log(`      🎮 Plateformes: ${updatedClub.plateformes.join(', ')}`);
      console.log(`      🌍 Pays: ${updatedClub.pays}`);
    }
    
    // Afficher quelques exemples de nouveaux joueurs
    console.log('\n👥 EXEMPLES DE NOUVEAUX JOUEURS:');
    for (let i = 0; i < Math.min(5, newPlayers.length); i++) {
      const player = await Player.findById(newPlayers[i]._id);
      const activeClubs = player.clubs.filter(c => c.statut === 'Actif');
      
      console.log(`\n   👤 ${player.pseudo}:`);
      console.log(`      ⚽ ${player.position} | 🎮 ${player.plateforme}`);
      console.log(`      🏆 ${activeClubs.length} club(s) | 📊 ${player.disponibilite}`);
    }
    
    console.log('\n🔐 MOT DE PASSE UNIVERSEL: TestPassword123!');
    console.log('\n🎉 Données supplémentaires créées avec succès !');
    
  } catch (error) {
    console.error('❌ Erreur lors de la création:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Déconnexion MongoDB');
  }
};

if (require.main === module) {
  createAdditionalTestData();
}

module.exports = createAdditionalTestData; 