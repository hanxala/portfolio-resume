# Portfolio Database System

This document describes the comprehensive database system for managing website content including blog posts, testimonials, services, contact messages, and more.

## Overview

The portfolio website now uses MongoDB Atlas for persistent data storage with the following capabilities:

- **Portfolio Data**: Personal information, education, projects, skills, achievements
- **Blog System**: Create, manage, and publish blog posts
- **Testimonials**: Client testimonials and reviews
- **Services**: Service offerings and pricing
- **Contact Management**: Handle contact form submissions
- **FAQ System**: Frequently asked questions
- **Website Settings**: Site configuration and metadata

## Database Collections

### Core Collections

| Collection | Purpose | Admin API | Public API |
|------------|---------|-----------|------------|
| `portfolio` | Portfolio data (existing) | ✅ | ✅ |
| `blog_posts` | Blog articles | ✅ | ✅ |
| `testimonials` | Client testimonials | ✅ | ✅ |
| `services` | Service offerings | ✅ | ✅ |
| `contact_messages` | Contact form submissions | ✅ | ❌ |
| `faq` | Frequently asked questions | ✅ | ✅ |
| `website_settings` | Site configuration | ✅ | ✅ |
| `content_categories` | Content categorization | ✅ | ✅ |

### System Collections

| Collection | Purpose |
|------------|---------|
| `backups` | Data backups |
| `audit_log` | Admin activity log |
| `site_notifications` | Admin notifications |

## API Endpoints

### Public APIs

```
GET  /api/blog                 - Get published blog posts
GET  /api/testimonials         - Get published testimonials  
GET  /api/services             - Get active services
GET  /api/faq                  - Get published FAQs
POST /api/contact              - Submit contact form
```

### Admin APIs (Authentication Required)

```
# Blog Management
GET    /api/admin/blog         - Get all blog posts
POST   /api/admin/blog         - Create blog post
PUT    /api/admin/blog         - Update blog post
DELETE /api/admin/blog?id=xxx  - Delete blog post

# Testimonial Management  
GET    /api/admin/testimonials - Get all testimonials
POST   /api/admin/testimonials - Create testimonial
PUT    /api/admin/testimonials - Update testimonial
DELETE /api/admin/testimonials?id=xxx - Delete testimonial

# Contact Management
GET    /api/admin/contact      - Get contact messages
PUT    /api/admin/contact      - Update message status
DELETE /api/admin/contact?id=xxx - Delete message

# System Management
GET    /api/admin/health       - Database health check
GET    /api/admin/backup       - Get backups list
POST   /api/admin/backup       - Create/restore backup
```

## Database Setup

### 1. Initialize Database

```bash
npm run init-db
```

This creates required collections and indexes.

### 2. Seed Sample Data

```bash
npm run seed-db
```

This populates the database with:
- 3 sample testimonials
- 2 sample blog posts
- 4 content categories
- 4 sample FAQs
- 3 service offerings
- Website settings

### 3. Verify Setup

```bash
npm run check-db
```

## Data Models

### Blog Post Schema

```typescript
interface BlogPost {
  id: string;
  title: string;
  slug: string;           // URL-friendly version of title
  excerpt: string;        // Short description
  content: string;        // Full markdown content
  author: string;         // Admin email
  category: string;       // Content category
  tags: string[];         // Tags for organization
  coverImage?: string;    // Optional cover image
  isPublished: boolean;   // Publication status
  publishedAt: Date;      // Publication date
  readTime: number;       // Estimated read time (minutes)
  views: number;          // View count
  metaTitle?: string;     // SEO meta title
  metaDescription?: string; // SEO meta description
  createdAt: Date;
  updatedAt: Date;
}
```

### Testimonial Schema

```typescript
interface Testimonial {
  id: string;
  name: string;           // Client name
  position: string;       // Job title
  company: string;        // Company name
  content: string;        // Testimonial text
  rating: number;         // 1-5 star rating
  image?: string;         // Optional client photo
  isPublished: boolean;   // Visibility status
  createdAt: Date;
  updatedAt: Date;
}
```

### Contact Message Schema

```typescript
interface ContactMessage {
  id: string;
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  status: 'new' | 'read' | 'responded' | 'archived';
  source: 'contact-form' | 'email' | 'phone' | 'other';
  adminNotes?: string;    // Private admin notes
  createdAt: Date;
  updatedAt: Date;
}
```

### Service Schema

