// Global polyfills for server-side rendering
if (typeof window === 'undefined') {
  // Only run in server environment
  try {
    if (typeof (global as any).self === 'undefined') {
      (global as any).self = global;
    }
  } catch {
    // Gracefully handle if 'self' check fails
    (global as any).self = global;
  }
}

export {}
