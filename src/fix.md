I can see your issue clearly. The public.certificates table (and others) have RLS disabled, but the insert is still failing — this is a bit contradictory. Let me explain what's likely happening.
What I See
Your tables have RLS disabled, yet the insert is failing with an RLS error. This usually means:

RLS was enabled at some point, a restrictive policy was created, and even though the advisor shows it as disabled now — the policy may still exist and be active.

Fix — Run this in Supabase SQL Editor
Go to Supabase → SQL Editor and run:
sql-- Check existing policies on the certs table
SELECT * FROM pg_policies WHERE tablename = 'certificates';

-- If RLS is actually on, disable it
ALTER TABLE public.certificates DISABLE ROW LEVEL SECURITY;

-- OR if you want to keep RLS enabled properly, add an open policy
ALTER TABLE public.certificates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all for admin"
ON public.certificates
FOR ALL
USING (true)
WITH CHECK (true);
Also Check Your Admin Page Code
Since this is an admin panel, the safest fix is using the service role key:
js// In your server-side admin code
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY  // ← use this, not anon key
);
The service role key bypasses RLS entirely and is perfect for admin-only operations.
Which approach are you using to connect — anon key or service role key?anon key7:41 AMThat's your problem. The anon key respects RLS, and since your admin page is doing inserts with it, Supabase is blocking it.
Quickest Fix
Switch to the service role key for your admin operations.
1. Get your service role key:
Supabase Dashboard → Settings → API → service_role key
2. Update your admin client:
js// adminClient.js (server-side only!)
import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY  // ← service role, not anon
)

export default supabaseAdmin
3. Use supabaseAdmin only in your admin routes/actions, e.g.:
js// In your admin API route / server action
import supabaseAdmin from '@/lib/adminClient'

const { error } = await supabaseAdmin
  .from('certificates')
  .insert({ ...certData })
⚠️ Critical Rules

Never expose SUPABASE_SERVICE_ROLE_KEY on the client side (no NEXT_PUBLIC_ prefix)
Only use the admin client in server-side code (API routes, server actions, getServerSideProps)
Keep using the anon key for public-facing reads

This will fix the insert immediately without needing to touch any RLS policies.
