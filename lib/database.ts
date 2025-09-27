// Database integration for permanent data persistence
// This example uses Supabase, but can be adapted for MongoDB, PostgreSQL, etc.

interface DatabaseConfig {
  provider: 'supabase' | 'mongodb' | 'planetscale' | 'neon';
  url: string;
  apiKey?: string;
}

// Environment-based database configuration
const getDatabaseConfig = (): DatabaseConfig => {
  const provider = process.env.DATABASE_PROVIDER as DatabaseConfig['provider'] || 'supabase';
  
  switch (provider) {
    case 'supabase':
      return {
        provider: 'supabase',
        url: process.env.SUPABASE_URL || '',
        apiKey: process.env.SUPABASE_ANON_KEY || ''
      };
    case 'mongodb':
      return {
        provider: 'mongodb',
        url: process.env.MONGODB_URL || ''
      };
    case 'planetscale':
      return {
        provider: 'planetscale',
        url: process.env.DATABASE_URL || ''
      };
    case 'neon':
      return {
        provider: 'neon',
        url: process.env.DATABASE_URL || ''
      };
    default:
      throw new Error(`Unsupported database provider: ${provider}`);
  }
};


// MongoDB implementation (alternative)
export class MongoDBStorage {
  private client: any;
  private isConnected: boolean = false;
  
  constructor() {
    if (typeof window !== 'undefined') return;
    // Don't initialize in constructor - do it lazily when needed
  }
  
  private async initializeMongoDB() {
    if (this.isConnected && this.client) return;
    
    try {
      const { MongoClient } = await import('mongodb');
      const config = getDatabaseConfig();
      this.client = new MongoClient(config.url);
      await this.client.connect();
      this.isConnected = true;
      console.log('✅ Connected to MongoDB successfully');
    } catch (error) {
      console.error('❌ Failed to initialize MongoDB:', error);
      this.isConnected = false;
      throw new Error('MongoDB connection failed');
    }
  }
  
  async savePortfolioData(data: any, adminEmail: string): Promise<void> {
    await this.initializeMongoDB();
    if (!this.client) throw new Error('Database not initialized');

    const db = this.client.db('portfolio_data');
    const collection = db.collection('portfolio');
    
    // Create backup
    const currentData = await this.getPortfolioData();
    if (currentData) {
      await db.collection('backups').insertOne({
        data: currentData,
        createdAt: new Date(),
        createdBy: adminEmail,
        reason: 'pre_update_backup'
      });
    }
    
    // Update data
    await collection.replaceOne(
      { _id: 'portfolio_data' },
      {
        _id: 'portfolio_data',
        data,
        lastModified: new Date(),
        modifiedBy: adminEmail,
        version: await this.getNextVersion()
      },
      { upsert: true }
    );
    
    // Log change
    await db.collection('audit_log').insertOne({
      action: 'UPDATE',
      adminEmail,
      description: 'Portfolio data updated',
      timestamp: new Date()
    });
  }
  
  async getPortfolioData(): Promise<any> {
    try {
      await this.initializeMongoDB();
      if (!this.client) return null;

      const db = this.client.db('portfolio_data');
      const result = await db.collection('portfolio').findOne({ _id: 'portfolio_data' });
      return result?.data || null;
    } catch (error) {
      console.error('MongoDB getPortfolioData error:', error);
      return null;
    }
  }
  
  private async getNextVersion(): Promise<number> {
    await this.initializeMongoDB();
    const db = this.client.db('portfolio_data');
    const current = await db.collection('portfolio').findOne({ _id: 'portfolio_data' });
    return (current?.version || 0) + 1;
  }

  async createBackup(adminEmail: string): Promise<void> {
    const currentData = await this.getPortfolioData();
    if (!currentData) return;

    await this.initializeMongoDB();
    const db = this.client.db('portfolio_data');
    await db.collection('backups').insertOne({
      data: currentData,
      createdAt: new Date(),
      createdBy: adminEmail,
      reason: 'manual_backup'
    });
  }

