const mongoose = require('mongoose');
const Club = require('../models/Club');
const User = require('../models/User');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/club-pro-commu';

async function run() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB');

    const users = await User.find({}).select('_id pseudo email isAdmin');
    console.log('\n--- USERS ---');
    users.forEach(u => {
      console.log(`- ID: ${u._id}, Pseudo: ${u.pseudo}, Email: ${u.email}, isAdmin: ${u.isAdmin}`);
    });

    const clubs = await Club.find({});
    console.log('\n--- CLUBS ---');
    for (const club of clubs) {
      console.log(`- Club: ${club.nom} (ID: ${club._id}), Creator: ${club.createurId}`);
      console.log('  Membres:');
      club.membres.forEach(m => {
        const matchingUser = users.find(u => u._id.toString() === m.userId.toString());
        console.log(`    * UserID: ${m.userId} (${matchingUser ? matchingUser.pseudo : 'Inconnu'}), Role: ${m.role}`);
      });
    }

    await mongoose.disconnect();
    console.log('\n✅ Disconnected');
  } catch (err) {
    console.error(err);
  }
}

run();
