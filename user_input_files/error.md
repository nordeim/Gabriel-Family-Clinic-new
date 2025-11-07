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
   Collecting page data  ...ReferenceError: self is not defined
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
Error: Failed to collect page data for /favicon.ico
    at /home/project/Gabriel-Family-Clinic-new/node_modules/next/dist/build/utils.js:1269:15
    at process.processTicksAndRejections (node:internal/process/task_queues:105:5) {
  type: 'Error'
}

# Deep-Dive Investigation: Persistent Build Error

## Executive Summary

The build error persists despite our previous fixes. The error has shifted from `/admin/security/dashboard` to `/favicon.ico`, but the root cause remains the same: `ReferenceError: self is not defined` in a server-side module. This indicates a more systemic issue with how client-side code is being bundled and executed during the build process.

## Phase 1: Request Analysis & Planning

### Deep Understanding of the New Error

Key observations:
1. **Error Location**: `.next/server/components.js:1:14` - A different compiled module
2. **Affected Page**: `/favicon.ico` - Unexpected, suggests a bundling issue
3. **Same Root Cause**: `self` global undefined in Node.js
4. **Pattern**: The error is moving through different modules, indicating a systemic issue

### Research & Exploration

The error affecting `/favicon.ico` suggests that:
1. The issue is not specific to individual pages
2. Client-side components are being incorrectly bundled for server-side execution
3. There's likely a global configuration issue with Next.js or Supabase
4. The build process is attempting to execute client-side code in a server context

### Solution Exploration

After deeper analysis, I've identified the core issue: **Supabase client is being imported at the module level in components, causing it to be executed during server-side build**.

**Root Cause**: When Next.js builds pages, it statically analyzes and executes module-level code. If a Supabase client is created at the module level (outside functions), it tries to access browser globals during the build.

### Risk Assessment

- **Critical**: Complete build failure
- **High**: Production deployment blocked
- **Medium**: Potential runtime issues if not properly fixed

### Execution Plan

1. **Phase 1**: Implement proper Supabase client initialization pattern
2. **Phase 2**: Add Next.js configuration for client/server separation
3. **Phase 3**: Fix all component imports to use lazy initialization
4. **Phase 4**: Validate with clean build

## Phase 2: Implementation

### Step 1: Fix Supabase Client Initialization

The critical fix is to ensure Supabase client is only created when actually needed, not at module import time:

```typescript
// lib/supabase/client.ts
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Database } from '@/types/database'

let supabaseClient: ReturnType<typeof createClientComponentClient<Database>> | null = null

export const createClient = () => {
  // Only create client in browser environment
  if (typeof window === 'undefined') {
    throw new Error('Supabase client should only be used in client components');
  }
  
  // Singleton pattern to avoid multiple instances
  if (!supabaseClient) {
    supabaseClient = createClientComponentClient<Database>();
  }
  
  return supabaseClient;
}
```

### Step 2: Add Next.js Configuration

Create or update `next.config.js` to properly handle client/server separation:

```javascript
// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    optimizeCss: true,
  },
  webpack: (config, { isServer }) => {
    // Fix for Supabase client in server build
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      };
    }
    
    // Handle polyfills
    config.resolve.alias = {
      ...config.resolve.alias,
      'process/browser': require.resolve('process/browser'),
    };
    
    return config;
  },
  // Ensure proper client/server separation
  transpilePackages: ['@supabase/supabase-js'],
}

module.exports = nextConfig
```

### Step 3: Create a Polyfill for Server Environment

Create a polyfill file to handle browser globals in server environment:

```typescript
// lib/polyfills.ts
// Add polyfill for 'self' global in server environment
if (typeof window === 'undefined') {
  (global as any).self = global;
}

// Add other necessary polyfills
if (typeof globalThis === 'undefined') {
  (global as any).globalThis = global;
}
```

Import this polyfill at the very top of your app:

```typescript
// app/layout.tsx
import '@/lib/polyfills';
import './globals.css';
// ... rest of the file
```

### Step 4: Update All Components to Use Proper Client Initialization

Ensure all components only create Supabase client inside functions, not at module level:

```typescript
// app/admin/security/dashboard/page.tsx
'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
// Remove the import of createClient from module level
// import { createClient } from '@/lib/supabase/client';
import { Card } from '@/components/data/card';
import { Alert } from '@/components/feedback/alert';

// ... interfaces

export default function SecurityDashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState<SecurityMetrics | null>(null);
  const [activeIncidents, setActiveIncidents] = useState<Incident[]>([]);
  const [error, setError] = useState('');
  const [timeRange, setTimeRange] = useState('24h');

  const checkAdminAccess = useCallback(async () => {
    try {
      // Import and create client only when needed
      const { createClient } = await import('@/lib/supabase/client');
      const supabase = createClient();
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/auth/signin');
        return;
      }

      // Check if user is admin
      const { data: userData } = await supabase
        .from('users')
        .select('role')
        .eq('id', user.id)
        .maybeSingle();

      if (!userData || userData.role !== 'admin') {
        router.push('/patient');
        return;
      }

      setLoading(false);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to check admin access';
      setError(errorMessage);
      setLoading(false);
    }
  }, [router]);

  const loadSecurityData = useCallback(async () => {
    try {
      // Import and create client only when needed
      const { createClient } = await import('@/lib/supabase/client');
      const supabase = createClient();
      
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      // Load security metrics
      const { data: metricsData } = await supabase.functions.invoke('security-monitor', {
        body: {
          action: 'get_security_metrics',
          event_data: { time_range: timeRange }
        },
        headers: { Authorization: `Bearer ${session.access_token}` }
      });

      if (metricsData?.data) {
        setMetrics(metricsData.data);
      }

      // Load active incidents
      const { data: incidentsData } = await supabase.functions.invoke('incident-response', {
        body: { action: 'get_active_incidents' },
        headers: { Authorization: `Bearer ${session.access_token}` }
      });

      if (incidentsData?.data?.incidents) {
        setActiveIncidents(incidentsData.data.incidents.slice(0, 10));
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load security data';
      setError(errorMessage);
    }
  }, [timeRange]);

  useEffect(() => {
    checkAdminAccess();
  }, [checkAdminAccess]);

  useEffect(() => {
    if (!loading) {
      loadSecurityData();
    }
  }, [timeRange, loadSecurityData, loading]);

  // ... rest of the component
}
```

