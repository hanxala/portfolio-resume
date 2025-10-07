import { MongoClient, Db, Collection, ObjectId, Document } from 'mongodb';
import { 
  BlogPost, 
  Testimonial, 
  Service, 
  ContactMessage, 
  FAQ, 
  WebsiteSettings, 
  NewsletterSubscriber, 
  Experience, 
  MediaItem,
  ContentCategory,
  SiteNotification,
  COLLECTIONS,
  DATABASE_INDEXES 
} from './website-schemas';

export class ContentManager {
  private client: MongoClient | null = null;
  private db: Db | null = null;
  private isConnected = false;

  constructor() {
    if (typeof window !== 'undefined') return; // Don't initialize on client side
  }

  private async connect(): Promise<void> {
    if (this.isConnected && this.client && this.db) return;

    try {
      const url = process.env.MONGODB_URL;
      if (!url) {
        throw new Error('MongoDB URL not provided');
      }

      this.client = new MongoClient(url);
      await this.client.connect();
      this.db = this.client.db('portfolio_data');
      this.isConnected = true;

      // Ensure indexes exist
      await this.createIndexes();
      
      console.log('✅ Content Manager connected to MongoDB');
    } catch (error) {
      console.error('❌ Content Manager connection failed:', error);
      this.isConnected = false;
      throw error;
    }
  }

  private async createIndexes(): Promise<void> {
    if (!this.db) return;

    try {
      // TODO: Fix index creation type issues
      console.log('⏭️ Skipping index creation temporarily');
      // for (const [collectionName, indexes] of Object.entries(DATABASE_INDEXES)) {
      //   const collection = this.db.collection(collectionName);
      //   for (const index of indexes) {
      //     await collection.createIndex(index.fields, index.options || {});
      //   }
      // }
      // console.log('✅ Database indexes created successfully');
    } catch (error) {
      console.warn('⚠️ Error creating indexes:', error);
    }
  }

  private async getCollection<T>(collectionName: string): Promise<Collection<T & Document>> {
    await this.connect();
    if (!this.db) {
      throw new Error('Database not connected');
    }
    return this.db.collection<T & Document>(collectionName);
  }

  // Generic CRUD operations
  async create<T>(collectionName: string, data: Omit<T, 'id' | 'createdAt' | 'updatedAt'>): Promise<T> {
    const collection = await this.getCollection<T>(collectionName);
    const id = new ObjectId().toString();
    const document = { ...data, id, createdAt: new Date(), updatedAt: new Date() } as T;
    
    await collection.insertOne(document as any);
    return document;
  }

  async findById<T>(collectionName: string, id: string): Promise<T | null> {
    const collection = await this.getCollection<T>(collectionName);
    const document = await collection.findOne({ id } as any);
    return document as T | null;
  }

  async findAll<T>(collectionName: string, filter: any = {}, options: any = {}): Promise<T[]> {
    const collection = await this.getCollection<T>(collectionName);
    const cursor = collection.find(filter, options);
    const documents = await cursor.toArray();
    return documents as T[];
  }

  async update<T>(collectionName: string, id: string, data: Partial<T>): Promise<T | null> {
    const collection = await this.getCollection<T>(collectionName);
    const updateData = { ...data, updatedAt: new Date() };
    
    await collection.updateOne(
      { id } as any,
      { $set: updateData }
    );
    
    return this.findById<T>(collectionName, id);
  }

  async delete(collectionName: string, id: string): Promise<boolean> {
    const collection = await this.getCollection(collectionName);
    const result = await collection.deleteOne({ id } as any);
    return result.deletedCount === 1;
  }

  async count(collectionName: string, filter: any = {}): Promise<number> {
    const collection = await this.getCollection(collectionName);
    return collection.countDocuments(filter);
  }

  // Blog Posts specific methods
  async getBlogPosts(options: {
    published?: boolean;
    category?: string;
    tag?: string;
    limit?: number;
    skip?: number;
  } = {}): Promise<{ posts: BlogPost[], total: number }> {
    const filter: any = {};
    if (options.published !== undefined) {
      filter.isPublished = options.published;
    }
    if (options.category) {
      filter.category = options.category;
    }
    if (options.tag) {
      filter.tags = options.tag;
    }

    const posts = await this.findAll<BlogPost>(
      COLLECTIONS.BLOG_POSTS,
      filter,
      {
        sort: { publishedAt: -1 },
        limit: options.limit,
        skip: options.skip
      }
    );

    const total = await this.count(COLLECTIONS.BLOG_POSTS, filter);
    return { posts, total };
  }

  async getBlogPostBySlug(slug: string): Promise<BlogPost | null> {
    const collection = await this.getCollection<BlogPost>(COLLECTIONS.BLOG_POSTS);
    const post = await collection.findOne({ slug } as any);
    
    if (post) {
      // Increment view count
      await collection.updateOne(
        { slug } as any,
        { $inc: { views: 1 } }
      );
    }
    
    return post as BlogPost | null;
  }

  // Testimonials specific methods
  async getPublishedTestimonials(): Promise<Testimonial[]> {
    return this.findAll<Testimonial>(
      COLLECTIONS.TESTIMONIALS,
      { isPublished: true },
      { sort: { createdAt: -1 } }
    );
  }

  // Services specific methods
  async getActiveServices(): Promise<Service[]> {
    return this.findAll<Service>(
      COLLECTIONS.SERVICES,
      { isActive: true },
      { sort: { order: 1 } }
    );
  }

  async getServiceBySlug(slug: string): Promise<Service | null> {
    const collection = await this.getCollection<Service>(COLLECTIONS.SERVICES);
    return collection.findOne({ slug, isActive: true } as any) as Promise<Service | null>;
  }

