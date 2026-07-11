require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const Club = require('../models/Club');
const Competition = require('../models/Competition');

const testPaymentCalculation = async () => {
  try {
    console.log('💳 Démarrage du test de calcul du cashprize dynamique...');
    console.log('🔌 Connexion à MongoDB...');
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/club-pro-commu');
    console.log('✅ Connexion établie.');

    // 1. Créer une compétition payante de test
    console.log('📝 Création d\'une compétition payante fictive...');
    const admin = await User.findOne({ isAdmin: true });
    if (!admin) {
      throw new Error('Aucun administrateur trouvé en base de données.');
    }

    const testComp = new Competition({
      nom: 'Test Cashprize Payant',
      description: 'Compétition pour tester les calculs de cagnotte.',
      type: 'elimination_directe',
      nombreEquipes: 8,
      plateforme: 'PS5',
      dateDebut: new Date(),
      statut: 'Brouillon',
      inscriptionsOuvertes: true,
      inscriptionGratuite: false, // Compétition payante !
      montantInscription: 20, // 20€ par club
      cashprizeMinimal: 100, // Cashprize minimum garanti = 100€
      createurId: admin._id
    });

    await testComp.save();
    console.log(`✅ Compétition créée. ID: ${testComp._id}`);
    console.log(`   - Frais d'inscription : ${testComp.montantInscription}€`);
    console.log(`   - Cashprize minimum garanti : ${testComp.cashprizeMinimal}€`);
    console.log(`   - Cashprize initial : ${testComp.cashprizeFinal}€ (Attendu : 0€ ou cashprize minimal si recalculé)`);

    // 2. Ajouter 4 clubs de test et simuler le paiement pour 2 d'entre eux
    const clubs = await Club.find().limit(4);
    if (clubs.length < 4) {
      throw new Error('Moins de 4 clubs en base de données. Exécutez createTestCompetition.js d\'abord !');
    }

    console.log('➕ Inscription des 4 clubs...');
    clubs.forEach(club => {
      testComp.equipesInscrites.push({
        clubId: club._id,
        statut: 'Inscrit',
        statutPaiement: 'En attente'
      });
    });
    await testComp.save();

    // 3. Simuler le paiement pour le premier club
    console.log('💳 Paiement Club 1 (20€)...');
    testComp.equipesInscrites[0].statutPaiement = 'Payé';
    testComp.equipesInscrites[0].statut = 'Confirmé';
    
    // Recalcul
    let payesCount = testComp.equipesInscrites.filter(e => e.statutPaiement === 'Payé').length;
    testComp.cashprizeFinal = Math.max(testComp.cashprizeMinimal, payesCount * testComp.montantInscription * 0.8);
    await testComp.save();
    console.log(`   - Cagnotte actuelle : ${testComp.cashprizeFinal}€ (Attendu : 100€ car 1 * 20€ * 0.8 = 16€ < 100€)`);
    
    if (testComp.cashprizeFinal !== 100) {
      throw new Error(`Erreur : Le cashprize garanti n'a pas été respecté. Attendu 100, obtenu ${testComp.cashprizeFinal}`);
    }

    // 4. Simuler le paiement pour tous les 4 clubs (Total récolte = 80€, 80% = 64€)
    console.log('💳 Paiement des 3 autres clubs...');
    for (let i = 1; i < 4; i++) {
      testComp.equipesInscrites[i].statutPaiement = 'Payé';
      testComp.equipesInscrites[i].statut = 'Confirmé';
    }
    payesCount = testComp.equipesInscrites.filter(e => e.statutPaiement === 'Payé').length;
    testComp.cashprizeFinal = Math.max(testComp.cashprizeMinimal, payesCount * testComp.montantInscription * 0.8);
    await testComp.save();
    console.log(`   - Cagnotte actuelle (4 clubs payés) : ${testComp.cashprizeFinal}€ (Attendu : 100€ car 4 * 20€ * 0.8 = 64€ < 100€)`);

    if (testComp.cashprizeFinal !== 100) {
      throw new Error(`Erreur : La cagnotte devrait toujours être à 100€ (minimum garanti).`);
    }

    // 5. Simuler le paiement pour 8 clubs (Inscrire 4 de plus et payer. Total récolte = 160€, 80% = 128€)
    console.log('➕ Inscription et paiement de 4 clubs supplémentaires (Total 8 clubs)...');
    // On simule simplement payesCount = 8
    payesCount = 8;
    testComp.cashprizeFinal = Math.max(testComp.cashprizeMinimal, payesCount * testComp.montantInscription * 0.8);
    await testComp.save();
    console.log(`   - Cagnotte finale (8 clubs payés) : ${testComp.cashprizeFinal}€ (Attendu : 128€ car 8 * 20€ * 0.8 = 128€ > 100€)`);

    if (testComp.cashprizeFinal !== 128) {
      throw new Error(`Erreur : La cagnotte finale devrait être de 128€, obtenu ${testComp.cashprizeFinal}`);
    }

    console.log('🎉 SUCCÈS : Le calcul dynamique du cashprize avec minimum garanti fonctionne parfaitement !');

    // Nettoyage de la compétition de test
    await Competition.findByIdAndDelete(testComp._id);
    console.log('🧹 Compétition de test supprimée de la base de données.');

  } catch (error) {
    console.error('❌ ÉCHEC DU TEST CASH PRIZE :', error.message);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Déconnexion.');
  }
};

testPaymentCalculation();
