/*
  Script: scripts/init-db.js
  Purpose: Verify MongoDB connection and initialize collections/indexes.
  Usage: node scripts/init-db.js (or npm run init-db)
*/

require('dotenv').config({ path: '.env.local' });
const { MongoClient } = require('mongodb');

const url = process.env.MONGODB_URL;

if (!url) {
  console.error('MONGODB_URL is not set in environment');
  process.exit(1);
}

async function main() {
  const client = new MongoClient(url);
  try {
    await client.connect();
    console.log('✅ Connected to MongoDB');

    const db = client.db('portfolio_data');

    // Ensure collections exist and create indexes
    const portfolio = db.collection('portfolio');
    // _id index is automatically created and unique by MongoDB

    const backups = db.collection('backups');
    await backups.createIndex({ createdAt: -1 });

    const audit = db.collection('audit_log');
    await audit.createIndex({ timestamp: -1 });
    await audit.createIndex({ adminEmail: 1 });

    // Seed an initial document if missing
    const existing = await portfolio.findOne({ _id: 'portfolio_data' });
    if (!existing) {
      await portfolio.insertOne({
        _id: 'portfolio_data',
        data: {},
        lastModified: new Date(),
        modifiedBy: 'init-script',
        version: 1,
      });
      console.log('✅ Seeded initial portfolio_data document');
    } else {
      console.log('✅ Portfolio data document already exists');
    }

    console.log('✅ Database initialization complete');
  } catch (err) {
    console.error('❌ Database initialization failed:', err);
    process.exit(1);
  } finally {
    await client.close();
  }
}

main();