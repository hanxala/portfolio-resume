import { NextResponse } from 'next/server';
import { getContentManager } from '@/lib/content-manager';

// GET /api/testimonials - Get published testimonials (public)
export async function GET() {
  try {
    const contentManager = getContentManager();
    const testimonials = await contentManager.getPublishedTestimonials();

    return NextResponse.json({
      testimonials,
      count: testimonials.length
    });

  } catch (error) {
    console.error('Testimonials API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch testimonials' },
      { status: 500 }
    );
  }
}