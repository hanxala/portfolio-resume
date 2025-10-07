import { NextRequest, NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { getContentManager } from '@/lib/content-manager';
import { Testimonial, COLLECTIONS } from '@/lib/website-schemas';

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

// GET /api/admin/testimonials - Get all testimonials (including unpublished)
export async function GET() {
  try {
    const auth = await checkAdminAuth();
    if (!auth.authorized) {
      return NextResponse.json({ error: auth.error }, { status: 401 });
    }

    const contentManager = getContentManager();
    const testimonials = await contentManager.findAll<Testimonial>(
      COLLECTIONS.TESTIMONIALS,
      {},
      { sort: { createdAt: -1 } }
    );

    return NextResponse.json({
      testimonials,
      count: testimonials.length
    });

  } catch (error) {
    console.error('Admin testimonials API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch testimonials' },
      { status: 500 }
    );
  }
}

// POST /api/admin/testimonials - Create new testimonial
export async function POST(request: NextRequest) {
  try {
    const auth = await checkAdminAuth();
    if (!auth.authorized) {
      return NextResponse.json({ error: auth.error }, { status: 401 });
    }

    const body = await request.json();
    const { name, position, company, content, rating, image, isPublished } = body;

    if (!name || !position || !company || !content || !rating) {
      return NextResponse.json(
        { error: 'Name, position, company, content, and rating are required' },
        { status: 400 }
      );
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: 'Rating must be between 1 and 5' },
        { status: 400 }
      );
    }

    const contentManager = getContentManager();
    const now = new Date();
    const testimonial = await contentManager.create<Testimonial>(COLLECTIONS.TESTIMONIALS, {
      name: name.trim(),
      position: position.trim(),
      company: company.trim(),
      content: content.trim(),
      rating,
      image: image?.trim(),
      isPublished: isPublished || false,
      createdAt: now,
      updatedAt: now
    });

    return NextResponse.json({
      success: true,
      testimonial
    });

  } catch (error) {
    console.error('Create testimonial error:', error);
    return NextResponse.json(
      { error: 'Failed to create testimonial' },
      { status: 500 }
    );
  }
}

// PUT /api/admin/testimonials - Update testimonial
export async function PUT(request: NextRequest) {
  try {
    const auth = await checkAdminAuth();
    if (!auth.authorized) {
      return NextResponse.json({ error: auth.error }, { status: 401 });
    }

    const body = await request.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Testimonial ID is required' },
        { status: 400 }
      );
    }

    if (updateData.rating && (updateData.rating < 1 || updateData.rating > 5)) {
      return NextResponse.json(
        { error: 'Rating must be between 1 and 5' },
        { status: 400 }
      );
    }

    const contentManager = getContentManager();
    const updatedTestimonial = await contentManager.update<Testimonial>(COLLECTIONS.TESTIMONIALS, id, updateData);

    if (!updatedTestimonial) {
      return NextResponse.json(
        { error: 'Testimonial not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      testimonial: updatedTestimonial
    });

  } catch (error) {
    console.error('Update testimonial error:', error);
    return NextResponse.json(
      { error: 'Failed to update testimonial' },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/testimonials - Delete testimonial
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
        { error: 'Testimonial ID is required' },
        { status: 400 }
      );
    }

    const contentManager = getContentManager();
    const deleted = await contentManager.delete(COLLECTIONS.TESTIMONIALS, id);

    if (!deleted) {
      return NextResponse.json(
        { error: 'Testimonial not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Testimonial deleted successfully'
    });

  } catch (error) {
    console.error('Delete testimonial error:', error);
    return NextResponse.json(
      { error: 'Failed to delete testimonial' },
      { status: 500 }
    );
  }
}