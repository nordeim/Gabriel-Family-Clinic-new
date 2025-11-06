// Global polyfills for server-side rendering
if (typeof window === 'undefined') {
  // Only run in server environment
  try {
    if (typeof (globalThis as Record<string, unknown>).self === 'undefined') {
      (globalThis as Record<string, unknown>).self = globalThis;
    }
  } catch {
    // Gracefully handle if 'self' check fails
    (globalThis as Record<string, unknown>).self = globalThis;
  }
}

export {}
