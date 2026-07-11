require('dotenv').config();
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const Competition = require('../models/Competition');
const { cleanCompetitionVideos } = require('../utils/videoCleanup');

const testVideoDispute = async () => {
  try {
    console.log('🧹 Démarrage du test de nettoyage de vidéos de litige...');
    console.log('🔌 Connexion à MongoDB...');
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/club-pro-commu');
    console.log('✅ Connexion établie.');

    // 1. S'assurer que le dossier uploads/disputes existe
    const uploadDir = path.resolve('uploads/disputes');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    // 2. Créer deux fichiers fictifs sur le disque
    const dummyFile1 = path.join(uploadDir, 'dispute-test-file-1.mp4');
    const dummyFile2 = path.join(uploadDir, 'dispute-test-file-2.mp4');
    
    fs.writeFileSync(dummyFile1, 'Contenu vidéo fictif 1');
    fs.writeFileSync(dummyFile2, 'Contenu vidéo fictif 2');
    
    console.log('📁 Fichiers vidéo fictifs créés sur le disque :');
    console.log(`   - ${dummyFile1} (Existe : ${fs.existsSync(dummyFile1)})`);
    console.log(`   - ${dummyFile2} (Existe : ${fs.existsSync(dummyFile2)})`);

    // 3. Trouver la compétition de test et injecter les chemins locaux dans les matchs
    let competition = await Competition.findOne({ nom: 'la street club pro compétition' });
    if (!competition) {
      throw new Error('Compétition de test introuvable. Veuillez d\'abord générer la compétition.');
    }

    // Match 1 (tour 3) : Litige résolu avec preuve vidéo 1
    const match1 = competition.matchsElimination.find(m => m.tour === 3);
    if (match1) {
      match1.litigeDetails = {
        preuveVideo: '/uploads/disputes/dispute-test-file-1.mp4',
        description: 'Litige avec vidéo locale 1'
      };
    }

    // Match 2 (tour 4) : Litige actif avec preuve vidéo 2
    const match2 = competition.matchsElimination.find(m => m.tour === 4);
    if (match2) {
      match2.litigeDetails = {
        preuveVideo: '/uploads/disputes/dispute-test-file-2.mp4',
        description: 'Litige avec vidéo locale 2'
      };
    }

    await competition.save();
    console.log('📝 Chemins des vidéos enregistrés en base de données.');

    // 4. Lancer le nettoyage
    console.log('🧹 Lancement de cleanCompetitionVideos...');
    cleanCompetitionVideos(competition);

    // 5. Vérifier que les fichiers ont bien été supprimés
    const exists1 = fs.existsSync(dummyFile1);
    const exists2 = fs.existsSync(dummyFile2);

    console.log('🔍 Résultats du nettoyage sur le disque :');
    console.log(`   - Fichier 1 existe toujours ? : ${exists1}`);
    console.log(`   - Fichier 2 existe toujours ? : ${exists2}`);

    if (!exists1 && !exists2) {
      console.log('🎉 SUCCÈS : Toutes les vidéos locales associées à la compétition ont été nettoyées du serveur !');
    } else {
      throw new Error('Certains fichiers vidéo locaux n\'ont pas été supprimés.');
    }

  } catch (error) {
    console.error('❌ ÉCHEC DU TEST VIDEO :', error.message);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Déconnexion.');
  }
};

testVideoDispute();
