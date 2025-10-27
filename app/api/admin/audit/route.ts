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

// GET /api/admin/audit - Get audit logs
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
    const limit = parseInt(searchParams.get('limit') || '50');

    const logs = await dbStorage.getAuditLog(limit);

    return NextResponse.json({
      success: true,
      logs,
      count: logs.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching audit logs:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch audit logs',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// POST /api/admin/audit - Create audit log entry (for custom logging)
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
    const { action, description } = body;

    if (!action || !description) {
      return NextResponse.json(
        { error: 'Action and description are required' },
        { status: 400 }
      );
    }

    await dbStorage.logChange(action, auth.email!, description);

    return NextResponse.json({
      success: true,
      message: 'Audit log entry created',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error creating audit log:', error);
    return NextResponse.json(
      { 
        error: 'Failed to create audit log',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
