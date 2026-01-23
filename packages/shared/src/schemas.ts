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

export const UserRoleEnum = z.enum(['admin', 'editor', 'viewer']);

export const UserSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email().optional(),
  name: z.string().optional().nullable(),
  role: UserRoleEnum.default('viewer'),
  photo_url: z.string().optional().nullable(),
});

export type User = z.infer<typeof UserSchema>;

export const ChurchPostStatusEnum = z.enum(['draft', 'published', 'archived']);

export const ChurchPostSchema = z.object({
  id: z.string().uuid().optional(),
  church_id: z.string().uuid(),
  title: z.string().min(3, "Title must be at least 3 characters"),
  body: z.string().min(20, "Body must be at least 20 characters"),
  excerpt: z.string().optional().nullable(),
  image_url: z.string().url().optional().nullable(),
  link_url: z.string().url().optional().nullable().or(z.literal('')),
  status: ChurchPostStatusEnum.default('draft'),
  pinned: z.boolean().default(false),
  published_at: z.string().optional().nullable(),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
});

export type ChurchPost = z.infer<typeof ChurchPostSchema>;

export const QuickActionTypeEnum = z.enum(['donate', 'events', 'website', 'whatsapp', 'youtube', 'instagram']);
export const QuickActionOpenModeEnum = z.enum(['in_app', 'external']);

export const ChurchQuickActionSchema = z.object({
  id: z.string().uuid().optional(),
  church_id: z.string().uuid(),
  type: QuickActionTypeEnum,
  label: z.string().min(1, "Label is required"),
  url: z.string().url("Must be a valid URL").startsWith("https://", "URL must start with https://"),
  sort_order: z.number().int().default(100),
  is_enabled: z.boolean().default(true),
  open_mode: QuickActionOpenModeEnum.default('in_app'),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
});

export type ChurchQuickAction = z.infer<typeof ChurchQuickActionSchema>;
