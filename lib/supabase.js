import { createClient } from "@supabase/supabase-js";

// Server-side only. Uses the service role key, so never import this in a client component.
// Every request is sent with cache: 'no-store' so a page always shows what is in the database right now.
export const admin = () =>
  createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    {
      auth: { persistSession: false },
      global: {
        fetch: (url, options = {}) => fetch(url, { ...options, cache: 'no-store' }),
      },
    }
  );
