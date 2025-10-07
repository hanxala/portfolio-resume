import { NextRequest, NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { getContentManager } from '@/lib/content-manager';
import { ContactMessage, COLLECTIONS } from '@/lib/website-schemas';

// Check admin authorization
async function checkAdminAuth() {
  const user = await currentUser();
  if (!user) {
    return { authorized: false, error: 'Authentication required' };
  }

  const userEmail = user.emailAddresses[0]?.emailAddress;
  const authorizedEmails = process.env.AUTHORIZED_ADMIN_EMAILS?.split(',').map(e => e.trim()) || [
    'hanzalakhan0913@gmail.com',
    'hanzalakhan0912@gmail.com'
  ];

  if (!userEmail || !authorizedEmails.includes(userEmail)) {
    return { authorized: false, error: 'Admin access required' };
  }

  return { authorized: true, userEmail };
}

// GET /api/admin/contact - Get contact messages
export async function GET(request: NextRequest) {
  try {
    const auth = await checkAdminAuth();
    if (!auth.authorized) {
      return NextResponse.json({ error: auth.error }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') as ContactMessage['status'] | null;

    const contentManager = getContentManager();
    const messages = await contentManager.getContactMessages(status || undefined);

    // Get status counts for dashboard
    const statusCounts = await Promise.all([
      contentManager.count(COLLECTIONS.CONTACT_MESSAGES, { status: 'new' }),
      contentManager.count(COLLECTIONS.CONTACT_MESSAGES, { status: 'read' }),
      contentManager.count(COLLECTIONS.CONTACT_MESSAGES, { status: 'responded' }),
      contentManager.count(COLLECTIONS.CONTACT_MESSAGES, { status: 'archived' })
    ]);

    return NextResponse.json({
      messages,
      count: messages.length,
      statusCounts: {
        new: statusCounts[0],
        read: statusCounts[1],
        responded: statusCounts[2],
        archived: statusCounts[3],
        total: statusCounts.reduce((a, b) => a + b, 0)
      }
    });

  } catch (error) {
    console.error('Admin contact API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch contact messages' },
      { status: 500 }
    );
  }
}

// PUT /api/admin/contact - Update contact message status
export async function PUT(request: NextRequest) {
  try {
    const auth = await checkAdminAuth();
    if (!auth.authorized) {
      return NextResponse.json({ error: auth.error }, { status: 401 });
    }

    const body = await request.json();
    const { id, status, adminNotes } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Message ID is required' },
        { status: 400 }
      );
    }

    const validStatuses: ContactMessage['status'][] = ['new', 'read', 'responded', 'archived'];
    if (status && !validStatuses.includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status' },
        { status: 400 }
      );
    }

    const contentManager = getContentManager();
    const updatedMessage = await contentManager.updateContactMessageStatus(
      id, 
      status, 
      adminNotes
    );

    if (!updatedMessage) {
      return NextResponse.json(
        { error: 'Contact message not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: updatedMessage
    });

  } catch (error) {
    console.error('Update contact message error:', error);
    return NextResponse.json(
      { error: 'Failed to update contact message' },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/contact - Delete contact message
export async function DELETE(request: NextRequest) {
  try {
    const auth = await checkAdminAuth();
    if (!auth.authorized) {
      return NextResponse.json({ error: auth.error }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Message ID is required' },
        { status: 400 }
      );
    }

    const contentManager = getContentManager();
    const deleted = await contentManager.delete(COLLECTIONS.CONTACT_MESSAGES, id);

    if (!deleted) {
      return NextResponse.json(
        { error: 'Contact message not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Contact message deleted successfully'
    });

  } catch (error) {
    console.error('Delete contact message error:', error);
    return NextResponse.json(
      { error: 'Failed to delete contact message' },
      { status: 500 }
    );
  }
}