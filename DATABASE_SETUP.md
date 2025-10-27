# Database Setup Guide

This guide will help you set up persistent database storage for your portfolio to solve the temporary data issue.

## Problem

Without a database, changes are stored in temporary `/tmp` storage which gets wiped on every redeployment. This means your portfolio updates don't persist.

## Solution

Configure MongoDB to store your portfolio data permanently across all deployments.

---

## Quick Start

### 1. Get a MongoDB Database

#### Option A: MongoDB Atlas (Recommended - Free)

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free account
3. Create a new cluster (M0 free tier)
4. Click "Connect" → "Connect your application"
5. Copy your connection string (looks like: `mongodb+srv://username:password@cluster.mongodb.net/`)

#### Option B: Other MongoDB Providers
- [Railway](https://railway.app/)
- [Render](https://render.com/)
- Local MongoDB installation

### 2. Configure Environment Variables

Add these to your `.env.local` (development) and Vercel environment variables (production):

```bash
# Database Configuration
DATABASE_PROVIDER=mongodb
MONGODB_URL=mongodb+srv://username:password@cluster.mongodb.net/portfolio_data?retryWrites=true&w=majority

# Optional: Cloud Storage Backup (already configured)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

### 3. Migrate Your Data

Run the migration script to import your current data into MongoDB:

```bash
npm run migrate-db
```

Or manually:

```bash
node scripts/migrate-to-database.js
```

### 4. Verify Setup

1. Visit your admin dashboard
2. Check database status
3. Make a test change and save
4. Redeploy your app
5. Verify the change persisted

---

## API Endpoints

### Database Management

#### Check Database Status
```http
GET /api/admin/database
```

**Response:**
```json
{
  "connected": true,
  "provider": "mongodb",
  "hasData": true,
  "message": "Database is connected and contains portfolio data",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

#### Create Manual Backup
```http
POST /api/admin/database
Content-Type: application/json

{
  "action": "backup"
}
```

#### Restore from Backup
```http
POST /api/admin/database
Content-Type: application/json

{
  "action": "restore",
  "backupId": "backup_id_here"
}
```

### Backup Management

#### List All Backups
```http
GET /api/admin/backups?limit=20
```

**Response:**
```json
{
  "success": true,
  "backups": [
    {
      "id": "backup_id",
      "created_at": "2024-01-01T00:00:00.000Z",
      "created_by": "admin@example.com",
      "backup_reason": "manual_backup"
    }
  ],
  "count": 1
}
```

### Audit Logs

#### View Audit Logs
```http
GET /api/admin/audit?limit=50
```

**Response:**
```json
{
  "success": true,
  "logs": [
    {
      "action": "UPDATE",
      "adminEmail": "admin@example.com",
      "description": "Portfolio data updated",
      "timestamp": "2024-01-01T00:00:00.000Z"
    }
  ],
  "count": 1
}
```

#### Create Custom Audit Log
```http
POST /api/admin/audit
Content-Type: application/json

{
  "action": "CUSTOM_ACTION",
  "description": "Custom description"
}
```

---

## Database Schema

### Collections

1. **portfolio** - Main portfolio data
   - `_id`: 'portfolio_data' (single document)
   - `data`: Your portfolio JSON data
   - `lastModified`: Timestamp
   - `modifiedBy`: Admin email
   - `version`: Version number

2. **backups** - Automatic and manual backups
   - `data`: Portfolio data snapshot
   - `createdAt`: Timestamp
   - `createdBy`: Admin email
   - `reason`: Backup reason

3. **audit_log** - Change tracking
   - `action`: Action type (UPDATE, RESTORE, MIGRATE)
   - `adminEmail`: Who made the change
   - `description`: What changed
   - `timestamp`: When it happened

---

## Vercel Deployment

### Add Environment Variables

1. Go to your Vercel project settings
2. Navigate to "Environment Variables"
3. Add these variables:
   - `DATABASE_PROVIDER` = `mongodb`
   - `MONGODB_URL` = `your_connection_string`

4. Redeploy your application

### Verify in Production

1. Check `/api/admin/database` endpoint
2. View audit logs at `/api/admin/audit`
3. Make test changes through admin panel
4. Redeploy and verify persistence

---

## Troubleshooting

### Database Not Connected

**Check:**
- Is `DATABASE_PROVIDER` set to `mongodb`?
- Is `MONGODB_URL` correct?
- Is your MongoDB cluster running?
- Are IP addresses whitelisted? (MongoDB Atlas: Add `0.0.0.0/0` for all IPs)

**Solution:**
```bash
# Test connection
node scripts/migrate-to-database.js
```

### Data Not Persisting

**Check:**
- Visit `/api/admin/database` to verify connection
- Check server logs for errors
- Verify environment variables in production

**Solution:**
- Re-run migration: `npm run migrate-db`
- Check audit logs: `/api/admin/audit`

### Migration Failed

**Common Issues:**
1. Wrong MongoDB URL format
2. Database credentials incorrect
3. Network/firewall blocking connection

**Solution:**
```bash
# Verify .env file
cat .env.local | grep DATABASE

# Test connection
node scripts/migrate-to-database.js
```

---

## NPM Scripts

Add these to your `package.json`:

```json
{
  "scripts": {
    "migrate-db": "node scripts/migrate-to-database.js",
    "check-db": "node scripts/init-db.js"
  }
}
```

---

## Best Practices

1. **Always Create Backups** before major changes
   ```bash
   curl -X POST https://yoursite.com/api/admin/database \
     -H "Content-Type: application/json" \
     -d '{"action":"backup"}'
   ```

2. **Monitor Audit Logs** regularly
   ```bash
   curl https://yoursite.com/api/admin/audit?limit=50
   ```

3. **Test Locally First** before production changes
   ```bash
   npm run dev
   # Make changes
   # Verify in local database
   ```

4. **Version Control** your environment variables template
   ```bash
   # Create .env.example
   DATABASE_PROVIDER=mongodb
   MONGODB_URL=your_mongodb_connection_string
   ```

---

## Support

If you encounter issues:

1. Check database connection: `GET /api/admin/database`
2. View logs: `GET /api/admin/audit`
3. Test locally: `npm run migrate-db`
4. Verify environment variables in Vercel

---

## Summary

✅ **Before:** Changes stored in `/tmp` - lost on redeploy  
✅ **After:** Changes stored in MongoDB - persists forever

Your portfolio data is now:
- ✅ Persistent across deployments
- ✅ Automatically backed up on each update
- ✅ Tracked with audit logs
- ✅ Restorable from any backup
- ✅ Production-ready
