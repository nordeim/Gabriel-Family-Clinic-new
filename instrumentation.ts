/**
 * Instrumentation file for Next.js
 * Provides safe polyfills for server-side rendering before any imports
 */

// Import server polyfill to ensure globals are available early
import './lib/server-polyfill.js';

export function register() {
  // Ensure all browser globals are properly polyfilled
  if (typeof global !== 'undefined' && typeof window === 'undefined') {
    // Double-check and ensure all globals are set up properly
    if (typeof (global as any).self === 'undefined') {
      (global as any).self = global;
    }
    
    if (typeof (global as any).window === 'undefined') {
      (global as any).window = global;
    }
    
    if (typeof (global as any).document === 'undefined') {
      (global as any).document = {
        querySelector: () => null,
        querySelectorAll: () => [],
        getElementById: () => null,
        getElementsByClassName: () => [],
        getElementsByTagName: () => [],
        createElement: () => ({
          setAttribute: () => {},
          getAttribute: () => null,
          style: {},
          appendChild: () => {},
          removeChild: () => {},
        }),
        createTextNode: () => ({}),
        head: {
          appendChild: () => {},
          removeChild: () => {},
        },
        body: {
          appendChild: () => {},
          removeChild: () => {},
        },
      };
    }
  }
}
