$ npm run build

> gabriel-family-clinic@0.1.0 build
> next build

  ▲ Next.js 14.2.22
  - Environments: .env.local
  - Experiments (use with caution):
    · optimizeCss

   Creating an optimized production build ...
 ✓ Compiled successfully
 ✓ Linting and checking validity of types    
   Collecting page data  .ReferenceError: self is not defined
    at Object.<anonymous> (/home/project/Gabriel-Family-Clinic-new/.next/server/components.js:1:14)
    at Module._compile (node:internal/modules/cjs/loader:1730:14)
    at Object..js (node:internal/modules/cjs/loader:1895:10)
    at Module.load (node:internal/modules/cjs/loader:1465:32)
    at Function._load (node:internal/modules/cjs/loader:1282:12)
    at TracingChannel.traceSync (node:diagnostics_channel:322:14)
    at wrapModuleLoad (node:internal/modules/cjs/loader:235:24)
    at Module.<anonymous> (node:internal/modules/cjs/loader:1487:12)
    at mod.require (/home/project/Gabriel-Family-Clinic-new/node_modules/next/dist/server/require-hook.js:65:28)
    at require (node:internal/modules/helpers:135:16)

> Build error occurred
Error: Failed to collect page data for /_not-found
    at /home/project/Gabriel-Family-Clinic-new/node_modules/next/dist/build/utils.js:1269:15
    at process.processTicksAndRejections (node:internal/process/task_queues:105:5) {
  type: 'Error'
}

