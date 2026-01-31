/**
 * Production-safe logger utility
 * Only logs in development, silent in production
 */

const isDev = process.env.NODE_ENV === 'development';

export const logger = {
  log: (...args: unknown[]) => {
    if (isDev) console.log(...args);
  },
  
  warn: (...args: unknown[]) => {
    if (isDev) console.warn(...args);
  },
  
  error: (...args: unknown[]) => {
    // Errors should always be logged
    console.error(...args);
  },
  
  info: (...args: unknown[]) => {
    if (isDev) console.info(...args);
  },
  
  debug: (...args: unknown[]) => {
    if (isDev) console.debug(...args);
  },
};

// API specific logger with request context
export const apiLogger = {
  request: (method: string, path: string, data?: unknown) => {
    if (isDev) {
      console.log(`[API ${method}] ${path}`, data || '');
    }
  },
  
  response: (method: string, path: string, status: number, data?: unknown) => {
    if (isDev) {
      console.log(`[API ${method}] ${path} → ${status}`, data || '');
    }
  },
  
  info: (method: string, path: string, message: string) => {
    if (isDev) {
      console.info(`[API ${method}] ${path}: ${message}`);
    }
  },
  
  error: (method: string, path: string, error: unknown) => {
    console.error(`[API ${method}] ${path} ERROR:`, error);
  },
};
