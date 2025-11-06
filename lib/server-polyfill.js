// Server-side polyfill for browser globals
// This file is injected at the start of all server bundles

if (typeof self === 'undefined') {
  global.self = global;
}

if (typeof window === 'undefined') {
  global.window = global;
}

if (typeof document === 'undefined') {
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
