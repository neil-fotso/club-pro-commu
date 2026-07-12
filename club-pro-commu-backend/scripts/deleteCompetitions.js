const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const deleteCompetitions = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/club-pro-commu';
    console.log(`Connecting to: ${mongoUri}`);
    
    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connected to MongoDB');

    // 1. Delete Competitions
    const competitionResult = await mongoose.connection.db.collection('competitions').deleteMany({});
    console.log(`🗑️  Deleted ${competitionResult.deletedCount} competitions.`);

    // 2. Delete Matches
    const matchResult = await mongoose.connection.db.collection('matches').deleteMany({});
    console.log(`🗑️  Deleted ${matchResult.deletedCount} matches.`);

    // 3. Clear references from clubs (optional but good practice)
    // If clubs have references to competitions, or registered teams, they are usually inside the competition document,
    // so deleting the competition document automatically clears those.

    console.log('🎉 All competitions and matches deleted successfully!');
    
    await mongoose.connection.close();
    console.log('🔌 Connection closed');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error during deletion:', error);
    process.exit(1);
  }
};

deleteCompetitions();
