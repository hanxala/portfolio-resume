import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    DATABASE_PROVIDER: process.env.DATABASE_PROVIDER || 'NOT SET',
    MONGODB_URL: process.env.MONGODB_URL ? 'SET (hidden)' : 'NOT SET',
    persistent: !!process.env.DATABASE_PROVIDER,
    nodeEnv: process.env.NODE_ENV,
    allEnvVars: Object.keys(process.env).filter(key => 
      key.includes('DATABASE') || key.includes('MONGODB')
    )
  });
}
