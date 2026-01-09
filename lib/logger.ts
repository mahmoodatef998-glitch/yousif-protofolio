/**
 * Centralized logging utility
 * Only logs in development mode to avoid performance issues in production
 * Works in both server-side and client-side environments
 */

// Check if we're in a browser environment
const isBrowser = typeof window !== 'undefined';
const isDevelopment = 
  isBrowser 
    ? process.env.NODE_ENV === 'development' || process.env.NEXT_PUBLIC_NODE_ENV === 'development'
    : process.env.NODE_ENV === 'development';

export const logger = {
  log: (...args: any[]) => {
    if (isDevelopment) {
      console.log('[LOG]', ...args);
    }
  },
  
  error: (...args: any[]) => {
    // Always log errors, even in production
    console.error('[ERROR]', ...args);
  },
  
  warn: (...args: any[]) => {
    if (isDevelopment) {
      console.warn('[WARN]', ...args);
    }
  },
  
  info: (...args: any[]) => {
    if (isDevelopment) {
      console.info('[INFO]', ...args);
    }
  },
  
  debug: (...args: any[]) => {
    if (isDevelopment) {
      console.debug('[DEBUG]', ...args);
    }
  },
  
  // Grouped logging for better organization
  group: (label: string, fn: () => void) => {
    if (isDevelopment) {
      console.group(label);
      fn();
      console.groupEnd();
    } else {
      fn();
    }
  },
  
  // Table logging for structured data
  table: (data: any) => {
    if (isDevelopment) {
      console.table(data);
    }
  },
};

