import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'

const isProtectedRoute = createRouteMatcher(['/admin(.*)'])

// Authorized admin emails from environment variables
const getAuthorizedEmails = () => {
  const emails = process.env.AUTHORIZED_ADMIN_EMAILS;
  return emails ? emails.split(',').map(email => email.trim()) : [];
};

const AUTHORIZED_EMAILS = getAuthorizedEmails();

export default clerkMiddleware(async (auth, req) => {
  if (isProtectedRoute(req)) {
    await auth.protect()
    
    // Note: In middleware, we can't easily access user's email
    // We'll rely on the admin page component to do the email check
    // Middleware will just ensure user is signed in
  }
})

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
}