  async logChange(action: string, adminEmail: string, description: string): Promise<void> {
    await this.initializeMongoDB();
    const db = this.client.db('portfolio_data');
    await db.collection('audit_log').insertOne({
      action,
      adminEmail,
      description,
      timestamp: new Date()
    });
  }

  async getAuditLog(limit: number = 50): Promise<any[]> {
    await this.initializeMongoDB();
    const db = this.client.db('portfolio_data');
    const results = await db.collection('audit_log')
      .find({})
      .sort({ timestamp: -1 })
      .limit(limit)
      .toArray();
    return results;
  }

  async getBackups(limit: number = 10): Promise<any[]> {
    await this.initializeMongoDB();
    const db = this.client.db('portfolio_data');
    const results = await db.collection('backups')
      .find({}, { projection: { _id: 1, createdAt: 1, createdBy: 1, reason: 1 } })
      .sort({ createdAt: -1 })
      .limit(limit)
      .toArray();
    return results.map(backup => ({
      id: backup._id,
      created_at: backup.createdAt,
      created_by: backup.createdBy,
      backup_reason: backup.reason
    }));
  }

  async restoreFromBackup(backupId: string, adminEmail: string): Promise<void> {
    await this.initializeMongoDB();
    const db = this.client.db('portfolio_data');
    
    // Get backup data
    const { ObjectId } = await import('mongodb');
    const backup = await db.collection('backups').findOne({ _id: new ObjectId(backupId) });
    
    if (!backup) {
      throw new Error('Backup not found');
    }
    
    // Save current data as backup before restore
    await this.createBackup(adminEmail);
    
    // Restore the backup
    await this.savePortfolioData(backup.data, adminEmail);
    
    // Log the restore action
    await this.logChange('RESTORE', adminEmail, `Restored from backup ${backupId}`);
  }
}

// Factory function to get the appropriate storage implementation
export function getDatabaseStorage() {
  const provider = process.env.DATABASE_PROVIDER;
  
  if (!provider) {
    console.warn('No DATABASE_PROVIDER specified, database features disabled');
    return null;
  }
  
  switch (provider) {
    case 'mongodb':
      return new MongoDBStorage();
    default:
      throw new Error(`Unsupported database provider: ${provider}`);
  }
}

// Database schema creation utilities
export const createDatabaseSchema = {
  supabase: `
    -- Portfolio data table
    CREATE TABLE portfolio_data (
      id INTEGER PRIMARY KEY DEFAULT 1,
      data JSONB NOT NULL,
      last_modified TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      modified_by VARCHAR(255) NOT NULL,
      version INTEGER DEFAULT 1,
      CONSTRAINT single_portfolio_record CHECK (id = 1)
    );
    
    -- Backups table
    CREATE TABLE portfolio_backups (
      id SERIAL PRIMARY KEY,
      data JSONB NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      created_by VARCHAR(255) NOT NULL,
      backup_reason VARCHAR(255)
    );
    
    -- Audit log table
    CREATE TABLE admin_audit_log (
      id SERIAL PRIMARY KEY,
      action VARCHAR(50) NOT NULL,
      admin_email VARCHAR(255) NOT NULL,
      description TEXT,
      timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      ip_address INET,
      user_agent TEXT
    );
    
    -- Indexes for performance
    CREATE INDEX idx_backups_created_at ON portfolio_backups(created_at);
    CREATE INDEX idx_audit_timestamp ON admin_audit_log(timestamp);
    CREATE INDEX idx_audit_admin ON admin_audit_log(admin_email);
    
    -- Row Level Security (RLS) policies
    ALTER TABLE portfolio_data ENABLE ROW LEVEL SECURITY;
    ALTER TABLE portfolio_backups ENABLE ROW LEVEL SECURITY;
    ALTER TABLE admin_audit_log ENABLE ROW LEVEL SECURITY;
  `,
  
  mongodb: `
    // Portfolio data collection with single document
    db.data.createIndex({ "_id": 1 }, { unique: true });
    
    // Backups collection
    db.backups.createIndex({ "createdAt": -1 });
    
    // Audit log collection
    db.audit_log.createIndex({ "timestamp": -1 });
    db.audit_log.createIndex({ "adminEmail": 1 });
  `
};