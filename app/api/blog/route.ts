import { NextRequest, NextResponse } from 'next/server';
import { getContentManager } from '@/lib/content-manager';
import { BlogPost } from '@/lib/website-schemas';

// GET /api/blog - Get blog posts (public)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const tag = searchParams.get('tag');
    const limit = parseInt(searchParams.get('limit') || '10');
    const page = parseInt(searchParams.get('page') || '1');
    const skip = (page - 1) * limit;

    const contentManager = getContentManager();
    const { posts, total } = await contentManager.getBlogPosts({
      published: true, // Only published posts for public API
      category: category || undefined,
      tag: tag || undefined,
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
    console.error('Blog API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch blog posts' },
      { status: 500 }
    );
  }
}