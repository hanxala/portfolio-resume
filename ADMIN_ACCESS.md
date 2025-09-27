# Admin Access Configuration

This portfolio website has restricted admin access to specific email addresses only.

## Authorized Admin Emails

Only the following email addresses can access the admin panel:
- `hanzalakhan0913@gmail.com`
- `hanzalakhan0912@gmail.com`

## Security Implementation

### 1. Environment Variables
The authorized emails are stored in `.env.local`:
```
AUTHORIZED_ADMIN_EMAILS=hanzalakhan0913@gmail.com,hanzalakhan0912@gmail.com
```

### 2. Middleware Protection
- `/middleware.ts` ensures only signed-in users can access `/admin` routes
- Basic authentication check at the route level

### 3. API Route Authorization
- `/api/admin/check` endpoint validates user email against authorized list
- Server-side validation using Clerk's `currentUser()` function

### 4. Client-side Validation
- Admin page component checks authorization before loading data
- Shows appropriate access denied message for unauthorized users

## Access Flow

1. **User visits `/admin`** → Middleware checks if signed in
2. **If not signed in** → Redirected to Clerk sign-in page
3. **If signed in** → Admin page loads
4. **Admin page** → Calls `/api/admin/check` to verify email
5. **If authorized** → Loads admin interface
6. **If not authorized** → Shows access denied message

## Pages

- **`/admin`** - Main admin dashboard (protected)
- **`/unauthorized`** - Access denied page with user info
- **`/sign-in`** - Clerk authentication
- **`/sign-up`** - Clerk registration

## User Experience

### Authorized Users
- Can sign in and access full admin functionality
- Can upload images, edit content, manage projects
- See welcome message with their email

### Unauthorized Users
- Can sign in but see access denied message
- Shows their current email address
- Option to sign out and return to main portfolio
- Clear explanation of restricted access

## Modifying Access

To change authorized emails:
1. Update `.env.local` file
2. Modify the `AUTHORIZED_ADMIN_EMAILS` variable
3. Restart the development server

## Security Notes

- Emails are validated on both client and server side
- All admin routes require authentication
- Sensitive operations are protected by Clerk middleware
- Environment variables keep configuration secure
