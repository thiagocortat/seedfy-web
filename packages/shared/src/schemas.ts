import { z } from 'zod';

export const ContentItemTypeEnum = z.enum(['podcast', 'video', 'music']);

export const ContentItemSchema = z.object({
  id: z.string().uuid().optional(),
  type: ContentItemTypeEnum,
  title: z.string().min(1, "Title is required"),
  description: z.string().optional().nullable(),
  cover_url: z.string().url().optional().nullable().or(z.literal('')),
  media_url: z.string().url().optional().nullable().or(z.literal('')),
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
  church_id: z.string().optional().nullable(),
});

export type User = z.infer<typeof UserSchema>;

// Groups
export const GroupRoleEnum = z.enum(['owner', 'member']);

export const GroupSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(1, "Name is required"),
  image_url: z.string().url().optional().nullable(),
  created_by: z.string().uuid().optional(),
  created_at: z.string().optional(),
});

export type Group = z.infer<typeof GroupSchema>;

export const GroupMemberSchema = z.object({
  group_id: z.string().uuid(),
  user_id: z.string().uuid(),
  role: GroupRoleEnum.default('member'),
  joined_at: z.string().optional(),
});

export type GroupMember = z.infer<typeof GroupMemberSchema>;

// Challenges
export const ChallengeTypeEnum = z.enum(['reading', 'meditation', 'fasting', 'communion']);
export const ChallengeStatusEnum = z.enum(['active', 'completed', 'canceled']);

export const ChallengeSchema = z.object({
  id: z.string().uuid().optional(),
  group_id: z.string().uuid().optional(),
  created_by: z.string().uuid().optional(),
  type: ChallengeTypeEnum,
  title: z.string().min(1, "Title is required"),
  duration_days: z.number().int().min(1).default(1),
  start_date: z.string().optional().nullable(),
  end_date: z.string().optional().nullable(),
  status: ChallengeStatusEnum.default('active'),
  created_at: z.string().optional(),
});

export type Challenge = z.infer<typeof ChallengeSchema>;

export const ChallengeParticipantStatusEnum = z.enum(['active', 'quit', 'completed']);

export const ChallengeParticipantSchema = z.object({
  challenge_id: z.string().uuid(),
  user_id: z.string().uuid(),
  status: ChallengeParticipantStatusEnum.default('active'),
  joined_at: z.string().optional(),
  progress: z.number().int().default(0),
});

export type ChallengeParticipant = z.infer<typeof ChallengeParticipantSchema>;

export const DailyCheckinSchema = z.object({
  challenge_id: z.string().uuid(),
  user_id: z.string().uuid(),
  date_key: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format (YYYY-MM-DD)"),
  completed_at: z.string().optional(),
});

export type DailyCheckin = z.infer<typeof DailyCheckinSchema>;

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

// Journey Templates
export const JourneyTemplateSchema = z.object({
  id: z.string().uuid().optional(),
  title: z.string().min(1, "Title is required"),
  description_short: z.string().min(1, "Short description is required"),
  description_long: z.string().optional().nullable(),
  cover_image_url: z.string().url().optional().nullable().or(z.literal('')),
  tags: z.array(z.string()).optional().default([]),
  durations_supported: z.array(z.number()).min(1, "At least one duration is required"),
  is_active: z.boolean().default(false),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
});

export type JourneyTemplate = z.infer<typeof JourneyTemplateSchema>;

// Journey Chapter Templates
export const JourneyChapterTemplateSchema = z.object({
  id: z.string().uuid().optional(),
  journey_id: z.string().uuid(),
  day_index: z.coerce.number().int().min(1, "Day index must be at least 1"),
  title: z.string().min(1, "Title is required"),
  narrative: z.string().min(1, "Narrative is required"),
  focus: z.string().min(1, "Focus is required"),
  practice: z.string().min(1, "Practice is required"),
  reflection_prompt: z.string().min(1, "Reflection prompt is required"),
  prayer: z.string().optional().nullable(),
  verse_reference: z.string().optional().nullable(),
  verse_text: z.string().optional().nullable(),
  media_url: z.string().url().optional().nullable().or(z.literal('')),
  media_type: z.enum(['audio', 'video']).optional().nullable(),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
});

export type JourneyChapterTemplate = z.infer<typeof JourneyChapterTemplateSchema>;
