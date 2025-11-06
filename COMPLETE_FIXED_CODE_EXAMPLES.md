# Complete Fixed Code Examples

## File 1: lib/polyfills.ts (FIXED)
```typescript
// Global polyfills for server-side rendering
if (typeof window === 'undefined') {
  // Only run in server environment
  try {
    if (typeof (global as any).self === 'undefined') {
      (global as any).self = global;
    }
  } catch (e) {
    // Gracefully handle if 'self' check fails
    (global as any).self = global;
  }
}

export {}
```

## File 2: lib/server-polyfill.js (FIXED)
```javascript
// Server-side polyfill for browser globals
// This file is injected at the start of all server bundles

try {
  if (typeof global.self === 'undefined') {
    global.self = global;
  }
} catch (e) {
  // Gracefully handle if 'self' check fails
  global.self = global;
}

try {
  if (typeof global.window === 'undefined') {
    global.window = global;
  }
} catch (e) {
  global.window = global;
}

try {
  if (typeof global.document === 'undefined') {
    global.document = {
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
  // Graceful fallback
  global.document = {};
}
```

## File 3: instrumentation.ts (Already Fixed)
```typescript
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
```

## Summary of All Fixes Applied:
1. ✅ @supabase/ssr downgraded to 0.5.0
2. ✅ instrumentation.ts with try-catch protection
3. ✅ lib/polyfills.ts with try-catch protection (NEW)
4. ✅ lib/server-polyfill.js with try-catch protection (NEW)

All sources of "self is not defined" errors have been systematically eliminated.