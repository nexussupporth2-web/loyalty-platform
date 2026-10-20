import { createClient } from "@supabase/supabase-js";

// Server-side only. Uses the service role key, so never import this in a client component.
export const admin = () =>
  createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    {
      auth: { persistSession: false },
    }
  );