```typescript
interface Service {
  id: string;
  name: string;
  slug: string;           // URL-friendly name
  description: string;    // Full description
  shortDescription: string; // Brief summary
  icon: string;           // Icon identifier
  price?: {
    type: 'fixed' | 'hourly' | 'project';
    amount: number;
    currency: string;
  };
  features: string[];     // Service features list
  isActive: boolean;      // Availability status
  order: number;          // Display order
  createdAt: Date;
  updatedAt: Date;
}
```

## Content Management

### Blog Management

1. **Create Post**: Use admin panel or API to create new blog posts
2. **Draft/Publish**: Posts can be saved as drafts or published immediately  
3. **SEO Optimization**: Automatic meta title/description generation
4. **Read Time**: Automatic calculation based on word count
5. **View Tracking**: Automatic view count increment on read

### Testimonial Management

1. **Add Testimonials**: Collect client feedback and add to database
2. **Rating System**: 1-5 star rating system
3. **Publish Control**: Show/hide testimonials on website
4. **Media Support**: Optional client photos via Cloudinary

### Contact Management

1. **Form Submissions**: Automatic collection from contact form
2. **Status Tracking**: New → Read → Responded → Archived
3. **Admin Notes**: Private notes for follow-up
4. **Email Integration**: Ready for email notification setup

## Security Features

### Authentication
- Clerk-based authentication for admin access
- Email-based authorization for admin operations
- JWT token validation for API requests

### Data Protection
- Input sanitization and validation
- SQL injection prevention (NoSQL)
- Rate limiting on contact forms
- Admin audit logging

### Backup System
- Automatic backups before data changes
- Manual backup creation
- Point-in-time recovery
- Export functionality

## Performance Optimization

### Database Indexes
- Optimized queries with proper indexing
- Full-text search capabilities
- Pagination support for large datasets

### Caching Strategy
- Memory caching for frequently accessed data
- CDN integration for media files
- API response caching

## Deployment Considerations

### Environment Variables
```env
# Database
DATABASE_PROVIDER=mongodb
MONGODB_URL=your_mongodb_connection_string

# Admin Access
AUTHORIZED_ADMIN_EMAILS=admin@example.com
ADMIN_PASSWORD=your_admin_password

# Optional: Cloud Storage
JSONBIN_API_KEY=backup_service_key
JSONBIN_BIN_ID=backup_service_id
```

### Production Setup

1. **Database Connection**: Ensure MongoDB Atlas is configured
2. **Environment Variables**: Set all required variables in Vercel
3. **Initialize Database**: Run `npm run init-db` after deployment
4. **Seed Data**: Optionally run `npm run seed-db` for sample content
5. **Health Check**: Monitor `/api/admin/health` endpoint

## Usage Examples

### Fetch Blog Posts (Public)

```javascript
// Get latest blog posts
const response = await fetch('/api/blog?limit=5');
const { posts, pagination } = await response.json();

// Get posts by category
const response = await fetch('/api/blog?category=web-development');
```

### Submit Contact Form

```javascript
const response = await fetch('/api/contact', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: 'John Doe',
    email: 'john@example.com',
    subject: 'Project Inquiry',
    message: 'I would like to discuss a project...'
  })
});
```

### Admin Operations

```javascript
// Create blog post (Admin only)
const response = await fetch('/api/admin/blog', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    title: 'My New Post',
    content: 'Post content...',
    excerpt: 'Short description',
    category: 'Web Development',
    tags: ['Next.js', 'React'],
    isPublished: true
  })
});
```

## Monitoring and Maintenance

### Health Monitoring
- Database connectivity checks
- Performance metrics tracking
- Error rate monitoring
- Backup verification

### Regular Tasks
- Weekly backup verification
- Monthly performance reviews
- Quarterly security audits
- Content moderation

## Future Enhancements

### Planned Features
- Newsletter subscription system
- Advanced analytics dashboard
- Content scheduling
- Media library management
- Multi-language support
- Advanced search functionality

### Scalability Considerations
- Database sharding for large datasets
- Read replicas for performance
- Content delivery optimization
- API rate limiting enhancements

## Support

For issues or questions:
1. Check the admin health dashboard
2. Review application logs
3. Verify environment variables
4. Test database connectivity
5. Contact system administrator

## Version History

- **v1.0.0** - Initial database system setup
- **v1.1.0** - Blog and testimonial management
- **v1.2.0** - Contact and service management
- **v1.3.0** - Admin interface integration
- **v1.4.0** - Backup and security features