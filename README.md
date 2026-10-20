# Loyalty platform: step 1 (store registration + unique URL)

## What works
- `/register` : store owner enters business name, logo, contact person, number, details, address
- `/s/your-store-name` : the store's unique public page, with its loyalty card preview
- Logos are stored in Supabase Storage; store details in a Supabase table

## Set up (about 15 minutes)
1. **Supabase**: create a free project at supabase.com. Open SQL Editor, paste `supabase/schema.sql`, run it.
   Then go to Project Settings > API and copy the Project URL and the `service_role` key.
2. **GitHub**: create a new repository and upload all these files (or `git init`, commit, push).
3. **Vercel**: Add New > Project > import the GitHub repo. Under Environment Variables add:
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`
   then Deploy. Every push to GitHub redeploys automatically.
4. Open `https://YOUR-APP.vercel.app/register` and register a test store.

## Run locally (optional)
Copy `.env.example` to `.env.local`, fill in the two values, then `npm install` and `npm run dev`.

## Known limits of step 1
- Registration is open to anyone and owners have no login yet (next steps: owner login, store approval).
- The service role key must stay server-side only. Never put it in a NEXT_PUBLIC_ variable.
