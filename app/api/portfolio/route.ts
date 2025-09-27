import { NextRequest, NextResponse } from 'next/server';
import { getPortfolioData, savePortfolioData } from '@/lib/portfolio-data';
import { currentUser } from '@clerk/nextjs/server';
import { validatePortfolioData, checkRateLimit } from '@/lib/validation';

export async function GET() {
  try {
    const data = await getPortfolioData();
    return NextResponse.json(data, {
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });
  } catch (error) {
    console.error('Portfolio data fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch portfolio data' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Get current authenticated user
    const user = await currentUser();
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const userEmail = user.emailAddresses[0]?.emailAddress;
    if (!userEmail) {
      return NextResponse.json(
        { error: 'User email not found' },
        { status: 400 }
      );
    }

    // Check if user is authorized admin
    const authorizedEmails = process.env.AUTHORIZED_ADMIN_EMAILS?.split(',').map(e => e.trim()) || [
      'hanzalakhan0913@gmail.com',
      'hanzalakhan0912@gmail.com'
    ];

    if (!authorizedEmails.includes(userEmail)) {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }

    // Rate limiting check
    const clientIP = request.headers.get('x-forwarded-for') || 
                    request.headers.get('x-real-ip') || 
                    request.ip || 
                    'unknown';
    
    const rateLimitCheck = checkRateLimit(`${userEmail}-${clientIP}`, 5, 10); // 5 requests per 10 minutes
    if (!rateLimitCheck.isAllowed) {
      return NextResponse.json(
        { 
          error: 'Rate limit exceeded',
          message: 'Too many update requests. Please wait before trying again.',
          retryAfter: rateLimitCheck.retryAfter
        },
        { 
          status: 429,
          headers: {
            'Retry-After': rateLimitCheck.retryAfter?.toString() || '300'
          }
        }
      );
    }

    const body = await request.json();
    console.log(`Admin ${userEmail} updating portfolio data`);
    
    // Extract portfolio data (remove any auth-related fields)
    const { password, ...portfolioData } = body;
    
    // Validate and sanitize the portfolio data
    const validation = validatePortfolioData(portfolioData);
    if (!validation.isValid) {
      console.warn('Portfolio data validation failed:', validation.errors);
      return NextResponse.json(
        { 
          error: 'Invalid portfolio data',
          message: 'The submitted data contains validation errors.',
          validationErrors: validation.errors
        },
        { status: 400 }
      );
    }
    
    // Use sanitized data for saving
    const sanitizedData = validation.sanitizedData!;
    
    // Fallback password check for compatibility
    if (password && password !== process.env.ADMIN_PASSWORD) {
      console.log('Legacy password authentication failed');
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    console.log('Attempting to save portfolio data to persistent storage...');
    
    // Save with admin email for audit tracking (using sanitized data)
    await savePortfolioData(sanitizedData, userEmail);
    
    console.log('✅ Portfolio data saved successfully to persistent storage!');
    
    return NextResponse.json({ 
      success: true,
      message: 'Portfolio data saved successfully',
      savedBy: userEmail,
      timestamp: new Date().toISOString(),
      persistent: !!process.env.DATABASE_PROVIDER
    }, {
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });
  } catch (error) {
    console.error('❌ Error saving portfolio data:', error);
    return NextResponse.json(
      { 
        error: 'Failed to save portfolio data', 
        details: error instanceof Error ? error.message : 'Unknown error',
        persistent: false
      },
      { status: 500 }
    );
  }
}
