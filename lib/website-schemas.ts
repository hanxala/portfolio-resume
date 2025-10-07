// Website Content Database Schemas
// This file defines all the data structures for website content

// Blog/Articles Schema
export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  author: string;
  coverImage?: string;
  tags: string[];
  category: string;
  publishedAt: Date;
  updatedAt: Date;
  isPublished: boolean;
  readTime: number; // in minutes
  metaTitle?: string;
  metaDescription?: string;
  views: number;
}

// Testimonials/Reviews Schema
export interface Testimonial {
  id: string;
  name: string;
  position: string;
  company: string;
  image?: string;
  content: string;
  rating: number; // 1-5 stars
  isPublished: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Services Schema
export interface Service {
  id: string;
  name: string;
  slug: string;
  description: string;
  shortDescription: string;
  icon: string;
  image?: string;
  price?: {
    type: 'fixed' | 'hourly' | 'project';
    amount: number;
    currency: string;
  };
  features: string[];
  isActive: boolean;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

// Contact Messages Schema
export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  status: 'new' | 'read' | 'responded' | 'archived';
  source: 'contact-form' | 'email' | 'phone' | 'other';
  createdAt: Date;
  updatedAt: Date;
  adminNotes?: string;
}

// FAQ Schema
export interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: string;
  isPublished: boolean;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

// Website Settings Schema
export interface WebsiteSettings {
  id: string;
  siteName: string;
  siteDescription: string;
  siteUrl: string;
  logo?: string;
  favicon?: string;
  socialLinks: {
    github?: string;
    linkedin?: string;
    twitter?: string;
    facebook?: string;
    instagram?: string;
  };
  seo: {
    metaTitle: string;
    metaDescription: string;
    keywords: string[];
    ogImage?: string;
  };
  contact: {
    email: string;
    phone?: string;
    address?: string;
    workingHours?: string;
  };
  features: {
    blog: boolean;
    testimonials: boolean;
    services: boolean;
    newsletter: boolean;
  };
  analytics: {
    googleAnalyticsId?: string;
    googleTagManagerId?: string;
  };
  updatedAt: Date;
}

// Newsletter Subscribers Schema
export interface NewsletterSubscriber {
  id: string;
  email: string;
  name?: string;
  isActive: boolean;
  subscribedAt: Date;
  unsubscribedAt?: Date;
  source: string;
  tags: string[];
}

// Experience/Work History Schema
export interface Experience {
  id: string;
  company: string;
  position: string;
  location: string;
  startDate: Date;
  endDate?: Date;
  isCurrent: boolean;
  description: string;
  responsibilities: string[];
  technologies: string[];
  achievements: string[];
  companyLogo?: string;
  companyWebsite?: string;
  isPublished: boolean;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

// Media/Gallery Schema
export interface MediaItem {
  id: string;
  title: string;
  description?: string;
  url: string;
  type: 'image' | 'video' | 'document';
  mimeType: string;
  size: number;
  category: string;
  tags: string[];
  uploadedBy: string;
  createdAt: Date;
  updatedAt: Date;
}

// Analytics/Statistics Schema
export interface SiteAnalytics {
  id: string;
  date: Date;
  pageViews: number;
  uniqueVisitors: number;
  sessions: number;
  bounceRate: number;
  averageSessionDuration: number;
  topPages: Array<{
    path: string;
    views: number;
  }>;
  referrers: Array<{
    source: string;
    visits: number;
  }>;
  devices: {
    desktop: number;
    mobile: number;
    tablet: number;
  };
  browsers: Array<{
    name: string;
    count: number;
  }>;
}

// Content Categories Schema
export interface ContentCategory {
  id: string;
  name: string;
  slug: string;
  description?: string;
  color?: string;
  icon?: string;
  parentId?: string;
  isActive: boolean;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

// Site Notifications Schema (for admin alerts)
export interface SiteNotification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'error' | 'success';
  isRead: boolean;
  actionUrl?: string;
  createdAt: Date;
  expiresAt?: Date;
}

// Database Collection Names
export const COLLECTIONS = {
  PORTFOLIO: 'portfolio',
  BLOG_POSTS: 'blog_posts',
  TESTIMONIALS: 'testimonials',
  SERVICES: 'services',
  CONTACT_MESSAGES: 'contact_messages',
  FAQ: 'faq',
  WEBSITE_SETTINGS: 'website_settings',
  NEWSLETTER_SUBSCRIBERS: 'newsletter_subscribers',
  EXPERIENCE: 'experience',
  MEDIA: 'media',
  ANALYTICS: 'site_analytics',
  CATEGORIES: 'content_categories',
  NOTIFICATIONS: 'site_notifications',
  BACKUPS: 'backups',
  AUDIT_LOG: 'audit_log'
} as const;

// Database Indexes Configuration
export const DATABASE_INDEXES = {
  [COLLECTIONS.BLOG_POSTS]: [
    { fields: { slug: 1 }, options: { unique: true } },
    { fields: { isPublished: 1, publishedAt: -1 } },
    { fields: { category: 1 } },
    { fields: { tags: 1 } }
  ],
  [COLLECTIONS.TESTIMONIALS]: [
    { fields: { isPublished: 1, createdAt: -1 } }
  ],
  [COLLECTIONS.SERVICES]: [
    { fields: { slug: 1 }, options: { unique: true } },
    { fields: { isActive: 1, order: 1 } }
  ],
  [COLLECTIONS.CONTACT_MESSAGES]: [
    { fields: { status: 1, createdAt: -1 } },
    { fields: { email: 1 } }
  ],
  [COLLECTIONS.FAQ]: [
    { fields: { isPublished: 1, order: 1 } },
    { fields: { category: 1 } }
  ],
  [COLLECTIONS.NEWSLETTER_SUBSCRIBERS]: [
    { fields: { email: 1 }, options: { unique: true } },
    { fields: { isActive: 1 } }
  ],
  [COLLECTIONS.EXPERIENCE]: [
    { fields: { isPublished: 1, order: 1 } },
    { fields: { isCurrent: 1, startDate: -1 } }
  ],
  [COLLECTIONS.MEDIA]: [
    { fields: { type: 1, category: 1 } },
    { fields: { uploadedBy: 1, createdAt: -1 } }
  ],
  [COLLECTIONS.ANALYTICS]: [
    { fields: { date: -1 } }
  ],
  [COLLECTIONS.CATEGORIES]: [
    { fields: { slug: 1 }, options: { unique: true } },
    { fields: { isActive: 1, order: 1 } }
  ]
};