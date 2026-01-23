export { createClient as createBrowserClient } from './supabase-browser';
export * from './schemas';
export * from './env';
// Note: createServerClient and createServiceClient are NOT exported here to prevent accidental import in Client Components
// They should be imported from @seedfy/shared/server in Server Components
