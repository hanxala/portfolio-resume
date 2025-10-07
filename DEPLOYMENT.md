# Portfolio Deployment Guide - Persistent Data Storage

## Overview

This guide will help you set up persistent data storage for your portfolio admin panel, ensuring that changes made by admins are permanent and survive deployments.

## Prerequisites

1. MongoDB Atlas account (or local MongoDB)
2. Vercel account for deployment
3. Clerk account for authentication (already configured)
4. Cloudinary account for image uploads (already configured)

## Setup Steps

### 1. Database Setup (MongoDB Atlas)

Your MongoDB connection is already configured in `.env.local`:
```
DATABASE_PROVIDER=mongodb
MONGODB_URL=mongodb+srv://hanzalakhan0912_db_user:JyVmK23SSl00kd77@cluster0.uebygdr.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0
```

**Test your database connection:**
```bash
npm install
npm run init-db
```

This will verify the connection and initialize required collections.

### 2. Vercel Deployment Configuration

#### 2.1 Environment Variables in Vercel Dashboard

Go to your Vercel project settings → Environment Variables and add:

**Required Variables:**
- `DATABASE_PROVIDER` = `mongodb`
- `MONGODB_URL` = `mongodb+srv://hanzalakhan0912_db_user:JyVmK23SSl00kd77@cluster0.uebygdr.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`
- `AUTHORIZED_ADMIN_EMAILS` = `hanzalakhan0913@gmail.com,hanzalakhan0912@gmail.com`
- `ADMIN_PASSWORD` = `hanzala2025`

**Authentication (Clerk):**
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` = `pk_test_dHJ1c3RlZC1iZWV0bGUtNjAuY2xlcmsuYWNjb3VudHMuZGV2JA`
- `CLERK_SECRET_KEY` = `sk_test_9raai7oDMCRDaAzpfWUTnvh6juWUBa1OXBV4kJr9eo`

**Cloudinary (Image uploads):**
- `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` = `dkid7ilxv`
- `CLOUDINARY_API_KEY` = `256441591684347`
- `CLOUDINARY_API_SECRET` = `7Wo_75mchUcqZpBQbdH_q-aGtQw`

**Optional (Cloud Backup - Recommended):**
- `JSONBIN_API_KEY` = (Optional: Sign up at jsonbin.io)
- `JSONBIN_BIN_ID` = (Optional: Create a bin at jsonbin.io)

#### 2.2 Deploy to Vercel
```bash
# Install Vercel CLI if you haven't
npm i -g vercel

# Deploy
vercel --prod
```

### 3. Post-Deployment Verification

After deployment, visit your admin panel and:

1. **Go to the "Database Management" tab**
2. **Click "Check Health"** - Should show:
   - ✅ Database: Connected (MongoDB)
   - Status: healthy

3. **Test data persistence:**
   - Make a change to your portfolio data
   - Click "Save Changes"
   - Redeploy your site
   - Verify your changes are still there

## How It Works

### Data Storage Priority
1. **MongoDB** (Primary) - Persistent across deployments
2. **Cloud Storage** (Backup) - JSONBin/GitHub as secondary backup
3. **Memory Cache** (Temporary) - Fast access during runtime
4. **File System** (Development) - Local development only

### Admin Features
- **Real-time Health Monitoring** - Check database connectivity
- **Backup Management** - Create/restore backups manually
- **Data Export** - Download portfolio data as JSON
- **Audit Logging** - Track all admin changes

## Troubleshooting

### Problem: Changes Still Not Persistent

1. **Check Database Health:**
   ```
   Visit: https://your-site.vercel.app/admin
   Go to "Database Management" → Click "Check Health"
   ```

2. **Verify Environment Variables:**
   - Ensure all variables are set in Vercel dashboard
   - Check MongoDB connection string is correct
   - Verify admin emails are authorized

3. **Check Network Connectivity:**
   - MongoDB Atlas: Ensure IP whitelist includes 0.0.0.0/0 (all IPs)
   - Check MongoDB Atlas cluster is running

### Problem: Database Connection Failed

1. **MongoDB Atlas Setup:**
   ```
   - Go to MongoDB Atlas → Database Access
   - Ensure user 'hanzalakhan0912_db_user' exists
   - Verify password is correct
   - Check user has read/write permissions
   ```

2. **Network Access:**
   ```
   - Go to MongoDB Atlas → Network Access
   - Add IP Address: 0.0.0.0/0 (Allow access from anywhere)
   ```

3. **Connection String:**
   - Verify the connection string format
   - Ensure database name and parameters are correct

### Problem: Admin Access Denied

Ensure your email is in the `AUTHORIZED_ADMIN_EMAILS` environment variable in Vercel.

## Additional Security (Optional)

### 1. Restrict MongoDB Network Access
Instead of allowing all IPs (0.0.0.0/0), you can restrict to Vercel's IP ranges:
```
Go to MongoDB Atlas → Network Access
Add Vercel IP ranges (check Vercel documentation for current ranges)
```

### 2. Enable Additional Cloud Backup

Sign up for JSONBin.io (free tier available):
```
1. Go to https://jsonbin.io
2. Create account and get API key
3. Create a new bin
4. Add to Vercel environment:
   - JSONBIN_API_KEY=your_api_key
   - JSONBIN_BIN_ID=your_bin_id
```

## Success Indicators

✅ **Working Correctly When:**
- Admin changes persist after redeployment
- Database Management shows "healthy" status
- Backup creation/restoration works
- Data export downloads complete portfolio

❌ **Not Working When:**
- Changes disappear after redeployment
- Database shows "disconnected" status
- Save operations fail with database errors

## Support

If you encounter issues:
1. Check the Database Management health status
2. Verify all environment variables in Vercel
3. Test database connectivity using the init-db script locally
4. Check MongoDB Atlas cluster status and network access