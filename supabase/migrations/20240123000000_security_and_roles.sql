-- 1. Create Roles Enum and add to users
DO $$ BEGIN
    CREATE TYPE public.app_role AS ENUM ('admin', 'editor', 'viewer');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

ALTER TABLE public.users ADD COLUMN IF NOT EXISTS role public.app_role DEFAULT 'viewer';

-- 2. Create Audit Logs
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES public.users(id),
  action text NOT NULL,
  table_name text NOT NULL,
  record_id uuid,
  old_data jsonb,
  new_data jsonb,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist to avoid conflicts (or use DO block)
DROP POLICY IF EXISTS "Admins can view audit logs" ON public.audit_logs;

CREATE POLICY "Admins can view audit logs" ON public.audit_logs
  FOR SELECT USING (
    exists (
      select 1 from public.users
      where users.id = auth.uid() and users.role = 'admin'
    )
  );

-- 3. Update Policies for Content Items
ALTER TABLE public.content_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read access for content" ON public.content_items;
DROP POLICY IF EXISTS "Admin and Editors can insert content" ON public.content_items;
DROP POLICY IF EXISTS "Admin and Editors can update content" ON public.content_items;
DROP POLICY IF EXISTS "Admin and Editors can delete content" ON public.content_items;

CREATE POLICY "Public read access for content" ON public.content_items
  FOR SELECT USING (true);

CREATE POLICY "Admin and Editors can insert content" ON public.content_items
  FOR INSERT WITH CHECK (
    exists (
      select 1 from public.users
      where users.id = auth.uid() and users.role in ('admin', 'editor')
    )
  );

CREATE POLICY "Admin and Editors can update content" ON public.content_items
  FOR UPDATE USING (
    exists (
      select 1 from public.users
      where users.id = auth.uid() and users.role in ('admin', 'editor')
    )
  );

CREATE POLICY "Admin and Editors can delete content" ON public.content_items
  FOR DELETE USING (
    exists (
      select 1 from public.users
      where users.id = auth.uid() and users.role in ('admin', 'editor')
    )
  );

-- 4. Update Policies for Churches
ALTER TABLE public.churches ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read access for churches" ON public.churches;
DROP POLICY IF EXISTS "Only Admins can insert churches" ON public.churches;
DROP POLICY IF EXISTS "Only Admins can update churches" ON public.churches;
DROP POLICY IF EXISTS "Only Admins can delete churches" ON public.churches;

CREATE POLICY "Public read access for churches" ON public.churches
  FOR SELECT USING (true);

CREATE POLICY "Only Admins can insert churches" ON public.churches
  FOR INSERT WITH CHECK (
    exists (
      select 1 from public.users
      where users.id = auth.uid() and users.role = 'admin'
    )
  );

CREATE POLICY "Only Admins can update churches" ON public.churches
  FOR UPDATE USING (
    exists (
      select 1 from public.users
      where users.id = auth.uid() and users.role = 'admin'
    )
  );

CREATE POLICY "Only Admins can delete churches" ON public.churches
  FOR DELETE USING (
    exists (
      select 1 from public.users
      where users.id = auth.uid() and users.role = 'admin'
    )
  );

-- 5. Storage Policies (Bucket creation needs to be done via API or dashboard usually, but we can set policies if buckets exist)
-- Assuming buckets 'covers' and 'media' exist. If not, these might fail or be no-op.
-- We'll wrap in DO block to be safe or just define policies on storage.objects

-- Policy for 'covers' bucket
BEGIN;
  INSERT INTO storage.buckets (id, name, public) VALUES ('covers', 'covers', true) ON CONFLICT DO NOTHING;
  INSERT INTO storage.buckets (id, name, public) VALUES ('media', 'media', true) ON CONFLICT DO NOTHING;
COMMIT;

DROP POLICY IF EXISTS "Public Access Covers" ON storage.objects;
DROP POLICY IF EXISTS "Admin Editor Upload Covers" ON storage.objects;

CREATE POLICY "Public Access Covers" ON storage.objects
  FOR SELECT USING ( bucket_id = 'covers' );

CREATE POLICY "Admin Editor Upload Covers" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'covers' AND
    exists (
      select 1 from public.users
      where users.id = auth.uid() and users.role in ('admin', 'editor')
    )
  );

-- Policy for 'media' bucket
DROP POLICY IF EXISTS "Public Access Media" ON storage.objects;
DROP POLICY IF EXISTS "Admin Editor Upload Media" ON storage.objects;

CREATE POLICY "Public Access Media" ON storage.objects
  FOR SELECT USING ( bucket_id = 'media' );

CREATE POLICY "Admin Editor Upload Media" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'media' AND
    exists (
      select 1 from public.users
      where users.id = auth.uid() and users.role in ('admin', 'editor')
    )
  );
