/**
 * Instrumentation file for Next.js
 * Provides polyfills for server-side rendering
 */

export function register() {
  // Polyfill 'self' for Node.js environment
  try {
    if (typeof (global as any).self === 'undefined') {
      (global as any).self = global;
    }
  } catch (e) {
    // Gracefully handle if 'self' check fails
    (global as any).self = global;
  }
  
  // Polyfill 'window' for Node.js environment
  try {
    if (typeof (global as any).window === 'undefined') {
      (global as any).window = global;
    }
  } catch (e) {
    (global as any).window = global;
  }
  
  // Polyfill 'document' for Node.js environment
  try {
    if (typeof (global as any).document === 'undefined') {
      (global as any).document = {
        querySelector: function() { return null; },
        querySelectorAll: function() { return []; },
        getElementById: function() { return null; },
        getElementsByClassName: function() { return []; },
        getElementsByTagName: function() { return []; },
        createElement: function() { 
          return {
            setAttribute: function() {},
            getAttribute: function() { return null; },
            style: {},
            appendChild: function() {},
            removeChild: function() {},
          };
        },
        createTextNode: function() { return {}; },
        head: {
          appendChild: function() {},
          removeChild: function() {},
        },
        body: {
          appendChild: function() {},
          removeChild: function() {},
        },
      };
    }
  } catch (e) {
    // Basic document polyfill
    (global as any).document = {};
  }
}
