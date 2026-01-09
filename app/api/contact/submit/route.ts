import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/lib/logger';
import { reviewRateLimiter } from '@/lib/rate-limit';
import { contactFormSchema, validateRequest } from '@/lib/validations';

// POST - Submit contact form
export async function POST(request: NextRequest) {
  try {
    // Rate limiting (using reviewRateLimiter as it's similar - user submissions)
    const rateLimitResult = await reviewRateLimiter(request);
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: rateLimitResult.message },
        { 
          status: 429,
          headers: {
            'Retry-After': String(Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000)),
            'X-RateLimit-Limit': '5',
            'X-RateLimit-Remaining': String(rateLimitResult.remaining),
            'X-RateLimit-Reset': new Date(rateLimitResult.resetTime).toISOString(),
          },
        }
      );
    }

    const body = await request.json();

    // Validate request body using Zod schema
    const validation = validateRequest(contactFormSchema, body);
    if (!validation.success) {
      return NextResponse.json(
        { 
          error: 'Validation failed',
          details: validation.error
        },
        { status: 400 }
      );
    }

    const { name, email, message } = validation.data;

    // TODO: Integrate with email service (SendGrid, Resend, etc.)
    // For now, just log the submission
    logger.log('Contact form submission:', {
      name,
      email,
      messageLength: message.length,
      timestamp: new Date().toISOString(),
    });

    // Simulate email sending
    // In production, you would:
    // 1. Send email using SendGrid/Resend
    // 2. Save to database
    // 3. Send notification to admin

    return NextResponse.json({
      success: true,
      message: 'Message sent successfully',
    });
  } catch (error: any) {
    logger.error('Error processing contact form:', error);
    return NextResponse.json(
      { error: 'Failed to send message. Please try again later.' },
      { status: 500 }
    );
  }
}

