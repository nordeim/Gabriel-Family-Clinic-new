// Server-side polyfill for browser globals
// This file is injected at the start of all server bundles

try {
  if (typeof global.self === 'undefined') {
    global.self = global;
  }
} catch {
  // Gracefully handle if 'self' check fails
  global.self = global;
}

try {
  if (typeof global.window === 'undefined') {
    global.window = global;
  }
} catch {
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
} catch {
  // Graceful fallback
  global.document = {};
}
