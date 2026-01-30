-- Migration: Add Media Columns to Journey Chapters
-- Description: Adds media_url and media_type columns to journey_chapter_templates table.

alter table public.journey_chapter_templates
  add column media_url text,
  add column media_type text check (media_type in ('audio', 'video'));
