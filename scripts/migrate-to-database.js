#!/usr/bin/env node

/**
 * Database Migration Script
 * 
 * Migrates existing portfolio data from local JSON file to MongoDB
 * 
 * Usage:
 *   node scripts/migrate-to-database.js
 * 
 * Environment variables required:
 *   - MONGODB_URL: MongoDB connection string
 *   - DATABASE_PROVIDER: Should be set to 'mongodb'
 */

require('dotenv').config();
const { MongoClient } = require('mongodb');
const fs = require('fs');
const path = require('path');

const ADMIN_EMAIL = 'system@migration';

async function migrate() {
  console.log('🚀 Starting database migration...\n');

  // Check environment variables
  if (!process.env.MONGODB_URL) {
    console.error('❌ MONGODB_URL environment variable is not set');
    console.error('Please add MONGODB_URL to your .env file');
    process.exit(1);
  }

  if (process.env.DATABASE_PROVIDER !== 'mongodb') {
    console.warn('⚠️  DATABASE_PROVIDER is not set to "mongodb"');
    console.log('Please set DATABASE_PROVIDER=mongodb in your .env file');
    process.exit(1);
  }

  // Read source data
  const dataPath = path.join(process.cwd(), 'lib', 'data.json');
  
  if (!fs.existsSync(dataPath)) {
    console.error(`❌ Source data file not found: ${dataPath}`);
    process.exit(1);
  }

  console.log(`📖 Reading data from: ${dataPath}`);
  const rawData = fs.readFileSync(dataPath, 'utf8');
  const portfolioData = JSON.parse(rawData);
  
  console.log('✅ Data loaded successfully\n');

  // Connect to MongoDB
  console.log('🔌 Connecting to MongoDB...');
  const client = new MongoClient(process.env.MONGODB_URL);

  try {
    await client.connect();
    console.log('✅ Connected to MongoDB\n');

    const db = client.db('portfolio_data');
    const collection = db.collection('portfolio');

    // Check if data already exists
    const existing = await collection.findOne({ _id: 'portfolio_data' });
    
    if (existing) {
      console.log('⚠️  Portfolio data already exists in database');
      console.log('Creating backup before migration...');
      
      // Create backup of existing data
      await db.collection('backups').insertOne({
        data: existing.data,
        createdAt: new Date(),
        createdBy: ADMIN_EMAIL,
        reason: 'pre_migration_backup'
      });
      
      console.log('✅ Backup created\n');
    }

    // Migrate data
    console.log('💾 Migrating portfolio data to database...');
    
    const result = await collection.replaceOne(
      { _id: 'portfolio_data' },
      {
        _id: 'portfolio_data',
        data: portfolioData,
        lastModified: new Date(),
        modifiedBy: ADMIN_EMAIL,
        version: existing ? (existing.version || 0) + 1 : 1
      },
      { upsert: true }
    );

    console.log('✅ Portfolio data migrated successfully\n');

    // Log the migration
    await db.collection('audit_log').insertOne({
      action: 'MIGRATE',
      adminEmail: ADMIN_EMAIL,
      description: 'Portfolio data migrated from local file to database',
      timestamp: new Date()
    });

    console.log('✅ Migration audit log created\n');

    // Verify migration
    console.log('🔍 Verifying migration...');
    const verifyData = await collection.findOne({ _id: 'portfolio_data' });
    
    if (verifyData && verifyData.data) {
      console.log('✅ Migration verified successfully\n');
      console.log('📊 Migration Summary:');
      console.log(`   - Version: ${verifyData.version}`);
      console.log(`   - Modified: ${verifyData.lastModified}`);
      console.log(`   - Modified By: ${verifyData.modifiedBy}`);
      console.log(`   - Status: ${result.upsertedCount > 0 ? 'Created' : 'Updated'}`);
      console.log('\n✨ Migration completed successfully!');
      console.log('\n📝 Next steps:');
      console.log('   1. Verify your data at /admin dashboard');
      console.log('   2. Test saving changes through the admin panel');
      console.log('   3. Your data will now persist across deployments!');
    } else {
      console.error('❌ Migration verification failed');
      process.exit(1);
    }

  } catch (error) {
    console.error('\n❌ Migration failed:', error.message);
    console.error('\nDetails:', error);
    process.exit(1);
  } finally {
    await client.close();
    console.log('\n🔌 Database connection closed');
  }
}

// Run migration
migrate().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
