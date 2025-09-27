import { NextRequest, NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { getDatabaseStorage } from '@/lib/database';

// Helper function to check admin authorization
async function checkAdminAuth(request: NextRequest) {
  const user = await currentUser();
  if (!user) {
    return { error: 'Authentication required', status: 401 };
  }

  const userEmail = user.emailAddresses[0]?.emailAddress;
  if (!userEmail) {
    return { error: 'User email not found', status: 400 };
  }

  const authorizedEmails = process.env.AUTHORIZED_ADMIN_EMAILS?.split(',').map(e => e.trim()) || [
    'hanzalakhan0913@gmail.com',
    'hanzalakhan0912@gmail.com'
  ];

  if (!authorizedEmails.includes(userEmail)) {
    return { error: 'Admin access required', status: 403 };
  }

  return { user, userEmail };
}

// GET: Dashboard overview data
export async function GET(request: NextRequest) {
  try {
    const authResult = await checkAdminAuth(request);
    if ('error' in authResult) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status });
    }

    const { userEmail } = authResult;
    
    try {
      const dbStorage = getDatabaseStorage();
      
      if (!dbStorage) {
        // Fallback data when database is not available
        return NextResponse.json({
          success: true,
          data: {
            systemInfo: {
              databaseProvider: 'none',
              hasPersistentStorage: false,
              hasCloudBackup: !!(process.env.JSONBIN_API_KEY || process.env.CLOUDINARY_API_KEY),
              environment: process.env.NODE_ENV || 'development',
              deploymentPlatform: process.env.VERCEL ? 'Vercel' : 'Other'
            },
            recentActivity: [],
            availableBackups: [],
            adminEmail: userEmail,
            lastUpdated: new Date().toISOString(),
            warning: 'Database not available - using fallback mode'
          }
        });
      }
      
      // Get dashboard data
      const [auditLog, backups] = await Promise.all([
        dbStorage.getAuditLog?.(20) ?? [],
        dbStorage.getBackups?.(10) ?? []
      ]);

      // Get system info
      const systemInfo = {
        databaseProvider: process.env.DATABASE_PROVIDER || 'none',
        hasPersistentStorage: !!process.env.DATABASE_PROVIDER,
        hasCloudBackup: !!(process.env.JSONBIN_API_KEY || process.env.CLOUDINARY_API_KEY),
        environment: process.env.NODE_ENV || 'development',
        deploymentPlatform: process.env.VERCEL ? 'Vercel' : 'Other'
      };

      return NextResponse.json({
        success: true,
        data: {
          systemInfo,
          recentActivity: auditLog,
          availableBackups: backups,
          adminEmail: userEmail,
          lastUpdated: new Date().toISOString()
        }
      });

    } catch (dbError) {
      console.warn('Dashboard data fetch failed:', dbError);
      
      // Fallback data when database is not available
      return NextResponse.json({
        success: true,
        data: {
          systemInfo: {
            databaseProvider: 'none',
            hasPersistentStorage: false,
            hasCloudBackup: !!(process.env.JSONBIN_API_KEY || process.env.CLOUDINARY_API_KEY),
            environment: process.env.NODE_ENV || 'development',
            deploymentPlatform: process.env.VERCEL ? 'Vercel' : 'Other'
          },
          recentActivity: [],
          availableBackups: [],
          adminEmail: userEmail,
          lastUpdated: new Date().toISOString(),
          warning: 'Database not available - using fallback mode'
        }
      });
    }

  } catch (error) {
    console.error('Dashboard error:', error);
    return NextResponse.json(
      { error: 'Failed to load dashboard data' },
      { status: 500 }
    );
  }
}

// POST: Administrative actions (backup, restore, etc.)
export async function POST(request: NextRequest) {
  try {
    const authResult = await checkAdminAuth(request);
    if ('error' in authResult) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status });
    }

    const { userEmail } = authResult;
    const { action, data } = await request.json();

    const dbStorage = getDatabaseStorage();
    if (!dbStorage) {
      return NextResponse.json(
        { error: 'Database storage not available' },
        { status: 503 }
      );
    }

    switch (action) {
      case 'create_backup':
        try {
          // Manual backup creation
          await dbStorage.createBackup(userEmail);
          await dbStorage.logChange('MANUAL_BACKUP', userEmail, 'Manual backup created via dashboard');
          
          return NextResponse.json({
            success: true,
            message: 'Backup created successfully',
            timestamp: new Date().toISOString()
          });
        } catch (error) {
          throw new Error(`Backup creation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }

      case 'restore_backup':
        const { backupId } = data;
        if (!backupId) {
          return NextResponse.json({ error: 'Backup ID required' }, { status: 400 });
        }

        try {
          await dbStorage.restoreFromBackup(backupId, userEmail);
          
          return NextResponse.json({
            success: true,
            message: `Successfully restored from backup #${backupId}`,
            timestamp: new Date().toISOString()
          });
        } catch (error) {
          throw new Error(`Backup restore failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }

      case 'get_audit_log':
        const { limit = 50 } = data;
        try {
          const auditLog = await dbStorage.getAuditLog(limit);
          return NextResponse.json({
            success: true,
            data: auditLog
          });
        } catch (error) {
          throw new Error(`Audit log fetch failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }

      case 'system_health_check':
        try {
          // Test database connectivity and operations
          const healthCheck = {
            database: {
              connected: true,
              provider: process.env.DATABASE_PROVIDER || 'unknown'
            },
            storage: {
              canRead: false,
              canWrite: false
            },
            timestamp: new Date().toISOString()
          };

          // Test read operation
          try {
            await dbStorage.getPortfolioData();
            healthCheck.storage.canRead = true;
          } catch (readError) {
            console.warn('Health check - read test failed:', readError);
          }

          // Test write operation (create a test log entry)
          try {
            await dbStorage.logChange('HEALTH_CHECK', userEmail, 'System health check performed');
            healthCheck.storage.canWrite = true;
          } catch (writeError) {
            console.warn('Health check - write test failed:', writeError);
          }

          return NextResponse.json({
            success: true,
            data: healthCheck
          });
        } catch (error) {
          return NextResponse.json({
            success: false,
            error: `Health check failed: ${error instanceof Error ? error.message : 'Unknown error'}`
          });
        }

      default:
        return NextResponse.json(
          { error: `Unknown action: ${action}` },
          { status: 400 }
        );
    }

  } catch (error) {
    console.error('Admin dashboard action error:', error);
    return NextResponse.json(
      { 
        error: 'Administrative action failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}