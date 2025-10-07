import { NextRequest, NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { getDatabaseStorage } from '@/lib/database';
import { getPortfolioData } from '@/lib/portfolio-data';

export async function GET() {
  try {
    // Check authentication and authorization
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

    const dbStorage = getDatabaseStorage();
    if (!dbStorage) {
      return NextResponse.json(
        { error: 'Database not configured' },
        { status: 503 }
      );
    }

    // Get list of available backups
    const backups = await dbStorage.getBackups();
    
    return NextResponse.json({
      success: true,
      backups,
      count: backups.length,
      requestedBy: userEmail
    });

  } catch (error) {
    console.error('Backup list fetch failed:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch backups',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Check authentication and authorization
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

    const body = await request.json();
    const { action, backupId } = body;

    const dbStorage = getDatabaseStorage();
    if (!dbStorage) {
      return NextResponse.json(
        { error: 'Database not configured' },
        { status: 503 }
      );
    }

    switch (action) {
      case 'create':
        await dbStorage.createBackup(userEmail);
        await dbStorage.logChange('BACKUP_CREATE', userEmail, 'Manual backup created via admin panel');
        
        return NextResponse.json({
          success: true,
          message: 'Backup created successfully',
          createdBy: userEmail,
          timestamp: new Date().toISOString()
        });

      case 'restore':
        if (!backupId) {
          return NextResponse.json(
            { error: 'Backup ID required for restore operation' },
            { status: 400 }
          );
        }

        await dbStorage.restoreFromBackup(backupId, userEmail);
        
        return NextResponse.json({
          success: true,
          message: 'Data restored from backup successfully',
          restoredBy: userEmail,
          backupId,
          timestamp: new Date().toISOString()
        });

      case 'export':
        // Export current data as downloadable backup
        const currentData = await getPortfolioData();
        const exportData = {
          portfolioData: currentData,
          metadata: {
            exportedAt: new Date().toISOString(),
            exportedBy: userEmail,
            version: Date.now()
          }
        };

        return NextResponse.json(exportData, {
          headers: {
            'Content-Type': 'application/json',
            'Content-Disposition': `attachment; filename="portfolio-backup-${new Date().toISOString().split('T')[0]}.json"`
          }
        });

      default:
        return NextResponse.json(
          { error: 'Invalid action. Use "create", "restore", or "export"' },
          { status: 400 }
        );
    }

  } catch (error) {
    console.error('Backup operation failed:', error);
    return NextResponse.json(
      { 
        error: 'Backup operation failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}