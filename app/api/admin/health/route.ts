import { NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { getDatabaseStorage } from '@/lib/database';
import { testCloudConnectivity } from '@/lib/cloud-storage';

export async function GET() {
  try {
    // Check if user is authenticated and authorized
    const user = await currentUser();
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const userEmail = user.emailAddresses[0]?.emailAddress;
    const authorizedEmails = process.env.AUTHORIZED_ADMIN_EMAILS?.split(',').map(e => e.trim()) || [
      'hanzalakhan0913@gmail.com',
      'hanzalakhan0912@gmail.com'
    ];

    if (!userEmail || !authorizedEmails.includes(userEmail)) {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }

    // Check database connectivity
    const dbStorage = getDatabaseStorage();
    let databaseStatus = {
      provider: process.env.DATABASE_PROVIDER || 'none',
      connected: false,
      error: null as string | null
    };

    if (dbStorage) {
      try {
        // Try to get portfolio data to test connection
        await dbStorage.getPortfolioData();
        databaseStatus.connected = true;
      } catch (error) {
        databaseStatus.error = error instanceof Error ? error.message : 'Unknown error';
      }
    }

    // Check cloud storage connectivity
    let cloudStatus;
    try {
      cloudStatus = await testCloudConnectivity();
    } catch (error) {
      cloudStatus = {
        jsonbin: false,
        github: false,
        pastebin: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }

    // Environment variables status
    const envStatus = {
      DATABASE_PROVIDER: !!process.env.DATABASE_PROVIDER,
      MONGODB_URL: !!process.env.MONGODB_URL,
      SUPABASE_URL: !!process.env.SUPABASE_URL,
      JSONBIN_API_KEY: !!process.env.JSONBIN_API_KEY,
      GITHUB_TOKEN: !!process.env.GITHUB_TOKEN,
      CLERK_SECRET_KEY: !!process.env.CLERK_SECRET_KEY,
      CLOUDINARY_API_SECRET: !!process.env.CLOUDINARY_API_SECRET
    };

    const overallHealthy = databaseStatus.connected || 
      cloudStatus.jsonbin || 
      cloudStatus.github;

    return NextResponse.json({
      status: overallHealthy ? 'healthy' : 'degraded',
      timestamp: new Date().toISOString(),
      checkedBy: userEmail,
      database: databaseStatus,
      cloudStorage: cloudStatus,
      environment: envStatus,
      recommendations: generateRecommendations(databaseStatus, cloudStatus, envStatus)
    });

  } catch (error) {
    console.error('Health check failed:', error);
    return NextResponse.json(
      { 
        error: 'Health check failed',
        details: error instanceof Error ? error.message : 'Unknown error',
        status: 'error'
      },
      { status: 500 }
    );
  }
}

function generateRecommendations(
  db: any, 
  cloud: any, 
  env: any
): string[] {
  const recommendations: string[] = [];

  if (!db.connected && db.provider !== 'none') {
    recommendations.push('⚠️ Database connection failed. Check your DATABASE_PROVIDER and connection string.');
  }

  if (!db.connected && db.provider === 'none') {
    recommendations.push('⚠️ No database provider configured. Add DATABASE_PROVIDER to environment variables.');
  }

  if (!cloud.jsonbin && !cloud.github && !cloud.pastebin) {
    recommendations.push('⚠️ No cloud storage backup configured. Consider adding JSONBIN_API_KEY or GITHUB_TOKEN.');
  }

  if (db.connected && (cloud.jsonbin || cloud.github)) {
    recommendations.push('✅ Excellent! Both database and cloud backup are configured.');
  } else if (db.connected) {
    recommendations.push('✅ Database is connected. Consider adding cloud backup for extra safety.');
  } else if (cloud.jsonbin || cloud.github) {
    recommendations.push('⚠️ Cloud backup available but no persistent database. Data may be lost on deployment.');
  }

  if (!env.CLOUDINARY_API_SECRET) {
    recommendations.push('⚠️ Cloudinary not configured. Image uploads may fail.');
  }

  return recommendations;
}