  // Contact Messages specific methods
  async createContactMessage(data: Omit<ContactMessage, 'id' | 'createdAt' | 'updatedAt' | 'status'>): Promise<ContactMessage> {
    const messageData = {
      ...data,
      status: 'new' as const,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    return this.create<ContactMessage>(COLLECTIONS.CONTACT_MESSAGES, messageData);
  }

  async getContactMessages(status?: ContactMessage['status']): Promise<ContactMessage[]> {
    const filter = status ? { status } : {};
    return this.findAll<ContactMessage>(
      COLLECTIONS.CONTACT_MESSAGES,
      filter,
      { sort: { createdAt: -1 } }
    );
  }

  async updateContactMessageStatus(id: string, status: ContactMessage['status'], adminNotes?: string): Promise<ContactMessage | null> {
    const updateData: Partial<ContactMessage> = { status };
    if (adminNotes) {
      updateData.adminNotes = adminNotes;
    }
    return this.update<ContactMessage>(COLLECTIONS.CONTACT_MESSAGES, id, updateData);
  }

  // FAQ specific methods
  async getPublishedFAQs(): Promise<FAQ[]> {
    return this.findAll<FAQ>(
      COLLECTIONS.FAQ,
      { isPublished: true },
      { sort: { order: 1 } }
    );
  }

  async getFAQsByCategory(category: string): Promise<FAQ[]> {
    return this.findAll<FAQ>(
      COLLECTIONS.FAQ,
      { category, isPublished: true },
      { sort: { order: 1 } }
    );
  }

  // Website Settings specific methods
  async getWebsiteSettings(): Promise<WebsiteSettings | null> {
    const settings = await this.findAll<WebsiteSettings>(COLLECTIONS.WEBSITE_SETTINGS, {}, { limit: 1 });
    return settings[0] || null;
  }

  async updateWebsiteSettings(data: Partial<WebsiteSettings>): Promise<WebsiteSettings> {
    const existing = await this.getWebsiteSettings();
    
    if (existing) {
      const updated = await this.update<WebsiteSettings>(COLLECTIONS.WEBSITE_SETTINGS, existing.id, data);
      return updated!;
    } else {
      // Create new settings
      const newSettings = {
        ...data,
        id: new ObjectId().toString(),
        updatedAt: new Date()
      } as WebsiteSettings;
      
      const collection = await this.getCollection<WebsiteSettings>(COLLECTIONS.WEBSITE_SETTINGS);
      await collection.insertOne(newSettings as any);
      return newSettings;
    }
  }

  // Newsletter specific methods
  async subscribeToNewsletter(email: string, name?: string, source: string = 'website'): Promise<NewsletterSubscriber> {
    // Check if already subscribed
    const existing = await this.findAll<NewsletterSubscriber>(
      COLLECTIONS.NEWSLETTER_SUBSCRIBERS,
      { email }
    );

    if (existing.length > 0) {
      const subscriber = existing[0];
      if (subscriber.isActive) {
        throw new Error('Email already subscribed');
      } else {
        // Reactivate subscription
        return this.update<NewsletterSubscriber>(COLLECTIONS.NEWSLETTER_SUBSCRIBERS, subscriber.id, {
          isActive: true,
          subscribedAt: new Date(),
          unsubscribedAt: undefined
        }) as Promise<NewsletterSubscriber>;
      }
    }

    return this.create<NewsletterSubscriber>(COLLECTIONS.NEWSLETTER_SUBSCRIBERS, {
      email,
      name,
      source,
      isActive: true,
      subscribedAt: new Date(),
      tags: []
    });
  }

  async unsubscribeFromNewsletter(email: string): Promise<boolean> {
    const collection = await this.getCollection<NewsletterSubscriber>(COLLECTIONS.NEWSLETTER_SUBSCRIBERS);
    const result = await collection.updateOne(
      { email, isActive: true } as any,
      {
        $set: {
          isActive: false,
          unsubscribedAt: new Date()
        }
      }
    );
    return result.modifiedCount === 1;
  }

  // Experience specific methods
  async getPublishedExperience(): Promise<Experience[]> {
    return this.findAll<Experience>(
      COLLECTIONS.EXPERIENCE,
      { isPublished: true },
      { sort: { order: 1, startDate: -1 } }
    );
  }

  // Categories specific methods
  async getActiveCategories(): Promise<ContentCategory[]> {
    return this.findAll<ContentCategory>(
      COLLECTIONS.CATEGORIES,
      { isActive: true },
      { sort: { order: 1 } }
    );
  }

  // Notifications specific methods
  async createNotification(data: Omit<SiteNotification, 'id' | 'createdAt'>): Promise<SiteNotification> {
    return this.create<SiteNotification>(COLLECTIONS.NOTIFICATIONS, {
      ...data,
      createdAt: new Date()
    });
  }

  async getUnreadNotifications(): Promise<SiteNotification[]> {
    return this.findAll<SiteNotification>(
      COLLECTIONS.NOTIFICATIONS,
      { isRead: false },
      { sort: { createdAt: -1 } }
    );
  }

  async markNotificationAsRead(id: string): Promise<boolean> {
    const updated = await this.update<SiteNotification>(COLLECTIONS.NOTIFICATIONS, id, { isRead: true });
    return updated !== null;
  }

  // Cleanup and close connection
  async close(): Promise<void> {
    if (this.client) {
      await this.client.close();
      this.client = null;
      this.db = null;
      this.isConnected = false;
    }
  }
}

// Export singleton instance
let contentManagerInstance: ContentManager | null = null;

export function getContentManager(): ContentManager {
  if (!contentManagerInstance) {
    contentManagerInstance = new ContentManager();
  }
  return contentManagerInstance;
}