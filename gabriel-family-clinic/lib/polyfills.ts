// Global polyfills for server-side rendering
if (typeof window === 'undefined') {
  // Only run in server environment
  if (typeof self === 'undefined') {
    (global as any).self = global;
  }
}

export {}
