/**
 * Rate limiting utility for API routes
 * Simple in-memory rate limiter (for production, use Redis or Vercel Edge Config)
 */

interface RateLimitStore {
  [key: string]: {
    count: number;
    resetTime: number;
  };
}

const store: RateLimitStore = {};

// Clean up old entries every 5 minutes
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now();
    Object.keys(store).forEach((key) => {
      if (store[key].resetTime < now) {
        delete store[key];
      }
    });
  }, 5 * 60 * 1000);
}

export interface RateLimitOptions {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Maximum requests per window
  message?: string; // Custom error message
}

export interface RateLimitResult {
  success: boolean;
  remaining: number;
  resetTime: number;
  message?: string;
}

/**
 * Rate limit check
 * @param identifier - Unique identifier (IP address, user ID, etc.)
 * @param options - Rate limit options
 * @returns Rate limit result
 */
export function rateLimit(
  identifier: string,
  options: RateLimitOptions
): RateLimitResult {
  const { windowMs, maxRequests, message } = options;
  const now = Date.now();
  const key = identifier;

  // Get or create rate limit entry
  let entry = store[key];

  if (!entry || entry.resetTime < now) {
    // Create new entry or reset expired entry
    entry = {
      count: 0,
      resetTime: now + windowMs,
    };
    store[key] = entry;
  }

  // Increment count
  entry.count += 1;

  // Check if limit exceeded
  if (entry.count > maxRequests) {
    return {
      success: false,
      remaining: 0,
      resetTime: entry.resetTime,
      message: message || `Rate limit exceeded. Try again after ${new Date(entry.resetTime).toISOString()}`,
    };
  }

  return {
    success: true,
    remaining: maxRequests - entry.count,
    resetTime: entry.resetTime,
  };
}

/**
 * Get client IP address from request
 */
export function getClientIP(request: Request): string {
  // Try various headers (for Vercel, Cloudflare, etc.)
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }

  const realIP = request.headers.get('x-real-ip');
  if (realIP) {
    return realIP;
  }

  // Fallback (won't work in serverless, but good for development)
  return 'unknown';
}

/**
 * Rate limit middleware for Next.js API routes
 */
export function createRateLimiter(options: RateLimitOptions) {
  return async (request: Request): Promise<RateLimitResult> => {
    const ip = getClientIP(request);
    return rateLimit(ip, options);
  };
}

// Predefined rate limiters
export const apiRateLimiter = createRateLimiter({
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 60, // 60 requests per minute
  message: 'Too many requests. Please try again later.',
});

export const uploadRateLimiter = createRateLimiter({
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 10, // 10 uploads per minute
  message: 'Too many uploads. Please try again later.',
});

export const reviewRateLimiter = createRateLimiter({
  windowMs: 60 * 60 * 1000, // 1 hour
  maxRequests: 5, // 5 reviews per hour
  message: 'Too many reviews. Please try again later.',
});

