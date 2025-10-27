# 🚀 Quick Start: Fix Temporary Data Issue

## The Problem
Your message says: *"Data saved successfully! Note: In production, changes are temporary and will reset on redeployment."*

This happens because data is stored in `/tmp` which gets wiped on every deployment.

## The Solution (3 Steps - 5 Minutes)

### Step 1: Get a Free MongoDB Database

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) (it's free!)
2. Sign up and create a cluster (select **M0 FREE** tier)
3. Click **"Connect"** → **"Connect your application"**
4. Copy the connection string (looks like this):
   ```
   mongodb+srv://username:password@cluster.mongodb.net/
   ```

### Step 2: Add Environment Variables

**For Local Development:**
Create/edit `.env.local` file:
```bash
DATABASE_PROVIDER=mongodb
MONGODB_URL=mongodb+srv://your-username:your-password@cluster.mongodb.net/portfolio_data
```

**For Production (Vercel):**
1. Go to your Vercel project dashboard
2. Settings → Environment Variables
3. Add:
   - `DATABASE_PROVIDER` = `mongodb`
   - `MONGODB_URL` = `your_connection_string`

### Step 3: Migrate Your Data

Run this command:
```bash
npm run migrate-db
```

That's it! ✅

---

## Verify It Works

1. **Make a change** in your admin panel
2. **Save it**
3. **Redeploy** your site
4. **Check** if the change is still there

Your changes will now **persist forever**! 🎉

---

## What You Get

✅ **Persistent Storage** - Changes survive redeployments  
✅ **Automatic Backups** - Every update creates a backup  
✅ **Audit Logs** - Track who changed what and when  
✅ **Restore Capability** - Roll back to any previous version  
✅ **Production Ready** - Works on Vercel, Netlify, etc.

---

## New API Endpoints

### Check Database Status
```bash
curl https://yoursite.com/api/admin/database
```

### View Backups
```bash
curl https://yoursite.com/api/admin/backups?limit=10
```

### View Change History
```bash
curl https://yoursite.com/api/admin/audit?limit=50
```

### Create Manual Backup
```bash
curl -X POST https://yoursite.com/api/admin/database \
  -H "Content-Type: application/json" \
  -d '{"action":"backup"}'
```

### Restore from Backup
```bash
curl -X POST https://yoursite.com/api/admin/database \
  -H "Content-Type: application/json" \
  -d '{"action":"restore","backupId":"your_backup_id"}'
```

---

## Troubleshooting

### "Connection Failed"
- Check MongoDB URL is correct
- Make sure cluster is running
- Whitelist IP address (use `0.0.0.0/0` for all IPs in MongoDB Atlas)

### "Migration Failed"
```bash
# Verify environment variables
cat .env.local | grep DATABASE

# Test connection manually
node scripts/migrate-to-database.js
```

### "Data Still Not Persisting"
- Verify environment variables are set in **Vercel** (not just locally)
- Redeploy after adding environment variables
- Check `/api/admin/database` to confirm connection

---

## Need More Details?

See the full guide: [DATABASE_SETUP.md](./DATABASE_SETUP.md)

---

## Summary

**Before:** `/tmp` storage → Data lost on redeploy 😢  
**After:** MongoDB storage → Data persists forever 🎉

**Time to setup:** ~5 minutes  
**Cost:** FREE (MongoDB Atlas M0 tier)  
**Benefit:** Never lose your changes again!
