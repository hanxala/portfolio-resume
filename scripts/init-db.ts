/*
  Script: scripts/init-db.ts
  Purpose: Verify MongoDB connection and initialize collections/indexes.
  Usage: npx ts-node scripts/init-db.ts (or add an npm script)
*/

import { MongoClient } from 'mongodb';

const url = process.env.MONGODB_URL;

if (!url) {
  console.error('MONGODB_URL is not set in environment');
  process.exit(1);
}

async function main() {
  const client = new MongoClient(url!);
  try {
    await client.connect();
    console.log('✅ Connected to MongoDB');

    const db = client.db('portfolio_data');

    // Ensure collections exist and create indexes
    const portfolio = db.collection('portfolio');
    await portfolio.createIndex({ _id: 1 }, { unique: true });

    const backups = db.collection('backups');
    await backups.createIndex({ createdAt: -1 });

    const audit = db.collection('audit_log');
    await audit.createIndex({ timestamp: -1 });
    await audit.createIndex({ adminEmail: 1 });

    // Seed an initial document if missing
    const existing = await portfolio.findOne({ _id: 'portfolio_data' } as any);
    if (!existing) {
      await portfolio.insertOne({
        _id: 'portfolio_data',
        data: {},
        lastModified: new Date(),
        modifiedBy: 'init-script',
        version: 1,
      } as any);
      console.log('✅ Seeded initial portfolio_data document');
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
