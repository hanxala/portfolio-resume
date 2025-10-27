import { NextRequest, NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { getDatabaseStorage } from '@/lib/database';

// Helper to check admin authorization
async function checkAdminAuth() {
  const user = await currentUser();
  if (!user) {
    return { authorized: false, error: 'Authentication required', status: 401 };
  }

  const userEmail = user.emailAddresses[0]?.emailAddress;
  if (!userEmail) {
    return { authorized: false, error: 'User email not found', status: 400 };
  }

  const authorizedEmails = process.env.AUTHORIZED_ADMIN_EMAILS?.split(',').map(e => e.trim()) || [
    'hanzalakhan0913@gmail.com',
    'hanzalakhan0912@gmail.com'
  ];

  if (!authorizedEmails.includes(userEmail)) {
    return { authorized: false, error: 'Admin access required', status: 403 };
  }

  return { authorized: true, email: userEmail };
}

// GET /api/admin/database - Get database status and info
export async function GET(request: NextRequest) {
  try {
    const auth = await checkAdminAuth();
    if (!auth.authorized) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const dbStorage = getDatabaseStorage();
    if (!dbStorage) {
      return NextResponse.json({
        connected: false,
        provider: null,
        message: 'No database provider configured. Set DATABASE_PROVIDER and connection URL in environment variables.'
      });
    }

    // Get database info
    try {
      const data = await dbStorage.getPortfolioData();
      const hasData = !!data;

      return NextResponse.json({
        connected: true,
        provider: process.env.DATABASE_PROVIDER,
        hasData,
        message: hasData 
          ? 'Database is connected and contains portfolio data' 
          : 'Database is connected but empty. Consider migrating your data.',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      return NextResponse.json({
        connected: false,
        provider: process.env.DATABASE_PROVIDER,
        error: error instanceof Error ? error.message : 'Connection failed',
        message: 'Database is configured but connection failed. Check your credentials.'
      }, { status: 500 });
    }
  } catch (error) {
    console.error('Database status check error:', error);
    return NextResponse.json(
      { error: 'Failed to check database status' },
      { status: 500 }
    );
  }
}

// POST /api/admin/database - Database operations (backup, restore)
export async function POST(request: NextRequest) {
  try {
    const auth = await checkAdminAuth();
    if (!auth.authorized) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const dbStorage = getDatabaseStorage();
    if (!dbStorage) {
      return NextResponse.json(
        { error: 'Database not configured' },
        { status: 503 }
      );
    }

    const body = await request.json();
    const { action, backupId } = body;

    switch (action) {
      case 'backup':
        await dbStorage.createBackup(auth.email!);
        return NextResponse.json({
          success: true,
          message: 'Manual backup created successfully',
          timestamp: new Date().toISOString()
        });

      case 'restore':
        if (!backupId) {
          return NextResponse.json(
            { error: 'Backup ID is required for restore operation' },
            { status: 400 }
          );
        }
        await dbStorage.restoreFromBackup(backupId, auth.email!);
        return NextResponse.json({
          success: true,
          message: 'Data restored successfully from backup',
          backupId,
          timestamp: new Date().toISOString()
        });

      default:
        return NextResponse.json(
          { error: 'Invalid action. Supported actions: backup, restore' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Database operation error:', error);
    return NextResponse.json(
      { 
        error: 'Database operation failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
