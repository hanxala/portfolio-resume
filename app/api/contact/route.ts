import { NextRequest, NextResponse } from 'next/server';
import { getContentManager } from '@/lib/content-manager';

// POST /api/contact - Submit contact form (public)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, phone, subject, message } = body;

    // Basic validation
    if (!name || !email || !subject || !message) {
      return NextResponse.json(
        { error: 'Name, email, subject, and message are required' },
        { status: 400 }
      );
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Please provide a valid email address' },
        { status: 400 }
      );
    }

    const contentManager = getContentManager();
    const contactMessage = await contentManager.createContactMessage({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: phone?.trim() || undefined,
      subject: subject.trim(),
      message: message.trim(),
      source: 'contact-form'
    });

    // You could also send email notification here
    // await sendEmailNotification(contactMessage);

    return NextResponse.json({
      success: true,
      message: 'Thank you for your message! I\'ll get back to you soon.',
      id: contactMessage.id
    });

  } catch (error) {
    console.error('Contact form error:', error);
    return NextResponse.json(
      { error: 'Failed to send message. Please try again later.' },
      { status: 500 }
    );
  }
}