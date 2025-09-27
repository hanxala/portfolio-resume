import { NextRequest, NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { getDatabaseStorage } from '@/lib/database';

// Get authorized admin emails from environment
const getAuthorizedEmails = (): string[] => {
  const emails = process.env.AUTHORIZED_ADMIN_EMAILS;
  const defaultEmails = ['hanzalakhan0913@gmail.com', 'hanzalakhan0912@gmail.com'];
  
  if (!emails) {
    console.warn('AUTHORIZED_ADMIN_EMAILS not set, using default emails');
    return defaultEmails;
  }
  
  return emails.split(',').map(email => email.trim());
};

export async function GET(request: NextRequest) {
  try {
    // Get current authenticated user from Clerk
    const user = await currentUser();
    
    if (!user) {
      return NextResponse.json(
        { 
          authorized: false, 
          error: 'Not authenticated',
          message: 'Please sign in to access admin panel'
        },
        { status: 401 }
      );
    }

    // Get user's primary email address
    const userEmail = user.emailAddresses[0]?.emailAddress;
    
    if (!userEmail) {
      return NextResponse.json(
        { 
          authorized: false, 
          error: 'No email found',
          message: 'User account has no email address'
        },
        { status: 400 }
      );
    }

    // Check if user email is in the authorized list
    const authorizedEmails = getAuthorizedEmails();
    const isAuthorized = authorizedEmails.includes(userEmail);

    // Log authorization attempt for security
    try {
      const dbStorage = getDatabaseStorage();
      if (dbStorage && dbStorage.logChange) {
        await dbStorage.logChange(
          isAuthorized ? 'AUTH_SUCCESS' : 'AUTH_DENIED',
          userEmail,
          `Admin authorization ${isAuthorized ? 'granted' : 'denied'}`
        );
      }
    } catch (dbError) {
      console.warn('Failed to log authorization attempt:', dbError);
    }

    // Get client IP and user agent for security logging
    const clientIP = request.headers.get('x-forwarded-for') || 
                    request.headers.get('x-real-ip') || 
                    'unknown';
    const userAgent = request.headers.get('user-agent') || 'unknown';

    console.log(`Admin authorization attempt:`, {
      email: userEmail,
      authorized: isAuthorized,
      ip: clientIP,
      userAgent: userAgent.substring(0, 100), // Truncate for logging
      timestamp: new Date().toISOString()
    });

    if (!isAuthorized) {
      return NextResponse.json(
        { 
          authorized: false,
          userEmail,
          message: 'Access denied. Your email is not in the authorized admin list.',
          authorizedEmails: authorizedEmails.map(email => 
            // Partially hide emails for security
            email.replace(/(.{2}).*(@.*)/, '$1****$2')
          )
        },
        { status: 403 }
      );
    }

    // Return success response
    return NextResponse.json({
      authorized: true,
      userEmail,
      userId: user.id,
      message: 'Admin access granted',
      permissions: {
        canEdit: true,
        canDelete: true,
        canBackup: true,
        canRestore: true,
        canViewAuditLog: true
      }
    });

  } catch (error) {
    console.error('Admin authorization error:', error);
    return NextResponse.json(
      { 
        authorized: false, 
        error: 'Authorization check failed',
        message: 'An error occurred while checking admin permissions'
      },
      { status: 500 }
    );
  }
}
