import { NextRequest, NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { getDatabaseStorage } from '@/lib/database';

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

// GET /api/admin/backups - List all backups
export async function GET(request: NextRequest) {
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

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '20');

    const backups = await dbStorage.getBackups(limit);

    return NextResponse.json({
      success: true,
      backups,
      count: backups.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching backups:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch backups',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/backups?id=<backupId> - Delete a specific backup
export async function DELETE(request: NextRequest) {
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

    const { searchParams } = new URL(request.url);
    const backupId = searchParams.get('id');

    if (!backupId) {
      return NextResponse.json(
        { error: 'Backup ID is required' },
        { status: 400 }
      );
    }

    // Note: Add deleteBackup method to MongoDBStorage class if needed
    // For now, return a message that this feature needs implementation
    return NextResponse.json(
      { 
        error: 'Delete backup feature not yet implemented',
        message: 'This feature will be added in the next update'
      },
      { status: 501 }
    );
  } catch (error) {
    console.error('Error deleting backup:', error);
    return NextResponse.json(
      { 
        error: 'Failed to delete backup',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
