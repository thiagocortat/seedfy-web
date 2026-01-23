import { z } from 'zod';

export const ContentItemTypeEnum = z.enum(['podcast', 'video', 'music']);

export const ContentItemSchema = z.object({
  id: z.string().uuid().optional(),
  type: ContentItemTypeEnum,
  title: z.string().min(1, "Title is required"),
  description: z.string().optional().nullable(),
  cover_url: z.string().url().optional().nullable(),
  media_url: z.string().url().optional().nullable(),
  is_live: z.boolean().default(false),
  created_at: z.string().optional(),
  play_count: z.number().default(0),
});

export type ContentItem = z.infer<typeof ContentItemSchema>;

export const ChurchSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(1, "Name is required"),
  logo_url: z.string().url().optional().nullable(),
  city: z.string().optional().nullable(),
  state: z.string().optional().nullable(),
});

export type Church = z.infer<typeof ChurchSchema>;
