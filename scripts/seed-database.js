/*
  Script: scripts/seed-database.js
  Purpose: Populate database with initial website content
  Usage: node scripts/seed-database.js
*/

require('dotenv').config({ path: '.env.local' });
const { MongoClient, ObjectId } = require('mongodb');

const url = process.env.MONGODB_URL;

if (!url) {
  console.error('MONGODB_URL is not set in environment');
  process.exit(1);
}

// Sample data for seeding
const sampleData = {
  testimonials: [
    {
      id: new ObjectId().toString(),
      name: 'Sarah Johnson',
      position: 'Product Manager',
      company: 'TechStart Inc.',
      content: 'Hanzala delivered an exceptional e-commerce platform that exceeded our expectations. His attention to detail and technical expertise made the entire process smooth and efficient.',
      rating: 5,
      isPublished: true,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: new ObjectId().toString(),
      name: 'Michael Chen',
      position: 'CEO',
      company: 'Digital Solutions',
      content: 'Working with Hanzala was a great experience. He understood our requirements perfectly and delivered a high-quality solution on time.',
      rating: 5,
      isPublished: true,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: new ObjectId().toString(),
      name: 'Emily Davis',
      position: 'Marketing Director',
      company: 'Creative Agency',
      content: 'The portfolio website Hanzala created for us is both beautiful and functional. It has significantly improved our online presence.',
      rating: 5,
      isPublished: true,
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ],

  blogPosts: [
    {
      id: new ObjectId().toString(),
      title: 'Getting Started with Next.js and TypeScript',
      slug: 'getting-started-nextjs-typescript',
      excerpt: 'Learn how to set up a Next.js project with TypeScript and build your first full-stack application.',
      content: `# Getting Started with Next.js and TypeScript

Next.js has become one of the most popular React frameworks, and when combined with TypeScript, it provides an excellent developer experience with strong typing and modern features.

## Why Next.js?

Next.js offers several advantages:
- **Server-Side Rendering (SSR)**: Improved performance and SEO
- **Static Site Generation (SSG)**: Fast loading times
- **API Routes**: Full-stack capabilities
- **Automatic Code Splitting**: Optimized bundle sizes

## Setting Up Your Project

\`\`\`bash
npx create-next-app@latest my-app --typescript
cd my-app
npm run dev
\`\`\`

## TypeScript Benefits

TypeScript adds static typing to JavaScript, which helps:
- Catch errors at compile time
- Provide better IDE support
- Improve code maintainability
- Enable better refactoring

## Conclusion

Next.js with TypeScript is a powerful combination for modern web development. Start your next project with this stack and experience the benefits firsthand.`,
      author: 'hanzalakhan0913@gmail.com',
      category: 'Web Development',
      tags: ['Next.js', 'TypeScript', 'React', 'Tutorial'],
      isPublished: true,
      publishedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
      readTime: 5,
      views: 0,
      createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    },
    {
      id: new ObjectId().toString(),
      title: 'Building Modern UIs with Tailwind CSS',
      slug: 'building-modern-uis-tailwind-css',
      excerpt: 'Discover how Tailwind CSS can speed up your frontend development and create beautiful, responsive designs.',
      content: `# Building Modern UIs with Tailwind CSS

Tailwind CSS is a utility-first CSS framework that provides low-level utility classes to build custom designs without writing custom CSS.

## What Makes Tailwind Special?

- **Utility-First**: Build complex components from simple utilities
- **Responsive Design**: Mobile-first responsive utilities
- **Customizable**: Extensive configuration options
- **Performance**: Automatic unused CSS removal

## Getting Started

\`\`\`bash
npm install tailwindcss
npx tailwindcss init
\`\`\`

## Example Component

\`\`\`html
<div class="bg-white rounded-lg shadow-lg p-6">
  <h2 class="text-2xl font-bold text-gray-800 mb-4">Card Title</h2>
  <p class="text-gray-600 leading-relaxed">Card content goes here...</p>
</div>
\`\`\`

## Best Practices

1. Use component extraction for repeated patterns
2. Leverage Tailwind's design system
3. Customize your theme to match your brand
4. Use responsive utilities for mobile-first design

Tailwind CSS makes it easy to build consistent, maintainable UIs quickly.`,
      author: 'hanzalakhan0913@gmail.com',
      category: 'CSS',
      tags: ['Tailwind CSS', 'CSS', 'UI', 'Frontend'],
      isPublished: true,
      publishedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
      readTime: 4,
      views: 0,
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
    }
  ],

  categories: [
    {
      id: new ObjectId().toString(),
      name: 'Web Development',
      slug: 'web-development',
      description: 'Articles about modern web development technologies and practices',
      color: '#3B82F6',
      isActive: true,
      order: 1,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: new ObjectId().toString(),
      name: 'CSS',
      slug: 'css',
      description: 'Styling and design-related articles',
      color: '#8B5CF6',
      isActive: true,
      order: 2,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: new ObjectId().toString(),
      name: 'JavaScript',
      slug: 'javascript',
      description: 'JavaScript tutorials and best practices',
      color: '#F59E0B',
      isActive: true,
      order: 3,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: new ObjectId().toString(),
      name: 'Mobile Development',
      slug: 'mobile-development',
      description: 'Mobile app development with React Native and Flutter',
      color: '#10B981',
      isActive: true,
      order: 4,
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ],

  faqs: [
    {
      id: new ObjectId().toString(),
      question: 'How long does it take to complete a typical project?',
      answer: 'Project timelines vary based on complexity and requirements. A simple portfolio website might take 1-2 weeks, while a full e-commerce platform could take 6-8 weeks. I provide detailed estimates after understanding your specific needs.',
      category: 'General',
      isPublished: true,
      order: 1,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: new ObjectId().toString(),
      question: 'Do you provide ongoing maintenance and support?',
      answer: 'Yes, I offer ongoing maintenance packages that include bug fixes, security updates, content updates, and feature enhancements. We can discuss the best maintenance plan for your project.',
      category: 'Services',
      isPublished: true,
      order: 2,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: new ObjectId().toString(),
      question: 'What technologies do you work with?',
      answer: 'I specialize in modern web technologies including Next.js, React, TypeScript, Node.js, MongoDB, and mobile development with React Native and Kotlin. I stay updated with the latest industry trends and best practices.',
      category: 'Technical',
      isPublished: true,
      order: 3,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: new ObjectId().toString(),
      question: 'Can you help with mobile app development?',
      answer: 'Absolutely! I develop mobile applications using React Native for cross-platform solutions and native Android development with Kotlin. I can help bring your mobile app idea to life.',
      category: 'Mobile',
      isPublished: true,
      order: 4,
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ],

  services: [
    {
      id: new ObjectId().toString(),
      name: 'Web Development',
      slug: 'web-development',
      description: 'Custom websites and web applications built with modern technologies like Next.js, React, and Node.js.',
      shortDescription: 'Modern, responsive websites and web applications',
      icon: 'code',
      price: {
        type: 'project',
        amount: 500,
        currency: 'USD'
      },
      features: [
        'Responsive Design',
        'SEO Optimization',
        'Performance Optimization',
        'Cross-browser Compatibility',
        'Content Management System'
      ],
      isActive: true,
      order: 1,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: new ObjectId().toString(),
      name: 'E-Commerce Development',
      slug: 'ecommerce-development',
      description: 'Complete e-commerce solutions with payment integration, inventory management, and admin dashboards.',
      shortDescription: 'Full-featured online stores and marketplaces',
      icon: 'shopping-cart',
      price: {
        type: 'project',
        amount: 1200,
        currency: 'USD'
      },
      features: [
        'Payment Gateway Integration',
        'Inventory Management',
        'Order Management',
        'Customer Dashboard',
        'Admin Panel',
        'Mobile Responsive'
      ],
      isActive: true,
      order: 2,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: new ObjectId().toString(),
      name: 'Mobile App Development',
      slug: 'mobile-app-development',
      description: 'Native and cross-platform mobile applications for iOS and Android using React Native and Kotlin.',
      shortDescription: 'Cross-platform and native mobile applications',
      icon: 'smartphone',
      price: {
        type: 'project',
        amount: 800,
        currency: 'USD'
      },
      features: [
        'Cross-platform Development',
        'Native Performance',
        'App Store Deployment',
        'Push Notifications',
        'Offline Functionality'
      ],
      isActive: true,
      order: 3,
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ],

  websiteSettings: {
    id: new ObjectId().toString(),
    siteName: 'Hanzala Khan - Portfolio',
    siteDescription: 'Software Developer & Android App Developer specializing in modern web and mobile applications',
    siteUrl: process.env.NEXT_PUBLIC_SITE_URL || 'https://hanzalakhan.dev',
    socialLinks: {
      github: 'https://github.com/hanzalakhan0913',
      linkedin: 'https://linkedin.com/in/hanzala-khan',
    },
    seo: {
      metaTitle: 'Hanzala Khan - Software Developer & Mobile App Developer',
      metaDescription: 'Experienced software developer specializing in Next.js, React, Node.js, and mobile app development. Available for freelance projects and collaborations.',
      keywords: ['Software Developer', 'Web Developer', 'Mobile App Developer', 'Next.js', 'React', 'Node.js', 'Kotlin', 'MongoDB']
    },
    contact: {
      email: 'hanzalakhan0913@gmail.com',
      phone: '+91 8779603467',
      address: 'Mumbai, Maharashtra - India'
    },
    features: {
      blog: true,
      testimonials: true,
      services: true,
      newsletter: false
    },
    analytics: {},
    updatedAt: new Date()
  }
};

async function seedDatabase() {
  const client = new MongoClient(url);
  
  try {
    await client.connect();
    console.log('✅ Connected to MongoDB');

    const db = client.db('portfolio_data');

    // Seed testimonials
    console.log('📝 Seeding testimonials...');
    const testimonialsCollection = db.collection('testimonials');
    await testimonialsCollection.deleteMany({}); // Clear existing
    await testimonialsCollection.insertMany(sampleData.testimonials);
    console.log(`✅ Inserted ${sampleData.testimonials.length} testimonials`);

    // Seed blog posts
    console.log('📝 Seeding blog posts...');
    const blogCollection = db.collection('blog_posts');
    await blogCollection.deleteMany({}); // Clear existing
    await blogCollection.insertMany(sampleData.blogPosts);
    console.log(`✅ Inserted ${sampleData.blogPosts.length} blog posts`);

    // Seed categories
    console.log('📝 Seeding categories...');
    const categoriesCollection = db.collection('content_categories');
    await categoriesCollection.deleteMany({}); // Clear existing
    await categoriesCollection.insertMany(sampleData.categories);
    console.log(`✅ Inserted ${sampleData.categories.length} categories`);

    // Seed FAQs
    console.log('📝 Seeding FAQs...');
    const faqCollection = db.collection('faq');
    await faqCollection.deleteMany({}); // Clear existing
    await faqCollection.insertMany(sampleData.faqs);
    console.log(`✅ Inserted ${sampleData.faqs.length} FAQs`);

    // Seed services
    console.log('📝 Seeding services...');
    const servicesCollection = db.collection('services');
    await servicesCollection.deleteMany({}); // Clear existing
    await servicesCollection.insertMany(sampleData.services);
    console.log(`✅ Inserted ${sampleData.services.length} services`);

    // Seed website settings
    console.log('📝 Seeding website settings...');
    const settingsCollection = db.collection('website_settings');
    await settingsCollection.deleteMany({}); // Clear existing
    await settingsCollection.insertOne(sampleData.websiteSettings);
    console.log('✅ Inserted website settings');

    console.log('🎉 Database seeding completed successfully!');
    
  } catch (error) {
    console.error('❌ Database seeding failed:', error);
    process.exit(1);
  } finally {
    await client.close();
  }
}

seedDatabase();