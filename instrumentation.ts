/**
 * Instrumentation file for Next.js
 * Provides polyfills for server-side rendering
 */

export function register() {
  // Polyfill 'self' for Node.js environment
  if (typeof self === 'undefined') {
    (global as any).self = global;
  }
  
  // Polyfill 'window' for Node.js environment
  if (typeof window === 'undefined') {
    (global as any).window = global;
  }
  
  // Polyfill 'document' for Node.js environment
  if (typeof document === 'undefined') {
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
}
