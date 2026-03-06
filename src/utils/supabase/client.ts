import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url || !key) {
    // During build-time prerendering, env vars may not be available.
    // Return a no-op proxy that won't crash but won't do anything.
    // At runtime in the browser, these vars will always be defined.
    console.warn('Supabase env vars missing — returning stub client (expected during build)')
    return createStubClient() as any
  }

  return createBrowserClient(url, key)
}

// Minimal stub that prevents crashes during SSR/build prerendering
function createStubClient(): any {
  const noop = () => ({ data: null, error: null, count: null })
  const noopAsync = async () => ({ data: null, error: null, count: null })
  const chainable: any = new Proxy({}, {
    get: () => (..._args: any[]) => chainable,
  })
  // Add async resolution
  chainable.then = (resolve: any) => resolve({ data: null, error: null, count: null })

  const auth = {
    getUser: noopAsync,
    getSession: noopAsync,
    signInWithPassword: noopAsync,
    signOut: noopAsync,
    onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => { } } } }),
  }

  return {
    auth,
    from: () => chainable,
    channel: () => ({
      on: function () { return this },
      subscribe: function () { return this },
      track: noopAsync,
    }),
    removeChannel: noop,
    rpc: noopAsync,
  }
}

