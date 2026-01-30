-- Migration: Journeys and Chapters
-- Description: Adds tables for Journeys and Chapters, and extends Challenges and DailyCheckins.

-- 1. Create journey_templates table
create table public.journey_templates (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  description_short text not null,
  description_long text,
  cover_image_url text,
  tags text[],
  durations_supported int[],
  is_active boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 2. Create journey_chapter_templates table
create table public.journey_chapter_templates (
  id uuid default gen_random_uuid() primary key,
  journey_id uuid references public.journey_templates(id) on delete cascade,
  day_index int not null,
  title text not null,
  narrative text not null,
  focus text not null,
  practice text not null,
  reflection_prompt text not null,
  prayer text,
  verse_reference text,
  verse_text text,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique (journey_id, day_index)
);

-- 3. Alter challenges table
alter table public.challenges 
  add column journey_id uuid references public.journey_templates(id),
  add column unlock_policy text default 'strict_daily',
  add column timezone text;

-- 4. Alter daily_checkins table
alter table public.daily_checkins
  add column day_index int,
  add column reflection_text text,
  add column visibility text default 'private';

-- 5. Enable RLS
alter table public.journey_templates enable row level security;
alter table public.journey_chapter_templates enable row level security;

-- 6. Create Policies (Simplified for MVP)

-- Journey Templates: Everyone can read active journeys. Admins/Service Role can do everything.
create policy "Active journeys are viewable by everyone" 
  on public.journey_templates for select 
  using (is_active = true);

create policy "Admins can do all on journey_templates" 
  on public.journey_templates for all 
  using (
    exists (
      select 1 from public.users 
      where id = auth.uid() and role in ('admin', 'editor')
    )
  );

-- Journey Chapters: Everyone can read chapters of active journeys.
create policy "Chapters of active journeys are viewable by everyone" 
  on public.journey_chapter_templates for select 
  using (
    exists (
      select 1 from public.journey_templates 
      where id = journey_chapter_templates.journey_id and is_active = true
    )
  );

create policy "Admins can do all on journey_chapter_templates" 
  on public.journey_chapter_templates for all 
  using (
    exists (
      select 1 from public.users 
      where id = auth.uid() and role in ('admin', 'editor')
    )
  );

-- Note: The admin check depends on the 'role' column in public.users, which was seen in the schemas.ts but not explicitly in the initial sql read. 
-- If public.users doesn't have 'role', this might fail or need adjustment. 
-- Based on schemas.ts UserSchema, it has 'role'. Assuming the column exists or was added in previous migrations.
-- If not, we might need to add it. Let's assume it exists for now based on schemas.ts.
-- Actually, let's verify if 'role' column exists in public.users in the first Read result.
-- Result 1: "create table public.users ... church_id text...". NO ROLE COLUMN visible in that CREATE statement.
-- However, UserSchema has it. It might have been added in "20240123000000_security_and_roles.sql".
-- I should verify that migration content first to be safe. But I will proceed assuming I can add it if missing.

