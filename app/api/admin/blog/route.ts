import { NextRequest, NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { getContentManager } from '@/lib/content-manager';
import { BlogPost, COLLECTIONS } from '@/lib/website-schemas';

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

// GET /api/admin/blog - Get all blog posts (including drafts)
export async function GET(request: NextRequest) {
  try {
    const auth = await checkAdminAuth();
    if (!auth.authorized) {
      return NextResponse.json({ error: auth.error }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const published = searchParams.get('published');
    const limit = parseInt(searchParams.get('limit') || '20');
    const page = parseInt(searchParams.get('page') || '1');
    const skip = (page - 1) * limit;

    const contentManager = getContentManager();
    const { posts, total } = await contentManager.getBlogPosts({
      published: published === 'true' ? true : published === 'false' ? false : undefined,
      category: category || undefined,
      limit,
      skip
    });

    return NextResponse.json({
      posts,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Admin blog API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch blog posts' },
      { status: 500 }
    );
  }
}

// POST /api/admin/blog - Create new blog post
export async function POST(request: NextRequest) {
  try {
    const auth = await checkAdminAuth();
    if (!auth.authorized) {
      return NextResponse.json({ error: auth.error }, { status: 401 });
    }

    const body = await request.json();
    const {
      title,
      content,
      excerpt,
      category,
      tags,
      coverImage,
      metaTitle,
      metaDescription,
      isPublished
    } = body;

    if (!title || !content || !excerpt) {
      return NextResponse.json(
        { error: 'Title, content, and excerpt are required' },
        { status: 400 }
      );
    }

    // Generate slug from title
    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim('-');

    // Calculate read time (rough estimate: 200 words per minute)
    const wordCount = content.split(/\s+/).length;
    const readTime = Math.ceil(wordCount / 200);

    const contentManager = getContentManager();
    
    // Check if slug already exists
    const existingPost = await contentManager.getBlogPostBySlug(slug);
    if (existingPost) {
      return NextResponse.json(
        { error: 'A post with this title already exists' },
        { status: 400 }
      );
    }

    const now = new Date();
    const blogPost = await contentManager.create<BlogPost>(COLLECTIONS.BLOG_POSTS, {
      title,
      slug,
      content,
      excerpt,
      author: auth.userEmail!,
      category: category || 'General',
      tags: tags || [],
      coverImage,
      metaTitle: metaTitle || title,
      metaDescription: metaDescription || excerpt,
      isPublished: isPublished || false,
      publishedAt: isPublished ? now : now,
      createdAt: now,
      updatedAt: now,
      readTime,
      views: 0
    });

    return NextResponse.json({
      success: true,
      post: blogPost
    });

  } catch (error) {
    console.error('Create blog post error:', error);
    return NextResponse.json(
      { error: 'Failed to create blog post' },
      { status: 500 }
    );
  }
}

// PUT /api/admin/blog - Update blog post
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
        { error: 'Post ID is required' },
        { status: 400 }
      );
    }

    // If title is being updated, regenerate slug
    if (updateData.title) {
      updateData.slug = updateData.title
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim('-');
    }

    // Recalculate read time if content is updated
    if (updateData.content) {
      const wordCount = updateData.content.split(/\s+/).length;
      updateData.readTime = Math.ceil(wordCount / 200);
    }

    // Update published date if being published for the first time
    const contentManager = getContentManager();
    const existingPost = await contentManager.findById<BlogPost>(COLLECTIONS.BLOG_POSTS, id);
    
    if (existingPost && !existingPost.isPublished && updateData.isPublished) {
      updateData.publishedAt = new Date();
    }

    const updatedPost = await contentManager.update<BlogPost>(COLLECTIONS.BLOG_POSTS, id, updateData);

    if (!updatedPost) {
      return NextResponse.json(
        { error: 'Blog post not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      post: updatedPost
    });

  } catch (error) {
    console.error('Update blog post error:', error);
    return NextResponse.json(
      { error: 'Failed to update blog post' },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/blog - Delete blog post
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
        { error: 'Post ID is required' },
        { status: 400 }
      );
    }

    const contentManager = getContentManager();
    const deleted = await contentManager.delete(COLLECTIONS.BLOG_POSTS, id);

    if (!deleted) {
      return NextResponse.json(
        { error: 'Blog post not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Blog post deleted successfully'
    });

  } catch (error) {
    console.error('Delete blog post error:', error);
    return NextResponse.json(
      { error: 'Failed to delete blog post' },
      { status: 500 }
    );
  }
}