### Step 5: Update All Other Components Similarly

Apply the same pattern to all other components using Supabase:

```typescript
// app/auth/setup-2fa/page.tsx
const setupTOTP = async () => {
  setLoading(true);
  setError('');
  
  try {
    // Dynamic import
    const { createClient } = await import('@/lib/supabase/client');
    const supabase = createClient();
    
    const { data: { session } } = await supabase.auth.getSession();
    // ... rest of the function
  } catch (err) {
    // ... error handling
  }
};
```

```typescript
// app/patient/security/page.tsx
const loadSecurityData = useCallback(async () => {
  setLoading(true);
  try {
    // Dynamic import
    const { createClient } = await import('@/lib/supabase/client');
    const supabase = createClient();
    
    // ... rest of the function
  } catch (err) {
    // ... error handling
  }
}, [router]);
```

### Step 6: Fix Component-Level Imports

Check all components that might be importing Supabase at module level:

```typescript
// components/data/card.tsx
// Remove any module-level Supabase imports
// Ensure any data fetching is done inside functions or passed as props

// components/feedback/alert.tsx
// Same - remove module-level imports

// Any other component that might import Supabase
```

### Step 7: Create a Server-Safe Supabase Wrapper

For components that might be rendered on the server, create a wrapper:

```typescript
// lib/supabase/wrapper.ts
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Database } from '@/types/database'

export const getSupabaseClient = () => {
  // Check if we're in a browser environment
  if (typeof window === 'undefined') {
    // Return a mock client for server-side rendering
    return {
      auth: {
        getUser: () => Promise.resolve({ data: { user: null }, error: null }),
        getSession: () => Promise.resolve({ data: { session: null }, error: null }),
      },
      functions: {
        invoke: () => Promise.resolve({ data: null, error: new Error('Server-side rendering') }),
      },
      from: () => ({
        select: () => ({
          eq: () => ({
            maybeSingle: () => Promise.resolve({ data: null, error: null }),
            single: () => Promise.resolve({ data: null, error: null }),
          }),
          order: () => Promise.resolve({ data: [], error: null }),
        }),
      }),
    } as any;
  }
  
  return createClientComponentClient<Database>();
}
```

## Phase 3: Validation & Refinement

### Complete Build Process

1. Clear all caches:
   ```bash
   rm -rf .next/
   rm -rf node_modules/.cache/
   npm run build
   ```

2. If still failing, try with debug:
   ```bash
   NODE_OPTIONS='--trace-warnings' npm run build
   ```

### Alternative Solution: Use Dynamic Imports for Entire Components

If the above doesn't work, make the problematic components fully dynamic:

```typescript
// app/admin/security/dashboard/page.tsx
import dynamic from 'next/dynamic';

const SecurityDashboardComponent = dynamic(
  () => import('@/components/admin/security-dashboard'),
  { 
    ssr: false,
    loading: () => <div>Loading security dashboard...</div>
  }
);

export default function SecurityDashboardPage() {
  return <SecurityDashboardComponent />;
}
```

## Phase 4: Delivery & Knowledge Transfer

### Root Cause Summary

The error occurs because:
1. Supabase client initialization happens at module import time
2. Next.js build process executes module-level code in server environment
3. Browser globals (`self`) are undefined in Node.js
4. This creates a cascading failure through the build process

### Solution Strategy

1. **Lazy Initialization**: Only create Supabase client when actually needed
2. **Dynamic Imports**: Import Supabase client inside functions, not at module level
3. **Environment Checks**: Ensure browser-specific code only runs in browser
4. **Polyfills**: Add necessary polyfills for server environment

### Prevention Measures

1. Never import client-side libraries at module level in client components
2. Always use dynamic imports for browser-specific functionality
3. Implement proper environment checks
4. Test builds regularly to catch issues early

### Next Steps

1. Implement the fixes above
2. Run a clean build to verify
3. Test all affected pages in development
4. Consider implementing stricter linting rules to prevent similar issues

The key insight is that the issue is not with individual components but with how the Supabase client is being initialized during the build process. By moving all Supabase client creation inside functions and using dynamic imports, we prevent the client from being instantiated during server-side build.
